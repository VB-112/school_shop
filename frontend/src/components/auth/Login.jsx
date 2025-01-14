import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Login.css';

const Login = ({ setUser }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Dla rejestracji
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Przełącznik między logowaniem a rejestracją
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? 'http://localhost:5000/api/register' : 'http://localhost:5000/api/login';

    try {
      const payload = isRegister ? { name, password, role } : { name, password };
      const response = await axios.post(endpoint, payload);

      if (!isRegister && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.role);

        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/products');
        }
      } else if (isRegister) {
        alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
        setIsRegister(false); // Powrót do logowania po rejestracji
      }
    } catch (err) {
      setError(isRegister ? 'Błąd rejestracji!' : 'Błąd logowania!');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? 'Zarejestruj się' : 'Zaloguj się'}</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isRegister && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Użytkownik</option>
            <option value="admin">Administrator</option>
          </select>
        )}
        <button type="submit">{isRegister ? 'Zarejestruj się' : 'Zaloguj się'}</button>
      </form>
      <button type="button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
      </button>
    </div>
  );
};

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
