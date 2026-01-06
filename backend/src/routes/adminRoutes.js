import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize, verifyUserActive } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));
router.use(verifyUserActive);

// User management
router.post('/members', adminController.createMemberController);
router.get('/members', adminController.getAllMembersController);
router.patch('/members/:memberId', adminController.updateMemberController);

router.post('/librarians', adminController.createLibrarianController);
router.get('/librarians', adminController.getAllLibrariansController);
router.patch('/librarians/:librarianId', adminController.updateLibrarianController);

router.post('/admins', adminController.createAdminController);
router.get('/admins', adminController.getAllAdminsController);

router.patch('/users/:userId/deactivate', adminController.deactivateUserController);

// Category management
router.post('/categories', adminController.createCategoryController);
router.get('/categories', adminController.getAllCategoriesController);
router.patch('/categories/:categoryId', adminController.updateCategoryController);
router.delete('/categories/:categoryId', adminController.deleteCategoryController);

// Book management
router.post('/books', adminController.createBookController);
router.get('/books', adminController.getAllBooksController);
router.get('/books/:bookId', adminController.getBookByIdController);
router.patch('/books/:bookId', adminController.updateBookController);
router.delete('/books/:bookId', adminController.deleteBookController);
router.post('/books/:bookId/copies', adminController.addBookCopyController);
router.delete('/book-copies/:bookCopyId', adminController.removeBookCopyController);

export default router;

