import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import HomeScreen from './pages/HomeScreen';
import PadSOSScreen from './pages/PadSOSScreen';
import PeriodTrackerScreen from './pages/PeriodTrackerScreen';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <HomeScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignupScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/pad-sos"
          element={user ? <PadSOSScreen /> : <Navigate to="/login" />}
        />
        <Route
          path="/period-tracker"
          element={user ? <PeriodTrackerScreen /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
