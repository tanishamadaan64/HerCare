import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '@/src/config/firebaseConfig'; // Adjust path if necessary
import { doc, setDoc } from 'firebase/firestore';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Get the newly created user ID

      // Save user details to Firestore
      await setDoc(doc(firestore, 'users', userId), {
        firstName,
        lastName,
        email
      });

      Alert.alert('Signup Successful', 'You have signed up successfully.');
      // Navigate to another screen or perform additional actions
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'An unknown error occurred.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButton}>Back To Home Page</Text>
        </TouchableOpacity>
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>HH</Text>
          </View>
          <Text style={styles.title}>Sign up</Text>
          <View style={styles.rowInputContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <View style={styles.wideInputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />
          </View>
          <View style={styles.wideInputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />
          </View>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Click here to Login instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    color: '#ff5f7c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#f4c7d7',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rowInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  wideInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  signUpButton: {
    backgroundColor: '#ff5f7c',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    color: '#ff5f7c',
    fontSize: 16,
    marginTop: 16,
  },
});
