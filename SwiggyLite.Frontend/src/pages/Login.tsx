import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, CardBody, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 450, margin: '5rem auto' }}>
      <Card className="shadow-lg" style={{ borderRadius: 16 }}>
        <CardBody className="p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1" style={{ color: '#ff6633' }}>
              Welcome Back
            </h3>
            <p className="text-muted mb-0">Sign in to continue ordering</p>
          </div>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Button
              variant="warning"
              type="submit"
              className="w-100"
              disabled={loading}
              style={{ borderRadius: 10, fontWeight: 600, padding: '12px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p className="text-muted small mb-0">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#ff6633', fontWeight: 600 }}>
                Sign up
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Login;
