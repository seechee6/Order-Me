import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/colors";


export default function StartNewCartCard() {
  return (
    <View style={styles.header}>
      <MaterialCommunityIcons name="cart-remove" size={35} color="black" />
      <Text style={styles.title}>Your Cart is Empty!</Text>

      <Text style={styles.desc}>
        Looks like you have not added anything to your cart.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    marginTop: 50,
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    marginTop: 10,
    fontFamily: "Poppins-Medium",
  },
  desc: {
    fontSize: 13,
    marginTop: 10,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    color: colors.gray.DEFAULT,
  },
});
