import api from './api';

export const librarianService = {
  getPendingBorrowings: () => {
    return api.get('/librarians/borrowings/pending');
  },

  getActiveBorrowings: () => {
    return api.get('/librarians/borrowings/active');
  },

  getPendingReservations: () => {
    return api.get('/librarians/reservations/pending');
  },

  approveBorrowing: (borrowingId) => {
    return api.patch(`/librarians/borrowings/${borrowingId}/approve`);
  },

  rejectBorrowing: (borrowingId) => {
    return api.patch(`/librarians/borrowings/${borrowingId}/reject`);
  },

  approveReservation: (reservationId) => {
    return api.patch(`/librarians/reservations/${reservationId}/approve`);
  },

  rejectReservation: (reservationId) => {
    return api.patch(`/librarians/reservations/${reservationId}/reject`);
  },

  returnBook: (borrowingId) => {
    return api.patch(`/librarians/borrowings/${borrowingId}/return`);
  },

  updateOverdueBorrowings: () => {
    return api.post('/librarians/borrowings/update-overdue');
  },
};

