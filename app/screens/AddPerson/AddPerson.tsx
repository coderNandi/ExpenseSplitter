import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addPerson } from "../../store/slices/personSlice";
import type { RootState } from "../../store/store";

const AddPerson = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [upi, setUpi] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      // Reset form when leaving the page
      return () => {
        setName("");
        setMobile("");
        setUpi("");
      };
    }, [])
  );

  const dispatch = useDispatch();
  const persons = useSelector((state: RootState) => state.persons);
  type TabParamList = {
    Home: undefined;
    CreateGroup: undefined;
    AddPerson: undefined;
    Contacts: undefined;
  };
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const handleSave = async () => {
    if (!name || !mobile || !upi) {
      alert("Please fill all fields");
      return;
    }
    const newPerson = {
      id: Date.now().toString(),
      name,
      mobile,
      upi,
    };
    dispatch(addPerson(newPerson));
    try {
      const updatedPersons = [...persons, newPerson];
      await AsyncStorage.setItem("persons", JSON.stringify(updatedPersons));
      navigation.navigate('Contacts');
    } catch (e) {
      alert("Failed to save to phone memory");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>Add a Person</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text.replace(/[^a-zA-Z ]/g, ""))}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={(text) => setMobile(text.replace(/\D/g, ""))}
        keyboardType="number-pad"
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="UPI ID"
        value={upi}
        onChangeText={setUpi}
        autoCapitalize="none"
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    marginTop: 8,
    backgroundColor: "#3a3a3dff",
    borderRadius: 8,
    overflow: "hidden",
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddPerson;
