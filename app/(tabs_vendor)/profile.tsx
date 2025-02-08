import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Menu, PaperProvider } from 'react-native-paper'; 
import RestaurantStatusToggle from '../components/RestaurantStatusToggle';

const Profile = () => {
  const { logout, user } = useAuth();
  const [paymentImage, setPaymentImage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fetchPaymentImage = async () => {
      if (user?.paymentImage) {
        setPaymentImage(user.paymentImage);
      } else {
        // Optional: Fetch paymentImage from Firebase if needed
        // const paymentImageFromFirebase = await getPaymentImage(user?.email);
        // setPaymentImage(paymentImageFromFirebase);
        setPaymentImage(null);
      }
    };
    fetchPaymentImage();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/sign-in");
  };

  const navigateToCustomer = () => {
    router.push("/home");
  };
  const navigateToCreateAnnouncements = () => {
    router.push("../components/CreateAnnouncements");
  };
  const viewFeedbacks = () => {
    router.push("../components/ViewFeedback");
  };

  const handleMenuVisibility = () => setVisible(!visible);

  const username = user?.username ?? user?.email;
  const email = user?.email;
  const phoneNumber = user?.phoneNumber;
  const address = user?.addresses?.find(addr => addr.primary)?.address;
  const profileImage = user?.profileImage;
  const restaurantName = user?.restaurantName;
  const restaurantAddress = user?.restaurantAddress;
  const restaurantImage = user?.restaurantImage;
  const category = user?.category;

  return (
    
    <SafeAreaView style={{ flex: 1, paddingBottom: 68 }}>
      <PaperProvider> 
      <ScrollView
        contentContainerStyle={{ padding: 25, paddingTop: 15 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerActions}>
          <Menu
      visible={visible}
      onDismiss={handleMenuVisibility}
      anchor={
        <MaterialIcons
          name="more-vert"
          size={30}
          color="black"
          onPress={handleMenuVisibility}
        />
      }
      style={styles.menu}
    >
      <Menu.Item
        onPress={navigateToCustomer}
        title="Switch to Customer"
        leadingIcon={() => <MaterialIcons name="person" size={20} color="black" />} 
      />
      <Menu.Item
        onPress={viewFeedbacks}
        title="View Customer Feedbacks"
        leadingIcon={() => <MaterialIcons name="feedback" size={20} color="black" />}
      />
      <Menu.Item
        onPress={navigateToCreateAnnouncements}
        title="Create announcement"
        leadingIcon={() => <MaterialIcons name="notifications" size={20} color="black" />}
      />
      <View style={styles.menuDivider} />
      <Menu.Item
        onPress={handleLogout}
        title="Logout"
        leadingIcon={() => <MaterialIcons name="exit-to-app" size={20} color="black" />} 
      />
    </Menu>
          </View>
        </View>

        <View className="items-center" style={styles.profileImageContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require('../../assets/images/defaultProfile.png')
            }
            style={styles.profileImage}
          />
          <Text className="mt-4" style={styles.infoText}>{username}</Text>
        </View>
        <RestaurantStatusToggle restaurantName={restaurantName} />    
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.infoText}>{email}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.infoText}>+60 {phoneNumber}</Text>

          <Text style={styles.label}>Address</Text>
          <Text style={styles.infoText}>{address}</Text>

          <Text style={styles.label}>Restaurant Name</Text>
          <Text style={styles.infoText}>{restaurantName}</Text>

          <Text style={styles.label}>Restaurant Address</Text>
          <Text style={styles.infoText}>{restaurantAddress}</Text>

          <Text style={styles.label}>Category</Text>
          <Text style={styles.infoText}>{category}</Text>

          <Text style={styles.label}>Restaurant Image</Text>
          <Image
            source={
              restaurantImage
                ? { uri: restaurantImage }
                : { uri: "https://via.placeholder.com/150" }
            }
            style={styles.restaurantImage}
          />

          <Text style={styles.label}>Payment QR Image</Text>
          <Image
            source={
              paymentImage
                ? { uri: paymentImage }
                : { uri: "https://via.placeholder.com/150" }
            }
            style={styles.restaurantImage}
          />
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("../components/EditVendor")}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </ScrollView>
      </PaperProvider> 
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: "orange",
  },
  profileImageContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  editButton: {
    paddingVertical: 10,
    backgroundColor: "orange",
    borderRadius: 15,
    alignItems: "center",
    marginTop: 8,
  },
  editText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  iconSpacing: {
    marginRight: 20,
  },
  restaurantImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: "cover",
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  menu:{
    borderRadius: 50, 
    maxWidth: '65%', 
    marginLeft:-10,
  
 
  }
});