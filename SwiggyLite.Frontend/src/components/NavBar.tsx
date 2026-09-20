import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';

const NavBar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <Navbar expand="lg" className="navbar navbar-dark bg-dark border-bottom" style={{ backgroundColor: '#ff6633', padding: '0.5rem 0' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center" style={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
          <svg width="32" height="32" viewBox="0 0 100 100" style={{ marginRight: 8 }}>
            <circle cx="50" cy="50" r="48" fill="#fff" />
            <path d="M30 55 Q50 25 70 55" stroke="#ff6633" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="38" cy="48" r="3" fill="#ff6633" />
            <circle cx="62" cy="48" r="3" fill="#ff6633" />
          </svg>
          SwiggyLite
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            {token ? (
              <>
                <Nav.Link as={Link} to="/cart" className={isActive('/cart')} style={{ cursor: 'pointer' }}>
                  🛒 Cart
                </Nav.Link>
                <Nav.Link as={Link} to="/orders" className={isActive('/orders')} style={{ cursor: 'pointer' }}>
                  📋 Orders
                </Nav.Link>
                <div className="text-white me-3">
                  <small>Hi, {user?.fullName?.split(' ')[0]}</small>
                </div>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className={isActive('/login')} style={{ cursor: 'pointer' }}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className={isActive('/register')} style={{ cursor: 'pointer' }}>
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
