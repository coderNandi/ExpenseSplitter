import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPerson } from '../../store/slices/personSlice';
import type { RootState } from '../../store/store';

const Contact = () => {
  const persons = useSelector((state: RootState) => state.persons);
  const dispatch = useDispatch();

  useEffect(() => {
    // Load persons from AsyncStorage on mount if store is empty
    const loadPersons = async () => {
      if (persons.length === 0) {
        const data = await AsyncStorage.getItem('persons');
        if (data) {
          const parsed = JSON.parse(data);
          parsed.forEach((p: any) => dispatch(addPerson(p)));
        }
      }
    };
    loadPersons();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={persons}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.personItem}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.mobile}>{item.mobile}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No people added yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  personItem: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  mobile: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 16,
  },
});

export default Contact;
