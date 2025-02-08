import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomTabBarProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
    }>;
  };
  descriptors: any;
  navigation: any;
}

const TabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  type IconName =
    | "home"
    | "cart"
    | "message"
    | "status"
    | "profile"
    | "menu"
    | "addmenu"
    | "order";

  const icons: Record<IconName, (props: { color: string }) => JSX.Element> = {
    home: (props) => <FontAwesome size={24} name="home" color={props.color} />,
    cart: (props) => (
      <FontAwesome size={22} name="shopping-cart" color={props.color} />
    ),
    message: (props) => (
      <AntDesign size={20} name="message1" color={props.color} />
    ),
    status: (props) => (
      <FontAwesome size={22} name="star" color={props.color} />
    ),
    profile: (props) => (
      <Ionicons size={22} name="person" color={props.color} />
    ),
    menu: (props) => <FontAwesome size={24} name="home" color={props.color} />,
    addmenu: (props) => (
      <FontAwesome size={22} name="plus" color={props.color} />
    ),
    order: (props) => (
      <FontAwesome size={24} name="shopping-cart" color={props.color} />
    ),
  };

  const primaryColor = "#969696";
  const secondaryColor = "#FF9001";

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        // console.log("Routes", route);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {icons[route.name as IconName]({
              color: isFocused ? secondaryColor : primaryColor,
            })}
            <Text
              style={{
                color: isFocused ? secondaryColor : primaryColor,
                fontSize: 10,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 16,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    gap: 16,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    borderCurve: "continuous",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
