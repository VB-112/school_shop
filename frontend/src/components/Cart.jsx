import PropTypes from 'prop-types';

const Cart = ({ cartItems, updateQuantity, removeItem, clearCart, placeOrder }) => {
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: '0',
        top: '80px', // Zwiększenie wartości 'top', aby koszyk nie nachodził na nagłówek
        width: '300px',
        height: 'calc(100% - 80px)', // Odejmuje 80px, aby koszyk miał odpowiednią wysokość
        backgroundColor: '#f9f9f9',
        borderLeft: '1px solid #ccc',
        padding: '10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <h4>Koszyk</h4>
      
      {cartItems.length === 0 ? (
        <p>Koszyk jest pusty</p>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '10px',
          }}
        >
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {cartItems.map((item) => (
              <li key={item.id} style={{ marginBottom: '10px' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{item.name}</strong>
                    <p>Cena: {item.price} zł</p>
                    <div>
                      Ilość:
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        style={{ width: '50px', marginLeft: '5px' }}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h5>Łączna cena: {calculateTotal()} zł</h5>
        <div className="mt-3 d-flex justify-content-between">
          <button className="btn btn-warning btn-sm" onClick={clearCart}>
            Wyczyść koszyk
          </button>
          <button className="btn btn-success btn-sm" onClick={placeOrder}>
            Złóż zamówienie
          </button>
        </div>
      </div>
    </div>
  );
};

Cart.propTypes = {
  cartItems: PropTypes.arrayOf(PropTypes.shape({
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  updateQuantity: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  clearCart: PropTypes.func.isRequired,
  placeOrder: PropTypes.func.isRequired,
};

export default Cart;
