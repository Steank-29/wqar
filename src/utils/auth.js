// src/utils/auth.js

// Store user data
export const setUserData = (userData, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', userData.token);
  } else {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('authToken', userData.token);
  }
};

// Get user data
export const getUserData = () => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiry');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('authToken');
  
  // Clear axios default header
  delete axios.defaults.headers.common['Authorization'];
  
  // Redirect to login
  window.location.href = '/login';
};

// Get user role
export const getUserRole = () => {
  const user = getUserData();
  return user ? user.role : null;
};

// Setup axios interceptors for token refresh
export const setupAxiosInterceptors = (axios) => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Handle token refresh or redirect to login
        logout();
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );
};