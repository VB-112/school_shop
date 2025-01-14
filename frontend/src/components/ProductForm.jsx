import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const ProductForm = ({ onProductAdded, productToEdit = null, onEditComplete = () => {} }) => {  // Default params here
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price);
      setDescription(productToEdit.description);
      setImage(productToEdit.image);
    }
  }, [productToEdit]);

  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (productToEdit) {
        await axios.put(`http://localhost:5000/api/products/${productToEdit.id}`, {
          name,
          price,
          description,
          image,
        });
        onEditComplete();
      } else {
        await axios.post('http://localhost:5000/api/products', {
          name,
          price,
          description,
          image,
        });
      }
      onProductAdded();
      setName('');
      setPrice('');
      setDescription('');
      setImage('');
    } catch (error) {
      console.error('Błąd podczas zapisywania produktu:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{productToEdit ? 'Edytuj produkt' : 'Dodaj nowy produkt'}</h2>
      <input
        type="text"
        placeholder="Nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Cena"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <textarea
        placeholder="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      ></textarea>
      <button type="submit">{productToEdit ? 'Zapisz zmiany' : 'Dodaj produkt'}</button>
    </form>
  );
};

ProductForm.propTypes = {
  onProductAdded: PropTypes.func.isRequired,
  productToEdit: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    price: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
  }),
  onEditComplete: PropTypes.func,
};

export default ProductForm;
