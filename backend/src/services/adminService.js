import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/bcrypt.js';

// ==================== USER MANAGEMENT ====================

/**
 * Create a new member
 */
export const createMember = async (memberData) => {
  const { email, password, firstName, lastName, phone, address } = memberData;

  // Check if email already exists
  const existingMember = await prisma.member.findUnique({ where: { email } });
  if (existingMember) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const member = await prisma.member.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
    },
  });

  const { password: _, ...memberWithoutPassword } = member;
  return memberWithoutPassword;
};

/**
 * Create a new librarian
 */
export const createLibrarian = async (librarianData) => {
  const { email, password, firstName, lastName, phone } = librarianData;

  // Check if email already exists
  const existingLibrarian = await prisma.librarian.findUnique({ where: { email } });
  if (existingLibrarian) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const librarian = await prisma.librarian.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    },
  });

  const { password: _, ...librarianWithoutPassword } = librarian;
  return librarianWithoutPassword;
};

/**
 * Create a new admin
 */
export const createAdmin = async (adminData) => {
  const { email, password, firstName, lastName } = adminData;

  // Check if email already exists
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
  if (existingAdmin) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
  });

  const { password: _, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

/**
 * Get all members
 */
export const getAllMembers = async () => {
  const members = await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return members;
};

/**
 * Get all librarians
 */
export const getAllLibrarians = async () => {
  const librarians = await prisma.librarian.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return librarians;
};

/**
 * Get all admins
 */
export const getAllAdmins = async () => {
  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return admins;
};

/**
 * Update member
 */
export const updateMember = async (memberId, updateData) => {
  const { email, firstName, lastName, phone, address, isActive } = updateData;

  // Check if member exists
  const existingMember = await prisma.member.findUnique({ where: { id: memberId } });
  if (!existingMember) {
    throw new Error('Member not found');
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== existingMember.email) {
    const emailTaken = await prisma.member.findUnique({ where: { email } });
    if (emailTaken) {
      throw new Error('Email already registered');
    }
  }

  const updatePayload = {};
  if (email) updatePayload.email = email;
  if (firstName) updatePayload.firstName = firstName;
  if (lastName) updatePayload.lastName = lastName;
  if (phone !== undefined) updatePayload.phone = phone;
  if (address !== undefined) updatePayload.address = address;
  if (isActive !== undefined) updatePayload.isActive = isActive;

  const member = await prisma.member.update({
    where: { id: memberId },
    data: updatePayload,
  });

  const { password: _, ...memberWithoutPassword } = member;
  return memberWithoutPassword;
};

/**
 * Update librarian
 */
export const updateLibrarian = async (librarianId, updateData) => {
  const { email, firstName, lastName, phone, isActive } = updateData;

  const existingLibrarian = await prisma.librarian.findUnique({ where: { id: librarianId } });
  if (!existingLibrarian) {
    throw new Error('Librarian not found');
  }

  if (email && email !== existingLibrarian.email) {
    const emailTaken = await prisma.librarian.findUnique({ where: { email } });
    if (emailTaken) {
      throw new Error('Email already registered');
    }
  }

  const updatePayload = {};
  if (email) updatePayload.email = email;
  if (firstName) updatePayload.firstName = firstName;
  if (lastName) updatePayload.lastName = lastName;
  if (phone !== undefined) updatePayload.phone = phone;
  if (isActive !== undefined) updatePayload.isActive = isActive;

  const librarian = await prisma.librarian.update({
    where: { id: librarianId },
    data: updatePayload,
  });

  const { password: _, ...librarianWithoutPassword } = librarian;
  return librarianWithoutPassword;
};

/**
 * Deactivate user (member, librarian, or admin)
 */
export const deactivateUser = async (userId, role) => {
  if (role === 'MEMBER') {
    const member = await prisma.member.findUnique({ where: { id: userId } });
    if (!member) {
      throw new Error('Member not found');
    }
    return await prisma.member.update({
      where: { id: userId },
      data: { isActive: false },
    });
  } else if (role === 'LIBRARIAN') {
    const librarian = await prisma.librarian.findUnique({ where: { id: userId } });
    if (!librarian) {
      throw new Error('Librarian not found');
    }
    return await prisma.librarian.update({
      where: { id: userId },
      data: { isActive: false },
    });
  } else if (role === 'ADMIN') {
    const admin = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!admin) {
      throw new Error('Admin not found');
    }
    return await prisma.adminUser.update({
      where: { id: userId },
      data: { isActive: false },
    });
  } else {
    throw new Error('Invalid role');
  }
};

