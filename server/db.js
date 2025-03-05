const { Client } = require('pg');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

// Initialize the PostgreSQL client
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'acme_store_db',
  password: 'your_password',
  port: 5432,
});

client.connect();

// Create tables
const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id UUID PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products (
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT
    );

    CREATE TABLE favorites (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT unique_favorite UNIQUE (user_id, product_id)
    );
  `;
  await client.query(SQL);
};

// Create a new user
const createUser = async ({ username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const SQL = `
    INSERT INTO users (id, username, password) 
    VALUES ($1, $2, $3) 
    RETURNING id, username;
  `;
  const response = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
  return response.rows[0];
};

// Create a new product
const createProduct = async ({ name, description }) => {
  const SQL = `
    INSERT INTO products (id, name, description) 
    VALUES ($1, $2, $3) 
    RETURNING id, name, description;
  `;
  const response = await client.query(SQL, [uuid.v4(), name, description]);
  return response.rows[0];
};

// Fetch all users
const fetchUsers = async () => {
  const SQL = `SELECT id, username FROM users`;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch all products
const fetchProducts = async () => {
  const SQL = `SELECT id, name, description FROM products`;
  const response = await client.query(SQL);
  return response.rows;
};

// Create a favorite
const createFavorite = async ({ user_id, product_id }) => {
  const SQL = `
    INSERT INTO favorites (id, user_id, product_id) 
    VALUES ($1, $2, $3) 
    RETURNING id, user_id, product_id;
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

// Fetch all favorites for a user
const fetchFavorites = async (user_id) => {
  const SQL = `
    SELECT f.id, p.name, p.description
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE f.user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

// Delete a favorite
const destroyFavorite = async (user_id, id) => {
  const SQL = `
    DELETE FROM favorites 
    WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [user_id, id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
