import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../src/config/firebaseConfig'; // Correct import path

const { width } = Dimensions.get('window');

export default function PeriodTrackerScreen({ navigation }) {
  const [selectedDates, setSelectedDates] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUserId(user.uid);
          await loadSavedData(user.uid);
        } else {
          Alert.alert('Error', 'No user is logged in');
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };

    const loadSavedData = async (uid) => {
      try {
        const periodsJson = await AsyncStorage.getItem(`periods_${uid}`);
        const selectedDatesJson = await AsyncStorage.getItem(`selectedDates_${uid}`);

        if (periodsJson) {
          setPeriods(JSON.parse(periodsJson));
        }
        if (selectedDatesJson) {
          setSelectedDates(JSON.parse(selectedDatesJson));
        }
      } catch (error) {
        console.error('Failed to load data from AsyncStorage:', error);
      }
    };

    loadUserId();
  }, []);

  const handleDayPress = (day) => {
    if (!startDate) {
      setStartDate(day.dateString);
      setSelectedDates({
        [day.dateString]: { selected: true, marked: true, selectedColor: '#ffccde' }
      });
    } else if (!endDate) {
      if (new Date(day.dateString) < new Date(startDate)) {
        Alert.alert('Error', 'End date should be after start date');
        return;
      }
      setEndDate(day.dateString);
      const newDates = { ...selectedDates };
      let currentDate = new Date(startDate);
      while (currentDate <= new Date(day.dateString)) {
        const dateString = currentDate.toISOString().split('T')[0];
        newDates[dateString] = { selected: true, marked: true, selectedColor: '#ffccde' };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates(newDates);
    } else {
      setStartDate(day.dateString);
      setEndDate(null);
      setSelectedDates({
        [day.dateString]: { selected: true, marked: true, selectedColor: '#ffccde' }
      });
    }
  };

  const logPeriod = async () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        Alert.alert('Error', 'Start date should be before end date');
        return;
      }

      const newDates = {};
      let currentDate = new Date(startDate);
      let numberOfDays = 0;
      while (currentDate <= new Date(endDate)) {
        const dateString = currentDate.toISOString().split('T')[0];
        newDates[dateString] = { selected: true, marked: true, selectedColor: '#ffccde' };
        currentDate.setDate(currentDate.getDate() + 1);
        numberOfDays++;
      }
      setSelectedDates(newDates);

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const month = startDateObj.toLocaleString('default', { month: 'long' });

      const newPeriod = { startDate, endDate, month, numberOfDays };
      setPeriods(prevPeriods => {
        const updatedPeriods = [...prevPeriods, newPeriod];
        AsyncStorage.setItem(`periods_${userId}`, JSON.stringify(updatedPeriods));
        AsyncStorage.setItem(`selectedDates_${userId}`, JSON.stringify(newDates));
        return updatedPeriods;
      });

      Alert.alert('Period Logged', `Period logged from ${startDate} to ${endDate}`);

      setStartDate(null);
      setEndDate(null);
      setSelectedDates({});
    } else {
      Alert.alert('Error', 'Please select both start and end dates');
    }
  };

  const deletePeriod = async (index) => {
    const updatedPeriods = periods.filter((_, i) => i !== index);
    setPeriods(updatedPeriods);
    await AsyncStorage.setItem(`periods_${userId}`, JSON.stringify(updatedPeriods));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.periodItem}>
      <Text style={styles.periodText}>Month: {item.month}</Text>
      <Text style={styles.periodText}>Start Date: {item.startDate}</Text>
      <Text style={styles.periodText}>End Date: {item.endDate}</Text>
      <Text style={styles.periodText}>Number of Days: {item.numberOfDays}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deletePeriod(index)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Period Tracker</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={selectedDates}
        theme={{
          calendarBackground: '#ffffff', // Set calendar background to white
          textSectionTitleColor: '#333',
          selectedDayBackgroundColor: '#ffccde',
          selectedDayTextColor: '#333',
          todayTextColor: '#ff6699',
          dayTextColor: '#333',
          arrowColor: '#ff6699',
          monthTextColor: '#000',
          indicatorColor: '#ff6693',
          backgroundColor: '#ffffff', 
          width: '100%',// Ensure background is set to white
        }}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={logPeriod}>
          <Text style={styles.buttonText}>Log Period</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={periods}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        contentContainerStyle={periods.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 40,
  },
  periodItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    width: width * 0.9,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  periodText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  list: {
    width: width * 0.9,
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff5f7c',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff5f7c',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyList: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
//jhakas