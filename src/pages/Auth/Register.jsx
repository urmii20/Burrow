import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const { state, register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await register(formData);
      navigate('/dashboard');
    } catch {
      // Error handling is managed within AuthContext
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });

    if (errors[event.target.name]) {
      setErrors({
        ...errors,
        [event.target.name]: ''
      });
    }
  };

  return (
    <div className="auth-wrapper page-fade">
      <div className="auth-container">
        <div className="text-center">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Join Burrow and take control of your deliveries</p>
        </div>

        {state.error && (
          <div className="alert-error">
            <p>{state.error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6 fade-stagger" onSubmit={handleSubmit}>
          <div className="space-y-4 fade-stagger">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="input-group">
                <div className="input-icon">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${
                    errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                  placeholder="Full Name"
                />
              </div>
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="input-group">
                <div className="input-icon">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${
                    errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                  placeholder="Email address"
                />
              </div>
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <div className="input-group">
                <div className="input-icon">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${
                    errors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                  placeholder="Phone Number"
                />
              </div>
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="input-group">
                <div className="input-icon">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-10 ${
                    errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="btn-text-muted absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="input-group">
                <div className="input-icon">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pr-10 ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  className="btn-text-muted absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(event) => setAcceptTerms(event.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
              I accept the{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && <p className="text-red-600 text-xs">{errors.terms}</p>}

          <button
            type="submit"
            disabled={state.isLoading}
            className="btn-blue btn-block btn-md"
          >
            {state.isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="auth-cta">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="nav-link font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
