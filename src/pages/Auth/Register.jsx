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

    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Please enter a valid 10-digit phone number';

    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!acceptTerms)
      newErrors.terms = 'You must accept the terms and conditions';

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
      // Error handled in AuthContext
    }
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (errors[event.target.name]) setErrors({ ...errors, [event.target.name]: '' });
  };

  return (
    <div className="auth-wrapper page-fade flex items-center justify-center min-h-screen bg-burrow-background px-4">
      <div className="auth-container max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-burrow-text-primary mb-2">Create your account</h2>
          <p className="text-burrow-text-secondary">Join Burrow and take control of your deliveries</p>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className={`input-field pl-10 ${errors.name ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
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
              className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
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
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burrow-primary"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-burrow-primary"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-2 text-sm">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-burrow-primary border-gray-300 rounded focus:ring-burrow-primary"
            />
            <label htmlFor="accept-terms" className="text-gray-700">
              I accept the{' '}
              <Link to="/terms" className="text-burrow-primary hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-burrow-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-600 mt-1">{errors.terms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.isLoading}
            className="btn-primary btn-lg w-full"
          >
            {state.isLoading ? 'Creating account...' : 'Create account'}
          </button>

          {/* Login CTA */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-burrow-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
