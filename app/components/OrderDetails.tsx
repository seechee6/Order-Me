import { StyleSheet, Text, TouchableOpacity, View, Alert, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { doc, getDoc, updateDoc, query, where, getDocs,Timestamp } from "firebase/firestore";
import { ordersRef } from "@/FirebaseConfig";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { format } from 'date-fns';

const OrderDetails = () => {
  const params = useLocalSearchParams();
  const orderItem =
    params.orderItem && !Array.isArray(params.orderItem)
      ? JSON.parse(params.orderItem)
      : null;

  const [orderStatus, setOrderStatus] = useState<string>("");
  const [orderImage, setOrderImage] = useState<string | null>(null);
  const [cancelStatus, setCancelStatus] = useState<string>("");

  const fetchOrderStatus = async () => {

    if (!orderItem?.orderId) return;

    try {
      const orderDocRef = doc(ordersRef, orderItem.orderId);
      const orderDoc = await getDoc(orderDocRef);

      if (orderDoc.exists()) {
        const data = orderDoc.data();
        setOrderStatus(data.status || "Pending");
        setOrderImage(data.proveImg || null);
        orderItem.timestamp = data.timestamp;
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return "N/A";

      let date: Date;

      // If timestamp is in Firestore Timestamp format (has seconds and nanoseconds)
      if (timestamp.seconds && timestamp.nanoseconds) {
        date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
      } else if (timestamp instanceof Date) {
        date = timestamp; // Already a JavaScript Date object
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp); // Parse ISO date string
      } else {
        throw new Error("Unsupported timestamp format");
      }

      // Format the date using date-fns
      return format(date, "MMM d, yyyy h:mm:ss a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const uploadImageToAllOrders = async (imageBase64: string) => {
    try {
      // Query for all orders with the same address
      const q = query(ordersRef, where("address", "==", orderItem.address));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const orderDocRef = doc.ref;
        await updateDoc(orderDocRef, { proveImg: imageBase64 });
      });

      Alert.alert("Success", "Image uploaded for all orders with the same address.");
    } catch (error) {
      console.error("Error uploading image to all orders:", error);
      Alert.alert("Error", "Failed to upload image to all orders.");
    }
  };

  const pickImage = async () => {
    if (!orderItem?.orderId) {
      Alert.alert("Error", "Order ID is missing.");
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // Resize and compress the image
        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const imageBase64 = `data:image/jpeg;base64,${base64}`;
        setOrderImage(imageBase64);

        // Update the order status to "Delivered" immediately to show checkmark-circle
        const orderDocRef = doc(ordersRef, orderItem.orderId);
        await updateDoc(orderDocRef, { proveImg: imageBase64, status: "Delivered" });
        setOrderStatus("Delivered");

        // Ask if the user wants to upload the image for all orders with the same address
        Alert.alert(
          "Confirm Image Upload",
          `Do you want to set all orders at ${orderItem.address} as delivered and upload this photo to all of them?`,
          [
            {
              text: "Cancel",
              onPress: async () => {
                Alert.alert("Success", "Image uploaded and status updated to Delivered for this order.");
              },
            },
            {
              text: "Yes",
              onPress: async () => {
                // Upload the image to all orders with the same address
                await uploadImageToAllOrders(imageBase64);

                // Update the status to "Delivered" for all orders with the same address
                const q = query(ordersRef, where("address", "==", orderItem.address));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach(async (doc) => {
                  const orderDocRef = doc.ref;
                  await updateDoc(orderDocRef, { status: "Delivered" });
                });

                Alert.alert("Success", "Image uploaded and status updated to Delivered for all orders.");
              },
            },
          ]
        );
      } else {
        Alert.alert("Selection Cancelled", "No image was selected.");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick and save the image.");
    }
  };

  const cancelOrder = async () => {
    try {
      if (!orderItem?.orderId) {
        Alert.alert("Error", "Order ID is missing.");
        return;
      }
  
      // Show confirmation alert
      Alert.alert(
        "Confirm Cancellation",
        "Are you sure you want to cancel this order?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              // Proceed with the cancellation if the user confirms
              const orderDocRef = doc(ordersRef, orderItem.orderId);
              await updateDoc(orderDocRef, { status: "Cancelled" });
  
              setOrderStatus("Cancelled");
              setCancelStatus("Order being cancelled"); // Set the cancellation message
              Alert.alert("Success", "Order has been cancelled.");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error cancelling the order:", error);
      Alert.alert("Error", "Failed to cancel the order.");
    }
  };
  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    fetchOrderStatus();
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.title}>Order Details</Text>
          </View>
          <TouchableOpacity style={styles.backbtn} onPress={goBack}>
            <Ionicons name="chevron-back-outline" size={16} color="orange" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          {orderItem && (
            <View style={styles.card}>
              <Text style={styles.username}>{orderItem.username}</Text>
              <Text style={styles.details}>Address: {orderItem.address}</Text>
              <Text style={styles.details}>Date: {orderItem.timestamp ? formatDate(orderItem.timestamp) : "N/A"}</Text>
              <Text style={styles.details}>Order ID: {orderItem.orderId || "N/A"}</Text>

              <View style={styles.statusContainer}>
                <Text style={styles.statusTitle}>Status:</Text>

                {/* Preparing Food */}
                <View style={styles.statusRow}>
                  <Ionicons
                    name={
                      orderStatus === "Preparing" ||
                      orderStatus === "Out for delivery" ||
                      orderStatus === "Delivered"
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={18}
                    color={
                      orderStatus === "Preparing" ||
                      orderStatus === "Out for delivery" ||
                      orderStatus === "Delivered"
                        ? "orange"
                        : "#555"
                    }
                  />
                  <Text
                    style={[styles.status, orderStatus === "Preparing" || orderStatus === "Out for delivery" || orderStatus === "Delivered" ? styles.statusActive : {}]}
                  >
                    Preparing Food
                  </Text>
                </View>

                {/* Out for delivery */}
                <View style={styles.statusRow}>
                  <Ionicons
                    name={
                      orderStatus === "Out for delivery" || orderStatus === "Delivered"
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={18}
                    color={
                      orderStatus === "Out for delivery" || orderStatus === "Delivered"
                        ? "orange"
                        : "#555"
                    }
                  />
                  <Text
                    style={[styles.status, orderStatus === "Out for delivery" || orderStatus === "Delivered" ? styles.statusActive : {}]}
                  >
                    Out for delivery
                  </Text>
                </View>

                {/* Delivered */}
                <View style={styles.statusRow}>
                  <Ionicons
                    name={orderStatus === "Delivered" ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={orderStatus === "Delivered" ? "orange" : "#555"}
                  />
                  <Text style={[styles.status, orderStatus === "Delivered" ? styles.statusActive : {}]}>
                    Delivered
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Ionicons name="cloud-upload-outline" size={20} color="orange" />
                <Text style={styles.uploadText}>Upload photo</Text>
              </TouchableOpacity>

              {/* Display uploaded photo */}
              {orderImage && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: orderImage }} style={styles.uploadedImage} />
                  <Text style={styles.uploadedText}>Uploaded Photo</Text>
                </View>
              )}

              <Text style={styles.details}>Items:</Text>
              <Text style={styles.items}>
                {orderItem.quantity} x {orderItem.name} - RM{orderItem.oriPrice}
              </Text>

              <Text style={styles.details}>Remarks:</Text>
              <Text style={styles.remarks}>{orderItem.remark || "No remarks"}</Text>

              <Text style={styles.total}>Total: RM{orderItem.totalPrice}</Text>
           {/* Cancel Order Button */}
           {orderStatus !== "Cancelled" && (
                <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
                  <Ionicons name="close-circle-outline" size={20} color="red" />
                  <Text style={styles.cancelText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
              {/* Display cancellation status */}
            {cancelStatus && (
              <View style={styles.cancelStatusContainer}>
                <Text style={styles.cancelStatusText}>{cancelStatus}</Text>
              </View>
            )}
           </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};
export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    height: "100%",
  },
  scrollViewContent: {
    paddingBottom: 20, // Ensures that the content at the bottom is visible
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: "#FF8C00",
    textAlign: "left",
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  statusContainer: {
    marginVertical: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    marginLeft: 8,
  },
  statusActive: {
    color: "orange",
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
  uploadText: {
    fontSize: 14,
    color: "orange",
    marginLeft: 5,
  },
  imageContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  uploadedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadedText: {
    fontSize: 14,
    color: "orange",
  },
  items: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  remarks: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: "orange",
    textAlign: "right",
    marginTop: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: "red",
    marginLeft: 5,
  },
  cancelStatusContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
});
