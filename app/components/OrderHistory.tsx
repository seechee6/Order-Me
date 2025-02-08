import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, orderBy, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from '@/constants/colors';

type OrderItem = {
  id: string;
  email: string;
  items: Array<{
    name: string;
    quantity: number;
    imageUrl: string;
    price: number;
    totalPrice: number;
    restaurantName: string;  // Ensure this field is properly populated
  }>;
  totalPrice: number;
  status: string;
  timestamp: Date;
  address: string;
  receiptImage: string;
  remark: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const fetchOrders = () => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    const ordersRef = collection(FIREBASE_DB, 'orders');
    const orderQuery = query(
      ordersRef,
      where('user', '==', userEmail),
      where('status', '==', 'Delivered'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(orderQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<OrderItem, 'id'>),
        timestamp: doc.data().timestamp.toDate(),
      }));
      setOrders(fetchedOrders);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchOrders();
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleBuyAgain = async (order: OrderItem) => {
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

      if (!existingCartDocs.empty) {
        const firstCartItem = existingCartDocs.docs[0].data();
        if (firstCartItem.restaurantName !== order.items[0].restaurantName) {
          differentRestaurantInCart = true;
          existingRestaurantName = firstCartItem.restaurantName;
        }
      }

      if (differentRestaurantInCart) {
        Alert.alert(
          "Clear existing cart?",
          `You already have items from ${existingRestaurantName} in your cart. Adding these items will clear your existing cart.`,
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Continue",
              onPress: async () => {
                for (const doc of existingCartDocs.docs) {
                  await deleteDoc(doc.ref);
                }
                await addItemsToCart(order, userEmail);
              }
            }
          ]
        );
      } else {
        await addItemsToCart(order, userEmail);
      }
    } catch (error) {
      console.error("Error handling buy again:", error);
      Alert.alert("Error", "Failed to add items to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addItemsToCart = async (order: OrderItem, userEmail: string) => {
    const cartRef = collection(FIREBASE_DB, "carts");
    
    try {
      for (const item of order.items) {
        const oriPrice = item.totalPrice / item.quantity;
        const newCartItem = {
          restaurantName: item.restaurantName || order.items[0].restaurantName,
          name: item.name,
          oriPrice: oriPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          email: userEmail,
          imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
        };
        console.log('Adding item to cart:', newCartItem);
        if (!newCartItem.name || !newCartItem.oriPrice || !newCartItem.quantity) {
          console.error('Missing required fields for item:', newCartItem);
          continue; 
        }
        await setDoc(doc(cartRef), newCartItem);
      }
      
      Alert.alert(
        "Success", 
        "Items added to cart successfully!",
        [
          {
            text: "View Cart",
            onPress: () => router.push("/(tabs)/cart")
          },
          {
            text: "Continue Ordering",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error("Error adding items to cart:", error);
      Alert.alert("Error", "Failed to add some items to cart. Please try again.");
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleFeedbackPress = (restaurantName: string) => {
    router.push({
      pathname: "/components/Feedback",
      params: { restaurantName: restaurantName }
    });
  };

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = [];
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, OrderItem[]>);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <MaterialIcons name="arrow-back-ios" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>All Orders</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.noOrdersContainer}>
             <MaterialIcons name="history" size={50} color="#B0B0B0" />
            <Text style={styles.noOrdersText}>No order history yet</Text>
          </View>
        ) : (
          Object.keys(groupedOrders).map((status) => (
            <View key={status} style={styles.section}>
              {groupedOrders[status].map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => toggleOrderExpansion(order.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderBasicInfo}>
                      <Text style={styles.orderDate}>{formatDate(order.timestamp)}</Text>
                    </View>
                    <Text style={styles.orderAmount}>RM {order.totalPrice.toFixed(2)}</Text>
                   
                  </View>

                  {expandedOrder === order.id && (
                    <View style={styles.expandedContent}>
                      <View style={styles.itemsList}>
                        {order.items.map((item, index) => (
                          <View key={index} style={styles.orderItem}>
                            <Image
                              source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                              style={styles.itemImage}
                            />
                            <View style={styles.itemDetails}>
                              <Text style={styles.itemName}>{item.name}</Text>
                              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                              <Text style={styles.itemPrice}>RM {item.totalPrice.toFixed(2)}</Text>
                              {order.remark && (
                      <Text style={styles.itemQuantity}>Remarks: {order.remark} </Text>
                    )}
                            </View>
                          </View>
                        ))}
                      </View>

                      <View style={styles.addressSection}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <Text style={styles.addressText}>{order.address}</Text>
                      </View>

                      <View style={styles.receiptSection}>
                        <Text style={styles.sectionTitle}>Payment Receipt</Text>
                        <Image
                          source={{ uri: order.receiptImage }}
                          style={styles.receiptImage}
                          resizeMode="contain"
                        />
                      </View>

                      <TouchableOpacity
  style={styles.receivedButton}
  onPress={() => handleFeedbackPress(order.items[0].restaurantName)}
>
  <Text style={styles.buttonText}>Order Received</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.buyAgainButton}
  onPress={() => handleBuyAgain(order)}
  disabled={loading}
>
  <Text style={styles.buyAgainText}>
    {loading ? 'Adding to Cart...' : 'Order Again'}
  </Text>
</TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
 
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'center',
    width: 340
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderBasicInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  expandedContent: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  itemsList: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-around',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: 'green',
    fontWeight: '500',
  },
  addressSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
  },
  receiptSection: {
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  receivedButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.secondary["DEFAULT"],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  receivedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyAgainButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.white.DEFAULT,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth:1.5,
    borderColor:colors.secondary["DEFAULT"],
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginLeft: 10 
  },
  section: { 
    marginBottom: 20 
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginTop:20,
    justifyContent: 'center',
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 10, 
    color: '#666' 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buyAgainText:{
    color:colors.secondary.DEFAULT,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      fontSize: 16,
  }
});