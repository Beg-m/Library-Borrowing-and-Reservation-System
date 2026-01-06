import api from './api';

export const authService = {
  login: async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    console.log('Login API response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Ensure role is uppercase before storing
      // Use role from response, or fallback to the role parameter sent
      const userRole = response.data.user?.role?.toUpperCase() || role.toUpperCase();
      const userData = {
        ...response.data.user,
        role: userRole
      };
      
      console.log('Storing user in localStorage:', userData);
      console.log('Stored role:', userRole);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Verify it was stored correctly
      const verifyUser = JSON.parse(localStorage.getItem('user'));
      console.log('Verified stored user:', verifyUser);
      console.log('Verified stored role:', verifyUser?.role);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    // If registration returns token, store it (auto-login after registration)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Ensure role is uppercase before storing
      const userData = {
        ...response.data.user,
        role: response.data.user.role?.toUpperCase() || 'MEMBER'
      };
      console.log('Storing registered user in localStorage:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  forgotPassword: async (email) => {
    // Note: Backend'de forgot password endpoint'i eklenmeli
    // Şimdilik placeholder - gerçek uygulamada backend'e istek gönderilir
    const response = await api.post('/auth/forgot-password', { email }).catch(() => {
      throw new Error('Endpoint not available');
    });
    return response.data;
  },
};

