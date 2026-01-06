import api from './api';

export const memberService = {
  searchBooks: (search, categoryId) => {
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    return api.get('/members/books/search', { params });
  },

  getBookDetails: (bookId) => {
    return api.get(`/members/books/${bookId}`);
  },

  getCategories: () => {
    return api.get('/members/categories');
  },

  borrowBookCopy: (bookCopyId) => {
    return api.post('/members/borrowings', { bookCopyId });
  },

  reserveBook: (bookId) => {
    return api.post('/members/reservations', { bookId });
  },

  getActiveBorrowings: () => {
    return api.get('/members/borrowings/active');
  },

  getActiveReservations: () => {
    return api.get('/members/reservations/active');
  },

  getBorrowingHistory: () => {
    return api.get('/members/borrowings/history');
  },

  cancelReservation: (reservationId) => {
    return api.delete(`/members/reservations/${reservationId}`);
  },
};

