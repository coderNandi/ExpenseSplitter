import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addGroup } from "../../store/slices/groupsSlice";
import type { Person } from "../../store/slices/personSlice";
import type { RootState } from "../../store/store";

const CreateGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Person[]>([]); // store person ids
  const persons = useSelector((state: RootState) => state.persons);
  const [localPersons, setLocalPersons] = useState<Person[]>([]);

  useEffect(() => {
    const fetchPersonsFromStorage = async () => {
      if (persons.length === 0) {
        try {
          const stored = await AsyncStorage.getItem("persons");
          if (stored) {
            setLocalPersons(JSON.parse(stored));
          }
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    fetchPersonsFromStorage();
  }, [persons]);
  const groups = useSelector((state: RootState) => state.groups);
  const dispatch = useDispatch();

  const getPersonsList = () => (persons.length > 0 ? persons : localPersons);

  const handleSelectContact = (id: string) => {
    if (!selectedContacts.find((person) => person.id === id)) {
      const selectedPerson = getPersonsList().find(
        (person) => person.id === id
      );
      if (selectedPerson) {
        setSelectedContacts([...selectedContacts, selectedPerson]);
      }
    }
    setDropdownOpen(false);
  };

  const handleRemoveContact = (id: string) => {
    setSelectedContacts(selectedContacts.filter((person) => person.id !== id));
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedContacts.length === 0) {
      alert("Please enter a group name and select at least one contact.");
      return;
    }
    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      members: selectedContacts, // store person ids
    };
    dispatch(
      addGroup({
        id: newGroup.id,
        name: newGroup.name,
        members: newGroup.members,
        expenses: [], // initialize expenses as empty array
      })
    );
    try {
      const updatedGroups = [
        ...groups,
        {
          id: newGroup.id,
          name: newGroup.name,
          members: newGroup.members,
          expenses: [],
        },
      ];
      await AsyncStorage.setItem("groups", JSON.stringify(updatedGroups));
      alert("Group created!");
      setGroupName("");
      setSelectedContacts([]);
      navigation.navigate("MainTabs", { screen: "Home" });
    } catch (e) {
      alert("Failed to save group to phone memory");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>Create a Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={(text) => setGroupName(text.replace(/[^a-zA-Z ]/g, ""))}
      />
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text
          style={{ color: selectedContacts.length === 0 ? "#aaa" : "#222" }}
        >
          {selectedContacts.length === 0
            ? "Select Contacts"
            : "Add more contacts"}
        </Text>
        <MaterialIcons
          name={dropdownOpen ? "expand-less" : "expand-more"}
          size={24}
          color="#222"
        />
      </TouchableOpacity>
      {dropdownOpen && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 150 }}>
            {getPersonsList()
              .filter((p) => !selectedContacts.find((sel) => sel.id === p.id))
              .map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectContact(person.id)}
                >
                  <Text>
                    {person.name} ({person.mobile})
                  </Text>
                </TouchableOpacity>
              ))}
            {getPersonsList().filter(
              (p) => !selectedContacts.find((sel) => sel.id === p.id)
            ).length === 0 && (
              <Text style={{ color: "#aaa", padding: 8 }}>
                No more contacts
              </Text>
            )}
          </ScrollView>
        </View>
      )}
      <View style={styles.selectedContactsWrap}>
        {selectedContacts.map((person) => {
          if (!person) return null;
          return (
            <View key={person.id} style={styles.chip}>
              <Text style={styles.chipText}>{person.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveContact(person.id)}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color="#fff"
                  style={styles.chipClose}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedContactsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: "#fff",
    fontSize: 15,
    marginRight: 4,
  },
  chipClose: {
    marginLeft: 2,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateGroup;
