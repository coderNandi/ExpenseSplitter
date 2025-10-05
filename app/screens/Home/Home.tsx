import { MaterialIcons } from '@expo/vector-icons';
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

// groups are now managed by Redux

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';

type TabParamList = {
  Home: undefined;
  AddPerson: undefined;
  Contacts: undefined;
};
type RootStackParamList = {
  MainTabs: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
};

const Home = () => {
  const groups = useSelector((state: RootState) => state.groups);
  const navigation = useNavigation<
    CompositeNavigationProp<
      BottomTabNavigationProp<TabParamList, 'Home'>,
      StackNavigationProp<RootStackParamList>
    >
  >();

  const handleGroupPress = (group: { id: string; name: string }) => {
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const handleAddGroup = () => {
    navigation.navigate("CreateGroup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My groups</Text>
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../../assets/images/android-icon-monochrome.png')}
            style={styles.emptyImage}
            resizeMode="contain"
            accessibilityLabel="No groups yet (empty)"
          />
          <Text style={styles.emptyText}>No groups yet. Tap + to create one!</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.groupItem}
              onPress={() => handleGroupPress(item)}
            >
              <Text style={styles.groupName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={handleAddGroup}>
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    // Ensure children can be pushed to the bottom
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  list: {
    marginBottom: 24,
  },
  groupItem: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
  },
  groupName: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3a3a3dff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyImage: {
    width: 160,
    height: 160,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Home;
