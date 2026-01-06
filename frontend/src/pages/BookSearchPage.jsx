import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { memberService } from '../services/memberService';

function BookSearchPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    searchBooks();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await memberService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const searchBooks = async () => {
    setLoading(true);
    try {
      const response = await memberService.searchBooks(searchTerm, selectedCategory || undefined);
      setBooks(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchBooks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-red-50">
      <Navbar title="Book Search" userRole="Member" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/member')}
            className="text-rose-700 hover:text-red-900 font-semibold transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🔍</span> Search (Title/Author)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all hover:border-gray-300"
                placeholder="Enter book title or author"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>📂</span> Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all hover:border-gray-300"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-800 to-red-900 text-white px-4 py-3 rounded-xl font-semibold hover:from-rose-900 hover:to-red-950 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {loading ? '⏳ Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
            <span className="text-6xl mb-4 block">📚</span>
            <p className="text-gray-600 font-medium text-lg">No books found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 border border-white/50"
                onClick={() => navigate(`/member/books/${book.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-rose-700 to-red-900 p-3 rounded-xl">
                    <span className="text-2xl">📖</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    book.availableCopies > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 mb-3 font-medium">✍️ {book.author}</p>
                <p className="text-sm text-gray-500 mb-2">📂 {book.category.name}</p>
                <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Available Copies</p>
                    <p className="text-lg font-bold text-rose-700">
                      {book.availableCopies} / {book.totalCopies}
                    </p>
                  </div>
                </div>
                <button
                  className="w-full bg-gradient-to-r from-rose-700 to-red-900 text-white px-4 py-3 rounded-xl font-semibold hover:from-rose-800 hover:to-red-950 transition-all shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/member/books/${book.id}`);
                  }}
                >
                  📖 View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookSearchPage;

