import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import MemberDashboard from '../pages/MemberDashboard';
import BookSearchPage from '../pages/BookSearchPage';
import BookDetailsPage from '../pages/BookDetailsPage';
import BorrowingHistoryPage from '../pages/BorrowingHistoryPage';
import LibrarianDashboard from '../pages/LibrarianDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import { getDashboardRoute } from '../utils/navigation';

// Protected Route Component
function ProtectedRouteComponent({ children, allowedRoles }) {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role to uppercase for comparison
  const userRole = user.role?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles?.map(role => role.toUpperCase());

  // Check if user's role is in the allowed roles list
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    // Access denied - redirect to appropriate dashboard based on user's role
    const dashboardRoute = getDashboardRoute(userRole);
    console.log('Access denied. User role:', userRole, 'Allowed roles:', normalizedAllowedRoles, 'Redirecting to:', dashboardRoute);
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route
          path="/member"
          element={
            <ProtectedRouteComponent allowedRoles={['MEMBER']}>
              <MemberDashboard />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/member/books"
          element={
            <ProtectedRouteComponent allowedRoles={['MEMBER']}>
              <BookSearchPage />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/member/books/:bookId"
          element={
            <ProtectedRouteComponent allowedRoles={['MEMBER']}>
              <BookDetailsPage />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/member/borrowings/history"
          element={
            <ProtectedRouteComponent allowedRoles={['MEMBER']}>
              <BorrowingHistoryPage />
            </ProtectedRouteComponent>
          }
        />
        
        <Route
          path="/librarian"
          element={
            <ProtectedRouteComponent allowedRoles={['LIBRARIAN']}>
              <LibrarianDashboard />
            </ProtectedRouteComponent>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRouteComponent allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRouteComponent>
          }
        />
        
        {/* Root redirect - check if user is logged in, otherwise go to login */}
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? (
              <Navigate to={(() => {
                const user = authService.getCurrentUser();
                if (user?.role?.toUpperCase() === 'MEMBER') return '/member';
                if (user?.role?.toUpperCase() === 'LIBRARIAN') return '/librarian';
                if (user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'ADMINISTRATOR') return '/admin';
                return '/login';
              })()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

