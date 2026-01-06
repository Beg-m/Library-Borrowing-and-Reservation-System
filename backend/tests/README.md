# Backend API Unit Tests

This directory contains comprehensive unit tests for the LBRS backend API endpoints using **Vitest** and **Supertest**.

## Overview

- **Framework**: Vitest
- **HTTP Testing**: Supertest
- **Database**: Mocked (no real database required)
- **Pattern**: AAA (Arrange-Act-Assert)

## Test Structure

```
tests/
├── setup.js              # Global test setup and mocks
├── helpers.js            # Test helper utilities
├── user.test.js          # User management tests
├── book.test.js          # Book management tests
├── borrowing.test.js     # Borrowing management tests
└── reservation.test.js   # Reservation management tests
```

## Test Coverage

### User Tests (`user.test.js`)
- ✅ User registration (success & validation)
- ✅ User login (success & invalid credentials)
- ✅ Create member/librarian/admin
- ✅ Get all users
- ✅ Email duplication handling

### Book Tests (`book.test.js`)
- ✅ Create book (success & validation)
- ✅ Duplicate ISBN handling
- ✅ Get all books
- ✅ Get book by ID (success & 404)
- ✅ Search/filter books (by title, author, category)
- ✅ Delete book (success & 404)
- ✅ Add book copies

### Borrowing Tests (`borrowing.test.js`)
- ✅ Create borrowing request
- ✅ Handle unavailable book errors
- ✅ Get active borrowings
- ✅ Approve/reject borrowing
- ✅ Return book
- ✅ Get pending borrowings (librarian)

### Reservation Tests (`reservation.test.js`)
- ✅ Create reservation
- ✅ Prevent duplicate reservations
- ✅ Calculate queue position
- ✅ Cancel reservation
- ✅ Get active/pending reservations
- ✅ Approve/reject reservations (librarian)

## Installation

Ensure all dependencies are installed:

```bash
cd backend
npm install
```

Required dev dependencies (automatically installed):
- `vitest` - Test framework
- `supertest` - HTTP assertions
- `@vitest/coverage-v8` - Coverage reporting

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

This will generate:
- Console output with coverage summary
- HTML coverage report in `coverage/` directory
- JSON coverage report in `coverage/` directory

### Run specific test file
```bash
npx vitest tests/user.test.js
```

### Run tests matching a pattern
```bash
npx vitest -t "should create"
```

## Mocking Strategy

All database operations are mocked using `vi.mock()`:

- **Prisma Client**: Fully mocked - no real database connections
- **Password Hashing**: Mocked bcrypt operations
- **JWT Tokens**: Mocked token generation/verification
- **Authentication Middleware**: Mocked user authentication

This ensures:
- ✅ Tests run fast (no I/O operations)
- ✅ Tests are isolated (no shared state)
- ✅ Tests are deterministic (controlled mock responses)
- ✅ No database setup required

## Example Test Output

```
✓ tests/user.test.js (15)
  ✓ User Routes (/api/auth and /api/admin/users) (15)
    ✓ POST /api/auth/register (3)
      ✓ should create a new member successfully
      ✓ should return validation error for missing required fields
      ✓ should return error if email already exists
    ✓ POST /api/auth/login (3)
      ✓ should login successfully with valid credentials
      ✓ should return error for missing credentials
      ✓ should return error for invalid credentials
    ...

Test Files  4 passed (4)
     Tests  45 passed (45)
      Time  1.23s
```

## Test Best Practices

All tests follow the **AAA pattern**:

1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the function/endpoint being tested
3. **Assert**: Verify the expected outcome

Example:
```javascript
it('should create a new book successfully', async () => {
  // Arrange
  const newBook = { title: 'Test Book', ... };
  prisma.book.create.mockResolvedValue(mockCreatedBook);

  // Act
  const response = await request(app)
    .post('/api/admin/books')
    .send(newBook)
    .expect(201);

  // Assert
  expect(response.body).toHaveProperty('book');
  expect(prisma.book.create).toHaveBeenCalled();
});
```

## Troubleshooting

### Tests fail with "Cannot find module"
- Ensure `npm install` has been run
- Check that all dependencies are installed

### Mock not working
- Verify mocks are reset in `beforeEach`
- Check that `vi.mock()` is called before imports

### Authentication errors
- Ensure mock auth middleware is properly set up
- Check that `req.user` is set in test app

## Notes

- Tests do NOT use a real database
- All database operations are mocked
- Tests are independent and can run in any order
- Each test resets mocks in `beforeEach`

## Coverage Goals

Target coverage:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Check coverage after running tests:
```bash
npm run test:coverage
```

Then open `coverage/index.html` in a browser to view detailed coverage report.

