import { useState } from 'react';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja danych
    if (name.length < 5) {
      setErrorMessage('Nazwa użytkownika musi zawierać co najmniej 5 znaków.');
      return;
    }
    if (password.length < 7 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setErrorMessage('Hasło musi mieć co najmniej 7 znaków, zawierać dużą literę i cyfrę.');
      return;
    }

    // Wysyłanie zapytania do backendu
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setName('');
        setPassword('');
        setErrorMessage('');
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error('Error occurred:', err);
      setErrorMessage('Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.');
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Imię użytkownika:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zarejestruj</button>
      </form>
      {errorMessage && <div>{errorMessage}</div>}
      {successMessage && <div>{successMessage}</div>}
    </div>
  );
};

export default Register;
