import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button, Badge, Row, Col } from 'react-bootstrap';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RestaurantMenu from '../components/RestaurantMenu';
import CartSidebar from '../components/CartSidebar';

interface Restaurant {
  id: number;
  name: string;
  description?: string;
  imageUrl: string;
  cuisine: string;
  area?: string;
  rating: number;
  timings?: string;
  isDelivery: boolean;
  deliveryTimeMinutes: number;
  isActive: boolean;
  createdAt: string;
}

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartKey, setCartKey] = useState(0);

  const refreshCart = useCallback(() => {
    setCartKey(k => k + 1);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/restaurants/${id}`);
        setRestaurant(res.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3 text-muted">Loading restaurant…</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="warning" onClick={() => navigate('/')}>
          ← Back to Restaurants
        </Button>
      </Container>
    );
  }

  if (!restaurant) return null;

  return (
    <div>
      {/* Restaurant Hero Section */}
      <div className="bg-dark text-white mb-4" style={{ padding: '2rem 0' }}>
        <Container>
          <Button variant="light" size="sm" onClick={() => navigate('/')} className="mb-3" style={{ borderRadius: 20 }}>
            ← Back to Restaurants
          </Button>
          <Row>
            <Col md={5} className="mb-3 mb-md-0">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                style={{ borderRadius: 16, width: '100%', height: 220, objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
              />
            </Col>
            <Col md={7}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h1 className="h2 mb-0 fw-bold">{restaurant.name}</h1>
                <Badge bg="warning" text="dark" className="fs-6">
                  ★★★★★ {restaurant.rating.toFixed(1)}
                </Badge>
              </div>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <Badge bg="secondary" className="fs-7">{restaurant.cuisine}</Badge>
                {restaurant.area && <Badge bg="light" text="dark" className="fs-7">{restaurant.area}</Badge>}
              </div>
              {restaurant.description && (
                <p className="text-white-50 mb-2">{restaurant.description}</p>
              )}
              <div className="d-flex gap-4 text-white-50 small mb-1">
                <span>⏱ {restaurant.deliveryTimeMinutes} min delivery</span>
                <span>{restaurant.timings || 'Open now'}</span>
              </div>
              {!token && (
                <Alert variant="warning" className="mt-3 mb-0">
                  Please <a href="/login" className="fw-bold">login</a> to browse the menu and place orders.
                </Alert>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Menu Section */}
      <Container>
        <h3 className="mb-4 fw-bold" style={{ color: '#212529' }}>Menu</h3>
        <RestaurantMenu restaurantId={restaurant.id} onCartUpdated={refreshCart} />
      </Container>

      {/* Mini Cart (floating) */}
      <CartSidebar restaurantId={restaurant.id} onCartUpdated={refreshCart} key={cartKey} />
    </div>
  );
};

export default RestaurantDetail;