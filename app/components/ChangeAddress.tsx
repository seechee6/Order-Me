import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  Gesture,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const ChangeAddress = () => {
  const { user } = useAuth();
  const { currentAddress } = useLocalSearchParams();
  console.log("Current Address:", currentAddress);

  const handleSelectAddress = (address: string) => {
    router.back();
    router.setParams({ selectedAddress: address });
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableWithoutFeedback onPress={() => router.back()}>
            <Text >Back</Text>
          </TouchableWithoutFeedback>
          <Text >Select Delivery Address</Text>
        </View>

        <View style={styles.addressList}>
          {user?.addresses?.map((address, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.addressItem,
                address.address === currentAddress && styles.selectedAddress
              ]}
              onPress={() => handleSelectAddress(address.address)}
            >
              <Text>{address.address}</Text>
              {address.state && <Text>{address.state}</Text>}
              {address.postcode && <Text>{address.postcode}</Text>}
              {address.primary && <Text style={styles.primaryBadge}>Primary</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ChangeAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  addressList: {
    flex: 1
  },
  addressItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  selectedAddress: {
    backgroundColor: '#f0f0f0'
  },
  primaryBadge: {
    color: 'green',
    fontSize: 12
  }
});