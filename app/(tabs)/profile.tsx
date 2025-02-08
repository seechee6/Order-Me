import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FIREBASE_DB } from '@/FirebaseConfig';
import { collection, query, orderBy, onSnapshot, where, doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuItem = ({
  onPress,
  title,
  icon,
  badge,
  showNotification,
}: {
  onPress: () => void;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
  showNotification?: boolean;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem}>
    <View style={styles.menuItemLeft}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={24} color="#666" style={styles.menuIcon} />
        {showNotification && <View style={styles.notificationDot} />}
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </View>
    {badge ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    ) : (
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const { logout, user } = useAuth();
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkNewAnnouncements = async () => {
      const lastViewedKey = `lastViewed_${user.username}`;
      const lastViewed = await AsyncStorage.getItem(lastViewedKey);
      const lastViewedDate = lastViewed ? new Date(lastViewed) : new Date(0);
      const announcementsRef = collection(FIREBASE_DB, 'announcements');
      const q = query(
        announcementsRef,
        orderBy('timestamp', 'desc'),
        where('timestamp', '>', lastViewedDate)
      );

      return onSnapshot(q, (snapshot) => {
        const hasNew = !snapshot.empty;
        setHasNewAnnouncements(hasNew);
      });
    };

    const unsubscribe = checkNewAnnouncements();
   
  }, [user]);

  const handleAnnouncementsPress = async () => {
    if (user) {
      const lastViewedKey = `lastViewed_${user.username}`;
      const now = new Date().toISOString();
      await AsyncStorage.setItem(lastViewedKey, now);
      setHasNewAnnouncements(false);
    }
    router.push("/components/Announcements");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/sign-in");
  };

  const username = user?.username || user?.email;
  const email = user?.email;
  const profileImage = user?.profileImage;
  const phoneNumber = user?.phoneNumber;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <TouchableOpacity
        style={styles.infoContainer}
        onPress={() => router.push("../components/EditProfile")}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../assets/images/defaultProfile.png")
            }
            style={styles.profileImage}
          />
        </View>
        <View style={styles.infoDetail}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userEmail}>{username ? email : phoneNumber}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        <MenuItem
          title="My Addresses"
          icon="location-on"
          onPress={() => router.push("../components/Addresses")}
        />
        <MenuItem
          title="Announcements"
          icon="campaign"
          onPress={handleAnnouncementsPress}
          showNotification={hasNewAnnouncements}
        />
        <MenuItem
          title="My Wishlist"
          icon="favorite"
          onPress={() => router.push("../components/wishlist")}
        />
        <MenuItem
          title="My Restaurant"
          icon="store"
          onPress={() => router.push("/menu")}
        />
        <MenuItem
          title="Order History"
          icon="receipt-long"
          onPress={() => router.push("../components/OrderHistory")}
        />
        <MenuItem
          title="Logout"
          icon="logout"
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
};
export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    padding: 20,
    paddingTop: 15,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: "#333",
    letterSpacing: 1,
  },
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 24,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoDetail: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#777",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    
  },
  menuText: {

    fontSize: 16,
    color: "#333",
  },
  badge: {
    backgroundColor: "#FF4B4B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    marginRight: 16,
  },
  notificationDot: {
    position: 'absolute',
    top: -6,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4B4B',
  },
});