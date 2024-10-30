import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  description: string;
}

const App = () => {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://randomuser.me/api/?results=9');
      const mappedData = response.data.results.map((user: any) => ({
        id: user.login.uuid,
        name: `${user.name.first} ${user.name.last}`,
        description: `${user.name.first} adalah pengguna dengan gender ${user.gender}`,
      }));
      setUsersData(mappedData);
      saveUsersToStorage(mappedData);
    } catch (error) {
      console.log(error);
    }
  };

  const saveUsersToStorage = async (users: User[]) => {
    try {
      await AsyncStorage.setItem('usersData', JSON.stringify(users));
    } catch (error) {
      console.log('Failed to save users to storage:', error);
    }
  };

  const loadUsersFromStorage = async () => {
    try {
      const usersString = await AsyncStorage.getItem('usersData');
      if (usersString) {
        setUsersData(JSON.parse(usersString));
      } else {
        fetchUsers(); // Jika tidak ada data, fetch data baru
      }
    } catch (error) {
      console.log('Failed to load users from storage:', error);
    }
  };

  const addUser = () => {
    setName('');
    setDescription('');
    setEditId(null);
    setModalVisible(true);
  };

  const handleEdit = (id: string) => {
    const userToEdit = usersData.find((user) => user.id === id);
    if (userToEdit) {
      setName(userToEdit.name);
      setDescription(userToEdit.description);
      setEditId(id);
      setModalVisible(true);
    }
  };

  const handleSave = () => {
    if (editId) {
      // Edit existing user
      setUsersData((prevData) => {
        const updatedData = prevData.map((user) =>
          user.id === editId ? { ...user, name, description } : user
        );
        saveUsersToStorage(updatedData); // Simpan ke AsyncStorage
        return updatedData;
      });
    } else {
      // Add new user
      const newUser: User = {
        id: Math.random().toString(),
        name,
        description,
      };
      setUsersData((prevData) => {
        const updatedData = [...prevData, newUser];
        saveUsersToStorage(updatedData); // Simpan ke AsyncStorage
        return updatedData;
      });
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    setUsersData((prevData) => {
      const updatedData = prevData.filter((user) => user.id !== id);
      saveUsersToStorage(updatedData); // Simpan ke AsyncStorage
      return updatedData;
    });
  };

  useEffect(() => {
    loadUsersFromStorage();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Daftar Pengguna</Text>
      <TouchableOpacity style={styles.addButton} onPress={addUser}>
        <Text style={styles.addButtonText}>Tambah User</Text>
      </TouchableOpacity>
      {usersData.map((user) => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <Text>Description: {user.description}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(user.id)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(user.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Modal for Adding/Editing User */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editId ? 'Edit User' : 'Tambah User'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nama"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Deskripsi"
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: 'orange',
    padding: 5,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
