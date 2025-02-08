import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import {
  GestureHandlerRootView,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import {
  onSnapshot,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { ordersRef } from "@/FirebaseConfig";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export interface OrderItem {
  user: string;
  email: string;
  id: string;
  imageUrl: string;
  name: string;
  oriPrice: number;
  quantity: number;
  restaurantName: string;
  totalPrice: number;
  username: string;
  orderId: string;
  timestamp: Timestamp;
  customerEmail: string;
  orderStatus: string;
  address: string;
  remark: string;
  proveImg: string;
}

interface Order {
  id: string;
  address: string;
  email: string;
  status: string;
  items: OrderItem[];
  timestamp: Timestamp;
  totalPrice: number;
  remark: string;
}

const Order = () => {
  const { user } = useAuth();
  const vendorEmail = user?.email;
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedAddress, setSelectedAddress] = useState<string>("All");
  const [selectedMealType, setSelectedMealType] = useState<string>("All");

  useEffect(() => {
    // Real-time updates with onSnapshot
    const ordersQuery = query(ordersRef, where("email", "==", vendorEmail));

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const updatedOrders: Order[] = [];
      const updatedItems: OrderItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updatedOrders.push({
          id: doc.id,
          address: data.address,
          email: data.user,
          status: data.status,
          items: data.items,
          timestamp: data.timestamp,
          totalPrice: data.totalPrice,
          remark: data.remark,
        });

        data.items.forEach((item: any) => {
          updatedItems.push({
            ...item,
            orderId: doc.id,
            timestamp: data.timestamp,
            customerEmail: data.user,
            orderStatus: data.status,
            address: data.address,
            remark: data.remark,
          });
        });
      });

      setOrders(updatedOrders);
      setOrderItems(updatedItems);
      setFilteredOrders(updatedItems); // Make sure to update the filtered orders too
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [vendorEmail]);

  const handleSearch = (text: string) => {
    if (text.trim() === "") {
      setFilteredOrders(orderItems);
      return;
    }

    const searchText = text.toLowerCase();
    const filtered = orderItems.filter(
      (order) =>
        // Search by status
        order.orderStatus.toLowerCase().includes(searchText) ||
        order.name.toLowerCase().includes(searchText) ||
        order.address.toLowerCase().includes(searchText)
    );

    setFilteredOrders(filtered);
  };

  const handleSortAndFilter = () => {
    let filtered = orderItems;

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (order) => order.orderStatus === selectedStatus
      );
    }

    // Filter by address
    if (selectedAddress !== "All") {
      filtered = filtered.filter((order) => order.address === selectedAddress);
    }

    // Filter by meal type
    if (selectedMealType !== "All") {
      filtered = filtered.filter((order) => order.name === selectedMealType);
    }

    setFilteredOrders(filtered);
  };
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    handleSortAndFilter();
  }, [selectedStatus, selectedAddress, selectedMealType]);

  // Inside your `handleStatusUpdate` function, consider adding the Cancelled status if you plan to update it from another part of the app.
  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    if (currentStatus === "Cancelled") return; // Prevent updating a cancelled order

    setIsUpdating(true); // Prevent multiple clicks
    try {
      const orderDocRef = doc(ordersRef, orderId); // Reference to the specific order
      let newStatus = "";

      if (currentStatus === "Pending") {
        newStatus = "Preparing";
      } else if (currentStatus === "Preparing") {
        newStatus = "Out for delivery";
      }

      await updateDoc(orderDocRef, { status: newStatus }); // Update Firestore

      // Update local state for real-time UI feedback
      setOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.orderId === orderId ? { ...item, orderStatus: newStatus } : item
        )
      );
      setFilteredOrders((prevFiltered) =>
        prevFiltered.map((item) =>
          item.orderId === orderId ? { ...item, orderStatus: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false); // Allow further interactions
    }
  };

  return (
    <GestureHandlerRootView style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text style={styles.title}>Orders</Text>
            <View>
              <TextInput
                placeholder="Search for orders"
                style={styles.searchBar}
                onChangeText={handleSearch}
              ></TextInput>
            </View>
            <View style={styles.filtersContainer}>
              {/* Status Dropdown */}
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  handleSortAndFilter();
                }}
                style={styles.filterPicker}
              >
                <Picker.Item label="Status" value="All" />
                <Picker.Item label="Preparing" value="Preparing" />
                <Picker.Item label="Out for delivery" value="Out for delivery" />
                <Picker.Item label="Delivered" value="Delivered" />
              </Picker>

              {/* Address Dropdown */}
              <Picker
                selectedValue={selectedAddress}
                onValueChange={setSelectedAddress}
                style={styles.filterPicker}
              >
                <Picker.Item label="Addresses" value="All" />
                {Array.from(
                  new Set(orderItems.map((item) => item.address))
                ).map((address) => (
                  <Picker.Item key={address} label={address} value={address} />
                ))}
              </Picker>

              <Picker
                selectedValue={selectedMealType}
                onValueChange={setSelectedMealType}
                style={styles.filterPicker}
              >
                <Picker.Item label="Meal Types" value="All" />
                {Array.from(new Set(orderItems.map((item) => item.name))).map(
                  (name) => (
                    <Picker.Item key={name} label={name} value={name} />
                  )
                )}
              </Picker>
            </View>
            <ScrollView style={{ height: "72%" }}>
              <View>
                {filteredOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() =>
                      router.push({
                        pathname: "../components/OrderDetails",
                        params: {
                          orderItem: JSON.stringify(order),
                        },
                      })
                    }
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.username}>{order.username}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          (order.orderStatus === "Pending" ||
                            order.orderStatus === "Preparing") &&
                          !isUpdating
                            ? handleStatusUpdate(
                                order.orderId,
                                order.orderStatus
                              )
                            : null
                        }
                      >
                        <Text
                          style={[
                            styles.statusBadge,
                            order.orderStatus === "Cancelled"
                              ? styles.cancelStatus
                              : order.orderStatus === "Pending"
                              ? styles.pendingStatus
                              : order.orderStatus === "Preparing"
                              ? styles.preparingStatus
                              : order.orderStatus === "Out for delivery"
                              ? styles.outForDeliveryStatus
                              : styles.deliveredStatus,
                          ]}
                        >
                          {order.orderStatus}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.address}>{order.address}</Text>
                    <Text style={styles.itemName}>{order.name}</Text>
                    {order.remark && (
                      <Text style={styles.remark}>"{order.remark}"</Text>
                    )}
                    <Text style={styles.totalPrice}>RM{order.totalPrice}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#FF8C00",
    marginBottom: 20,
  },
  searchBar: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "white",
  },
  searchBarText: {
    fontSize: 16,
    color: "black",
    opacity: 0.6,
  },
  searchBarIcon: {
    color: "black",
    opacity: 0.6,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelStatus: {
    backgroundColor: "#FFE2E2",
    color: "#E14949",
  },
  pendingStatus: {
    backgroundColor: "#FFE0F1",
    color: "#DA1C92",
  },
  preparingStatus: {
    //purple
    backgroundColor: "#EAE1FB",
    color: "#8A2BE2",
  },
  outForDeliveryStatus: {
    //blue
    backgroundColor: "#E3F2FD",
    color: "#2196F3",
  },
  deliveredStatus: {
    //green
    backgroundColor: "#E8F5E9",
    color: "#4CAF50",
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  remark: {
    fontSize: 12,
    color: "#FF5722",
    fontStyle: "italic",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C00",
    textAlign: "right",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  filterPicker: {
    flex: 1,
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    fontSize: 12,
  },
  orderCardText: {
    fontSize: 14,
    color: "#333",
  },
});

export default Order;
