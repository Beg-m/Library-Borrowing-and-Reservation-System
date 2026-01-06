import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { librarianService } from '../services/librarianService';

function LibrarianDashboard() {
  const [pendingBorrowings, setPendingBorrowings] = useState([]);
  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrowings');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pendingBorrowingsRes, activeBorrowingsRes, reservationsRes] = await Promise.all([
        librarianService.getPendingBorrowings(),
        librarianService.getActiveBorrowings(),
        librarianService.getPendingReservations(),
      ]);
      setPendingBorrowings(pendingBorrowingsRes.data);
      setActiveBorrowings(activeBorrowingsRes.data);
      setPendingReservations(reservationsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBorrowing = async (borrowingId) => {
    if (!window.confirm('Approve this borrowing request?')) {
      return;
    }

    try {
      await librarianService.approveBorrowing(borrowingId);
      alert('Borrowing approved successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve borrowing');
    }
  };

  const handleRejectBorrowing = async (borrowingId) => {
    if (!window.confirm('Reject this borrowing request?')) {
      return;
    }

    try {
      await librarianService.rejectBorrowing(borrowingId);
      alert('Borrowing rejected successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject borrowing');
    }
  };

  const handleApproveReservation = async (reservationId) => {
    if (!window.confirm('Approve this reservation request?')) {
      return;
    }

    try {
      await librarianService.approveReservation(reservationId);
      alert('Reservation approved successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to approve reservation');
    }
  };

  const handleRejectReservation = async (reservationId) => {
    if (!window.confirm('Reject this reservation request?')) {
      return;
    }

    try {
      await librarianService.rejectReservation(reservationId);
      alert('Reservation rejected successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject reservation');
    }
  };

  const handleReturnBook = async (borrowingId) => {
    if (!window.confirm('Mark this book as returned?')) {
      return;
    }

    try {
      await librarianService.returnBook(borrowingId);
      alert('Book marked as returned successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to return book');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar title="Librarian Dashboard" userRole="Librarian" />
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
      <Navbar title="Librarian Dashboard" userRole="Librarian" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <nav className="flex space-x-4 p-2 flex-wrap">
              <button
                onClick={() => setActiveTab('borrowings')}
                className={`${
                  activeTab === 'borrowings'
                    ? 'bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                } whitespace-nowrap py-3 px-6 rounded-xl font-semibold text-sm transition-all transform hover:scale-105`}
              >
                ⏳ Pending Borrowings ({pendingBorrowings.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                } whitespace-nowrap py-3 px-6 rounded-xl font-semibold text-sm transition-all transform hover:scale-105`}
              >
                📚 Active Borrowings ({activeBorrowings.length})
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`${
                  activeTab === 'reservations'
                    ? 'bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                } whitespace-nowrap py-3 px-6 rounded-xl font-semibold text-sm transition-all transform hover:scale-105`}
              >
                ⏳ Pending Reservations ({pendingReservations.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'active' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span> Active Borrowings
            </h2>
            {activeBorrowings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-500 font-medium">No active borrowings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBorrowings.map((borrowing) => (
                  <div
                    key={borrowing.id}
                    className={`border-2 rounded-xl p-5 hover:shadow-lg transition-all ${
                      borrowing.isOverdue
                        ? 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50'
                        : 'border-rose-100 bg-gradient-to-br from-rose-50 to-red-50'
                    }`}
                  >
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{borrowing.bookCopy.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">✍️ {borrowing.bookCopy.book.author}</p>
                    <p className="text-sm text-gray-700 mb-2">
                      👤 <span className="font-semibold">{borrowing.member.firstName} {borrowing.member.lastName}</span> ({borrowing.member.email})
                    </p>
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                        Copy #{borrowing.bookCopy.copyNumber}
                      </span>
                      {borrowing.borrowDate && (
                        <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                          📅 Borrowed: {new Date(borrowing.borrowDate).toLocaleDateString()}
                        </span>
                      )}
                      {borrowing.dueDate && (
                        <span className={`text-xs px-3 py-1 rounded-lg font-semibold ${
                          borrowing.isOverdue
                            ? 'bg-red-500 text-white'
                            : 'bg-white'
                        }`}>
                          ⏰ Due: {new Date(borrowing.dueDate).toLocaleDateString()}
                          {borrowing.isOverdue && ' ⚠️ OVERDUE'}
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => handleReturnBook(borrowing.id)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                      >
                        📥 Return Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'borrowings' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <span className="text-3xl">📚</span> Pending Borrowing Requests
            </h2>
            {pendingBorrowings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-500 font-medium">No pending borrowing requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBorrowings.map((borrowing) => (
                  <div key={borrowing.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 hover:shadow-lg transition-all">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{borrowing.bookCopy.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">✍️ {borrowing.bookCopy.book.author}</p>
                    <p className="text-sm text-gray-700 mb-2">
                      👤 <span className="font-semibold">{borrowing.member.firstName} {borrowing.member.lastName}</span> ({borrowing.member.email})
                    </p>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                        Copy #{borrowing.bookCopy.copyNumber}
                      </span>
                      {borrowing.dueDate && (
                        <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                          📅 Due: {new Date(borrowing.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleApproveBorrowing(borrowing.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectBorrowing(borrowing.id)}
                        className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <span className="text-3xl">⏳</span> Pending Reservation Requests
            </h2>
            {pendingReservations.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-500 font-medium">No pending reservation requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReservations.map((reservation) => (
                  <div key={reservation.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 hover:shadow-lg transition-all">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{reservation.book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">✍️ {reservation.book.author}</p>
                    <p className="text-sm text-gray-700 mb-2">
                      👤 <span className="font-semibold">{reservation.member.firstName} {reservation.member.lastName}</span> ({reservation.member.email})
                    </p>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs bg-white px-3 py-1 rounded-lg font-semibold">
                        # {reservation.queuePosition} in queue
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleApproveReservation(reservation.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectReservation(reservation.id)}
                        className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibrarianDashboard;

