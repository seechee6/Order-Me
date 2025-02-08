import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import StartNewCartCard from "../../components/MyCarts/StartNewCartCard";
import { router } from "expo-router";

// Define types for cart items and quantities
type CartItem = {
  restaurantName: string;
  restaurantEmail: string;
  id: string;
  name: string;
  quantity: number;
  imageUrl: string;
  price: number;
  totalPrice: number;
};

export default function Cart() {
  const [userCart, setUserCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [restaurantName, setRestaurantName] = useState<string>(""); // Track restaurant name
  const [restaurantEmail, setRestaurantEmail] = useState<string>(""); // Track restaurant email
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  // Fetch cart data
  const fetchCartData = async () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    try {
      const cartRef = collection(FIREBASE_DB, "carts");
      const cartQuery = query(cartRef, where("email", "==", userEmail));

      const snapshot = await getDocs(cartQuery);

      const cartItems: CartItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CartItem, "id">), // Cast data to CartItem excluding id
      }));

      // Initialize quantities
      const initialQuantities = cartItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {} as { [key: string]: number });

      setQuantities(initialQuantities);
      setUserCart(cartItems);
    } catch (error) {
      console.error("Error fetching cart data: ", error);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    setLoading(true); // Indicate that Firestore is being updated

    try {
      const cartDocRef = doc(FIREBASE_DB, "carts", itemId);
      const cartDocSnap = await getDoc(cartDocRef);

      if (cartDocSnap.exists()) {
        const cartItemData = cartDocSnap.data();
        const oriPrice = cartItemData?.oriPrice || 0;

        const newTotalPrice = oriPrice * quantity;

        await updateDoc(cartDocRef, { quantity, totalPrice: newTotalPrice });

        setUserCart((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, quantity, totalPrice: newTotalPrice }
              : item
          )
        );
      } else {
        console.error("Cart item not found");
      }
    } catch (error) {
      console.error("Error updating cart item: ", error);
      Alert.alert("Error", "Failed to update item.");
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = (id: string) => {
    setQuantities((prev) => {
      const newQuantities = { ...prev, [id]: prev[id] + 1 };
      updateCartItem(id, newQuantities[id]);
      return newQuantities;
    });
  };

  const decrementQuantity = (id: string) => {
    setQuantities((prev) => {
      const newQuantities = { ...prev, [id]: Math.max(prev[id] - 1, 0) };
      updateCartItem(id, newQuantities[id]);
      return newQuantities;
    });
  };

  const fetchCartDataRealTime = () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    const cartRef = collection(FIREBASE_DB, "carts");
    const cartQuery = query(cartRef, where("email", "==", userEmail));

    const unsubscribe = onSnapshot(cartQuery, (snapshot) => {
      const cartItems: CartItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CartItem, "id">),
      }));

      const initialQuantities = cartItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {} as { [key: string]: number });

      setQuantities(initialQuantities);
      setUserCart(cartItems);
      if (cartItems.length > 0) {
        setRestaurantName(cartItems[0].restaurantName);
      } else {
        setRestaurantName("");
      }
    });

    return unsubscribe;
  };

  const deleteCartItem = async (itemId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            const userEmail = auth.currentUser?.email;
            if (!userEmail) return;

            setLoading(true);

            try {
              const cartDocRef = doc(FIREBASE_DB, "carts", itemId);
              await deleteDoc(cartDocRef);
              fetchCartData();
              Alert.alert("Success", "Item deleted successfully!");
            } catch (error) {
              console.error("Error deleting cart item: ", error);
              Alert.alert("Error", "Failed to delete item.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = fetchCartDataRealTime();
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    fetchCartData();
  }, []);

  // Calculate total price
  const calculateTotalPrice = () => {
    return userCart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handleCheckout = () => {
    if (userCart.length === 0) {
      Alert.alert("Cart is empty", "Unable to proceed to checkout.");
    } else {
      router.push("../components/Checkout");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        {userCart?.length == 0 ? <StartNewCartCard /> : null}
        <Text style={styles.restaurantName}>{restaurantName}</Text>
      </View>

      <FlatList
        data={userCart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={
                item.imageUrl
                  ? { uri: item.imageUrl }
                  : { uri: "https://via.placeholder.com/150" }
              }
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                RM {(item.totalPrice || 0).toFixed(2)}
              </Text>
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
            <TouchableOpacity
              onPress={() => deleteCartItem(item.id)}
              style={styles.deleteIcon}
            >
              <MaterialIcons name="delete-forever" size={25} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.totalPrice}>
          Total: RM {calculateTotalPrice().toFixed(2)}
        </Text>
        <TouchableOpacity style={styles.reviewButton} onPress={handleCheckout}>
          <Text style={styles.checkOut}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: "orange",
    marginBottom: 5,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 14,
    color: "green",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    fontSize: 20,
    padding: 10,
    color: "#007BFF",
  },
  quantityText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  restaurantName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "gray",
    marginBottom: -20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    paddingBottom: Platform.OS === 'android' ? 86 : 60,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  reviewButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 8,
  },
  checkOut: {
    color: "white",
    fontWeight: "bold",
  },
});
