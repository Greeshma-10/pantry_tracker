import React, { useState } from 'react';
import { auth } from '@/firebase'; // Adjust path as needed
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Box, TextField, Button, Typography, colors } from '@mui/material';



function Authentication({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // State to manage whether to show sign-up or sign-in form
  const [error, setError] = useState(''); // State for error message


  const handleSignUp = async () => {
    try {
      console.log('Signing up with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      setUser(userCredential.user);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      setError(''); // Clear previous errors
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid email or password.'); // Set error message
    }
    
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h6">{isSignUp ? 'Sign Up' : 'Sign In'}</Typography>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        
        sx={{
          marginBottom: 2,
          '& .MuiInputBase-input': {
            color: 'white', // Change text color here
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'green', // Default border color
            },
            '&:hover fieldset': {
              borderColor: 'orange', // Border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'red', // Border color when focused
            },
          },
        }}
      />
      <TextField
        label="Password"
        type="password"
      
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{
          marginBottom: 2,
          '& .MuiInputBase-input': {
            color: 'white', // Change text color here
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'green', // Default border color
            },
            '&:hover fieldset': {
              borderColor: 'orange', // Border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'red', // Border color when focused
            },
          },
        }}
      />
      
      {isSignUp ? (
        <>
          <Button onClick={handleSignUp} variant="contained" sx={{ marginBottom: 1 }}>
            Sign Up
          </Button>
          <Typography variant="body2">
            Already have an account?{' '}
            <Button onClick={() => setIsSignUp(false)}>Sign In</Button>
          </Typography>
        </>
      ) : (
        <>
          <Button onClick={handleSignIn} variant="contained" sx={{ marginBottom: 1 }}>
            Sign In
          </Button>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Button onClick={() => setIsSignUp(true)}>Sign Up</Button>
          </Typography>
        </>
      )}
    </Box>
  );
}

export default Authentication;
