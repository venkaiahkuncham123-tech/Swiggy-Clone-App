import { useState, useEffect, useCallback } from 'react';
import { Container, Card, CardBody, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { startSignalRConnection, joinUserOrderFeed, stopSignalRConnection } from '../api/signalr';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  itemName: string;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: number;
  restaurantId: number;
  deliveryAddress: string;
  instructions: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string | null;
  restaurant?: {
    name: string;
    imageUrl?: string;
  };
  orderItems?: OrderItem[];
}

const ORDER_STATUS_FLOW = ['Pending', 'Confirmed', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'];

const Orders: React.FC = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signalrReady, setSignalrReady] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please login to view your orders');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Connect to SignalR for real-time updates
  useEffect(() => {
    if (!token || !user) return;

    const connect = async () => {
      const conn = await startSignalRConnection(
        // onStatusUpdate callback
        (orderId: number, newStatus: string) => {
          setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
          ));
        },
        // onOrderCreated callback
        (_orderId: number, _status: string) => {
          fetchOrders();
        }
      );
      if (conn) {
        await joinUserOrderFeed(user.id);
        await conn.invoke('JoinUserOrderFeed', user.id);
        setSignalrReady(true);
      }
    };

    connect();

    return () => {
      stopSignalRConnection();
    };
  }, [token, user, fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-success';
      case 'preparing': return 'bg-warning';
      case 'outfordelivery': return 'bg-info';
      case 'delivered': return 'bg-primary';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusStep = (status: string) => {
    const idx = ORDER_STATUS_FLOW.findIndex(s => s.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const formatDateTime = (dt: string) => {
    const date = new Date(dt);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3 text-muted">Loading your orders…</p>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold" style={{ color: '#212529' }}>
          Your Orders
        </h3>
        <div className="d-flex align-items-center gap-2">
          {signalrReady && (
            <Badge bg="success" className="fs-7">● Real-time</Badge>
          )}
          <Button variant="outline-warning" size="sm" onClick={fetchOrders}>
            Refresh
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="mb-0 bg-white shadow-sm text-center py-5">
          <CardBody>
            <p className="text-muted mb-0">You haven&apos;t placed any orders yet.</p>
            <p className="text-muted small mt-2">Browse restaurants and place your first order!</p>
            <Button variant="warning" size="sm" className="mt-3" onClick={() => navigate('/')}>
              Browse Restaurants
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="list-group">
          {orders.map((order) => (
            <Card key={order.id} className="mb-3 shadow-sm">
              <CardBody className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">Order #{order.id}</h5>
                    <small className="text-muted">
                      {formatDateTime(order.createdAt)}
                    </small>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} fs-7`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                    {order.status.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                </div>

                {order.restaurant && (
                  <div className="mb-2">
                    <small className="text-muted d-block">
                      <span className="fw-semibold" style={{ color: '#ff6633' }}>Restaurant:</span> {order.restaurant.name}
                    </small>
                  </div>
                )}

                <div className="text-muted small mb-2">
                  <span className="fw-semibold">Delivery Address:</span> {order.deliveryAddress}
                </div>

                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">
                      <span className="fw-semibold">Items:</span>{' '}
                      {order.orderItems.map((item, idx) => (
                        <span key={idx}>
                          {item.itemName} (x{item.quantity}) - ₹{item.totalPrice.toFixed(2)}
                          {idx < order.orderItems!.length - 1 && ', '}
                        </span>
                      ))}
                    </small>
                  </div>
                )}

                {/* Order Status Timeline */}
                <div className="order-timeline mt-3">
                  <ul className="list-unstyled d-flex justify-content-between">
                    {ORDER_STATUS_FLOW.filter(s => s !== 'Cancelled').map((step, idx) => {
                      const currentStep = getStatusStep(order.status);
                      const isCompleted = idx <= currentStep;
                      const isCancelled = order.status === 'Cancelled';
                      return (
                        <li key={step} className="text-center">
                          <div
                            className={`step-circle ${isCompleted && !isCancelled ? 'bg-warning' : isCancelled ? 'bg-danger' : 'bg-secondary'}`}
                            style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            {idx + 1}
                          </div>
                          <small className={`mt-1 d-block ${isCompleted && !isCancelled ? 'text-warning fw-bold' : 'text-muted'}`}>
                            {step.replace(/([A-Z])/g, ' $1').trim()}
                          </small>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                  <span className="text-muted small">Total Amount</span>
                  <span className="h5 mb-0 text-warning">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Orders;