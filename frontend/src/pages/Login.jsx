import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'patient';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await auth.login({
        email: formData.email,
        password: formData.password
      });

      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userType', response.data.user.user_type);

      // Show success animation
      setSuccess(true);

      // Navigate to profile page after short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    if (userType === 'patient') {
      navigate('/patient/onboarding');
    } else {
      navigate('/researcher/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      {/* Back to Home Button - Top Left */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      <div className="max-w-md w-full animate-fade-in-up">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-duo animate-float">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">
            Log in to your {userType === 'patient' ? 'patient' : 'researcher'} account
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 animate-scale-in">
          {success && (
            <div className="mb-6 bg-primary-50 border-2 border-primary-500 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-primary-700">Login successful! Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start space-x-3 animate-fade-in">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="your.email@example.com"
                disabled={loading || success}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Enter your password"
                disabled={loading || success}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full ${userType === 'patient' ? 'btn-primary' : 'btn-secondary'} text-base`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  Logging in...
                </span>
              ) : success ? (
                'Success!'
              ) : (
                'LOG IN'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm font-bold text-gray-500 uppercase tracking-wide">
                Or
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={handleSignUpRedirect}
            disabled={loading || success}
            className="w-full py-4 px-8 border-2 border-gray-300 hover:border-primary-500 rounded-2xl font-bold text-gray-700 hover:text-primary-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CREATE NEW ACCOUNT
          </button>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By continuing, you agree to CuraLink's{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
