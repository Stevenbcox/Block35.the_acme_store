const express = require('express');
const { createUser, createProduct, fetchUsers, fetchProducts, createFavorite, fetchFavorites, destroyFavorite } = require('./db');
const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON request bodies

// Initialize the database by creating tables
const init = async () => {
  await createTables();
};

// Routes

// GET /api/users: Returns an array of users
app.get('/api/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/products: Returns an array of products
app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/users/:id/favorites: Returns an array of favorites for a user
app.get('/api/users/:id/favorites', async (req, res) => {
  const userId = req.params.id;
  try {
    const favorites = await fetchFavorites(userId);
    res.status(200).json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /api/users/:id/favorites: Adds a product to a user's favorites
app.post('/api/users/:id/favorites', async (req, res) => {
  const userId = req.params.id;
  const { product_id } = req.body;

  try {
    const favorite = await createFavorite({ user_id: userId, product_id });
    res.status(201).json(favorite);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE /api/users/:userId/favorites/:id: Deletes a favorite for a user
app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  const userId = req.params.userId;
  const favoriteId = req.params.id;

  try {
    await destroyFavorite(userId, favoriteId);
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  init(); // Call the init function to create the tables
});
