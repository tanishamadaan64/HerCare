// src/pages/SignupScreen.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(firestore, 'users', userId), {
        firstName,
        lastName,
        email,
      });

      alert('Signup Successful!');
      navigate('/');
    } catch (error) {
      alert('Signup Failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          &larr; Back to Home Page
        </button>

        <div style={styles.iconContainer}>HH</div>
        <h2 style={styles.title}>Sign Up</h2>

        <form style={styles.form} onSubmit={handleSignup}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label htmlFor="firstName" style={styles.label}>First Name *</label>
              <input
                id="firstName"
                type="text"
                style={styles.input}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="lastName" style={styles.label}>Last Name *</label>
              <input
                id="lastName"
                type="text"
                style={styles.input}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <label htmlFor="email" style={styles.label}>Email Address *</label>
          <input
            id="email"
            type="email"
            style={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label htmlFor="password" style={styles.label}>Password *</label>
          <input
            id="password"
            type="password"
            style={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button type="submit" style={styles.signupButton}>Sign Up</button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={styles.link}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate('/login')}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '16px',
    '@media (max-width: 768px)': {
      padding: '12px',
      alignItems: 'flex-start',
      paddingTop: '20px',
    },
  },
  container: {
    maxWidth: '480px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    '@media (max-width: 768px)': {
      maxWidth: '100%',
      padding: '20px',
      margin: '0 auto',
    },
    '@media (max-width: 480px)': {
      padding: '16px',
      boxShadow: 'none',
      borderRadius: '0px',
    },
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#ff5f7c',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '20px',
    textAlign: 'left',
    padding: '8px 0',
    '@media (max-width: 480px)': {
      fontSize: '16px',
      marginBottom: '16px',
    },
  },
  iconContainer: {
    backgroundColor: '#f4c7d7',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    lineHeight: '80px',
    margin: '0 auto 16px',
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#fff',
    userSelect: 'none',
    '@media (max-width: 480px)': {
      width: '60px',
      height: '60px',
      lineHeight: '60px',
      fontSize: '30px',
    },
  },
  title: {
    marginBottom: '24px',
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    '@media (max-width: 768px)': {
      fontSize: '24px',
      marginBottom: '20px',
    },
    '@media (max-width: 480px)': {
      fontSize: '22px',
      marginBottom: '16px',
    },
  },
  form: {
    textAlign: 'left',
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      gap: '0px',
      marginBottom: '16px',
    },
  },
  inputGroup: {
    flex: 1,
    minWidth: '140px',
    '@media (max-width: 480px)': {
      minWidth: 'auto',
      marginBottom: '16px',
    },
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#444',
    '@media (max-width: 480px)': {
      fontSize: '16px',
      marginBottom: '4px',
    },
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
    '@media (max-width: 480px)': {
      padding: '12px',
      fontSize: '16px',
      marginBottom: '0px',
    },
  },
  signupButton: {
    backgroundColor: '#ff5f7c',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '16px',
    width: '100%',
    cursor: 'pointer',
    marginTop: '8px',
    '@media (max-width: 480px)': {
      padding: '14px',
      fontSize: '18px',
      marginTop: '12px',
    },
  },
  switchText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
    '@media (max-width: 480px)': {
      fontSize: '16px',
      marginTop: '16px',
    },
  },
  link: {
    color: '#ff5f7c',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
  },
};