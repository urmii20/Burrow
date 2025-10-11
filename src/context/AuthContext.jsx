/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

import apiClient from '../lib/api';

// AuthContext shares authentication state and actions across the app.
const AuthContext = createContext(null);

// initialState defines the default auth store values.
const initialState = {
  user: null,
  isLoading: false,
  error: null
};

// normaliseUser keeps role naming consistent between API and UI.
const normaliseUser = (user) => {
  if (!user) {
    return user;
  }

  return {
    ...user,
    role: user.role === 'customer' ? 'consumer' : user.role
  };
};

// authReducer tracks loading, success, and error transitions.
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

// AuthProvider exposes auth state and service calls to descendants.
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // authenticate handles login/register flows with shared behaviour.
  const authenticate = async (path, payload, defaultError) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const user = await apiClient.post(path, payload);
      const normalisedUser = normaliseUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalisedUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: normalisedUser });
      return normalisedUser;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error?.message || defaultError
      });
      throw error;
    }
  };

  // login authenticates a returning user.
  const login = (email, password) =>
    authenticate('/auth/login', { email, password }, 'Unable to login. Please try again.');

  // register signs up a new user and stores the session.
  const register = (userData) =>
    authenticate('/auth/register', userData, 'Unable to register. Please try again.');

  // logout clears local state even if the API call fails.
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

  // On mount we hydrate any persisted user session.
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const normalisedUser = normaliseUser(parsedUser);
        if (parsedUser) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: normalisedUser });
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

// useAuth ensures components consume the provider safely.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
