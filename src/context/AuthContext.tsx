import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
} | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    error: null
  });

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    if (email === 'admin@burrow.com' && password === 'admin123') {
      const user: User = {
        id: '1',
        name: 'Admin User',
        email: email,
        phone: '9876543210',
        role: 'operator',
        addresses: [],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('burrow_token', 'mock_admin_token');
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } else if (email === 'user@test.com' && password === 'user123') {
      const user: User = {
        id: '2',
        name: 'Test User',
        email: email,
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

  const register = async (userData: any) => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
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
    // Check for existing token on app load
    const token = localStorage.getItem('burrow_token');
    if (token) {
      // In real app, validate token with API
      const user: User = {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};