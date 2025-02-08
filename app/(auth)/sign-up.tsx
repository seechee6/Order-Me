import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import CustomTextInput from "@/components/CustomTextInput";
import images from "@/constants/images";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

const signUp = () => {
  const { signUp, isAuthenticated } = useAuth();
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const phoneNumRef = useRef("0");
  const addressRef = useRef("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const handleSignUp = () => {
    if (passwordRef.current == confirmPasswordRef.current) {
      signUp(
        emailRef.current,
        passwordRef.current,
        phoneNumRef.current,
        addressRef.current
      );
    } else {
      alert("Password must be the same");
    }
  };

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <KeyboardAvoidingView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
              <View style={styles.info}>
                <Image source={images.logo} style={styles.image}></Image>
                <Text>Let's create an account to continue order me</Text>
              </View>
              <View style={styles.form}>
                <CustomTextInput
                  placeholder="Email"
                  onChangeText={(email) => (emailRef.current = email)}
                />
                <CustomTextInput
                  placeholder="Phone Number"
                  onChangeText={(phoneNum) => (phoneNumRef.current = phoneNum)}
                />
                <CustomTextInput
                  placeholder="Address"
                  onChangeText={(address) => (addressRef.current = address)}
                />
                <CustomTextInput
                  placeholder="Password"
                  onChangeText={(password) => (passwordRef.current = password)}
                  secureTextEntry={true}
                />
                <CustomTextInput
                  placeholder="Confirm Password"
                  onChangeText={(cPassword) =>
                    (confirmPasswordRef.current = cPassword)
                  }
                  secureTextEntry={true}
                />
                <CustomButton title="Sign Up" handleOnPress={handleSignUp} />
              </View>
              <View style={styles.line} />
              <View style={styles.signUp}>
                <Text>Already have an account? </Text>
                <Link href="/sign-in">Sign In</Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default signUp;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    height: "100%",
  },
  form: {
    gap: 14,
    marginTop: -60, // Adjusted to move the form closer to the text
  },
  info: {
    marginTop: 12,
    marginBottom: 8, // Reduce bottom margin for a smaller gap
    maxHeight: 360,
    alignItems: "center",
  },
  image: {
    resizeMode: "contain",
    maxHeight: 267,
  },
  signUp: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  line: {
    borderWidth: 0.5,
    borderColor: "grey",
    marginTop: 16,
  },
});
