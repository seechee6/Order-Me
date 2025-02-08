import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ListingType } from "@/type/listingType";
import { saveWishlist, getWishlist } from "@/app/utility/storage";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons"; 
import { colors } from "@/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter } from "expo-router"; 
import { getAuth } from "firebase/auth";

const EmptyWishlistMessage = () => (
  <View style={styles.emptyWishlistContainer}>
    <Ionicons name="heart-outline" size={50} color={colors.secondary[200]} />
    <Text style={styles.emptyWishlistText}>Your wishlist is empty!</Text>
    <Text style={styles.emptyWishlistSubText}>Add items to your wishlist.</Text>
  </View>
);

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<ListingType[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadWishlist = async () => {
      const savedWishlist = await getWishlist(); 
      setWishlist(savedWishlist);
    };
    loadWishlist();
  }, []);

  const handleRestaurantPress = (restaurantName: string) => {
    router.push({
      pathname: "/components/RestaurantMenuScreen",
      params: { name: restaurantName }
    });
  };

  const renderItems = ({ item }: { item: ListingType }) => {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => handleRestaurantPress(item.name)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
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
              <Text
                style={styles.itemLocationTxt}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.location}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Ionicons name="star" size={16} color={colors.secondary[200]} />
            </View>
          </View>
        </TouchableOpacity>
      </GestureHandlerRootView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
      </View>

      {wishlist.length === 0 ? (
        <EmptyWishlistMessage />
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItems}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          numColumns={1}  
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.primary[200],
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28, 
    fontWeight: "bold",
    color: colors.secondary.DEFAULT,
    marginLeft: 20,
    marginBottom: 5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    width: "85%", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
    margin: 5,
    padding: 10, 
    alignSelf: 'center',
    paddingLeft:5
  },
  image: {
    width: "100%",  
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  itemTxt: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary[200],
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
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
  emptyWishlistContainer: {
    flex: 1,
    marginTop: 100,
    alignItems: "center",
    padding: 20,
  },
  emptyWishlistText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary[200],
    marginTop: 10,
  },
  emptyWishlistSubText: {
    fontSize: 14,
    color: colors.secondary[200],
    marginTop: 5,
  },
});

export default Wishlist;