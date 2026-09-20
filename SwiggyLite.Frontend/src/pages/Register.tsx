import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, CardBody, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone
      );

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Email already registered. Please login.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="mt-5" style={{ maxWidth: 450, margin: '5rem auto' }}>
        <Card className="shadow-lg" style={{ borderRadius: 16 }}>
          <CardBody className="p-4 text-center">
            <div className="mb-3">
              <h3 className="fw-bold" style={{ color: '#28a745' }}>
                Registration Successful!
              </h3>
            </div>
            <p className="text-muted">Redirecting you to login page...</p>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: 450, margin: '5rem auto' }}>
      <Card className="shadow-lg" style={{ borderRadius: 16 }}>
        <CardBody className="p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1" style={{ color: '#ff6633' }}>
              Create Account
            </h3>
            <p className="text-muted mb-0">Join SwiggyLite today</p>
          </div>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number (optional)</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <p className="text-muted small mb-0">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#ff6633', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Register;
