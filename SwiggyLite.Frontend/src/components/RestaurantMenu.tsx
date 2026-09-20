import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  spicyLevel?: string;
  size?: string;
  isAvailable: boolean;
  restaurantId: number;
  menuCategoryId: number;
}

interface RestaurantMenuProps {
  restaurantId: number;
  onCartUpdated?: () => void;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ restaurantId, onCartUpdated }) => {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  const fetchMenu = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await api.get(`/menus/restaurant/${restaurantId}`);
      setMenuItems(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const addToCart = async (menuItemId: number) => {
    if (!token) return;
    setAddingId(menuItemId);
    try {
      await api.post('/cart/add', { menuItemId, quantity: 1 });
      onCartUpdated?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not add item to cart';
      alert(msg);
    } finally {
      setAddingId(null);
    }
  };

  // Group items by category (preserving order of first appearance)
  const grouped: Record<string, MenuItem[]> = {};
  menuItems.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" role="status" />
        <p className="mt-3 text-muted">Loading menu…</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-0">This restaurant hasn't published its menu yet.</p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h5 className="mb-3" style={{ fontWeight: 700, color: '#212529' }}>
            {category}
          </h5>
          <Row>
            {items.map((item) => (
              <Col md={6} lg={4} key={item.id} className="mb-3">
                <Card className="h-100 menu-item-card shadow-sm">
                  {item.imageUrl && (
                    <Card.Img
                      variant="top"
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h6 mb-1">{item.name}</Card.Title>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fw-bold text-warning">₹{item.price.toFixed(2)}</span>
                      {item.size && <Badge bg="light" text="dark" className="small">{item.size}</Badge>}
                      {item.spicyLevel && <Badge bg="danger" className="small">{item.spicyLevel}</Badge>}
                      {!item.isAvailable && <Badge bg="secondary" className="small">Out of stock</Badge>}
                    </div>
                    {item.description && (
                      <Card.Text className="small text-muted mt-1 flex-grow-1">
                        {item.description}
                      </Card.Text>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-top-0">
                    <Button
                      variant="warning"
                      size="sm"
                      className="w-100"
                      style={{ borderRadius: 8, fontWeight: 600 }}
                      onClick={() => addToCart(item.id)}
                      disabled={!token || !item.isAvailable || addingId === item.id}
                    >
                      {!token ? 'Login to Order' : addingId === item.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" />
                          Adding…
                        </>
                      ) : 'Add to Cart'}
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenu;