import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { name: 'Fiction' },
    update: {},
    create: {
      name: 'Fiction',
      description: 'Fictional novels and stories',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Science' },
    update: {},
    create: {
      name: 'Science',
      description: 'Scientific books and research',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: 'History' },
    update: {},
    create: {
      name: 'History',
      description: 'Historical books and biographies',
    },
  });

  const category4 = await prisma.category.upsert({
    where: { name: 'Technology' },
    update: {},
    create: {
      name: 'Technology',
      description: 'Technology and programming books',
    },
  });

  console.log('Categories created');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@lbrs.com' },
    update: {},
    create: {
      email: 'admin@lbrs.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
    },
  });

  console.log('Admin user created:', admin.email);

  // Create librarian
  const librarianPassword = await hashPassword('librarian123');
  const librarian = await prisma.librarian.upsert({
    where: { email: 'librarian@lbrs.com' },
    update: {},
    create: {
      email: 'librarian@lbrs.com',
      password: librarianPassword,
      firstName: 'John',
      lastName: 'Librarian',
      phone: '555-0101',
    },
  });

  console.log('Librarian created:', librarian.email);

  // Create member
  const memberPassword = await hashPassword('member123');
  const member = await prisma.member.upsert({
    where: { email: 'member@lbrs.com' },
    update: {},
    create: {
      email: 'member@lbrs.com',
      password: memberPassword,
      firstName: 'Jane',
      lastName: 'Member',
      phone: '555-0202',
      address: '123 Library St',
    },
  });

  console.log('Member created:', member.email);

  // Create or get books
  const book1 = await prisma.book.upsert({
    where: { isbn: '978-0-7432-7356-5' },
    update: {},
    create: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      description: 'A classic American novel set in the Jazz Age',
      categoryId: category1.id,
    },
  });

  const book2 = await prisma.book.upsert({
    where: { isbn: '978-0-06-112008-4' },
    update: {},
    create: {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      description: 'A powerful tale of racial injustice and childhood innocence',
      categoryId: category1.id,
    },
  });

  const book3 = await prisma.book.upsert({
    where: { isbn: '978-0-553-10953-5' },
    update: {},
    create: {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0-553-10953-5',
      description: 'A popular science book about cosmology',
      categoryId: category2.id,
    },
  });

  const book4 = await prisma.book.upsert({
    where: { isbn: '978-0-385-49532-5' },
    update: {},
    create: {
      title: 'The Code Book',
      author: 'Simon Singh',
      isbn: '978-0-385-49532-5',
      description: 'The science of secrecy from ancient Egypt to quantum cryptography',
      categoryId: category4.id,
    },
  });

  const book5 = await prisma.book.upsert({
    where: { isbn: '978-0-06-231609-7' },
    update: {},
    create: {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      isbn: '978-0-06-231609-7',
      description: 'A brief history of humankind',
      categoryId: category3.id,
    },
  });

  console.log('Books created');

  // Delete ALL existing borrowings first (to avoid foreign key constraints)
  // Delete all borrowings that reference these books' copies
  await prisma.borrowing.deleteMany({
    where: {
      bookCopy: {
        bookId: { in: [book1.id, book2.id, book3.id, book4.id, book5.id] }
      }
    }
  });
  
  // Delete ALL existing reservations for these books
  await prisma.reservation.deleteMany({
    where: {
      bookId: { in: [book1.id, book2.id, book3.id, book4.id, book5.id] }
    }
  });

  // Delete existing copies for these books AFTER deleting borrowings
  await prisma.bookCopy.deleteMany({
    where: {
      bookId: { in: [book1.id, book2.id, book3.id, book4.id, book5.id] }
    }
  });

  // Create book copies
  const copy1 = await prisma.bookCopy.create({
    data: { bookId: book1.id, copyNumber: 1, status: 'BORROWED' },
  });

  await prisma.bookCopy.create({
    data: { bookId: book1.id, copyNumber: 2, status: 'AVAILABLE' },
  });

  await prisma.bookCopy.create({
    data: { bookId: book2.id, copyNumber: 1, status: 'RESERVED' },
  });

  await prisma.bookCopy.create({
    data: { bookId: book3.id, copyNumber: 1, status: 'AVAILABLE' },
  });

  const copy2 = await prisma.bookCopy.create({
    data: { bookId: book3.id, copyNumber: 2, status: 'BORROWED' },
  });

  await prisma.bookCopy.create({
    data: { bookId: book4.id, copyNumber: 1, status: 'AVAILABLE' },
  });

  const copy3 = await prisma.bookCopy.create({
    data: { bookId: book5.id, copyNumber: 1, status: 'BORROWED' },
  });

  await prisma.bookCopy.create({
    data: { bookId: book5.id, copyNumber: 2, status: 'AVAILABLE' },
  });

  await prisma.bookCopy.create({
    data: { bookId: book5.id, copyNumber: 3, status: 'AVAILABLE' },
  });

  console.log('Book copies created');

  // Create more book copies for additional borrowings and history
  const copy4 = await prisma.bookCopy.create({
    data: { bookId: book4.id, copyNumber: 2, status: 'BORROWED' },
  });

  const copy5 = await prisma.bookCopy.create({
    data: { bookId: book2.id, copyNumber: 2, status: 'BORROWED' },
  });

  const copy6 = await prisma.bookCopy.create({
    data: { bookId: book1.id, copyNumber: 3, status: 'AVAILABLE' },
  });

  // Create additional copies for history
  const copy7 = await prisma.bookCopy.create({
    data: { bookId: book1.id, copyNumber: 4, status: 'AVAILABLE' },
  });

  const copy8 = await prisma.bookCopy.create({
    data: { bookId: book2.id, copyNumber: 3, status: 'AVAILABLE' },
  });

  const copy9 = await prisma.bookCopy.create({
    data: { bookId: book3.id, copyNumber: 3, status: 'AVAILABLE' },
  });

  const copy10 = await prisma.bookCopy.create({
    data: { bookId: book4.id, copyNumber: 3, status: 'AVAILABLE' },
  });

  const copy11 = await prisma.bookCopy.create({
    data: { bookId: book5.id, copyNumber: 4, status: 'AVAILABLE' },
  });

  // Create even more copies for history
  const copy12 = await prisma.bookCopy.create({
    data: { bookId: book1.id, copyNumber: 5, status: 'AVAILABLE' },
  });

  const copy13 = await prisma.bookCopy.create({
    data: { bookId: book2.id, copyNumber: 4, status: 'AVAILABLE' },
  });

  const copy14 = await prisma.bookCopy.create({
    data: { bookId: book3.id, copyNumber: 4, status: 'AVAILABLE' },
  });

  const copy15 = await prisma.bookCopy.create({
    data: { bookId: book4.id, copyNumber: 4, status: 'AVAILABLE' },
  });

  const copy16 = await prisma.bookCopy.create({
    data: { bookId: book5.id, copyNumber: 5, status: 'AVAILABLE' },
  });

  const copy17 = await prisma.bookCopy.create({
    data: { bookId: book1.id, copyNumber: 6, status: 'AVAILABLE' },
  });

  const copy18 = await prisma.bookCopy.create({
    data: { bookId: book2.id, copyNumber: 5, status: 'AVAILABLE' },
  });

  // Create borrowings for member
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 14);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7); // 7 days ago

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // Yesterday (overdue)

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

  const fiveMonthsAgo = new Date();
  fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  await prisma.borrowing.createMany({
    data: [
      // Active borrowings (APPROVED status)
      {
        memberId: member.id,
        bookCopyId: copy1.id,
        status: 'APPROVED',
        borrowDate: lastWeek,
        dueDate: nextWeek,
      },
      {
        memberId: member.id,
        bookCopyId: copy2.id,
        status: 'APPROVED',
        borrowDate: lastMonth,
        dueDate: yesterday, // This will be overdue (active but past due date)
      },
      {
        memberId: member.id,
        bookCopyId: copy3.id,
        status: 'APPROVED',
        borrowDate: new Date(),
        dueDate: nextWeek,
      },
      {
        memberId: member.id,
        bookCopyId: copy4.id,
        status: 'APPROVED',
        borrowDate: lastWeek,
        dueDate: tomorrow,
      },
      // History - RETURNED books (many fake data)
      {
        memberId: member.id,
        bookCopyId: copy5.id,
        status: 'RETURNED',
        borrowDate: lastMonth,
        dueDate: new Date(lastMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy6.id,
        status: 'RETURNED',
        borrowDate: new Date(lastMonth.getTime() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(lastMonth.getTime() - 6 * 24 * 60 * 60 * 1000),
        returnDate: new Date(lastMonth.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy7.id,
        status: 'RETURNED',
        borrowDate: twoMonthsAgo,
        dueDate: new Date(twoMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(twoMonthsAgo.getTime() + 12 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy8.id,
        status: 'RETURNED',
        borrowDate: threeMonthsAgo,
        dueDate: new Date(threeMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(threeMonthsAgo.getTime() + 13 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy9.id,
        status: 'RETURNED',
        borrowDate: twoWeeksAgo,
        dueDate: new Date(twoWeeksAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(twoWeeksAgo.getTime() + 11 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy10.id,
        status: 'RETURNED',
        borrowDate: threeWeeksAgo,
        dueDate: new Date(threeWeeksAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(threeWeeksAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy12.id,
        status: 'RETURNED',
        borrowDate: fourMonthsAgo,
        dueDate: new Date(fourMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(fourMonthsAgo.getTime() + 12 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy13.id,
        status: 'RETURNED',
        borrowDate: fiveMonthsAgo,
        dueDate: new Date(fiveMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(fiveMonthsAgo.getTime() + 11 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy14.id,
        status: 'RETURNED',
        borrowDate: sixMonthsAgo,
        dueDate: new Date(sixMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(sixMonthsAgo.getTime() + 13 * 24 * 60 * 60 * 1000),
      },
      {
        memberId: member.id,
        bookCopyId: copy15.id,
        status: 'RETURNED',
        borrowDate: new Date(fourMonthsAgo.getTime() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(fourMonthsAgo.getTime() + 4 * 24 * 60 * 60 * 1000),
        returnDate: new Date(fourMonthsAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
      // OVERDUE history (returned late)
      {
        memberId: member.id,
        bookCopyId: copy11.id,
        status: 'OVERDUE',
        borrowDate: twoMonthsAgo,
        dueDate: new Date(twoMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(twoMonthsAgo.getTime() + 20 * 24 * 60 * 60 * 1000), // Returned 6 days late
      },
      {
        memberId: member.id,
        bookCopyId: copy16.id,
        status: 'OVERDUE',
        borrowDate: threeMonthsAgo,
        dueDate: new Date(threeMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(threeMonthsAgo.getTime() + 18 * 24 * 60 * 60 * 1000), // Returned 4 days late
      },
      {
        memberId: member.id,
        bookCopyId: copy17.id,
        status: 'OVERDUE',
        borrowDate: fourMonthsAgo,
        dueDate: new Date(fourMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(fourMonthsAgo.getTime() + 21 * 24 * 60 * 60 * 1000), // Returned 7 days late
      },
      {
        memberId: member.id,
        bookCopyId: copy18.id,
        status: 'OVERDUE',
        borrowDate: fiveMonthsAgo,
        dueDate: new Date(fiveMonthsAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(fiveMonthsAgo.getTime() + 19 * 24 * 60 * 60 * 1000), // Returned 5 days late
      },
    ],
  });

  console.log('Borrowings created');

  // Create reservations for member
  await prisma.reservation.createMany({
    data: [
      {
        memberId: member.id,
        bookId: book2.id,
        status: 'ACTIVE',
        queuePosition: 1,
      },
      {
        memberId: member.id,
        bookId: book4.id,
        status: 'PENDING',
        queuePosition: 1,
      },
      {
        memberId: member.id,
        bookId: book3.id,
        status: 'ACTIVE',
        queuePosition: 2,
      },
    ],
  });

  console.log('Reservations created');
  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

