import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { state, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className="auth-wrapper page-fade flex items-center justify-center min-h-screen bg-burrow-background px-4">
      <div className="auth-container max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-burrow-text-primary mb-2">Welcome back</h2>
          <p className="text-burrow-text-secondary">Sign in to your Burrow account</p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Demo Info */}
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Demo Credentials (Operator View)</p>
          <p>operator.one@burrow.com / OperatorDemo1</p>
          <p>operator.two@burrow.com / OperatorDemo2</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="input-field pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burrow-primary"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-burrow-primary border-gray-300 rounded focus:ring-burrow-primary"
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="nav-link text-burrow-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.isLoading}
            className="btn-primary btn-lg w-full"
          >
            {state.isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Signup CTA */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Don’t have an account?{' '}
            <Link to="/register" className="text-burrow-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
