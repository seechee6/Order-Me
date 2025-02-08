import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack, Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "@/context/AuthContext";
import TabBar from "@/components/CustomTabbar";

const TabLayout = () => {
  const { role } = useAuth();
  return (
      <Tabs screenOptions={{ tabBarActiveTintColor: 'orange' }}
      tabBar={props => <TabBar {...props} />}
      >
        <Tabs.Screen name="home" 
        redirect ={role=="admin"}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
        }}/>
        <Tabs.Screen name="cart" options={{
          headerShown: false,
          title: 'Cart',
          tabBarIcon: ({ color }) => <Feather size={24} name="shopping-cart" color={color} />
        }}/>
        <Tabs.Screen name="message" options={{
          headerShown: false,
          title: 'Message',
          tabBarIcon: ({ color }) => <AntDesign name="message1" size={22} color={color}  />
        }}/>
        <Tabs.Screen name="status" options={{
          headerShown: false,
          title: 'Status',
          tabBarIcon: ({ color }) => <FontAwesome name="star" size={24} color={color} />
        }}/>
        <Tabs.Screen name="profile" options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color}  />
        }}/>
      </Tabs>
  );
};

export default TabLayout;

const styles = StyleSheet.create({});
