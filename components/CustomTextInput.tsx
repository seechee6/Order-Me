import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";


import { colors } from "@/constants/colors";


interface textInputProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

const CustomTextInput: React.FC<textInputProps> = ({
  placeholder,
  onChangeText,
  secureTextEntry,
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      style={styles.container}
    />
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.secondary.DEFAULT,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 36,
  },
});
