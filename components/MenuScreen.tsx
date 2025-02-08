import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MenuItem } from "@/type/listingType"; // Add your MenuItem type here
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

type Props = {
  route: {
    params: {
      restaurantName: string;
    };
  };
};

const MenuScreen = ({ route }: Props) => {
  const { restaurantName } = route.params;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch menu items for the selected restaurant
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);

      try {
        const itemsRef = collection(FIREBASE_DB, "items");
        const q = query(itemsRef, where("restaurantName", "==", restaurantName));
        const snapshot = await getDocs(q);

        const fetchedMenuItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];

        setMenuItems(fetchedMenuItems);
      } catch (error) {
        console.error("Error fetching menu items: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantName]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{restaurantName} Menu</Text>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.itemInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>RM {item.price}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  itemInfo: {
    marginTop: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  price: {
    fontSize: 16,
    color: "#007BFF",
  },
});

export default MenuScreen;
