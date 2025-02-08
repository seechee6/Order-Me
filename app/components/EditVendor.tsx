import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

const EditDetails: React.FC = () => {
  const { user, setUser } = useAuth();
  // States for both personal and vendor details
  const [username, setUsername] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [address, setAddress] = useState(user?.addresses.find((address) => address.primary)?.address || "");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  const [restaurantAddress, setRestaurantAddress] = useState(user?.restaurantAddress || "");
  const [category, setCategory] = useState(user?.category || "mix rice");
  const [restaurantImage, setRestaurantImage] = useState<string | null>(null); // State for restaurant image
  const [paymentImage, setPaymentImage] = useState<string | null>(null); // State for payment image
  const [profileImage, setProfileImage] = useState<string | null>(null); // State for profile image
  const [loading, setLoading] = useState(false);

  // Fetch the profile and restaurant images if available
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        const usersCollection = collection(FIREBASE_DB, "users");
        const userQuery = query(usersCollection, where("email", "==", user.email));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          setProfileImage(userData.profileImage || null);
        }

        const restaurantsCollection = collection(FIREBASE_DB, "restaurants");
        const restaurantQuery = query(restaurantsCollection, where("owner", "==", user.email));
        const restaurantSnapshot = await getDocs(restaurantQuery);

        if (!restaurantSnapshot.empty) {
          const restaurantDoc = restaurantSnapshot.docs[0];
          const restaurantData = restaurantDoc.data();
          setRestaurantImage(restaurantData.restaurantImage || null);
          setPaymentImage(restaurantData.paymentImage || null);
        }
      }
    };

    fetchUserData();
  }, [user?.email]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User data is unavailable.");
      return;
    }

    if (!username || !restaurantName) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Update user details
      const usersRef = collection(FIREBASE_DB, "users");
      const userQuery = query(usersRef, where("email", "==", user.email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        Alert.alert("Error", "User not found.");
        setLoading(false);
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userDocRef = doc(FIREBASE_DB, "users", userDoc.id);

      const updatedUser = { username, phoneNumber, address, restaurantName, category, restaurantAddress, paymentImage: paymentImage || "", profileImage: profileImage || "" };
      await updateDoc(userDocRef, updatedUser);
      setUser({ ...user, ...updatedUser });

      // Update or create restaurant details
      const restaurantsCollection = collection(FIREBASE_DB, "restaurants");
      const restaurantQuery = query(restaurantsCollection, where("owner", "==", user.email));
      const restaurantSnapshot = await getDocs(restaurantQuery);

      if (!restaurantSnapshot.empty) {
        const restDoc = restaurantSnapshot.docs[0];
        const restaurantDocRef = doc(FIREBASE_DB, "restaurants", restDoc.id);
        await updateDoc(restaurantDocRef, { restaurantName, restaurantAddress, category, owner: user.email, restaurantImage, paymentImage });
      } else {
        const newRestaurantDocRef = doc(restaurantsCollection);
        await setDoc(newRestaurantDocRef, { restaurantName, restaurantAddress, category, owner: user.email, restaurantImage,paymentImage });
      }

      Alert.alert("Profile", "Details updated successfully.", [
        { text: "OK", onPress: () => router.push("../(tabs_vendor)/profile") },
      ]);
    } catch (error) {
      console.error("Failed to update details:", error);
      Alert.alert("Error", "Failed to update details.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      // Request permission for media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to your photos.");
        return;
      }

      // Launch image picker to select a photo
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;

        // Resize the image
        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Convert resized image to Base64
        const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Set the image as Base64 encoded string
        setImage(`data:image/jpeg;base64,${base64}`);
      } else {
        Alert.alert("Selection Cancelled", "No image was selected.");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SafeAreaView style={{ flex: 1, height: "100%", padding: 25, paddingTop: 15 }}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back-outline"
            size={25}
            color="black"
            onPress={() => router.back()}
          />
          <Text style={styles.headerText}>Edit Details</Text>
        </View>

        <SafeAreaView style={styles.container}>
          {/* Personal Details */}
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <Text style={styles.label}>Profile Image</Text>
          <TouchableOpacity onPress={() => pickImage(setProfileImage)}>
            <View style={styles.imagePicker1}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.image1} />
              ) : (
                <Text>Pick a profile image</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />

          

          {/* Vendor Details */}
          <Text style={styles.sectionTitle2}>Vendor Details</Text>

          <Text style={styles.label}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            value={restaurantName}
            onChangeText={setRestaurantName}
          />

        <Text style={styles.label}>Restaurant Address</Text>
          <TextInput
            style={styles.input}
            value={restaurantAddress}
            onChangeText={setRestaurantAddress}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Mix Rice" value="Mix Rice" />
              <Picker.Item label="Dessert" value="Dessert" />
              <Picker.Item label="Western Food" value="Western Food" />
              <Picker.Item label="Vegetarian" value="Vegetarian" />
              <Picker.Item label="Others" value="Others" />
            </Picker>
          </View>

          <Text style={styles.label}>Restaurant Image</Text>
          <TouchableOpacity onPress={() => pickImage(setRestaurantImage)}>
            <View style={styles.imagePicker}>
              {restaurantImage ? (
                <Image source={{ uri: restaurantImage }} style={styles.image} />
              ) : (
                <Text>Pick a restaurant image</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Payment QR</Text>
          <TouchableOpacity onPress={() => pickImage(setPaymentImage)}>
            <View style={styles.imagePicker}>
              {paymentImage ? (
                <Image source={{ uri: paymentImage }} style={styles.image} />
              ) : (
                <Text>Pick a payment QR image</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: "#888",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  imagePicker1: {
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
  image1: {
    height: "100%",
    width: "100%",
    borderRadius: 5,
    resizeMode: "cover",
  },
  imagePicker: {
    marginTop: 10,
    height: 150,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 5,
    resizeMode: "cover",
  },
  saveButton: {
    backgroundColor: "orange",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default EditDetails;
