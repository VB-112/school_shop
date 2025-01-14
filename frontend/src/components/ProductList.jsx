import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania produktów:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ marginRight: '320px', padding: '20px' }}>
      <h2>Produkty</h2>
      <div className="product-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', // Ustawiamy dokładnie 4 kolumny
          gap: '15px', // Odstęp między kartami
        }}
      >
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} addToCart={addToCart} />
          </div>
        ))}
      </div>
    </div>
  );
};

ProductList.propTypes = {
  addToCart: PropTypes.func.isRequired,
};

export default ProductList;
