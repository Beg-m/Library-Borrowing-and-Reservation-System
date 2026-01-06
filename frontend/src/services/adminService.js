import api from './api';

export const adminService = {
  // Members
  createMember: (memberData) => {
    return api.post('/admin/members', memberData);
  },

  getAllMembers: () => {
    return api.get('/admin/members');
  },

  updateMember: (memberId, memberData) => {
    return api.patch(`/admin/members/${memberId}`, memberData);
  },

  // Librarians
  createLibrarian: (librarianData) => {
    return api.post('/admin/librarians', librarianData);
  },

  getAllLibrarians: () => {
    return api.get('/admin/librarians');
  },

  updateLibrarian: (librarianId, librarianData) => {
    return api.patch(`/admin/librarians/${librarianId}`, librarianData);
  },

  // Admins
  createAdmin: (adminData) => {
    return api.post('/admin/admins', adminData);
  },

  getAllAdmins: () => {
    return api.get('/admin/admins');
  },

  // Users
  deactivateUser: (userId, role) => {
    return api.patch(`/admin/users/${userId}/deactivate`, { role });
  },

  // Categories
  createCategory: (categoryData) => {
    return api.post('/admin/categories', categoryData);
  },

  getAllCategories: () => {
    return api.get('/admin/categories');
  },

  updateCategory: (categoryId, categoryData) => {
    return api.patch(`/admin/categories/${categoryId}`, categoryData);
  },

  deleteCategory: (categoryId) => {
    return api.delete(`/admin/categories/${categoryId}`);
  },

  // Books
  createBook: (bookData) => {
    return api.post('/admin/books', bookData);
  },

  getAllBooks: () => {
    return api.get('/admin/books');
  },

  getBookById: (bookId) => {
    return api.get(`/admin/books/${bookId}`);
  },

  updateBook: (bookId, bookData) => {
    return api.patch(`/admin/books/${bookId}`, bookData);
  },

  deleteBook: (bookId) => {
    return api.delete(`/admin/books/${bookId}`);
  },

  addBookCopy: (bookId) => {
    return api.post(`/admin/books/${bookId}/copies`);
  },

  removeBookCopy: (bookCopyId) => {
    return api.delete(`/admin/book-copies/${bookCopyId}`);
  },
};

