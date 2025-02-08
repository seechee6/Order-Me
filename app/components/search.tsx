import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";

type Restaurant = {
  restaurantName: string;
  category: string;
  restaurantImage: string;
};

const SearchScreen = () => {
  const [inputQuery, setInputQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const performSearch = async () => {
    if (!inputQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const restaurantsRef = collection(FIREBASE_DB, "restaurants");
      const querySnapshot = await getDocs(restaurantsRef);

      const results = querySnapshot.docs
        .map((doc) => doc.data() as Restaurant)
        .filter(
          (restaurant) =>
            restaurant.restaurantName
              .toLowerCase()
              .includes(inputQuery.toLowerCase()) ||
            restaurant.category.toLowerCase().includes(inputQuery.toLowerCase())
        );

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [inputQuery]);

  const handleRestaurantPress = (restaurantName: string) => {
    router.push({
      pathname: "/components/RestaurantMenuScreen",
      params: { name: restaurantName },
    });
  };

  const renderItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleRestaurantPress(item.restaurantName)}
    >
      <Image source={{ uri: item.restaurantImage }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.restaurantName}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <MaterialIcons
          name="arrow-back-ios"
          size={28}
          color="black"
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search restaurants..."
          value={inputQuery}
          onChangeText={setInputQuery}
          style={styles.searchInput}
          autoFocus
        />
        <TouchableOpacity onPress={performSearch}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        inputQuery.trim() && (
          <View style={styles.noResultContainer}>
            {/* Add an icon and text */}
            <MaterialIcons name="search-off" size={40} color="gray" />
            <Text style={styles.noResultText}>No restaurants found.</Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  backIcon: { marginVertical: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 8 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  details: { marginLeft: 10, justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "bold" },
  category: { fontSize: 14, color: "#666" },
  listContainer: { paddingBottom: 10 },
  loader: { marginTop: 20 },
  noResultContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noResultText: {
    fontSize: 18,
    color: "gray",
    marginTop: 10,
  },
});

export default SearchScreen;