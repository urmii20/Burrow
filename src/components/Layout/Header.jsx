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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-burrow-primary" />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-burrow-primary to-burrow-secondary bg-clip-text text-transparent tracking-tight">
                Burrow
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-8">
            {!state.user ? (
              <>
                <Link
                  to="/login"
                  className="text-burrow-text-secondary hover:text-burrow-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-burrow-primary text-white px-4 py-2 rounded-lg hover:bg-burrow-accent transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {!isOperatorRoute && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-burrow-text-secondary hover:text-burrow-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/new-request"
                      className="text-burrow-text-secondary hover:text-burrow-primary transition-colors"
                    >
                      New Request
                    </Link>
                  </>
                )}

                {state.user.role === 'operator' && !isOperatorRoute && (
                  <Link
                    to="/operator/dashboard"
                    className="text-burrow-primary hover:text-indigo-700 transition-colors font-medium"
                  >
                    Operator Portal
                  </Link>
                )}

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-burrow-text-secondary">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{state.user.name}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-burrow-text-secondary hover:text-red-500 transition-colors"
                  >
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
