import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FIREBASE_DB } from "@/FirebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const RestaurantMenuScreen = () => {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const auth = getAuth();
  const { user } = useAuth();

  useEffect(() => {
    if (name) {
      fetchMenuItems();
    }
  }, [name]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const itemsRef = collection(FIREBASE_DB, "items");
      const q = query(itemsRef, where("restaurantName", "==", name));
      const snapshot = await getDocs(q);

      const fetchedMenuItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];

      setMenuItems(fetchedMenuItems);
      const initialQuantities = fetchedMenuItems.reduce((acc, item) => {
        acc[item.id] = 0;
        return acc;
      }, {} as { [key: string]: number });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching menu items: ", error);
      Alert.alert("Error", "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decrementQuantity = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const handleAddToCart = async () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
      Alert.alert("Error", "Please log in to add items to the cart.");
      return;
    }

    setLoading(true);
    try {
      const cartRef = collection(FIREBASE_DB, "carts");
      const cartQuery = query(cartRef, where("email", "==", userEmail));
      const existingCartDocs = await getDocs(cartQuery);

      let differentRestaurantInCart = false;
      let existingRestaurantName = "";

      existingCartDocs.forEach((doc) => {
        if (doc.data().restaurantName !== name) {
          differentRestaurantInCart = true;
          existingRestaurantName = doc.data().restaurantName;
        }
      });

      const itemsToAdd = menuItems.filter(item => quantities[item.id] > 0).length;

      if (differentRestaurantInCart) {
        Alert.alert(
          "Adding this item will clear your cart. Add anyway?",
          `You already have items from ${existingRestaurantName} in your cart.`,
          [
            {
              text: "Don't Add",
              style: "cancel",
            },
            {
              text: "Add Item",
              onPress: async () => {
                existingCartDocs.forEach(async (doc) => {
                  await deleteDoc(doc.ref);
                });
                await addItemsToCart(userEmail);
                Alert.alert(
                  "Cart Updated",
                  `${itemsToAdd} item(s) added to your cart.`
                );
              },
            },
          ]
        );
      } else {
        await addItemsToCart(userEmail);
        Alert.alert(
          "Cart Updated",
          `${itemsToAdd} item(s) added to your cart.`
        );
      }
    } catch (error) {
      console.error("Error adding to cart: ", error);
      Alert.alert("Error", "Could not update cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addItemsToCart = async (userEmail: string) => {
    for (const item of menuItems) {
      const quantity = quantities[item.id];
      if (quantity > 0) {
        const cartRef = collection(FIREBASE_DB, "carts");
        const cartQuery = query(
          cartRef,
          where("email", "==", userEmail),
          where("restaurantName", "==", name),
          where("name", "==", item.name)
        );

        const existingCartDocs = await getDocs(cartQuery);
        const totalPrice = item.price * quantity;

        if (!existingCartDocs.empty) {
          const existingDoc = existingCartDocs.docs[0];
          const newQuantity = existingDoc.data().quantity + quantity;
          const newTotalPrice = item.price * newQuantity;

          await updateDoc(existingDoc.ref, {
            quantity: newQuantity,
            totalPrice: newTotalPrice,
          });
        } else {
          const newCartItem = {
            restaurantName: name,
            name: item.name,
            oriPrice: item.price,
            quantity: quantity,
            totalPrice: totalPrice,
            email: userEmail,
            imageUrl: item.imageUrl,
            username: user?.username,
          };

          await setDoc(doc(cartRef), newCartItem);
        }
      }
    }
  };
  const goBack = () => {
    router.back();
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backbtn} onPress={goBack}>
        <Ionicons name="chevron-back-outline" size={16} color="orange" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>{name} Menu</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : menuItems.length === 0 ? (
        <View style={styles.noMenuContainer}>
          <MaterialIcons name="restaurant-menu" size={100} color="#ccc" />
          <Text style={styles.noMenuText}>No menu available for this restaurant</Text>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.menuItemCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDescription}>
                  {item.description}
                </Text>
                <Text style={styles.menuItemPrice}>RM {item.price}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
                  <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantities[item.id]}</Text>
                <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      {menuItems.length > 0 && (
        <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
      >
          <Text style={styles.addToCartText}>Add To Cart</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 10,
  },
  backbtn: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "20%",
  },
  backText: {
    fontSize: 14,
    color: "orange",
    marginLeft: 5,
  },
  menuItemCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuItemInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    marginLeft: 10,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    marginLeft: 10,
  },
  menuItemPrice: {
    fontSize: 16,
    color: "#007BFF",
    marginLeft: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 10,
  },
  quantityButton: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
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
  noMenuText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
  noMenuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default RestaurantMenuScreen;
