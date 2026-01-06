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

## Notes

- All API endpoints (except login/register) require JWT authentication
- Role-based access control is enforced at both route and API level
- Passwords are hashed using bcrypt
- Database schema follows the exact ERD requirements

