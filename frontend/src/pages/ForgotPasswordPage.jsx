import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Note: Backend'de forgot password endpoint'i yoksa bu sadece bilgilendirme yapar
      // Gerçek uygulamada backend'e istek gönderilir
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Eğer endpoint yoksa bile kullanıcıya bilgi ver
      if (err.response?.status === 404) {
        setError('Password reset feature is not yet available. Please contact the administrator.');
      } else {
        setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-red-900 to-rose-800 flex items-center justify-center px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-[1.02]">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-4xl">🔑</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 font-medium">We'll help you get back in</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl">
              <p className="font-semibold flex items-center gap-2"><span>✅</span> Reset Link Sent!</p>
              <p className="text-sm mt-2">
                If an account exists with <strong>{email}</strong>, we've sent password reset instructions.
                Please check your email.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full text-center bg-gradient-to-r from-rose-800 to-red-900 text-white py-3 px-4 rounded-xl font-semibold hover:from-rose-900 hover:to-red-950 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              🔐 Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📧</span> Email Address
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

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? '⏳ Sending...' : '📨 Send Reset Instructions'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-rose-700 hover:text-red-900 font-medium transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

