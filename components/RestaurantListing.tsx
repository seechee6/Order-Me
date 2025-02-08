import { StyleSheet, View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ListingType } from "@/type/listingType";
import { saveWishlist, getWishlist } from "@/app/utility/storage";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { router } from "expo-router";

interface Props {
  listings: ListingType[];
  category: string;
}

const RestaurantListing = ({ listings, category }: Props) => {
  const [filteredListings, setFilteredListings] = useState<ListingType[]>(listings);
  const [wishlist, setWishlist] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [restaurantRatings, setRestaurantRatings] = useState<Record<string, number>>({});

  const fetchRatingsForRestaurant = async (restaurantName: string) => {
    const feedbackRef = collection(FIREBASE_DB, "feedback");
    const q = query(feedbackRef, where("restaurantName", "==", restaurantName));
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => doc.data());
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return parseFloat((totalRating / reviews.length).toFixed(1));
    }
    return 0;
  };

  useEffect(() => {
    const loadWishlist = async () => {
      const savedWishlist = await getWishlist();
      setWishlist(savedWishlist);
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const restaurantsRef = collection(FIREBASE_DB, "restaurants");
        let q = query(restaurantsRef);

        if (category !== "All") {
          q = query(restaurantsRef, where("category", "==", category));
        }

        const snapshot = await getDocs(q);
        const restaurantsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const rating = await fetchRatingsForRestaurant(data.restaurantName);
            
            setRestaurantRatings(prev => ({
              ...prev,
              [data.restaurantName]: rating
            }));

            return {
              id: doc.id,
              name: data.restaurantName,
              imageUrl: data.restaurantImage,
              category: data.category,
              location: data.restaurantAddress || "Unknown",
              rating: rating,
              cuisine: data.cuisine || "Unknown",
              priceRange: data.priceRange || "Unknown",
              isOpen: data.isOpen || false,
              description: data.description || "No description available",
              owner: data.owner,
            };
          })
        );

        setFilteredListings(restaurantsData);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [category]);

  const handleWishlistToggle = async (item: ListingType) => {
    const isAlreadyInWishlist = wishlist.some(
      (wishlistItem) => wishlistItem.id === item.id
    );
    let updatedWishlist;

    if (isAlreadyInWishlist) {
      updatedWishlist = wishlist.filter((wishlistItem) => wishlistItem.id !== item.id);
      Alert.alert("Removed", `${item.name} has been removed from your wishlist. You are no longer receiving announcements from them.`);
    } else {
      updatedWishlist = [...wishlist, item];
      Alert.alert("Added", `${item.name} has been added to your wishlist. You are now subscribed to receive announcements from them.`);
    }

    setWishlist(updatedWishlist);
    await saveWishlist(updatedWishlist);
  };

  const renderItems = ({ item }: { item: ListingType }) => {
    const isInWishlist = wishlist.some(
      (wishlistItem) => wishlistItem.id === item.id
    );

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity
          style={[styles.card, !item.isOpen && { opacity: 0.6 }]}
          onPress={() => {
            if (item.isOpen) {
              router.push({
                pathname: "/components/RestaurantMenuScreen",
                params: { name: item.name },
              });
            } else {
              Alert.alert("Closed", `${item.name} is currently closed.`);
            }
          }}
          disabled={!item.isOpen}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.restaurantImage} />
          <Text style={styles.itemTxt} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.locationContainer}>
            <View style={styles.location}>
              <FontAwesome5
                name="map-marker-alt"
                size={18}
                color={colors.secondary[200]}
              />
              <Text style={styles.itemLocationTxt} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
              {restaurantRatings[item.name] && restaurantRatings[item.name] !== 0 
  ? restaurantRatings[item.name].toFixed(1) 
  : "No ratings yet"}
              </Text>
              <Ionicons name="star" size={16} color={colors.secondary[200]} />
            </View>
          </View>

          {!item.isOpen && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favorite}
          onPress={() => handleWishlistToggle(item)}
        >
          <Ionicons
            name={isInWishlist ? "heart" : "heart-outline"}
            size={20}
            color={isInWishlist ? "red" : "black"}
          />
        </TouchableOpacity>
      </GestureHandlerRootView>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <FlatList
        data={loading ? [] : filteredListings}
        renderItem={renderItems}
        keyExtractor={(item) => item.id.toString()}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
      />
    </GestureHandlerRootView>
  );
};

export default RestaurantListing;
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,  
    width: '100%',    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 10,
  },
  restaurantImage: {
    width: "100%",      
    height: 180,        
    borderRadius: 10,   
    alignSelf: 'center', 
    resizeMode: 'cover', 
    marginBottom: 10,  
  },
  itemTxt: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary[200],
    marginBottom: 10,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemLocationTxt: {
    fontSize: 12,
    marginLeft: 5,
    flexShrink: 1,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    marginRight: 5,
    fontWeight: "bold",
  },
  favorite: {
    position: "absolute",
    top: 165,
    right: 15,
    backgroundColor: colors.secondary[100],
    padding: 10,
    borderRadius: 30,
    borderColor: "white",
    borderWidth: 2,
  },
  
  addToCartButton: {
    backgroundColor: "orange",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
  },
  
  addToCartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)", 
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, 
    borderRadius: 10,  
  },
  closedText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});