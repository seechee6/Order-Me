import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import favicon from "../../assets/images/profile.jpeg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RestaurantListing from "../../components/RestaurantListing";
import restaurantData from "@/data/restaurants.json";
import groupData from "@/data/groups.json";
import GroupListings from "@/components/GroupListings";
import { CategoryButtons } from "@/components/CategoryButton";

const Home = () => {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const onCatChanged = (category: string) => {
    console.log("Category:", category);
    setCategory(category);
  };

  const handleSearchNavigate = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "../components/search",
        params: { query: searchQuery },
      });
    }
  };
  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.title}>
              <Text style={styles.heading}>Order Me</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/components/search")}>
            <View style={styles.searchWrapper}>
          
              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="Search..."
                 editable={false}
                  style={styles.searchInput}
                 
                />
                <TouchableOpacity onPress={handleSearchNavigate}>
                  <Ionicons
                    name="search"
                    size={20}
                    color={colors.black.DEFAULT}
                    style={styles.searchIcon}
                  />
                </TouchableOpacity>
              </View>
         
            </View>
            </TouchableOpacity>
            <CategoryButtons onCategoryChanged={onCatChanged} />
            <RestaurantListing listings={restaurantData} category={category} />
            <GroupListings listings={groupData} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    fontFamily: "Poppins-Bold",
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  testImage: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 8,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  menuIcon: {
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 10,
    padding: 8,
    marginTop: 20,
  },
  heading: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.secondary.DEFAULT,
    marginTop: 10,
    marginLeft: 5,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
   
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: "100%",
    width:500
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black.DEFAULT,
  },
  title: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#333333",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryBtnText: {
    marginLeft: 3,
    color: "black",
    fontWeight: "bold",
  },
  categoryBtnActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#333333",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryBtnActiveText: {
    marginLeft: 3,
    color: "white",
    fontWeight: "bold",
  },
});