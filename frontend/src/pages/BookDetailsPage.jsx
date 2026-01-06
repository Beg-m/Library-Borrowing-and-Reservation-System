import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { memberService } from '../services/memberService';

function BookDetailsPage() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      const response = await memberService.getBookDetails(bookId);
      setBook(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to load book details');
      navigate('/member/books');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookCopyId) => {
    if (!window.confirm('Are you sure you want to borrow this book copy?')) {
      return;
    }

    setActionLoading(true);
    try {
      await memberService.borrowBookCopy(bookCopyId);
      alert('Borrowing request submitted successfully!');
      // Small delay to ensure backend has processed the request
      setTimeout(() => {
        navigate('/member', { replace: false });
      }, 500);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to borrow book');
      setActionLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!window.confirm('Are you sure you want to reserve this book?')) {
      return;
    }

    setActionLoading(true);
    setReservationSuccess(false);
    try {
      const response = await memberService.reserveBook(bookId);
      console.log('Reservation successful:', response.data);
      
      // Show success state
      setReservationSuccess(true);
      
      // Reload book details to update status
      await loadBookDetails();
      
      // Show success message
      setTimeout(() => {
        alert('✅ Reservation Successful!\n\nYour reservation has been submitted. You can view it in your dashboard.');
        // Navigate to dashboard after showing message
        navigate('/member', { replace: false });
      }, 300);
    } catch (error) {
      console.error('Reservation error:', error);
      alert('❌ ' + (error.response?.data?.error || 'Failed to reserve book. Please try again.'));
      setActionLoading(false);
      setReservationSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar title="Book Details" userRole="Member" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  const availableCopy = book.bookCopies.find((copy) => copy.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-red-50">
      <Navbar title="Book Details" userRole="Member" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/member/books')}
          className="text-rose-700 hover:text-red-900 font-semibold transition-colors flex items-center gap-2 mb-6"
        >
          <span>←</span> Back to Search
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50">
          <div className="flex items-start gap-6 mb-6">
            <div className="bg-gradient-to-br from-rose-700 to-red-900 p-6 rounded-2xl">
              <span className="text-6xl">📖</span>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-3">{book.title}</h1>
              <div className="space-y-2">
                <p className="text-lg text-gray-700 flex items-center gap-2">
                  <span className="font-bold">✍️ Author:</span> <span className="font-medium">{book.author}</span>
                </p>
                <p className="text-lg text-gray-700 flex items-center gap-2">
                  <span className="font-bold">🔢 ISBN:</span> <span className="font-mono text-sm">{book.isbn}</span>
                </p>
                <p className="text-lg text-gray-700 flex items-center gap-2">
                  <span className="font-bold">📂 Category:</span> <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg font-semibold">{book.category.name}</span>
                </p>
              </div>
            </div>
          </div>
          
          {book.description && (
            <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-6 mb-6 border-l-4 border-rose-700">
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          )}

          <div className="border-t-2 border-gray-100 pt-6 mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
              <span>📊</span> Availability Status
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">✅ Available</p>
                <p className="text-3xl font-extrabold text-green-600">{book.availableCopies}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-rose-50 p-5 rounded-xl border-2 border-blue-200 text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">📚 Borrowed</p>
                <p className="text-3xl font-extrabold text-blue-600">{book.borrowedCopies}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-200 text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">⏳ Reserved</p>
                <p className="text-3xl font-extrabold text-yellow-600">{book.reservedCopies}</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 font-medium">Total Copies: <span className="font-bold text-rose-700">{book.totalCopies}</span></p>
          </div>

          <div className="border-t-2 border-gray-100 pt-6">
            {availableCopy ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <p className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>✅</span> This book is available for borrowing!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => handleBorrow(availableCopy.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg"
                    >
                      {actionLoading ? '⏳ Processing...' : '📖 Borrow This Book'}
                    </button>
                    <button
                      onClick={handleReserve}
                      disabled={actionLoading || reservationSuccess}
                      className={`flex-1 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg border-2 ${
                        reservationSuccess
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300'
                          : 'bg-gradient-to-r from-rose-700 to-red-900 text-white border-transparent hover:from-rose-800 hover:to-red-950'
                      }`}
                    >
                      {actionLoading ? '⏳ Processing...' : reservationSuccess ? '✅ Reserved Successfully!' : '⏳ Reserve This Book'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    💡 You can also reserve this book to get notified when it becomes available or to secure your place in the queue.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                <p className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>⚠️</span> This book is currently unavailable
                </p>
                <button
                  onClick={handleReserve}
                  disabled={actionLoading || reservationSuccess}
                  className={`w-full px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg ${
                    reservationSuccess
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                  }`}
                >
                  {actionLoading ? '⏳ Processing...' : reservationSuccess ? '✅ Reserved Successfully!' : '⏳ Reserve This Book'}
                </button>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  💡 Reserve this book to get notified when it becomes available. You'll be added to the waiting queue.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;

