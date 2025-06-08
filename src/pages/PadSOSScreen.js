import React, { useState, useEffect, useRef } from 'react';
import { firestore, auth } from '../../src/config/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultPosition = [37.78825, -122.4324];

// Fix Leaflet icon issues on Webpack (optional)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced component to handle map view updates
const MapViewController = ({ currentLocation }) => {
  const map = useMap();
  const hasZoomedRef = useRef(false);
  
  useEffect(() => {
    if (currentLocation && !hasZoomedRef.current) {
      // Force invalidate size first (important for mobile)
      setTimeout(() => {
        map.invalidateSize();
        map.setView([currentLocation.latitude, currentLocation.longitude], 16, {
          animate: true,
          duration: 1
        });
        hasZoomedRef.current = true;
      }, 100);
    }
  }, [currentLocation, map]);
  
  return null;
};

// Utility function to get distance between two coords in KM
const getDistance = (coord1, coord2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
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

export default function PadSOSScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocations, setUserLocations] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [helpRequests, setHelpRequests] = useState([]);
  const [helpRequested, setHelpRequested] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mapKey, setMapKey] = useState(0); // Force map re-render when needed
  const mapRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Invalidate map size on resize
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced location update function
  const updateLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        console.log('Location detected:', coords); // Debug log
        setCurrentLocation(coords);
        
        // Force map update after location is set
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
            mapRef.current.setView([coords.latitude, coords.longitude], 16, {
              animate: true,
              duration: 1
            });
          }
        }, 200);

        const userId = auth.currentUser?.uid;
        if (!userId) {
          alert('User not logged in');
          return;
        }
        try {
          await setDoc(doc(firestore, 'userLocations', userId), {
            coordinates: coords,
            timestamp: new Date(),
          });
        } catch (e) {
          console.error('Error updating location in firestore', e);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(`Unable to retrieve your location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for mobile
        maximumAge: 30000 // Reduced maximum age
      }
    );
  };

  // Function to remove user location from Firestore
  const removeUserLocation = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await deleteDoc(doc(firestore, 'userLocations', userId));
        console.log('User location removed from Firestore');
      } catch (e) {
        console.error('Error removing user location:', e);
      }
    }
  };

  useEffect(() => {
    updateLocation();
    const interval = setInterval(updateLocation, 30000); // update every 30s

    // Listen to user locations changes
    const unsubscribeLocations = onSnapshot(
      collection(firestore, 'userLocations'),
      (snapshot) => {
        const locations = snapshot.docs.map((doc) => ({
          id: doc.id,
          coordinates: doc.data().coordinates,
        }));
        setUserLocations(locations);
      }
    );

    // Listen to help requests
    const unsubscribeHelpRequests = onSnapshot(
      collection(firestore, 'helpRequests'),
      (snapshot) => {
        const requests = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            userId: doc.data().userId,
            coordinates: doc.data().coordinates,
            status: doc.data().status,
            acceptedBy: doc.data().acceptedBy,
          }))
          .filter(
            (req) => req.status === 'pending' || req.status === 'accepted'
          );
        setHelpRequests(requests);
      }
    );

    // Fetch user names
    const fetchUserNames = async () => {
      try {
        const usersSnap = await getDocs(collection(firestore, 'users'));
        const names = {};
        usersSnap.forEach((doc) => {
          const data = doc.data();
          names[doc.id] = data.firstName || 'Unknown';
        });
        setUserNames(names);
      } catch (e) {
        console.error('Error fetching user names', e);
      }
    };
    fetchUserNames();

    // Cleanup function - remove location when component unmounts or user signs out
    return () => {
      clearInterval(interval);
      unsubscribeLocations();
      unsubscribeHelpRequests();
      removeUserLocation(); // Remove user's location from Firestore
    };
  }, []);

  // Listen for accepted help request notifications for current user
  useEffect(() => {
    const unsubscribeAccepted = onSnapshot(
      collection(firestore, 'helpRequests'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const updated = change.doc.data();
            if (
              updated.status === 'accepted' &&
              updated.userId === auth.currentUser?.uid
            ) {
              alert(
                `Your help request has been accepted by ${
                  userNames[updated.acceptedBy] || 'someone'
                }`
              );
            }
          }
        });
      }
    );
    return () => unsubscribeAccepted();
  }, [userNames]);

  // Send Help Request
  const sendHelpRequest = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('User not logged in');
      return;
    }
    if (!currentLocation) {
      alert('Current location not available');
      return;
    }
    try {
      const newRequest = {
        userId,
        coordinates: currentLocation,
        message: 'I need help!',
        status: 'pending',
        timestamp: new Date(),
        acceptedBy: '',
      };
      await addDoc(collection(firestore, 'helpRequests'), newRequest);
      setHelpRequested(true);
      alert('Your help request has been sent to all nearby users.');
    } catch (e) {
      console.error('Error sending help request:', e);
      alert('Failed to send help request.');
    }
  };

  // Cancel Help Request
  const cancelHelpRequest = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('User not logged in');
      return;
    }
    try {
      const snapshot = await getDocs(collection(firestore, 'helpRequests'));
      const userRequest = snapshot.docs.find(
        (doc) => doc.data().userId === userId
      );
      if (userRequest) {
        await deleteDoc(doc(firestore, 'helpRequests', userRequest.id));
        setHelpRequested(false);
        alert('Your help request has been cancelled.');
      } else {
        alert('No help request found to cancel.');
      }
    } catch (e) {
      console.error('Error cancelling help request:', e);
      alert('Failed to cancel help request.');
    }
  };

  // Remove help request from list after acceptance
  const removeHelpRequestFromList = async (requestId) => {
    try {
      await deleteDoc(doc(firestore, 'helpRequests', requestId));
    } catch (e) {
      console.error('Error removing help request:', e);
    }
  };

  // Accept help request
  const acceptHelpRequest = async (requestId, requesterId, requesterName) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      await updateDoc(doc(firestore, 'helpRequests', requestId), {
        status: 'accepted',
        acceptedBy: userId,
      });

      alert(`You have volunteered to help ${requesterName}`);

      await removeHelpRequestFromList(requestId);
    } catch (e) {
      console.error('Error accepting help request:', e);
      alert('Failed to accept help request.');
    }
  };

  // Confirm help received by requester
  const handleReceivedHelp = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('User not logged in');
      return;
    }

    try {
      const userHelpRequest = helpRequests.find(
        (request) => request.userId === userId
      );
      if (userHelpRequest) {
        await removeHelpRequestFromList(userHelpRequest.id);
        setHelpRequested(false);
      }
      alert('You have confirmed that you received help.');
    } catch (e) {
      console.error('Error confirming help:', e);
      alert('Failed to confirm help.');
    }
  };

  // Manual location refresh function
  const refreshLocation = () => {
    updateLocation();
  };

  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;

  return (
    <>
      <style>{`
        .padsos-container {
          display: flex;
          height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          flex-direction: ${isMobile ? 'column' : 'row'};
        }
        
        .padsos-sidebar {
          width: ${isMobile ? '100%' : '30%'};
          min-width: ${isMobile ? 'auto' : '280px'};
          max-width: ${isMobile ? 'none' : '400px'};
          padding: ${isSmallMobile ? '15px' : '20px'};
          background-color: #f8f8f8;
          box-sizing: border-box;
          height: ${isMobile ? 'auto' : '100vh'};
          overflow-y: ${isMobile ? 'visible' : 'auto'};
          max-height: ${isMobile ? '50vh' : 'none'};
        }
        
        .padsos-sidebar h3 {
          margin: 0 0 15px 0;
          font-size: ${isSmallMobile ? '18px' : '20px'};
        }
        
        .padsos-location-status {
          background-color: ${currentLocation ? '#e8f5e8' : '#ffebee'};
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: ${isSmallMobile ? '12px' : '14px'};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .padsos-refresh-btn {
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 3px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .padsos-requests-list {
          max-height: ${isMobile ? '200px' : '400px'};
          overflow-y: auto;
          margin-bottom: 15px;
        }
        
        .padsos-user-item {
          padding: ${isSmallMobile ? '8px' : '10px'};
          margin-bottom: 10px;
          background-color: white;
          border-radius: 5px;
          font-size: ${isSmallMobile ? '14px' : '16px'};
          cursor: pointer;
        }
        
        .padsos-button {
          background-color: #ff5f7c;
          color: white;
          border: none;
          border-radius: 5px;
          padding: ${isSmallMobile ? '8px 12px' : '10px 15px'};
          margin: ${isSmallMobile ? '5px 5px 5px 0' : '5px 10px 5px 0'};
          cursor: pointer;
          font-size: ${isSmallMobile ? '14px' : '16px'};
        }
        
        .padsos-request-help-button {
          background-color: #ff5f7c;
          color: white;
          padding: ${isSmallMobile ? '12px' : '15px'};
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
          width: 100%;
          font-size: ${isSmallMobile ? '14px' : '16px'};
        }
        
        .padsos-help-them-button {
          background-color: #4caf50;
          color: white;
          padding: ${isSmallMobile ? '12px' : '15px'};
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
          width: 100%;
          font-size: ${isSmallMobile ? '14px' : '16px'};
        }
        
        .padsos-map-container {
          flex: 1;
          height: ${isMobile ? '50vh' : '100vh'};
          min-height: ${isMobile ? '300px' : 'auto'};
        }
        
        .padsos-requested-help-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: ${isSmallMobile ? '15px' : '20px'};
          text-align: center;
          box-sizing: border-box;
        }
        
        .padsos-requested-help-container h2 {
          font-size: ${isSmallMobile ? '20px' : '24px'};
          margin-bottom: 15px;
        }
        
        .padsos-requested-help-container p {
          font-size: ${isSmallMobile ? '14px' : '16px'};
          margin-bottom: 20px;
          max-width: 500px;
        }
        
        .padsos-requested-help-buttons {
          display: flex;
          flex-direction: ${isSmallMobile ? 'column' : 'row'};
          gap: ${isSmallMobile ? '10px' : '0'};
          width: ${isSmallMobile ? '100%' : 'auto'};
          max-width: ${isSmallMobile ? '300px' : 'none'};
        }
        
        .padsos-button:hover,
        .padsos-request-help-button:hover,
        .padsos-help-them-button:hover,
        .padsos-refresh-btn:hover {
          opacity: 0.9;
        }
        
        .padsos-button:disabled,
        .padsos-request-help-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      
      {helpRequested ? (
        <div className="padsos-requested-help-container">
          <h2>You have requested help!</h2>
          <p>Your request has been sent. If someone accepts to help you, you will be notified.</p>
          <div className="padsos-requested-help-buttons">
            <button className="padsos-button" onClick={cancelHelpRequest}>
              Cancel Request
            </button>
            <button className="padsos-button" onClick={handleReceivedHelp}>
              Received Help
            </button>
          </div>
        </div>
      ) : (
        <div className="padsos-container">
          <div className="padsos-sidebar">
            <h3>Help Requests</h3>
            
            <div className="padsos-location-status">
              <span>
                {currentLocation 
                  ? `📍 Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                  : '📍 Getting location...'}
              </span>
              <button className="padsos-refresh-btn" onClick={refreshLocation}>
                Refresh
              </button>
            </div>
            
            <div className="padsos-requests-list">
              {helpRequests.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRequest(item)}
                  className="padsos-user-item"
                  style={{
                    border:
                      selectedRequest && selectedRequest.id === item.id
                        ? '2px solid #ff5f7c'
                        : '1px solid #ddd',
                  }}
                >
                  <strong>{userNames[item.userId] || 'Unknown'}</strong>
                  {currentLocation && item.coordinates && (
                    <>
                      <p>
                        {getDistance(currentLocation, item.coordinates)} km away
                      </p>
                      <p style={{ color: '#ff5f7c' }}>
                        in urgent need of sanitary napkin
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
            {selectedRequest && (
              <button
                className="padsos-help-them-button"
                onClick={() =>
                  acceptHelpRequest(
                    selectedRequest.id,
                    selectedRequest.userId,
                    userNames[selectedRequest.userId] || 'Unknown User'
                  )
                }
              >
                Help Them
              </button>
            )}
            <button
              className="padsos-request-help-button"
              onClick={sendHelpRequest}
              disabled={!currentLocation}
              title={!currentLocation ? 'Location required to request help' : ''}
            >
              Request Help
            </button>
          </div>

          <div className="padsos-map-container">
            <MapContainer
              key={mapKey}
              center={
                currentLocation
                  ? [currentLocation.latitude, currentLocation.longitude]
                  : defaultPosition
              }
              zoom={currentLocation ? 16 : 13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
                // Force invalidate size after map is created
                setTimeout(() => {
                  mapInstance.invalidateSize();
                  if (currentLocation) {
                    mapInstance.setView([currentLocation.latitude, currentLocation.longitude], 16);
                  }
                }, 500);
              }}
            >
              <MapViewController currentLocation={currentLocation} />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.coordinates.latitude, loc.coordinates.longitude]}
                >
                  <Popup>{userNames[loc.id] || 'Unknown User'}</Popup>
                </Marker>
              ))}

              {/* Special marker for current user with different color */}
              {currentLocation && (
                <Marker
                  position={[currentLocation.latitude, currentLocation.longitude]}
                  icon={new L.Icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                    className: 'current-user-marker'
                  })}
                >
                  <Popup>You are here</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}
