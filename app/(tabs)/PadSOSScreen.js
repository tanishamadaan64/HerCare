import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { firestore, auth } from '../../src/config/firebaseConfig';
import { collection, doc, setDoc, onSnapshot, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Request Help function
const sendHelpRequest = async (location, setHelpRequested) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    Alert.alert('Error', 'User not logged in');
    return;
  }

  try {
    const newRequest = {
      userId,
      coordinates: location,
      message: 'I need help!',
      status: 'pending',
      timestamp: new Date(),
      acceptedBy: '',
    };

    await addDoc(collection(firestore, 'helpRequests'), newRequest);

    setHelpRequested(true);
    Alert.alert('Help Request Sent', 'Your help request has been sent to all nearby users.');

  } catch (error) {
    console.error('Error sending help request:', error);
    Alert.alert('Error', 'Failed to send help request.');
  }
};

const cancelHelpRequest = async (setHelpRequested) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    Alert.alert('Error', 'User not logged in');
    return;
  }

  try {
    const helpRequestQuery = collection(firestore, 'helpRequests');
    const snapshot = await getDocs(helpRequestQuery);

    const userHelpRequest = snapshot.docs.find(doc => doc.data().userId === userId);
    if (userHelpRequest) {
      await deleteDoc(doc(firestore, 'helpRequests', userHelpRequest.id));
      setHelpRequested(false);
      Alert.alert('Help Request Cancelled', 'Your help request has been cancelled.');
    } else {
      Alert.alert('Error', 'No help request found to cancel.');
    }
  } catch (error) {
    console.error('Error cancelling help request:', error);
    Alert.alert('Error', 'Failed to cancel help request.');
  }
};

const removeHelpRequestFromList = async (requestId) => {
  try {
    await deleteDoc(doc(firestore, 'helpRequests', requestId));
  } catch (error) {
    console.error('Error removing help request:', error);
  }
};

const acceptHelpRequest = async (requestId, requesterId, requesterName) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    Alert.alert('Error', 'User not logged in');
    return;
  }

  try {
    // Update the request to indicate it has been accepted
    await updateDoc(doc(firestore, 'helpRequests', requestId), {
      status: 'accepted',
      acceptedBy: userId,
    });

    // Notify the requester
    Alert.alert('Great', `You have volunteered to help ${requesterName}`);

    // Optionally, remove the request from the list (if needed)
    await removeHelpRequestFromList(requestId);
  } catch (error) {
    console.error('Error accepting help request:', error);
    Alert.alert('Error', 'Failed to accept help request.');
  }
};

