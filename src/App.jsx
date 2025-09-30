import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ConsumerDashboard from './pages/Dashboard/ConsumerDashboard';
import NewRequest from './pages/Request/NewRequest';
import RequestStatus from './pages/Request/RequestStatus';
import OperatorDashboard from './pages/Operator/OperatorDashboard';

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles = [] }) => {
  const { state } = useAuth();

  if (requireAuth && !state.user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && state.user && !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

const AppContent = () => {
  const { state } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={state.user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={state.user ? <Navigate to="/dashboard" replace /> : <Register />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {state.user?.role === 'operator' ? (
                  <Navigate to="/operator/dashboard" replace />
                ) : (
                  <ConsumerDashboard />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/new-request"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <NewRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/request/:id"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <RequestStatus />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['operator']}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
