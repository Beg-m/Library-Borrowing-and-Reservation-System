import express from 'express';
import * as librarianController from '../controllers/librarianController.js';
import { authenticate, authorize, verifyUserActive } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and librarian role
router.use(authenticate);
router.use(authorize('LIBRARIAN'));
router.use(verifyUserActive);

// Pending requests
router.get('/borrowings/pending', librarianController.getPendingBorrowingsController);
router.get('/borrowings/active', librarianController.getActiveBorrowingsController);
router.get('/reservations/pending', librarianController.getPendingReservationsController);

// Approve/Reject borrowings
router.patch('/borrowings/:borrowingId/approve', librarianController.approveBorrowingController);
router.patch('/borrowings/:borrowingId/reject', librarianController.rejectBorrowingController);
router.patch('/borrowings/:borrowingId/return', librarianController.returnBookController);

// Approve/Reject reservations
router.patch('/reservations/:reservationId/approve', librarianController.approveReservationController);
router.patch('/reservations/:reservationId/reject', librarianController.rejectReservationController);

// Utility
router.post('/borrowings/update-overdue', librarianController.updateOverdueBorrowingsController);

export default router;

