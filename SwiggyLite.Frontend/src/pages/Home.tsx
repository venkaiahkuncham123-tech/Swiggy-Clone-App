import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Container, Spinner, Alert, Button, Card, CardBody, CardTitle, CardText } from 'react-bootstrap';

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

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.query = searchTerm;
      if (selectedCuisine) params.cuisine = selectedCuisine;
      const res = await api.get('/restaurants', { params });
      setRestaurants(res.data || []);
      setError(null);
    } catch {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm, selectedCuisine]);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const res = await api.get('/restaurants');
        const data: Restaurant[] = res.data || [];
        const unique = [...new Set(data.map(r => r.cuisine))];
        setCuisines(unique);
      } catch {
        // silently ignore
      }
    };
    fetchCuisines();
  }, []);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3 text-muted">Loading restaurants…</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="mb-4 bg-white shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                placeholder="Search restaurants, cuisines…"
                className="form-control form-control-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 12, padding: '12px 16px' }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-lg"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                style={{ borderRadius: 12 }}
              >
                <option value="">All Cuisines</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <Button
                variant="warning"
                size="lg"
                className="w-100"
                onClick={fetchRestaurants}
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <h4 className="mb-4" style={{ fontWeight: 700 }}>
        {selectedCuisine ? `${selectedCuisine} Restaurants` : 'Popular Restaurants'}
      </h4>

      {restaurants.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          No restaurants found. Try adjusting your search!
        </Alert>
      ) : (
        <div className="row g-4">
          {restaurants.map((restaurant) => (
            <div className="col-12 col-md-6 col-lg-4" key={restaurant.id}>
              <Card
                className="resto-card h-100"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img src={restaurant.imageUrl} alt={restaurant.name} className="card-img-top" />
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <CardTitle className="h5 mb-0" style={{ fontWeight: 700 }}>
                      {restaurant.name}
                    </CardTitle>
                    <span className="badge bg-warning rating-badge">
                      Rating: {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  {restaurant.description && (
                    <CardText className="text-muted small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {restaurant.description}
                    </CardText>
                  )}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    <span className="badge bg-secondary cuisine-badge">{restaurant.cuisine}</span>
                    {restaurant.area && (
                      <span className="badge bg-light text-dark cuisine-badge">{restaurant.area}</span>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-muted small">
                    <span>Delivery: {restaurant.deliveryTimeMinutes} min</span>
                    <span>{restaurant.timings || 'Open now'}</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Home;