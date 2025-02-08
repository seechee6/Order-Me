
import { ListRenderItem, StyleSheet, Text, View, Image } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import { GroupType } from "@/type/groupType";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";


const GroupListings = ({ listings }: { listings: GroupType[] }) => {
  const renderItem: ListRenderItem<GroupType> = ({ item }) => {
    return (
      <View style={styles.item}>
        <Image source={{ uri: item.image }} style={styles.image}></Image>
        <View>
          <Text style={styles.itemTxt}>{item.name}</Text>
          <View style={{ flexDirection: "row", alignContent: "center" }}>
            <Ionicons
              name="star"
              size={20}
              color={colors.secondary[200]}
            ></Ionicons>
            <Text style={styles.itemRating}>{item.rating}</Text>
            <Text style={styles.itemReview}>({item.reviews})</Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

     
    </GestureHandlerRootView>
  );
};

export default GroupListings;

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  item: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.black.DEFAULT,
    marginBottom: 10,
  },
  itemTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black.DEFAULT,
    marginBottom: 8,
  },
  itemRating: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black.DEFAULT,
    marginLeft: 5,
  },
  itemReview: {
    fontSize: 14,
    color: "#999",
  },
});