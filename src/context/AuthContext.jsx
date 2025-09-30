/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

import apiClient from '../lib/api';

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

const STORAGE_KEY = 'burrow_user';

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const user = await apiClient.post('/auth/login', { email, password });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error?.message || 'Unable to login. Please try again.'
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const user = await apiClient.post('/auth/register', userData);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error?.message || 'Unable to register. Please try again.'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: parsedUser });
        }
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem(STORAGE_KEY);
      }
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
