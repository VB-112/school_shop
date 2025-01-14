import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';
import ProductForm from './ProductForm';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get('http://localhost:5000/api/products');
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    setProductToEdit(product); // Set product to edit when clicking 'Edit'
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleProductAdded = () => {
    // Refresh product list after adding a new product
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => console.error('Error fetching updated products:', error));
  };

  const handleEditComplete = () => {
    // Refresh product list after editing a product
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => console.error('Error fetching updated products:', error));
    setProductToEdit(null); // Reset productToEdit after edit is complete
  };

  return (
    <div className="admin-container">
      <div className="panel-header">
        <h2>Admin Panel</h2>
      </div>

      <ProductForm
        onProductAdded={handleProductAdded}
        productToEdit={productToEdit}
        onEditComplete={handleEditComplete}
      />

      <h3>Product List</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>
                <button onClick={() => handleEditProduct(product.id)}>Edit</button>
                <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
