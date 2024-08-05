'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, TextField, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { firestore, auth } from '@/firebase'; // Ensure the correct path to firebase.js
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, where } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Authentication from './Authentication'; // Ensure correct path

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 400,
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
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemSupplier, setItemSupplier] = useState('');
  const [user, setUser] = useState(null);
  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Pulses'];

  const updateInventory = async (userId) => {
    try {
      const snapshot = query(collection(firestore, 'inventory'), where('userId', '==', userId));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const addItem = async (item, category, description, price, supplier) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, category, description, price, supplier, userId: user.uid });
      } else {
        await setDoc(docRef, { quantity: 1, category, description, price, supplier, userId: user.uid });
      }
      await updateInventory(user.uid);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1, userId: user.uid });
        }
      }
      await updateInventory(user.uid);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredInventory(filtered);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updateInventory(user.uid);
      } else {
        setUser(null);
        setInventory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchQuery, selectedCategory, inventory]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100%" minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={2}>
      {user ? (
        <>
          <Button
  variant="contained"
  onClick={handleSignOut}
  sx={{
    position: 'absolute',
    top: { xs: 8, sm: 16 }, // Adjust position for small and larger screens
    right: { xs: 7, sm: 15 }, // Adjust position for small and larger screens
    // Add padding or margin if needed for better placement
    padding: '8px 16px',
  }}
>
  Sign Out
</Button>


          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'white', 
              marginBottom: 3,
              // Set the width of the TextField
              width: '60%',
              // Customizing the background color
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'black', // Background color
                borderRadius: 2, // Rounded corners
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white', // Border color of the Select
              },
              '& .MuiOutlinedInput-input': {
                color: 'white', // Text color
                fontSize: '1rem', // Font size
              },
            }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' } }>
  <InputLabel id="category-label"  sx={{
      //color: '#555', 
      position: 'absolute',
      top: 0, // Align the label to the top
      left: 290, // Align the label to the left
      padding: '0 4px',
      textAlign: 'center', 
      width: '30%', // Ensure the label spans the width of the container
      display: 'flex', // Flex container for centering label
      justifyContent: 'topleft' // Center label horizontally
    }}
  > Category</InputLabel>
  <Select
    labelId="category-label"
    
    id="category-select"
    
    value={itemCategory}
    label="Category"
    onChange={(e) => setItemCategory(e.target.value)}
    sx={{
      textAlign:'justified',
      width: '60%',
      '& .MuiSelect-select': {
        color: 'white', // Text color inside the Select
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white', // Border color of the Select
      },
      '& .MuiSelect-icon': {
        color: 'white', // Color of the dropdown arrow
      },
    }}
  >
    {categories.map((category) => (
      <MenuItem key={category} value={category}>
        {category}
      </MenuItem>
    ))}
  </Select>
</FormControl>

          <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth value={itemName} onChange={(e) => setItemName(e.target.value)} sx={{ marginBottom: 2 }} />
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select labelId="category-label" id="category-select" value={itemCategory} label="Category" onChange={(e) => setItemCategory(e.target.value)}>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField id="outlined-description" label="Description" variant="outlined" fullWidth value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} sx={{ marginBottom: 2 }} />
              <TextField id="outlined-price" label="Price" variant="outlined" fullWidth value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} sx={{ marginBottom: 2 }} />
              <TextField id="outlined-supplier" label="Supplier" variant="outlined" fullWidth value={itemSupplier} onChange={(e) => setItemSupplier(e.target.value)} sx={{ marginBottom: 2 }} />
              <Button variant="outlined" fullWidth onClick={() => {
                addItem(itemName, itemCategory, itemDescription, itemPrice, itemSupplier);
                setItemName('');
                setItemCategory('');
                setItemDescription('');
                setItemPrice('');
                setItemSupplier('');
                handleClose();
              }}>
                Add
              </Button>
            </Box>
          </Modal>
          <Button variant="contained" onClick={handleOpen} sx={{ marginBottom: 2 }}>
            Add New Item
          </Button>
          <Box border="1px solid #333" width="100%" maxWidth="800px" overflow="auto" padding={2}>
            <Typography variant="h2" color="White" textAlign="center" marginBottom={2}>
              Inventory Items
            </Typography>
            <Grid container spacing={2}>
              {filteredInventory.map(({ name, quantity, category, description, price, supplier }) => (
                <Grid item xs={12} sm={6} md={4} key={name}>
                  <Box bgcolor="#f0f0f0" padding={2} display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h5" color="#333" textAlign="center" marginBottom={1}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="h6" color="#333" textAlign="center" marginBottom={1}>
                      Category: {category}
                    </Typography>
                    <Typography variant="h6" color="#333" textAlign="center" marginBottom={1}>
                      Quantity: {quantity}
                    </Typography>
                    <Typography variant="body1" color="#333" textAlign="center" marginBottom={1}>
                      Description: {description}
                    </Typography>
                    <Typography variant="body1" color="#333" textAlign="center" marginBottom={1}>
                      Price: ${price}
                    </Typography>
                    <Typography variant="body1" color="#333" textAlign="center" marginBottom={1}>
                      Supplier: {supplier}
                    </Typography>
                    <Button variant="contained" onClick={() => removeItem(name)} fullWidth>
                      Remove
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      ) : (
        <Authentication setUser={setUser} />
      )}
    </Box>
  );
}