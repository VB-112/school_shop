import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shop_db',
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Brak tokenu autoryzacji.' });

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Nieautoryzowany dostęp.' });
    req.user = decoded; // Add user data to the request object
    next();
  });
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Tylko admin może wykonać tę akcję.' });
  }
  next();
};

// Routes

// Register user
app.post('/api/register', (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
  }

  if (name.length < 5) {
    return res.status(400).json({ message: 'Nazwa użytkownika musi mieć co najmniej 5 znaków.' });
  }

  if (password.length < 7 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({
      message: 'Hasło musi mieć co najmniej 7 znaków, zawierać dużą literę i cyfrę.',
    });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).send(err);

    const query = 'INSERT INTO users (name, password, role) VALUES (?, ?, ?)';
    db.query(query, [name, hashedPassword, role], (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Użytkownik zarejestrowany pomyślnie!' });
    });
  });
});

// Login user
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
  }

  const query = 'SELECT * FROM users WHERE name = ?';
  db.query(query, [name], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
    }

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) return res.status(500).send(err);
      if (!isMatch) {
        return res.status(400).json({ message: 'Nieprawidłowe hasło.' });
      }

      const token = jwt.sign({ id: results[0].id, role: results[0].role }, 'secretkey', { expiresIn: '1h' });
      res.json({
        message: 'Zalogowano pomyślnie!',
        token,
        role: results[0].role,
      });
    });
  });
});

// Fetch all products
app.get('/api/products', verifyToken, (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a new product
app.post('/api/products', verifyToken, verifyAdmin, (req, res) => {
  const { name, description, price, image } = req.body;
  if (!name || !description || !price || !image) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
  }

  const query = 'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)';
  db.query(query, [name, description, price, image], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({
      id: result.insertId,
      name,
      description,
      price,
      image,
    });
  });
});

// Update a product
app.put('/api/products/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  const query = 'UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?';
  db.query(query, [name, description, price, image, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Produkt zaktualizowany pomyślnie' });
  });
});

// Delete a product
app.delete('/api/products/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Produkt usunięty pomyślnie' });
  });
});

// Endpoint to change a user's role (admin only)
app.patch('/api/user/:id/role', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Rola musi być "user" lub "admin".' });
  }

  const query = 'UPDATE users SET role = ? WHERE id = ?';
  db.query(query, [role, id], (err, result) => {
    if (err) {
      console.error('Błąd podczas zmiany roli użytkownika:', err);
      return res.status(500).json({ message: 'Błąd serwera' });
    }
    res.status(200).json({ message: `Rola użytkownika o ID ${id} została zmieniona na ${role}.` });
  });
});

// Endpoint to get all users (admin only)
app.get('/api/users', verifyToken, verifyAdmin, (req, res) => {
  try {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