export default function PadSOSScreen({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocations, setUserLocations] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [helpRequests, setHelpRequests] = useState([]);
  const [helpRequested, setHelpRequested] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // Add this state

  useEffect(() => {
    let isMounted = true;

    const updateLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Permission to access location was denied. Please enable location services in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync();
        const currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        if (isMounted) {
          setCurrentLocation(currentCoords);

          const userId = auth.currentUser?.uid;
          if (!userId) {
            Alert.alert('Error', 'User not logged in');
            return;
          }

          console.log(`Updating location for user ${userId}:`, currentCoords);
          await setDoc(doc(firestore, 'userLocations', userId), {
            coordinates: currentCoords,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
        Alert.alert('Error', 'Could not get current location.');
      }
    };

    const intervalId = setInterval(updateLocation, 30000);
    updateLocation();

    const unsubscribeLocations = onSnapshot(collection(firestore, 'userLocations'), snapshot => {
      if (isMounted) {
        const locations = snapshot.docs.map(doc => ({
          id: doc.id,
          coordinates: doc.data().coordinates,
        }));
        console.log('User locations:', locations);
        setUserLocations(locations);
      }
    });

    const unsubscribeHelpRequests = onSnapshot(collection(firestore, 'helpRequests'), snapshot => {
      if (isMounted) {
        const requests = snapshot.docs
          .map(doc => ({
            id: doc.id,
            userId: doc.data().userId,
            coordinates: doc.data().coordinates,
            status: doc.data().status,
            acceptedBy: doc.data().acceptedBy,
          }))
          .filter(request => request.status === 'pending' || request.status === 'accepted');
        console.log('Help requests:', requests);
        setHelpRequests(requests);
      }
    });

    const fetchUserNames = async () => {
      try {
        const usersSnap = await getDocs(collection(firestore, 'users'));
        const names = {};
        usersSnap.forEach(doc => {
          const data = doc.data();
          console.log(`Fetched data for user ${doc.id}:`, data);
          if (data.firstName) {
            names[doc.id] = data.firstName;
          } else {
            console.warn(`No firstName for user ${doc.id}`);
            names[doc.id] = 'Unknown';
          }
        });
        console.log('Fetched user names:', names);
        if (isMounted) {
          setUserNames(names);
        }
      } catch (error) {
        console.log('Error fetching user names:', error);
      }
    };

    fetchUserNames();

    return () => {
      clearInterval(intervalId);
      isMounted = false;
      unsubscribeLocations();
      unsubscribeHelpRequests();
    };
  }, []);

  useEffect(() => {
    const unsubscribeAcceptedRequests = onSnapshot(collection(firestore, 'helpRequests'), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const updatedRequest = change.doc.data();
          if (updatedRequest.status === 'accepted' && updatedRequest.userId === auth.currentUser?.uid) {
            Alert.alert('Request Accepted', `Your help request has been accepted by ${userNames[updatedRequest.acceptedBy] || 'a user'}`);
          }
        }
      });
    });

    return () => unsubscribeAcceptedRequests();
  }, [userNames]);

  const getDistance = (coord1, coord2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  };

  const renderHelpRequestItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, selectedRequest && selectedRequest.id === item.id && styles.selectedItem]}
      onPress={() => setSelectedRequest(item)} // Set the selected request on click
    >
      <Text style={styles.userName}>{userNames[item.userId] || 'Unknown'}</Text>
      {currentLocation && item.coordinates && (
        <>
          <Text style={styles.distance}>
            {getDistance(currentLocation, item.coordinates)} km away
          </Text>
          <Text style={styles.urgentMessage}>
            in urgent need of sanitary napkin
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  const handleReceivedHelp = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      const userHelpRequest = helpRequests.find(request => request.userId === userId);
      if (userHelpRequest) {
        await removeHelpRequestFromList(userHelpRequest.id);
        setHelpRequests(prevRequests => prevRequests.filter(request => request.id !== userHelpRequest.id));
      }

      setHelpRequested(false);
      Alert.alert('Help Confirmation', 'You have confirmed that you received help.');
    } catch (error) {
      console.error('Error confirming help:', error);
      Alert.alert('Error', 'Failed to confirm help.');
    }
  };

  const handleHelpThem = async () => {
    if (!selectedRequest) return;

    try {
      const { id, userId } = selectedRequest;
      const requesterName = userNames[userId] || 'Unknown User';
      await acceptHelpRequest(id, userId, requesterName);
      setSelectedRequest(null); // Reset selected request
    } catch (error) {
      console.error('Error handling help request:', error);
      Alert.alert('Error', 'Failed to accept help request.');
    }
  };

  return helpRequested ? (
    <View style={styles.requestedHelpContainer}>
      <Text style={styles.requestedHelpText}>You have requested help!</Text>
      <Text style={styles.subText}>
        Your request has been sent. If someone accepts to help you, you will be notified.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => cancelHelpRequest(setHelpRequested)}>
          <Text style={styles.buttonText}>Cancel Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleReceivedHelp}>
          <Text style={styles.buttonText}>Received Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <FlatList
          data={helpRequests}
          renderItem={renderHelpRequestItem}
          keyExtractor={(item) => item.id}
        />
        {selectedRequest && (
          <TouchableOpacity
            style={styles.helpThemButton}
            onPress={handleHelpThem}
          >
            <Text style={styles.helpThemButtonText}>Help Them</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.requestHelpButton} 
          onPress={() => currentLocation && sendHelpRequest(currentLocation, setHelpRequested)}
        >
          <Text style={styles.requestHelpButtonText}>Request Help</Text>
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        region={{
          latitude: currentLocation ? currentLocation.latitude : 37.78825,
          longitude: currentLocation ? currentLocation.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {userLocations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={loc.coordinates}
            title={userNames[loc.id] || 'Unknown User'}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '30%',
    backgroundColor: '#f8f8f8',
    padding: 10,
    paddingTop: 40,
  },
  map: {
    flex: 1,
  },
  userItem: {
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#ff5f7c',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
  },
  urgentMessage: {
    fontSize: 12,
    color: '#ff5f7c',
    marginTop: 5,
  },
  requestedHelpContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestedHelpText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 70,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#ff5f7c',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  requestHelpButton: {
    backgroundColor: '#ff5f7c',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  requestHelpButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpThemButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  helpThemButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
//khalass