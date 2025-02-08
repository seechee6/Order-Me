import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import {
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import image manipulator
import * as FileSystem from "expo-file-system"; // Import for converting to base64
import { itemsRef } from "../../FirebaseConfig"; // Adjust the import based on your folder structure
import { useAuth } from "../../context/AuthContext";
import {
  GestureHandlerRootView,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  email: string; // Add email field
  restaurantName: string; // Add restaurantName field
}

const MenuScreen = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState(""); // Image URL for editing
  const [editedImageUri, setEditedImageUri] = useState<string | null>(null); // For picked image
  const { user } = useAuth(); // Assuming useAuth gives the authenticated user object
  const email = user?.email; // Make sure it's not undefined
  const restaurantName = user?.restaurantName; // Make sure it's not undefined

  useEffect(() => {
    if (!user) {
      console.error("User is not authenticated.");
      Alert.alert("Error", "User is not authenticated.");
      setLoading(false);
      return;
    }

    if (!email || !restaurantName) {
      console.error("Missing email or restaurantName.");
      Alert.alert("Error", "Email or Restaurant Name is missing.");
      setLoading(false);
      return;
    }

    const fetchItems = async () => {
      try {
        console.log("Email:", email, "Restaurant Name:", restaurantName);

        const querySnapshot = await getDocs(
          query(
            itemsRef,
            where("email", "==", email),
            where("restaurantName", "==", restaurantName)
          )
        );

        const fetchedItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];

        setItems(fetchedItems);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching items:", error.message);
          Alert.alert(
            "Error",
            error.message || "There was an issue fetching the items."
          );
        } else {
          console.error("An unexpected error occurred:", error);
          Alert.alert("Error", "An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [user, email, restaurantName]);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(itemsRef, id));
      setItems(items.filter((item) => item.id !== id));
      Alert.alert("Success", "Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item: ", error);
      Alert.alert("Error", "Failed to delete item.");
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setEditedName(item.name);
    setEditedDescription(item.description);
    setEditedPrice(item.price.toString());
    setEditedImageUrl(item.imageUrl); // Set the current image URL for editing
    setEditedImageUri(null); // Reset picked image if any
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1, // High-quality image
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setEditedImageUri(imageUri); // Set the picked image URI

        // Resize the image to a smaller resolution (e.g., 600px wide)
        const resizedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 600 } }], // Resize to a width of 600px (adjust as needed)
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress the image to 70%
        );

        const base64Image = await convertImageToBase64(resizedImage.uri); // Convert to base64
        setEditedImageUrl(base64Image); // Set the base64 image for saving
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  // Function to convert the image to Base64 after resizing and compressing
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`; // You can change the type to png if the image is png
    } catch (error) {
      console.error("Error converting image to base64: ", error);
      return "";
    }
  };

  const handleSaveChanges = async () => {
    if (!editedName || !editedDescription || !editedPrice || !editedImageUrl) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const itemDoc = doc(itemsRef, editingItem?.id || "");
      await updateDoc(itemDoc, {
        name: editedName,
        description: editedDescription,
        price: parseFloat(editedPrice),
        imageUrl: editedImageUrl, // Save the base64 string
      });

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === editingItem?.id
            ? {
                ...item,
                name: editedName,
                description: editedDescription,
                price: parseFloat(editedPrice),
                imageUrl: editedImageUrl, // Update the image field
              }
            : item
        )
      );

      setEditingItem(null);
      Alert.alert("Success", "Item updated successfully!");
    } catch (error) {
      console.error("Error updating item: ", error);
      Alert.alert("Error", "Failed to update item.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Menu</Text>
        {editingItem ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={editedName}
                onChangeText={setEditedName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={editedDescription}
                onChangeText={setEditedDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={editedPrice}
                onChangeText={setEditedPrice}
                keyboardType="numeric"
              />

              {/* Enter Item Image URL input */}
              <TextInput
                style={styles.input}
                placeholder="Enter Item Image URL"
                value={editedImageUrl}
                onChangeText={setEditedImageUrl}
                numberOfLines={3}
                multiline={true}
              />

              {/* OR text */}
              <Text style={styles.orText}>OR</Text>

              {/* Pick an image button */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Text style={styles.imagePickerText}>Pick an Image</Text>
              </TouchableOpacity>

              {/* Display the image preview */}
              {(editedImageUri || editedImageUrl) && (
                <Image
                  source={{ uri: editedImageUri || editedImageUrl }}
                  style={styles.previewImage}
                />
              )}

              <Button
                title="Save Changes"
                onPress={handleSaveChanges}
                color="orange"
              />
            </View>
          </TouchableWithoutFeedback>
        ) :items.length === 0 ?(  <View style={styles.noMenuContainer}>
          <MaterialIcons name="restaurant-menu" size={100} color="#ccc" />
          <Text style={styles.noMenuText}>No menu available for this restaurant</Text>
        </View>):
         (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text style={styles.price}>RM {item.price}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button
                    title="Edit"
                    onPress={() => handleEditItem(item)}
                    color="green"
                  />
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteItem(item.id)}
                    color="red"
                  />
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontFamily: "Poppins-Bold",
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFA500",
    textAlign: "left",
    marginBottom: 20,
  },
  editForm: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  cardContent: {
    flexDirection: "row",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: "#007BFF",
  },
  actions: {
    marginTop: 8,
    flexDirection: "row", // Align buttons horizontally
    justifyContent: "flex-end", // Align buttons to the right
    gap: 10, // Space between buttons
  },
  input: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: Platform.OS === "ios" ? 100 : undefined,
  },
  imagePicker: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    color: "blue",
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
    noMenuText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
  noMenuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default MenuScreen;
