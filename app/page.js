'use client'

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, TextField, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { firestore } from '@/firebase'; // Ensure the correct path to firebase.js
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Adjust width to be responsive
  maxWidth: 400, // Maximum width for larger screens
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Meat'];

  // Function to update the inventory from Firebase
  const updateInventory = async () => {
    try {
      console.log('Fetching inventory from Firebase...');
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      console.log('Fetched inventory:', inventoryList);
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Function to add an item to Firebase
  const addItem = async (item, category) => {
    try {
      console.log(`Adding item: ${item} in category: ${category}`);
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, category });
      } else {
        await setDoc(docRef, { quantity: 1, category });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Function to remove an item from Firebase
  const removeItem = async (item) => {
    try {
      console.log(`Removing item: ${item}`);
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // useEffect to update the inventory when the component mounts
  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100%"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category-select"
              value={itemCategory}
              label="Category"
              onChange={(e) => setItemCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              addItem(itemName, itemCategory);
              setItemName('');
              setItemCategory('');
              handleClose();
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen} sx={{ marginBottom: 2 }}>
        Add New Item
      </Button>
      <Box
        border="1px solid #333"
        width="100%"
        maxWidth="800px"
        overflow="auto"
        padding={2}
      >
        <Typography variant="h2" color="#333" textAlign="center" marginBottom={2}>
          Inventory Items
        </Typography>
        <Grid container spacing={2}>
          {inventory.map(({ name, quantity, category }) => (
            <Grid item xs={12} sm={6} md={4} key={name}>
              <Box
                bgcolor="#f0f0f0"
                padding={2}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Typography variant="h5" color="#333" textAlign="center" marginBottom={1}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h5" color="#333" textAlign="center" marginBottom={1}>
                  Category: {category}
                </Typography>
                <Typography variant="h5" color="#333" textAlign="center" marginBottom={1}>
                  Quantity: {quantity}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                  fullWidth
                >
                  Remove
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
