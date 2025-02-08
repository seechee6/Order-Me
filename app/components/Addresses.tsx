import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Touchable,
  View,
  TouchableHighlight,
  Modal,
  Alert,
  Button,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Addresses = () => {
  const { user, setUser } = useAuth();
  const userUid = getAuth().currentUser?.uid;
  const primaryAddress = user?.addresses?.find((addr) => addr.primary)?.address;
  const secondaryAddresses = user?.addresses?.filter((addr) => !addr.primary);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newState, setNewState] = useState("");
  const [newPostcode, setNewPostcode] = useState("");

  const goBack = () => {
    router.back();
  };

  const Breakline = () => {
    return <View style={styles.breakline}></View>;
  };
const handleSetPrimaryOrDelete = async (selectedAddress: { address: string }) => {
  Alert.alert(
    "Address Options",
    "Choose an option for this address:",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Set as Primary",
        onPress: async () => {
          const updatedAddresses = user?.addresses.map((addr) => ({
            ...addr,
            primary: addr.address === selectedAddress.address,
          }));
          if (user && userUid) {
            const userRef = doc(FIREBASE_DB, "users", userUid);
            await updateDoc(userRef, { addresses: updatedAddresses });
            if (updatedAddresses) {
              setUser({ ...user, addresses: updatedAddresses });
            }
          }
        },
      },
      {
        text: "Delete",
        onPress: async () => {
          const updatedAddresses = user?.addresses.filter((addr) => addr.address !== selectedAddress.address);
          if (user && userUid) {
            const userRef = doc(FIREBASE_DB, "users", userUid);
            await updateDoc(userRef, { addresses: updatedAddresses });
            if (updatedAddresses) {
              setUser({ ...user, addresses: updatedAddresses });
            }
          }
        },
        style: "destructive",
      },
    ]
  );
};
  const handleAddAddress = async () => {
    const newAddressInfo = {
      address: newAddress,
      primary: false,
      state: newState,
      postcode: newPostcode,
    };
    const updatedAddresses = [...(user?.addresses || []), newAddressInfo];
    if (user && userUid) {
      const userRef = doc(FIREBASE_DB, "users", userUid);
      await updateDoc(userRef, { addresses: updatedAddresses });
      setUser({ ...user, addresses: updatedAddresses });
      setModalVisible(false);
      setNewAddress("");
      setNewState("");
      setNewPostcode("");
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backbtn} onPress={goBack}>
            <Ionicons name="chevron-back-outline" size={16} color="black" />
            <Text>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text >Add New Address</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text>Primary Address</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.phoneNum}>{user?.phoneNumber}</Text>
            <Text style={styles.address}>{primaryAddress}</Text>
          </View>
          <Text>Secondary Addresses</Text>
          {secondaryAddresses?.map((address, index) => (
            <View key={index}>
              <Breakline />
              <TouchableOpacity
                style={styles.secondaryAddresses}
                onPress={() => handleSetPrimaryOrDelete(address)}
              >
                <Text style={styles.address}>{address.address}</Text>
                {address.state && (
                  <Text className="text-sm">{address.state}</Text>
                )}
                {address.postcode && (
                  <Text className="text-sm">{address.postcode}</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.centeredView}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Add New Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Address"
                    value={newAddress}
                    onChangeText={setNewAddress}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={newState}
                    onChangeText={setNewState}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Postcode"
                    value={newPostcode}
                    onChangeText={setNewPostcode}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                    <Text style={styles.addBtnText}>Add New Address</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Addresses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 4,
  },
  backbtn: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "20%",
  },
  icon: {
    // height: 16,
    // width: 16,
  },
  phoneNum: {
    fontSize: 16,
    fontWeight: "600",
  },
  address: {
    fontSize: 14,
    fontWeight: "400",
  },
  breakline: {
    width: "100%",
    backgroundColor: "#CCC",
    height: 1.5,
    marginVertical: 8,
  },
  secondaryAddresses: {
    padding: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 12,
    paddingLeft: 8,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "orange",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
  },
});
