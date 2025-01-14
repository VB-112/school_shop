import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login'; 
import Register from './components/auth/Register'; 
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  // Sprawdzenie, czy użytkownik jest zalogowany po załadowaniu aplikacji
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Dekodowanie tokena JWT
      setUser(decodedToken.role); // Ustawiamy rolę użytkownika na podstawie tokena
    }
  }, []);

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (products) => {
    try {
      const token = localStorage.getItem('token'); // Pobierz token z localStorage
      if (!token) {
        console.error('Brak tokenu autoryzacji.');
        return;
      }
  
      const response = await axios.post(
        'http://localhost:5000/api/order',
        { products },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Dodaj token w nagłówkach
          },
        }
      );
  
      console.log('Zamówienie złożone pomyślnie:', response.data);
    } catch (error) {
      console.error('Błąd podczas składania zamówienia:', error);
    }
  };
  

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setMessage(`Produkt ${product.name} został dodany do koszyka!`);
    setTimeout(() => setMessage(""), 3000);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Funkcja do wylogowywania użytkownika
  const logout = () => {
    setUser(null); // Resetujemy stan użytkownika
    setCart([]); // Czyszczenie koszyka
    localStorage.removeItem('token'); // Usuwamy token z localStorage po wylogowaniu
  };

  return (
    <Router>
      <div>
        <header className="bg-light py-2 d-flex justify-content-between align-items-center px-3">
          <h1 className="text-center">Szkolny Sklepik</h1>
          {user ? (
            <button className="btn btn-outline-danger" onClick={logout}>
              Wyloguj
            </button>
          ) : (
            <Navigate to="/login" />
          )}
        </header>
        <main>
          {message && (
            <div className="alert-container">
              <div className="alert alert-success">{message}</div>
            </div>
          )}

          <Routes>
            <Route path="/admin" element={user === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/products" element={<ProductList addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart
              cartItems={cart}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              clearCart={clearCart}
              placeOrder={placeOrder}
            />} />
            <Route path="/" element={user ? <Navigate to="/products" /> : <Navigate to="/login" />} />
          </Routes>

          {user && window.location.pathname === '/products' && (
            <Cart
              cartItems={cart}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              clearCart={clearCart}
              placeOrder={placeOrder}
            />
          )}
        </main>
      </div>
    </Router>
  );
};

export default App;