// ==================== CATEGORY MANAGEMENT ====================

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
  const { name, description } = categoryData;

  // Check if category already exists
  const existingCategory = await prisma.category.findUnique({ where: { name } });
  if (existingCategory) {
    throw new Error('Category already exists');
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Update category
 */
export const updateCategory = async (categoryId, updateData) => {
  const { name, description } = updateData;

  const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // Check if name is being changed and if it's already taken
  if (name && name !== existingCategory.name) {
    const nameTaken = await prisma.category.findUnique({ where: { name } });
    if (nameTaken) {
      throw new Error('Category name already exists');
    }
  }

  const updatePayload = {};
  if (name) updatePayload.name = name;
  if (description !== undefined) updatePayload.description = description;

  return await prisma.category.update({
    where: { id: categoryId },
    data: updatePayload,
  });
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId) => {
  // Check if category has books
  const books = await prisma.book.findMany({ where: { categoryId } });
  if (books.length > 0) {
    throw new Error('Cannot delete category with associated books');
  }

  return await prisma.category.delete({
    where: { id: categoryId },
  });
};

// ==================== BOOK MANAGEMENT ====================

/**
 * Create a new book
 */
export const createBook = async (bookData) => {
  const { title, author, isbn, description, categoryId } = bookData;

  // Check if ISBN already exists
  const existingBook = await prisma.book.findUnique({ where: { isbn } });
  if (existingBook) {
    throw new Error('Book with this ISBN already exists');
  }

  // Check if category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new Error('Category not found');
  }

  const book = await prisma.book.create({
    data: {
      title,
      author,
      isbn,
      description,
      categoryId,
    },
    include: {
      category: true,
    },
  });

  return book;
};

/**
 * Get all books
 */
export const getAllBooks = async () => {
  return await prisma.book.findMany({
    include: {
      category: true,
      bookCopies: {
        select: {
          id: true,
          copyNumber: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get book by ID
 */
export const getBookById = async (bookId) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      category: true,
      bookCopies: true,
    },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

/**
 * Update book
 */
export const updateBook = async (bookId, updateData) => {
  const { title, author, isbn, description, categoryId } = updateData;

  const existingBook = await prisma.book.findUnique({ where: { id: bookId } });
  if (!existingBook) {
    throw new Error('Book not found');
  }

  // Check if ISBN is being changed and if it's already taken
  if (isbn && isbn !== existingBook.isbn) {
    const isbnTaken = await prisma.book.findUnique({ where: { isbn } });
    if (isbnTaken) {
      throw new Error('Book with this ISBN already exists');
    }
  }

  // Check if category exists (if being updated)
  if (categoryId && categoryId !== existingBook.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new Error('Category not found');
    }
  }

  const updatePayload = {};
  if (title) updatePayload.title = title;
  if (author) updatePayload.author = author;
  if (isbn) updatePayload.isbn = isbn;
  if (description !== undefined) updatePayload.description = description;
  if (categoryId) updatePayload.categoryId = categoryId;

  return await prisma.book.update({
    where: { id: bookId },
    data: updatePayload,
    include: {
      category: true,
    },
  });
};

/**
 * Delete book
 */
export const deleteBook = async (bookId) => {
  // Check if book has active borrowings or reservations
  const activeBorrowings = await prisma.borrowing.findFirst({
    where: {
      bookCopy: { bookId },
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });

  if (activeBorrowings) {
    throw new Error('Cannot delete book with active borrowings');
  }

  const activeReservations = await prisma.reservation.findFirst({
    where: {
      bookId,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (activeReservations) {
    throw new Error('Cannot delete book with active reservations');
  }

  // Delete book copies first (cascade)
  await prisma.bookCopy.deleteMany({
    where: { bookId },
  });

  // Delete book
  return await prisma.book.delete({
    where: { id: bookId },
  });
};

/**
 * Add book copy
 */
export const addBookCopy = async (bookId) => {
  // Check if book exists
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw new Error('Book not found');
  }

  // Get the highest copy number for this book
  const maxCopy = await prisma.bookCopy.aggregate({
    where: { bookId },
    _max: { copyNumber: true },
  });

  const copyNumber = (maxCopy._max.copyNumber || 0) + 1;

  const bookCopy = await prisma.bookCopy.create({
    data: {
      bookId,
      copyNumber,
      status: 'AVAILABLE',
    },
  });

  return bookCopy;
};

/**
 * Remove book copy (only if available)
 */
export const removeBookCopy = async (bookCopyId) => {
  const bookCopy = await prisma.bookCopy.findUnique({ where: { id: bookCopyId } });
  if (!bookCopy) {
    throw new Error('Book copy not found');
  }

  if (bookCopy.status !== 'AVAILABLE') {
    throw new Error('Cannot remove book copy that is not available');
  }

  return await prisma.bookCopy.delete({
    where: { id: bookCopyId },
  });
};

