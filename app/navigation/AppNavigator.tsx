import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";
import AddPerson from "../screens/AddPerson/AddPerson";
import Contact from "../screens/Contacts/Contact";
import Home from "../screens/Home/Home";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = "home";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "AddPerson") iconName = "person-add";
          else if (route.name === "Contacts") iconName = "contacts";
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: "Home" }} />
      <Tab.Screen
        name="AddPerson"
        component={AddPerson}
        options={{ title: "Add Person" }}
      />
      <Tab.Screen
        name="Contacts"
        component={Contact}
        options={{ title: "Contacts" }}
      />
    </Tab.Navigator>
  );
}
