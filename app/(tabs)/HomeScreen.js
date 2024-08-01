import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { auth, firestore } from '../../src/config/firebaseConfig'; // Adjust the import if needed
import { doc, getDoc } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', userId));
          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName || 'User');
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = () => {
    // Navigate to Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image source={require('./profile.png')} style={styles.icon} />
          <Text style={styles.firstName}>{firstName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>HerCare : Your menstruation Buddy</Text>
        <Image style={styles.chartimage} source={require('./main.png')} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PadSOS')}>
          <Image style={styles.icon} source={require('./sos.png')} />
          <Text style={styles.buttonText}>Go To Pad SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PeriodTracker')}>
          <Image style={styles.icon} source={require('./menstruation.png')} />
          <Text style={styles.buttonText}>Go To Period Tracker</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Menstruation Survey by HerCare</Text>
      <View style={styles.chartsContainer}>
        <Image style={styles.chartImage} source={require('./chart.png')} />
        <Image style={styles.chartImage} source={require('./chart1.png')} />
      </View>

      <Text style={styles.dataTitle}>Menstruation Data</Text>
      <Text style={styles.dataText}>- Regularity of menstrual cycle affects overall health.</Text>
      <Text style={styles.dataText}>- Regular exercise can influence menstrual regularity.</Text>
      <Text style={styles.dataText}>- Consult a healthcare provider if you experience irregularities.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 50,
    marginTop: 10,
    marginRight: 10,
  },
  firstName: {
    fontSize: 17,
    color: '#333',
    fontWeight: 'bold',
    marginTop:20,
  },
  logoutButton: {
    backgroundColor: '#ff5f7c',
    borderRadius: 10,
    padding: 10,
  },
  logoutText: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    padding: 5,
    textAlign: 'center',
  },
  chartimage: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    borderRadius: 20,
  },
   surveyText: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffccde',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
    height : 130,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginVertical: 5,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  chartImage: {
    width: '48%',
    height: 180,
    resizeMode: 'contain',
  },
  dataTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
//jhakas