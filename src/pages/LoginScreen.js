// src/pages/LoginScreen.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login Successful!');
      navigate('/');
    } catch (error) {
      alert('Login Failed: ' + (error.message || 'Unknown error'));
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: '20px',
    },
    container: {
      maxWidth: 400,
      width: '100%',
      padding: 24,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: 8,
      textAlign: 'center',
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#ff5f7c',
      fontSize: 14,
      cursor: 'pointer',
      marginBottom: 20,
      textAlign: 'left',
    },
    iconContainer: {
      backgroundColor: '#f4c7d7',
      borderRadius: '50%',
      width: 80,
      height: 80,
      lineHeight: '80px',
      margin: '0 auto 16px',
      fontSize: 40,
      fontWeight: 'bold',
      color: '#fff',
      userSelect: 'none',
    },
    title: {
      marginBottom: 24,
      fontSize: 28,
      fontWeight: '700',
      color: '#333',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
    },
    label: {
      marginBottom: 6,
      fontWeight: '600',
      fontSize: 14,
      color: '#444',
    },
    input: {
      padding: '10px 12px',
      marginBottom: 20,
      borderRadius: 4,
      border: '1px solid #ccc',
      fontSize: 16,
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    loginButton: {
      backgroundColor: '#ff5f7c',
      color: '#fff',
      padding: '12px',
      border: 'none',
      borderRadius: 4,
      fontWeight: '700',
      fontSize: 16,
      cursor: 'pointer',
    },
    switchText: {
      marginTop: 20,
      fontSize: 14,
      color: '#666',
    },
    link: {
      color: '#ff5f7c',
      cursor: 'pointer',
      fontWeight: '600',
      textDecoration: 'underline',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          &larr; Back to Home Page
        </button>

        <div style={styles.iconContainer}>HH</div>
        <h2 style={styles.title}>Login</h2>

        <form style={styles.form} onSubmit={handleLogin}>
          <label style={styles.label} htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            style={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label style={styles.label} htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            style={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={styles.link}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate('/signup')}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
}
