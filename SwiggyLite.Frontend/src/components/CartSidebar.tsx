import React, { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Modal, Form } from 'react-bootstrap';
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

const CartSidebar: React.FC<{ restaurantId?: number; onCartUpdated?: () => void }> = ({ restaurantId, onCartUpdated }) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/cart');
      setItems(res.data.items || []);
      setTotal(res.data.totalAmount || 0);
    } catch {
      // silently ignore
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Please enter a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const orderData = {
        restaurantId: restaurantId || 0,
        deliveryAddress: address,
        instructions,
        items: items.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
      };
      await api.post('/orders', orderData);
      setShowCheckout(false);
      await fetchCart();
      onCartUpdated?.();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      alert('Failed to place order: ' + (err.response?.data?.message || err.message));
    } finally {
      setPlacing(false);
    }
  };

  if (!token) return null;

  return (
    <>
      {/* Floating mini-cart bar */}
      {items.length > 0 && (
        <div className="cart-mini-bar">
          <div
            className="cart-mini-summary"
            onClick={() => navigate('/cart')}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-2 text-dark">
              <Badge bg="warning" text="dark" className="fs-6">
                🛒 {items.length}
              </Badge>
              <span className="fw-medium small">Cart items</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold text-warning">₹{total.toFixed(2)}</span>
              <Button
                variant="outline-light"
                size="sm"
                onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}
                style={{ borderRadius: 8, borderWidth: 2 }}
              >
                View Cart
              </Button>
            </div>
          </div>
        </div>
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
              value={address || (user?.phone ? `Phone: ${user.phone}` : '')}
              onChange={(e) => setAddress(e.target.value)}
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
            <span className="h5 fw-bold text-warning">₹{total.toFixed(2)}</span>
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
            disabled={placing || !address.trim()}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            {placing ? 'Placing Order…' : 'Place Order & Pay'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CartSidebar;