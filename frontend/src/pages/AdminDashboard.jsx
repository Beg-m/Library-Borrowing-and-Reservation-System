import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { adminService } from '../services/adminService';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', description: '', categoryId: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'books') {
        const [booksRes, categoriesRes] = await Promise.all([
          adminService.getAllBooks(),
          adminService.getAllCategories(),
        ]);
        setBooks(booksRes.data);
        setCategories(categoriesRes.data);
      } else if (activeTab === 'categories') {
        const response = await adminService.getAllCategories();
        setCategories(response.data);
      } else if (activeTab === 'members') {
        const response = await adminService.getAllMembers();
        setMembers(response.data);
      } else if (activeTab === 'librarians') {
        const response = await adminService.getAllLibrarians();
        setLibrarians(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await adminService.createBook(bookForm);
      alert('Book created successfully');
      setShowBookForm(false);
      setBookForm({ title: '', author: '', isbn: '', description: '', categoryId: '' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create book');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCategory(categoryForm);
      alert('Category created successfully');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleAddBookCopy = async (bookId) => {
    if (!window.confirm('Add a new copy of this book?')) {
      return;
    }

    try {
      await adminService.addBookCopy(bookId);
      alert('Book copy added successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add book copy');
    }
  };

  const handleDeactivateUser = async (userId, role) => {
    if (!window.confirm('Deactivate this user?')) {
      return;
    }

    try {
      await adminService.deactivateUser(userId, role);
      alert('User deactivated successfully');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to deactivate user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-red-50">
      <Navbar title="Admin Dashboard" userRole="Administrator" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <nav className="flex space-x-4 p-2">
              {['books', 'categories', 'members', 'librarians'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  } whitespace-nowrap py-3 px-6 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 capitalize`}
                >
                  {tab === 'books' && '📚 '}
                  {tab === 'categories' && '📂 '}
                  {tab === 'members' && '👥 '}
                  {tab === 'librarians' && '👨‍💼 '}
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        ) : (
          <>
            {/* Books Tab */}
            {activeTab === 'books' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent flex items-center gap-3">
                      <span className="text-3xl">📚</span> Books Management
                    </h2>
                    <button
                      onClick={() => setShowBookForm(!showBookForm)}
                      className="bg-gradient-to-r from-rose-700 to-red-900 text-white px-6 py-3 rounded-xl font-semibold hover:from-rose-800 hover:to-red-950 transition-all transform hover:scale-105 shadow-lg"
                    >
                      {showBookForm ? '❌ Cancel' : '➕ Add Book'}
                    </button>
                  </div>

                  {showBookForm && (
                    <form onSubmit={handleCreateBook} className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-xl border-2 border-rose-200 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">📖 Create New Book</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="📖 Book Title *"
                          value={bookForm.title}
                          onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                          required
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="✍️ Author *"
                          value={bookForm.author}
                          onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                          required
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="🔢 ISBN *"
                          value={bookForm.isbn}
                          onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                          required
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                        />
                        <select
                          value={bookForm.categoryId}
                          onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                          required
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                        >
                          <option value="">📂 Select Category *</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <textarea
                          placeholder="📝 Description"
                          value={bookForm.description}
                          onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl col-span-1 md:col-span-2 focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                          rows="3"
                        />
                      </div>
                      <button
                        type="submit"
                        className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                      >
                        ✅ Create Book
                      </button>
                    </form>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
                  {books.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">📚</span>
                      <p className="text-gray-500 font-medium">No books found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {books.map((book) => (
                        <div key={book.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 hover:shadow-lg transition-all">
                          <h3 className="font-bold text-gray-800 text-lg mb-2">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">✍️ {book.author}</p>
                          <p className="text-xs text-gray-500 mb-2 font-mono">🔢 {book.isbn}</p>
                          <p className="text-xs bg-white px-3 py-1 rounded-lg font-semibold inline-block mb-3">
                            📂 {book.category.name}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-700 font-semibold">
                              📖 {book.bookCopies?.length || 0} copies
                            </span>
                            <button
                              onClick={() => handleAddBookCopy(book.id)}
                              className="bg-gradient-to-r from-rose-700 to-red-900 text-white px-4 py-2 rounded-lg hover:from-rose-800 hover:to-red-950 transition-all transform hover:scale-105 text-sm font-semibold shadow"
                            >
                              ➕ Add Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent flex items-center gap-3">
                      <span className="text-3xl">📂</span> Categories Management
                    </h2>
                    <button
                      onClick={() => setShowCategoryForm(!showCategoryForm)}
                      className="bg-gradient-to-r from-rose-700 to-red-900 text-white px-6 py-3 rounded-xl font-semibold hover:from-rose-800 hover:to-red-950 transition-all transform hover:scale-105 shadow-lg"
                    >
                      {showCategoryForm ? '❌ Cancel' : '➕ Add Category'}
                    </button>
                  </div>

                  {showCategoryForm && (
                    <form onSubmit={handleCreateCategory} className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-xl border-2 border-rose-200 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">📂 Create New Category</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="📂 Category Name *"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                        />
                        <textarea
                          placeholder="📝 Description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-700 focus:border-rose-700 transition-all"
                          rows="3"
                        />
                      </div>
                      <button
                        type="submit"
                        className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                      >
                        ✅ Create Category
                      </button>
                    </form>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
                  {categories.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">📂</span>
                      <p className="text-gray-500 font-medium">No categories found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <div key={category.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 hover:shadow-lg transition-all">
                          <h3 className="font-bold text-gray-800 text-lg mb-2">📂 {category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                    <span className="text-3xl">👥</span> Members Management
                  </h2>
                  {members.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">👥</span>
                      <p className="text-gray-500 font-medium">No members found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map((member) => (
                        <div key={member.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg mb-1">
                                👤 {member.firstName} {member.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">📧 {member.email}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              member.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {member.isActive ? '✅ Active' : '❌ Inactive'}
                            </span>
                          </div>
                          {member.isActive ? (
                            <button
                              onClick={() => handleDeactivateUser(member.id, 'MEMBER')}
                              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 text-sm font-semibold shadow"
                            >
                              🚫 Deactivate
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
                            >
                              Already Inactive
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Librarians Tab */}
            {activeTab === 'librarians' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-rose-700 to-red-900 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                    <span className="text-3xl">👨‍💼</span> Librarians Management
                  </h2>
                  {librarians.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">👨‍💼</span>
                      <p className="text-gray-500 font-medium">No librarians found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {librarians.map((librarian) => (
                        <div key={librarian.id} className="border-2 border-rose-100 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg mb-1">
                                👨‍💼 {librarian.firstName} {librarian.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">📧 {librarian.email}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              librarian.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {librarian.isActive ? '✅ Active' : '❌ Inactive'}
                            </span>
                          </div>
                          {librarian.isActive ? (
                            <button
                              onClick={() => handleDeactivateUser(librarian.id, 'LIBRARIAN')}
                              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 text-sm font-semibold shadow"
                            >
                              🚫 Deactivate
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
                            >
                              Already Inactive
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

