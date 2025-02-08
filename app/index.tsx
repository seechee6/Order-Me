import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/images";
import CustomButton from "../components/CustomButton";
import { router } from "expo-router";

const App = () => {
  return (
    <SafeAreaView className="p-5 justify-center h-full gap-4">
      <View className="items-center mb-16">
        <Image source={icons.logo} style={{ resizeMode: "contain", maxHeight: 300 }}></Image>
        <Text>Welcome to Order Me!!!</Text>
      </View>
      <CustomButton
        title="Continue with Email"
        handleOnPress={() => router.replace("/sign-in")}
      ></CustomButton>
    </SafeAreaView>
  );
};

export default App;
