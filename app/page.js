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

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Name,Category,Description,Price,Supplier\n";

    const formattedInventory = inventory.map(item => (
      `${item.name},${item.category},${item.description},${item.price},${item.supplier}`
    ));

    const csvData = csvContent + formattedInventory.join("\n");

    const encodedUri = encodeURI(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
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
  }, [searchQuery, selectedCategory, inventory, filterInventory]);

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
              padding: '8px 16px',
            }}
          >
            Sign Out
          </Button>
              Search Bar
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'white',
              marginBottom: 3,
              width: '60%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'black',
                borderRadius: 2,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
                fontSize: '1rem',
              },
            }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            <InputLabel
              id="category-label"
              sx={{
                position: 'absolute',
                top: 0, // Align the label to the top
                left: 290, // Align the label to the left
                padding: '0 4px',
                //color: 'white',
                '&.Mui-focused': {
                  color: 'white',
                },
              }}
            >
              Category
            </InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{
                color: 'white',
                backgroundColor: 'black',
                width: '60%',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ width: '100%' }}>
            {filteredInventory.map((item) => (
              <Grid item key={item.name} xs={12} sm={6} md={4} lg={3}>
                <Box
                  sx={{
                    padding: 2,
                    border: '1px solid white',
                    borderRadius: 2,
                    backgroundColor: 'black',
                    color: 'white',
                  }}
                >
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2">Category: {item.category}</Typography>
                  <Typography variant="body2">Description: {item.description}</Typography>
                  <Typography variant="body2">Price: {item.price}</Typography>
                  <Typography variant="body2">Supplier: {item.supplier}</Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Button
                      variant="contained"
                      onClick={() => addItem(item.name, item.category, item.description, item.price, item.supplier)}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => removeItem(item.name)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ marginTop: 3 }}
          >
            Add Item
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportToCSV}
            sx={{ marginTop: 3, marginLeft: 2 }}
          >
            Export to CSV
          </Button>

          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
              <TextField
                label="Price"
                variant="outlined"
                fullWidth
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
              <TextField
                label="Supplier"
                variant="outlined"
                fullWidth
                value={itemSupplier}
                onChange={(e) => setItemSupplier(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem(itemName, itemCategory, itemDescription, itemPrice, itemSupplier);
                  handleClose();
                }}
              >
                Add Item
              </Button>
            </Box>
          </Modal>
        </>
      ) : (
        <Authentication />
      )}
    </Box>
  );
}
