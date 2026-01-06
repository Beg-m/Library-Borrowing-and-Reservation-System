import { authService } from '../services/authService';

/**
 * Get dashboard route based on user role
 * @param {string} role - User role (MEMBER, LIBRARIAN, ADMIN)
 * @returns {string} Dashboard route
 */
export const getDashboardRoute = (role) => {
  const normalizedRole = role?.toUpperCase();
  
  switch (normalizedRole) {
    case 'MEMBER':
      return '/member';
    case 'LIBRARIAN':
      return '/librarian';
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return '/admin';
    default:
      return '/login';
  }
};

/**
 * Redirect user to appropriate dashboard based on their role
 * @param {Function} navigate - React Router navigate function
 * @param {Object} user - User object (optional, will get from localStorage if not provided)
 */
export const redirectToDashboard = (navigate, user = null) => {
  const currentUser = user || authService.getCurrentUser();
  
  if (!currentUser || !currentUser.role) {
    navigate('/login', { replace: true });
    return;
  }

  const route = getDashboardRoute(currentUser.role);
  navigate(route, { replace: true });
};

