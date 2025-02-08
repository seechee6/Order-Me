import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import TabBar from "@/components/CustomTabbar";

const TabLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{ tabBarActiveTintColor: "orange" }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="menu"
          options={{
            headerShown: false,
            title: "Menu",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
            tabBarLabel: "Menu", // Explicitly setting label
          }}
        />
        <Tabs.Screen
          name="addmenu" // New screen name
          options={{
            headerShown: false,
            title: "AddMenu",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name="plus" color={color} />
            ), // Add icon
            tabBarLabel: "AddMenu", // Explicitly setting label
          }}
        />
        <Tabs.Screen
          name="order"
          options={{
            headerShown: false,
            title: "Order",
            tabBarIcon: ({ color }) => (
              <Feather size={24} name="shopping-cart" color={color} />
            ),
            tabBarLabel: "Orders", // Explicitly setting label
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            headerShown: false,
            title: "Message",
            tabBarIcon: ({ color }) => (
              <AntDesign name="message1" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={22} color={color} />
            ),
            tabBarLabel: "Profile",
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;

const styles = StyleSheet.create({});
