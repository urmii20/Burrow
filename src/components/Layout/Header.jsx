import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Header renders navigation links and user actions.
const Header = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isOperatorRoute = location.pathname.startsWith('/operator');

  return (
    <header className="sticky top-0 z-50 bg-burrow-background/95 backdrop-blur-sm shadow-sm border-b border-burrow-border/80">
      <div className="layout-container">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-burrow-primary drop-shadow" />
              <span className="text-2xl font-extrabold text-burrow-primary tracking-tight">
                Burrow
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-8">
            {!state.user ? (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn-primary btn-md">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {!isOperatorRoute && (
                  <>
                    <Link to="/dashboard" className="nav-link">
                      Dashboard
                    </Link>
                    <Link to="/new-request" className="nav-link">
                      New Request
                    </Link>
                  </>
                )}

                {state.user.role === 'operator' && !isOperatorRoute && (
                  <Link to="/operator/dashboard" className="nav-link-strong">
                    Operator Portal
                  </Link>
                )}

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-burrow-text-secondary">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{state.user.name}</span>
                  </div>

                  <button onClick={handleLogout} className="btn-text-danger">
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
