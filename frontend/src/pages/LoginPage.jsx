import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { redirectToDashboard } from '../utils/navigation';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (authService.isAuthenticated()) {
      redirectToDashboard(navigate);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password, role);
      
      console.log('Login response:', response);
      console.log('User from response:', response.user);
      console.log('User role from response:', response.user?.role);

      // Wait a moment to ensure localStorage is updated by authService.login
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get user from localStorage to ensure it's saved
      const savedUser = authService.getCurrentUser();
      console.log('User from localStorage after login:', savedUser);
      console.log('User role from localStorage:', savedUser?.role);
      
      // Determine role - use saved user if available, otherwise use response user
      const userToUse = savedUser || response.user;
      const userRole = userToUse?.role?.toUpperCase();
      
      console.log('Final user role for redirect:', userRole);
      
      // Redirect based on user role
      if (userRole === 'MEMBER') {
        console.log('Redirecting MEMBER to /member');
        navigate('/member', { replace: true });
      } else if (userRole === 'LIBRARIAN') {
        console.log('Redirecting LIBRARIAN to /librarian');
        navigate('/librarian', { replace: true });
      } else if (userRole === 'ADMIN' || userRole === 'ADMINISTRATOR') {
        console.log('Redirecting ADMIN to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.error('Unknown role:', userRole, 'Full user:', userToUse);
        setError('Unknown user role. Please contact administrator.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-red-900 to-rose-800 flex items-center justify-center px-4 py-12">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-[1.02]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-rose-700 to-red-800 bg-clip-text text-transparent mb-2">
            LBRS
          </h1>
          <p className="text-gray-600 font-medium">Library Borrowing & Reservation System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>👤</span> Login As
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all hover:border-gray-300"
            >
              <option value="MEMBER">👥 Member</option>
              <option value="LIBRARIAN">👨‍💼 Librarian</option>
              <option value="ADMIN">🔑 Administrator</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>📧</span> Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all hover:border-gray-300"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>🔒</span> Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all hover:border-gray-300"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-800 to-red-900 text-white py-3 px-4 rounded-xl font-semibold hover:from-rose-900 hover:to-red-950 focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Link
            to="/forgot-password"
            className="block text-sm text-rose-700 hover:text-red-900 font-medium transition-colors"
          >
            🔑 Forgot Password?
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-rose-700 hover:text-red-900 font-semibold hover:underline transition-colors"
            >
              ✨ Register Now
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-100 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 text-center mb-3">
            📝 Demo Credentials
          </p>
          <div className="text-xs text-gray-600 space-y-1.5">
            <p className="flex items-center gap-2"><span>👤</span> Member: <code className="bg-white px-2 py-0.5 rounded">member@lbrs.com</code> / <code className="bg-white px-2 py-0.5 rounded">member123</code></p>
            <p className="flex items-center gap-2"><span>👨‍💼</span> Librarian: <code className="bg-white px-2 py-0.5 rounded">librarian@lbrs.com</code> / <code className="bg-white px-2 py-0.5 rounded">librarian123</code></p>
            <p className="flex items-center gap-2"><span>🔑</span> Admin: <code className="bg-white px-2 py-0.5 rounded">admin@lbrs.com</code> / <code className="bg-white px-2 py-0.5 rounded">admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

