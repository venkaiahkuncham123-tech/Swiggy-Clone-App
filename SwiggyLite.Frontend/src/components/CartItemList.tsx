import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  id: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  addedAt: string;
  menuItem?: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

const CartItemList: React.FC<{ restaurantId?: number }> = ({ restaurantId }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/cart');
      setCartItems(res.data.items || []);
      setTotalAmount(res.data.totalAmount || 0);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token might be expired, will be handled by axios interceptor
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (menuItemId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await api.put('/cart/update', { menuItemId, quantity: newQty });
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (menuItemId: number) => {
    try {
      await api.delete(`/cart/remove/${menuItemId}`);
      await fetchCart();
    } catch (err: any) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        restaurantId: restaurantId || 0,
        deliveryAddress: deliveryAddress,
        instructions: instructions,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        }))
      };
      await api.post('/orders', orderData);
      setShowCheckout(false);
      setDeliveryAddress('');
      setInstructions('');
      await fetchCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      alert('Failed to place order: ' + (err.response?.data?.message || err.message));
    } finally {
      setPlacing(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-5">
        <Alert variant="info">
          Please <a href="/login">login</a> to view your cart.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" role="status" />
        <p className="mt-3 text-muted">Loading your cart…</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold" style={{ color: '#212529' }}>
          Your Cart
        </h3>
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/')}>
          ← Back to Restaurants
        </Button>
      </div>

      {cartItems.length === 0 ? (
        <Card className="mb-0 bg-white shadow-sm text-center py-5">
          <CardBody>
            <div style={{ fontSize: '3rem' }}>🛒</div>
            <p className="text-muted mb-0">Your cart is empty</p>
            <p className="text-muted small mt-2">Browse restaurants and add items to your cart!</p>
            <Button variant="warning" size="sm" className="mt-3" onClick={() => navigate('/')}>
              Browse Restaurants
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <CardBody>
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center py-3 border-bottom">
                  <div style={{ width: '80px', height: '80px' }} className="flex-shrink-0">
                    {item.menuItem?.imageUrl ? (
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="img-fluid rounded"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center h-100 rounded">
                        <span className="text-muted small">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="ms-3 flex-grow-1">
                    <h6 className="mb-1 fw-semibold">{item.menuItem?.name || 'Item'}</h6>
                    <p className="text-muted small mb-0">₹{item.unitPrice.toFixed(2)} each</p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{ minWidth: '32px', borderRadius: 6 }}
                    >
                      −
                    </Button>
                    <span className="fw-bold">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      style={{ minWidth: '32px', borderRadius: 6 }}
                    >
                      +
                    </Button>
                  </div>
                  <div className="ms-3 text-end">
                    <div className="fw-bold">₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => removeItem(item.menuItemId)}
                      style={{ padding: 0, color: '#dc3545', fontSize: '0.75rem' }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="shadow-sm cart-summary mb-4">
            <CardBody>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted">Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-top">
                <span className="fw-bold">Delivery Fee</span>
                <span className="text-muted">₹{(totalAmount > 199 ? 0 : 30).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-top pt-3">
                <span className="fw-bold">Total Amount</span>
                <span className="h5 mb-0 text-warning">₹{(totalAmount + (totalAmount > 199 ? 0 : 30)).toFixed(2)}</span>
              </div>
              <Button
                variant="warning"
                className="w-100 mt-3"
                size="lg"
                onClick={() => setShowCheckout(true)}
                style={{ borderRadius: 12, fontWeight: 600, padding: '12px' }}
              >
                Proceed to Checkout
              </Button>
            </CardBody>
          </Card>
        </>
      )}

      {/* Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton className="bg-warning">
          <h5 className="mb-0 fw-bold">Delivery Details</h5>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Delivery Address *</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="123 Main Street, Hyderabad"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              style={{ borderRadius: 8 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Special Instructions (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="E.g. Leave at doorstep, ring the bell"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Form.Group>
          <div className="d-flex justify-content-between py-2 border-top pt-2">
            <span className="fw-medium">Total Amount</span>
            <span className="h5 fw-bold text-warning">₹{(totalAmount + (totalAmount > 199 ? 0 : 30)).toFixed(2)}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowCheckout(false)}>
            Cancel
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={handleCheckout}
            disabled={placing || !deliveryAddress.trim()}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            {placing ? 'Placing Order…' : 'Place Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CartItemList;