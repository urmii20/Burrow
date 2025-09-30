/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isLoading: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, isLoading: false, user: action.payload, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'admin@burrow.com' && password === 'admin123') {
      const user = {
        id: '1',
        name: 'Admin User',
        email,
        phone: '9876543210',
        role: 'operator',
        addresses: [],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('burrow_token', 'mock_admin_token');
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } else if (email === 'user@test.com' && password === 'user123') {
      const user = {
        id: '2',
        name: 'Test User',
        email,
        phone: '9876543210',
        role: 'consumer',
        addresses: [],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('burrow_token', 'mock_user_token');
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } else {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid email or password' });
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'consumer',
      addresses: [],
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('burrow_token', 'mock_token_' + user.id);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
  };

  const logout = () => {
    localStorage.removeItem('burrow_token');
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    const token = localStorage.getItem('burrow_token');
    if (token) {
      const user = {
        id: '2',
        name: 'Test User',
        email: 'user@test.com',
        phone: '9876543210',
        role: token.includes('admin') ? 'operator' : 'consumer',
        addresses: [],
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
