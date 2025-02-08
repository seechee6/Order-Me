import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
} from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import CustomTextInput from "@/components/CustomTextInput";
import { Link, router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { signIn, isAuthenticated } = useAuth();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const handleSignIn = () => {
    console.log(emailRef.current, "and ", passwordRef.current);
    signIn(emailRef.current, passwordRef.current);
    if (isAuthenticated) {
      router.replace("/home");
    }
  };

  return (
    <SafeAreaView className="h-full align-center justify-center">
      <KeyboardAvoidingView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
            <View className="p-4 h-full">
              <View style={styles.info}>
                <Image
                  source={images.logo}
                  className="max-h-[267px]"
                  style={{ resizeMode: "contain" }}
                />
                <Text>Let's sign in to continue order me</Text>
              </View>
              <View style={styles.form}>
                <CustomTextInput
                  placeholder="Email"
                  onChangeText={(email) => (emailRef.current = email)}
                />
                <CustomTextInput
                  secureTextEntry
                  placeholder="Password"
                  onChangeText={(password) => (passwordRef.current = password)}
                />
                <CustomButton
                  title="Sign In"
                  handleOnPress={handleSignIn} // Disables button when loading
                />
              </View>
              <View style={styles.line} />
              <View style={styles.signUp}>
                <Text>Don't have an account? </Text>
                <Link href="/sign-up">Sign Up</Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  info: {
    marginTop: 24, // Keeps some top spacing
    marginBottom: 8, // Reduced bottom spacing
    maxHeight: 360,
    alignItems: "center",
  },
  form: {
    gap: 16, // Reduced gap between input fields
    marginTop: -10, // Moves the form closer to the text
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
