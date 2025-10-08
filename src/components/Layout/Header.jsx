import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    <header className="sticky top-0 z-50 bg-burrow-background shadow-sm border-b border-gray-200">
      <div className="layout-container flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-burrow-primary" />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-burrow-primary to-burrow-secondary bg-clip-text text-transparent tracking-tight">
            Burrow
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
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
                {/* User Info */}
                <div className="flex items-center space-x-2 text-burrow-text-secondary">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{state.user.name}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:text-red-500 transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
