import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; // Import expo-file-system
import * as ImageManipulator from "expo-image-manipulator"; // Import image manipulator
import { addDoc } from "firebase/firestore";
import { itemsRef } from "../../FirebaseConfig"; // Adjust path if necessary
import { useAuth } from "../../context/AuthContext"; // Replace with your actual auth provider

const AddMenu = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const { user } = useAuth(); // Get user details from AuthContext
  const email = user?.email; // Vendor's email
  const restaurantName = user?.restaurantName || "Default Restaurant"; // Vendor's restaurant name

  const handleAddItem = async () => {
    try {
      if (!name || !description || !price || (!imageUri && !imageUrl)) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }

      if (!email || !restaurantName) {
        Alert.alert("Error", "Missing vendor details. Please log in again.");
        return;
      }

      // Use selected image URI or the image URL entered
      const finalImageUrl = imageUri || imageUrl;

      // Save the item to Firestore
      await addDoc(itemsRef, {
        name,
        description,
        price: parseFloat(price),
        imageUrl: finalImageUrl,
        email, // Vendor's email
        restaurantName, // Vendor's restaurant name
        createdAt: new Date(), // Optional timestamp
      });

      Alert.alert("Success", "Item added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setImageUri(null);
      setImageUrl("");
    } catch (error) {
      console.error("Error adding item: ", error);
      Alert.alert("Error", "Failed to add item.");
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
        quality: 1, // High-quality image
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
  
        // Resize the image to a smaller resolution (adjust width and height as needed)
        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 600 } }], // Resize to width of 600px (adjust as needed)
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress the image to 70%
        );
  
        // Convert resized image to Base64
        const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        setImageUri(`data:image/jpeg;base64,${base64}`); // Save as Base64 encoded string
      } else {
        Alert.alert("Selection Cancelled", "No image was selected.");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Menu Item</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter Item Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Enter Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Item Image URL"
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={styles.imagePickerText}>Pick Image From Gallery</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

        <Button title="ADD MENU ITEM" onPress={handleAddItem} color="orange" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",paddingBottom: 80,
  },
  form: {
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    color: "orange",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  descriptionInput: {
    height: 150,
    textAlignVertical: "top",
  },
  imagePicker: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    color: "orange",
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  orText: {
    textAlign: "center",
    fontSize: 18,
    marginVertical: 10,
    color: "#888",
  },
});

export default AddMenu;