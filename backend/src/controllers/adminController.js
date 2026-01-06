import * as adminService from '../services/adminService.js';

// ==================== USER MANAGEMENT ====================

/**
 * Create member
 * POST /api/admin/members
 */
export const createMemberController = async (req, res) => {
  try {
    const member = await adminService.createMember(req.body);
    res.status(201).json({ message: 'Member created successfully', member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Create librarian
 * POST /api/admin/librarians
 */
export const createLibrarianController = async (req, res) => {
  try {
    const librarian = await adminService.createLibrarian(req.body);
    res.status(201).json({ message: 'Librarian created successfully', librarian });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Create admin
 * POST /api/admin/admins
 */
export const createAdminController = async (req, res) => {
  try {
    const admin = await adminService.createAdmin(req.body);
    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all members
 * GET /api/admin/members
 */
export const getAllMembersController = async (req, res) => {
  try {
    const members = await adminService.getAllMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all librarians
 * GET /api/admin/librarians
 */
export const getAllLibrariansController = async (req, res) => {
  try {
    const librarians = await adminService.getAllLibrarians();
    res.json(librarians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all admins
 * GET /api/admin/admins
 */
export const getAllAdminsController = async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update member
 * PATCH /api/admin/members/:memberId
 */
export const updateMemberController = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await adminService.updateMember(memberId, req.body);
    res.json({ message: 'Member updated successfully', member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update librarian
 * PATCH /api/admin/librarians/:librarianId
 */
export const updateLibrarianController = async (req, res) => {
  try {
    const { librarianId } = req.params;
    const librarian = await adminService.updateLibrarian(librarianId, req.body);
    res.json({ message: 'Librarian updated successfully', librarian });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Deactivate user
 * PATCH /api/admin/users/:userId/deactivate
 */
export const deactivateUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const user = await adminService.deactivateUser(userId, role);
    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ==================== CATEGORY MANAGEMENT ====================

/**
 * Create category
 * POST /api/admin/categories
 */
export const createCategoryController = async (req, res) => {
  try {
    const category = await adminService.createCategory(req.body);
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all categories
 * GET /api/admin/categories
 */
export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await adminService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update category
 * PATCH /api/admin/categories/:categoryId
 */
export const updateCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await adminService.updateCategory(categoryId, req.body);
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete category
 * DELETE /api/admin/categories/:categoryId
 */
export const deleteCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await adminService.deleteCategory(categoryId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ==================== BOOK MANAGEMENT ====================

/**
 * Create book
 * POST /api/admin/books
 */
export const createBookController = async (req, res) => {
  try {
    const book = await adminService.createBook(req.body);
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all books
 * GET /api/admin/books
 */
export const getAllBooksController = async (req, res) => {
  try {
    const books = await adminService.getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get book by ID
 * GET /api/admin/books/:bookId
 */
export const getBookByIdController = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await adminService.getBookById(bookId);
    res.json(book);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Update book
 * PATCH /api/admin/books/:bookId
 */
export const updateBookController = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await adminService.updateBook(bookId, req.body);
    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete book
 * DELETE /api/admin/books/:bookId
 */
export const deleteBookController = async (req, res) => {
  try {
    const { bookId } = req.params;
    await adminService.deleteBook(bookId);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Add book copy
 * POST /api/admin/books/:bookId/copies
 */
export const addBookCopyController = async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookCopy = await adminService.addBookCopy(bookId);
    res.status(201).json({ message: 'Book copy added successfully', bookCopy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Remove book copy
 * DELETE /api/admin/book-copies/:bookCopyId
 */
export const removeBookCopyController = async (req, res) => {
  try {
    const { bookCopyId } = req.params;
    await adminService.removeBookCopy(bookCopyId);
    res.json({ message: 'Book copy removed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

