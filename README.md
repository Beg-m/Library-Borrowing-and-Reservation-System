# Library Borrowing and Reservation System (LBRS)

A full-stack web application for managing library book borrowings and reservations.

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing
- Vitest (Unit Testing)
- Supertest (HTTP Testing)

### Frontend
- React
- Vite
- TailwindCSS
- Axios
- React Router

## Project Structure

```
LBRS/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── prisma/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   │   ├── setup.js
│   │   ├── helpers.js
│   │   ├── user.test.js
│   │   ├── book.test.js
│   │   ├── borrowing.test.js
│   │   └── reservation.test.js
│   ├── vitest.config.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   ├── router/
    │   └── main.jsx
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/lbrs_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

4. Update the `DATABASE_URL` with your PostgreSQL credentials and create the database:
```bash
createdb lbrs_db
```

5. Generate Prisma Client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Seed the database with initial data:
```bash
npm run prisma:seed
```

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Credentials

After seeding the database, you can use these credentials to login:

- **Member**: 
  - Email: `member@lbrs.com`
  - Password: `member123`

- **Librarian**: 
  - Email: `librarian@lbrs.com`
  - Password: `librarian123`

- **Admin**: 
  - Email: `admin@lbrs.com`
  - Password: `admin123`

## Features

### Member Features
- Login/Register
- Search books (by title, author, or category)
- View book details
- Borrow available book copies
- Reserve unavailable books
- View active borrowings & reservations
- View borrowing history
- Cancel reservations

### Librarian Features
- View pending borrow & reservation requests
- Approve/reject borrowing requests
- Approve/reject reservation requests
- Return books
- Update overdue borrowings

### Admin Features
- Manage users (create, update, deactivate members and librarians)
- Manage categories (create, update, delete)
- Manage books (create, update, delete, add copies)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new member

### Member Endpoints
- `GET /api/members/books/search` - Search books
- `GET /api/members/books/:bookId` - Get book details
- `POST /api/members/borrowings` - Borrow a book copy
- `POST /api/members/reservations` - Reserve a book
- `GET /api/members/borrowings/active` - Get active borrowings
- `GET /api/members/reservations/active` - Get active reservations
- `GET /api/members/borrowings/history` - Get borrowing history
- `DELETE /api/members/reservations/:reservationId` - Cancel reservation

### Librarian Endpoints
- `GET /api/librarians/borrowings/pending` - Get pending borrowings
- `GET /api/librarians/reservations/pending` - Get pending reservations
- `PATCH /api/librarians/borrowings/:borrowingId/approve` - Approve borrowing
- `PATCH /api/librarians/borrowings/:borrowingId/reject` - Reject borrowing
- `PATCH /api/librarians/reservations/:reservationId/approve` - Approve reservation
- `PATCH /api/librarians/reservations/:reservationId/reject` - Reject reservation
- `PATCH /api/librarians/borrowings/:borrowingId/return` - Return book

### Admin Endpoints
- User Management: `/api/admin/members`, `/api/admin/librarians`, `/api/admin/admins`
- Category Management: `/api/admin/categories`
- Book Management: `/api/admin/books`, `/api/admin/books/:bookId/copies`

## System Rules

1. A book copy cannot be borrowed by two users at the same time
2. Reservation uses queue_position logic
3. Status transitions: Available → Borrowed, Available → Reserved
4. Due dates are automatically calculated (14 days)
5. Overdue borrowings are flagged automatically

## Testing

The backend includes comprehensive unit tests using **Vitest** and **Supertest**.

### Backend Unit Testing

- **Framework**: Vitest
- **HTTP Testing**: Supertest
- **Database**: Fully mocked (no real database required)
- **Test Pattern**: AAA (Arrange-Act-Assert)

### Test Coverage

- ✅ **58 tests** covering all API endpoints
- ✅ **4 test suites**: User, Book, Borrowing, Reservation
- ✅ **100% test success rate**
- ✅ **Fast execution**: < 500ms for all tests

### Running Tests

Navigate to the backend directory:

```bash
cd backend
```

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode (auto-rerun on file changes):**
```bash
npm run test:watch
```

**Run tests with coverage report:**
```bash
npm run test:coverage
```

### Test Structure

```
backend/tests/
├── setup.js              # Global test setup and mocks
├── helpers.js            # Test helper utilities
├── user.test.js          # User management tests (13 tests)
├── book.test.js          # Book management tests (16 tests)
├── borrowing.test.js     # Borrowing management tests (14 tests)
└── reservation.test.js   # Reservation management tests (15 tests)
```

### Test Features

- **Mock-based testing**: All database operations are mocked
- **No database required**: Tests run completely isolated
- **Fast execution**: Tests complete in milliseconds
- **Comprehensive coverage**: All endpoints and error cases tested
- **AAA pattern**: All tests follow Arrange-Act-Assert structure

For detailed testing documentation, see [backend/tests/README.md](backend/tests/README.md)

## Notes

- All API endpoints (except login/register) require JWT authentication
- Role-based access control is enforced at both route and API level
- Passwords are hashed using bcrypt
- Database schema follows the exact ERD requirements

