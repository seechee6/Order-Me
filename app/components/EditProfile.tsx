import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, query, where, getDocs, collection } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

const EditProfile: React.FC = () => {
  const { user, setUser, } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [addresses, setAddress] = useState(user?.addresses || "");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user?.profileImage]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User data is unavailable.");
      return;
    }
    if (!username) {
      Alert.alert("Error", "Please enter your username.");
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(FIREBASE_DB, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "User not found.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userRef = doc(FIREBASE_DB, "users", userDoc.id);
      const updatedUser = {
        username,
        phoneNumber,
        profileImage: profileImage || "",
      };

      await updateDoc(userRef, updatedUser);
      setUser({ ...user, ...updatedUser });

      Alert.alert("Profile", "Details updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setProfileImage(`data:image/jpeg;base64,${base64}`);
      } else {
        Alert.alert("Selection Cancelled", "No image was selected.");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  return (
    <SafeAreaView style={{ height: "100%", padding: 25, paddingTop: 15 }}>
       <View style={styles.header}>
       <Ionicons
        name="arrow-back-outline"
        size={25}
        color="black"
        onPress={() => router.back()}
       /> 
       <Text style={styles.headerText}> Edit Profile</Text>
       </View>
      
      <SafeAreaView style={styles.container2}>
      <Text style={styles.label}>Profile Image</Text>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <Text>Pick a profile image</Text>
            )}
          </View>
        </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} />

      {/* <Text style={styles.label}>Address</Text> */}
      {/* <TextInput style={styles.input} value={address} onChangeText={setAddress} /> */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
      </SafeAreaView>
    
      
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  container2: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "orange",
  },
  label: {
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    fontSize: 16,
  },
  imagePicker: {
    marginTop: 10,
    height: 150,
    width: 150,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    alignSelf: "center",
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 5,
    resizeMode: "cover",
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "orange",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
