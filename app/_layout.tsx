import React, { useEffect } from "react";
import { SplashScreen, Stack, router } from "expo-router";
import { useFonts } from "expo-font";
import { AuthContextProvider, useAuth } from "@/context/AuthContext";
import "./global.css";

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth(); // Get user and auth state

  useEffect(() => {
    if (typeof isAuthenticated === "undefined") return;

    const isVendor = user?.role === "vendor"; // Check if the user is a vendor

    if (isAuthenticated) {
      if (isVendor) {
        // Redirect vendors to their menu
        router.replace("/(tabs_vendor)/menu");
      } else {
        // Redirect other users to the general home screen
        router.replace("/home");
      }
    } else {
      // Redirect unauthenticated users to the sign-in page
      router.replace("/sign-in");
    }
  }, [isAuthenticated, user]); // Watch for changes in authentication or user role

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs_vendor)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="listing/[id]"
        options={{
          headerShown: true,
          title: "Listing Details", // Customize title as needed
        }}
      />
      <Stack.Screen
        name="components/EditProfile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/EditVendor"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/wishlist"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/search"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/ChatRoom"
        options={{
          headerShown: false,
        }}
      />
          <Stack.Screen
        name="components/ViewFeedback"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/Feedback"
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
        name="components/Announcements"
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
        name="components/CreateAnnouncements"
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
  name="components/RestaurantMenuScreen"
  options={{
    headerShown: false,
  }}
  initialParams={{ restaurantName: '' }}
/>
      <Stack.Screen
        name="components/Checkout"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/ChangeAddress"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="components/Addresses"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="components/OrderDetails"
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="components/OrderHistory"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default function rootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}