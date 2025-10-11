import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Login lets returning customers unlock their saved deliveries.
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { state, login } = useAuth();
  const navigate = useNavigate();

  // When someone signs in we verify their details and take them to their dashboard.
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch {
      // Error handling is managed within AuthContext
    }
  };

  // Keeps the form fields in sync with what the visitor is typing.
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className="auth-wrapper page-fade">
      <div className="auth-container">
        {/* Page introduction reassures users they are signing in to Burrow. */}
        <div className="text-center">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your Burrow account</p>
        </div>

        {state.error && (
          {/* Error banner plainly states what went wrong with the last attempt. */}
          <div className="alert-error">
            <p>{state.error}</p>
          </div>
        )}

        {/* Demo credentials help testers explore the operator experience quickly. */}
        <div className="alert-info">
          <p className="font-medium mb-2">Demo Credentials For An Operator View:</p>

          <p className="text-xs text-burrow-primary">Operator 1: operator.one@burrow.com / OperatorDemo1</p>
          <p className="text-xs text-burrow-primary">Operator 2: operator.two@burrow.com / OperatorDemo2</p>
        </div>

        {/* Sign-in form collects the email and password in a familiar layout. */}
        <form className="mt-8 space-y-6 fade-stagger" onSubmit={handleSubmit}>
          <div className="space-y-4 fade-stagger">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="input-group">
                <div className="input-icon">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="input-group">
                <div className="input-icon">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="btn-text-muted absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-burrow-text-muted" />
                  ) : (
                    <Eye className="h-5 w-5 text-burrow-text-muted" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-burrow-border text-burrow-primary focus:ring-burrow-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-burrow-text-secondary">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="nav-link">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={state.isLoading}
            className="btn-primary btn-block btn-md"
          >
            {state.isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="auth-cta">
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="nav-link font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
