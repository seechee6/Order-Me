import { StyleSheet, Text, View, TextInput, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import ChatList from "../components/ChatList";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { userRef } from "@/FirebaseConfig";
import { query, where, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import Ionicons from '@expo/vector-icons/Ionicons';

const Message = () => {
  const { logout, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user?.email) {
      getUsers();
    }
  }, [user?.email]);

  const getUsers = async () => {
    try {
      const q = query(userRef, where("email", "!=", user?.email));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.restaurantName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <SafeAreaView style={{ height: "100%", padding: 25, paddingTop: 15, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Text style={styles.title}>Message</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#ccc" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by restaurant name..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {filteredUsers.length > 0 ? (
        <ChatList currentUser={user} users={filteredUsers} />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text>No restaurant found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Message;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: "orange",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "white",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
});
