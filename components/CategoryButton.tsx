import { TouchableOpacity } from "react-native";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet , Text} from "react-native";
import { View } from "react-native";
import { colors } from "@/constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Category = {
  title: string;
  iconName: string;
};
const Categories: Category[] = [
  { title: "All", iconName: "food" },
  { title: "Mix Rice", iconName: "rice" },
  { title: "Dessert", iconName: "cake" },
  { title: "Western Food", iconName: "food" },
  { title: "Vegetarian", iconName: "food" },
  { title: "Others", iconName: "fruit-watermelon" },
];


type Props = {
  onCategoryChanged: (category: string) => void;
};
export const CategoryButtons = ({ onCategoryChanged }: Props) => {
  const scrollRef = useRef<ScrollView>(null);
  const itemRef = useRef<(typeof TouchableOpacity | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelectCategory = (index: number) => {
    setActiveIndex(index);
    const selected = itemRef.current[index] as unknown as View;
    selected?.measure(
      (x: number, y: number, width: number, height: number, pageX: number) => {
        scrollRef.current?.scrollTo({ x: pageX - 10, animated: true });
      }
    );
    onCategoryChanged(Categories[index].title);
  };

  return (
    <View>
      <Text style={styles.title}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        contentContainerStyle={{
          gap: 20,
          paddingVertical: 10,
          marginBottom: 10,
        }}
      >
        {Categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            ref={(el) => (itemRef.current[index] = el as any)}
            onPress={() => handleSelectCategory(index)}
            style={
              activeIndex === index
                ? styles.categoryBtnActive
                : styles.categoryBtn
            }
          >
            <MaterialCommunityIcons
              name={item.iconName as any}
              size={20}
              color={
                activeIndex === index
                  ? colors.white.DEFAULT
                  : colors.black.DEFAULT
              }
            />
            <Text
              style={
                activeIndex === index
                  ? styles.categoryBtnActiveText
                  : styles.categoryBtnText
              }
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  
  title: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "bold",
    color: colors.black.DEFAULT,
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#333333",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryBtnText: {
    marginLeft: 3,
    color: "black",
    fontWeight: "bold",
  },
  categoryBtnActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#333333",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryBtnActiveText: {
    marginLeft: 3,
    color: "white",
    fontWeight: "bold",
  },
  
})