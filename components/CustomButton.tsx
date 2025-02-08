import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";


import { colors } from "@/constants/colors";


interface CustomButtonProps {
  title: string;
  handleOnPress: () => void;
  width?: number;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handleOnPress,
  width,
}) => {
  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      activeOpacity={0.7}
      onPress={handleOnPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: colors.secondary.DEFAULT,
    minHeight: 48,
    borderRadius: 12,
    minWidth: 128,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: colors.primary,
  },
});
