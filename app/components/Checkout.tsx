import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

// Define types for cart items
type CartItem = {
  restaurantName: string;
  restaurantEmail: string; // Add this
  id: string;
  name: string;
  quantity: number;
  imageUrl: string;
  price: number;
  totalPrice: number;
  username: string;
};

export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Access user data
  const [selectedAddress, setSelectedAddress] =
    useState<string>("No Address Found");
  const [paymentImage, setPaymentImage] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantEmail, setRestaurantEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [remark, setRemark] = useState<string>("");

  const auth = FIREBASE_AUTH;
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (user?.addresses) {
      const primary =
        user.addresses.find((addr) => addr.primary)?.address ||
        "No Address Found";
      setSelectedAddress(primary);
    }
   
  }, [user]);

  const fetchRestaurantName = async () => {
    try {
      const restaurantRef = collection(FIREBASE_DB, "restaurants");
      const restaurantQuery = query(
        restaurantRef,
        where("restaurantName", "==", restaurantName)
      );
      const restaurantSnapshot = await getDocs(restaurantQuery);
  
      if (!restaurantSnapshot.empty) {
        const restaurantData = restaurantSnapshot.docs[0].data();
  
        setRestaurantEmail(restaurantData.owner); // Set the restaurant email
        setPaymentImage(restaurantData.paymentImage); // Set the restaurant-specific payment image
      }
    } catch (error) {
      console.error("Error fetching restaurant details: ", error);
      Alert.alert("Error", "Failed to fetch restaurant details.");
    }
  };
  
  useEffect(() => {
    if (params.selectedAddress) {
      setSelectedAddress(params.selectedAddress as string);
    }
    fetchRestaurantName();
  }, [params]);

  // Fetch cart data
  const fetchCartData = async () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    try {
      const cartRef = collection(FIREBASE_DB, "carts");
      const cartQuery = query(cartRef, where("email", "==", userEmail));
      const snapshot = await getDocs(cartQuery);
      const ordersRef = collection(FIREBASE_DB, "orders");

      const cartItems: CartItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CartItem, "id">),
      }));

      setRestaurantName(cartItems[0].restaurantName);
      setUsername(cartItems[0].username);
      setCartItems(cartItems);

      // Calculate total price
      const total = cartItems.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0
      );
      setTotalPrice(total);
    } catch (error) {
      console.error("Error fetching cart data: ", error);
    }
  };

  // Function to clear cart items
  const clearCartItems = async () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    try {
      const cartRef = collection(FIREBASE_DB, "carts");
      const cartQuery = query(cartRef, where("email", "==", userEmail));
      const snapshot = await getDocs(cartQuery);

      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error clearing cart items: ", error);
    }
  };

  // Confirm the order
  const confirmOrder = async () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail || !receiptImage) {
      Alert.alert("Error", "Please upload a payment receipt.");
      return;
    }

    setLoading(true);

    try {
      const ordersRef = collection(FIREBASE_DB, "orders");
      // setRestaurantEmail(restaurantSnapshot.docs[0].data().email);
      await addDoc(ordersRef, {
        email: restaurantEmail,
        restaurantName: restaurantName,
        user: userEmail,
        items: cartItems,
        totalPrice,
        address: selectedAddress,
        receiptImage, // Add the receipt image here
        timestamp: new Date(),
        status: "Pending",
        username: username,
        remark: remark,
      });

      await clearCartItems(); // Clear cart items after order is placed

      Alert.alert("Success", "Your order has been placed!");
      router.push("/home");
    } catch (error) {
      console.error("Error confirming order: ", error);
      Alert.alert("Error", "Failed to place the order.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    try {
      // Request permission for media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your photos."
        );
        return;
      }

      // Launch image picker to select a photo
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // Resize the image
        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Convert resized image to Base64
        const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Set the image as Base64 encoded string
        setImage(`data:image/jpeg;base64,${base64}`);
      } else {
        Alert.alert("Selection Cancelled", "No image was selected.");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };
  useEffect(() => {
    if (auth.currentUser) {
      fetchCartData(); // Fetch cart items from Firestore
    }

    // Use `user` to set the address
    if (user?.addresses) {
      setSelectedAddress(
        user?.addresses?.find((addr) => addr.primary)?.address ??
          "No Address Found"
      );
    } else {
      console.log("No address found in user context");
    }
  }, [auth.currentUser, user]);
  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Checkout</Text>
          </View>
          <TouchableOpacity style={styles.backbtn} onPress={goBack}>
            <Ionicons name="chevron-back-outline" size={16} color="orange" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.addressContainer}>
            <Text style={styles.addressTitle}>Delivery Address</Text>
            <View style={styles.addressWrapper}>
              <View style={styles.selectedAddressContainer}>
                <Text
                  style={styles.selectedAddress}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedAddress}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.newAddressButton}
                onPress={() =>
                  router.push({
                    pathname: "../components/ChangeAddress",
                    params: {
                      currentAddress: selectedAddress,
                    },
                  })
                }
              >
                <Text style={styles.newAddressText}>Change Address</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.restaurantContainer}>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </View>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.item}>
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
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    RM {item.totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.remarkContainer}>
            <Text style={styles.remarkTitle}>Order Remarks</Text>
            <TextInput
              style={styles.remarkInput}
              placeholder="Add special instructions..."
              value={remark}
              onChangeText={setRemark}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.qrCodeContainer}>
  <Text style={styles.qrCodeTitle}>Pay via QR Code</Text>
  <Image
    source={
      paymentImage
        ? { uri: paymentImage }
        : { uri: "https://via.placeholder.com/150" }
    }
    style={styles.qrCodeImage}
  />
  <Text style={styles.receiptTitle}>Upload Payment Receipt</Text>
  {receiptImage && (
    <Image
      source={{ uri: receiptImage }}
      style={styles.receiptImage}
    />
  )}


  <TouchableOpacity
    style={styles.uploadButton}
    onPress={() => pickImage(setReceiptImage)}
  >
    <Ionicons name="cloud-upload-outline" size={20} color="orange" />
    <Text style={styles.uploadButtonText}>Upload Receipt</Text>
  </TouchableOpacity>
</View>

          <View style={styles.footer}>
            <Text style={styles.totalPrice}>
              Total: RM {totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmOrder}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? "Processing..." : "Confirm Order"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: "orange",
    marginBottom: 5,
  },
  backbtn: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "20%",
    marginBottom: 10,
  },
  backText: {
    fontSize: 14,
    color: "orange",
    marginLeft: 5,
  },
  addressContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  selectedAddress: {
    fontSize: 16,
    color: "#555",
  },
  item: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#555",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#FF6F61",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
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
  addressWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  newAddressButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "orange",
    borderRadius: 8,
  },
  selectedAddressContainer: {
    flex: 1, // Allow this container to take up remaining space
    marginRight: 10, // Add spacing between the text and the button
    flexShrink: 1, // Prevent overflow by shrinking if needed
  },
  newAddressText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  remarkContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  remarkTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  remarkInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  qrCodeContainer: {
    marginVertical: 20,
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,

  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  receiptImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "orange",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "orange",
    marginLeft: 5,
  },
  restaurantContainer: {
    marginVertical: 10, // Space above and below the container
    padding: 10, // Inner spacing for better readability
    borderRadius: 4, // Slightly rounded corners
  },
  restaurantName: {
    fontSize: 18, // Standard font size
    fontWeight: "bold", // Slightly bold for emphasis
    color: "#000", // Plain black text
  },
});
