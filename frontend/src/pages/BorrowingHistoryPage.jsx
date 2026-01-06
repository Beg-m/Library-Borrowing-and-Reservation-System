import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { memberService } from '../services/memberService';

function BorrowingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await memberService.getBorrowingHistory();
      console.log('Borrowing History Response:', response);
      console.log('Borrowing History Data:', response.data);
      // Handle both direct array and wrapped response
      const historyData = Array.isArray(response.data) ? response.data : response.data || [];
      console.log('Setting history:', historyData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to load borrowing history: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar title="Borrowing History" userRole="Member" />
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
      <Navbar title="Borrowing History" userRole="Member" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/member')}
            className="text-rose-700 hover:text-red-900 font-semibold transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-rose-700 to-red-900 p-3 rounded-xl">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent">
              Borrowing History
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-gray-500 font-medium">No borrowing history found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className={`border-2 rounded-xl p-6 transition-all hover:shadow-xl transform hover:scale-[1.01] ${
                    borrowing.status === 'OVERDUE'
                      ? 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50'
                      : 'border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl ${
                      borrowing.status === 'RETURNED'
                        ? 'bg-green-100'
                        : borrowing.status === 'OVERDUE'
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">📖</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800 text-xl mb-1">{borrowing.bookCopy.book.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">✍️ {borrowing.bookCopy.book.author}</p>
                          <p className="text-xs text-gray-500 mb-3">📂 {borrowing.bookCopy.book.category.name}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                          borrowing.status === 'RETURNED'
                            ? 'bg-green-100 text-green-700'
                            : borrowing.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {borrowing.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                        {borrowing.borrowDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <div>
                              <p className="text-xs text-gray-500">Borrowed Date</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {new Date(borrowing.borrowDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        {borrowing.dueDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⏰</span>
                            <div>
                              <p className="text-xs text-gray-500">Due Date</p>
                              <p className={`text-sm font-semibold ${
                                borrowing.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-700'
                              }`}>
                                {new Date(borrowing.dueDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        {borrowing.returnDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            <div>
                              <p className="text-xs text-gray-500">Returned Date</p>
                              <p className="text-sm font-semibold text-green-600">
                                {new Date(borrowing.returnDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowingHistoryPage;

