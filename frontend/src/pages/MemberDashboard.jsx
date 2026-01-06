import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { memberService } from '../services/memberService';

function MemberDashboard() {
  const [borrowings, setBorrowings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    activeBorrowings: 0,
    activeReservations: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const loadData = useCallback(async () => {
    try {
      const [borrowingsRes, reservationsRes, historyRes] = await Promise.all([
        memberService.getActiveBorrowings(),
        memberService.getActiveReservations(),
        memberService.getBorrowingHistory(),
      ]);
      
      console.log('Borrowings:', borrowingsRes.data);
      console.log('Reservations:', reservationsRes.data);
      console.log('History:', historyRes.data);
      
      setBorrowings(borrowingsRes.data);
      setReservations(reservationsRes.data);
      setHistory(historyRes.data);

      // Calculate statistics
      const overdueCount = borrowingsRes.data.filter(b => b.isOverdue).length;
      const statsData = {
        totalBorrowed: historyRes.data.length + borrowingsRes.data.length,
        activeBorrowings: borrowingsRes.data.length,
        activeReservations: reservationsRes.data.length,
        overdue: overdueCount,
      };
      setStats(statsData);
      console.log('MemberDashboard: Stats updated', statsData);
      console.log('MemberDashboard: Active Reservations count', reservationsRes.data.length);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Veri yüklenirken hata oluştu: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data when component mounts or location changes
  useEffect(() => {
    console.log('MemberDashboard: Loading data...', location.pathname);
    loadData();
  }, [location.pathname, loadData]);

  // Also reload when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('MemberDashboard: Page visible, reloading data...');
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also reload on window focus
    window.addEventListener('focus', loadData);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await memberService.cancelReservation(reservationId);
        loadData();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to cancel reservation');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar title="Member Dashboard" userRole="Member" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-red-50">
      <Navbar title="Member Dashboard" userRole="Member" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/member/books')}
            className="bg-gradient-to-r from-rose-800 to-red-900 text-white px-8 py-4 rounded-xl font-semibold hover:from-rose-900 hover:to-red-950 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>📚</span> Browse Books
          </button>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-3xl font-extrabold text-blue-600">{stats.totalBorrowed}</span>
            </div>
            <p className="text-gray-600 font-semibold">Total Books Borrowed</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-3 rounded-xl">
                <span className="text-2xl">📖</span>
              </div>
              <span className="text-3xl font-extrabold text-rose-600">{stats.activeBorrowings}</span>
            </div>
            <p className="text-gray-600 font-semibold">Active Borrowings</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <span className="text-2xl">⏳</span>
              </div>
              <span className="text-3xl font-extrabold text-purple-600">{stats.activeReservations}</span>
            </div>
            <p className="text-gray-600 font-semibold">Active Reservations</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                <span className="text-2xl">⚠️</span>
              </div>
              <span className="text-3xl font-extrabold text-red-600">{stats.overdue}</span>
            </div>
            <p className="text-gray-600 font-semibold">Overdue Books</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Borrowings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-rose-700 to-red-900 p-3 rounded-xl">
                <span className="text-2xl">📖</span>
              </div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent">Active Borrowings</h2>
            </div>
            {borrowings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-500 font-medium">No active borrowings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowings.map((borrowing) => (
                  <div
                    key={borrowing.id}
                    className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                      borrowing.isOverdue 
                        ? 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50' 
                        : 'border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 hover:border-rose-300'
                    }`}
                  >
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{borrowing.bookCopy.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">✍️ {borrowing.bookCopy.book.author}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-white px-2 py-1 rounded-lg font-semibold">
                        {borrowing.status}
                      </span>
                    </div>
                    {borrowing.dueDate && (
                      <p className={`text-sm font-semibold flex items-center gap-2 ${
                        borrowing.isOverdue ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        <span>{borrowing.isOverdue ? '⚠️' : '📅'}</span>
                        Due: {new Date(borrowing.dueDate).toLocaleDateString()}
                        {borrowing.isOverdue && <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">OVERDUE</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Reservations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-rose-700 to-red-900 p-3 rounded-xl">
                <span className="text-2xl">⏳</span>
              </div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent">Active Reservations</h2>
            </div>
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-500 font-medium">No active reservations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 transition-all hover:shadow-lg hover:border-rose-300">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{reservation.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">✍️ {reservation.book.author}</p>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                        #{reservation.queuePosition} in queue
                      </span>
                      <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                        {reservation.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-semibold hover:underline transition-colors flex items-center gap-1"
                    >
                      <span>❌</span> Cancel Reservation
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/member/borrowings/history')}
            className="text-rose-700 hover:text-red-900 font-semibold transition-colors flex items-center gap-2 mx-auto"
          >
            <span>📚</span> View Borrowing History <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;

