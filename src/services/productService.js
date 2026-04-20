// services/productService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available (for wishlist, etc.)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get all products with filters
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.featured) params.append('featured', filters.featured);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.category) params.append('category', filters.category);
    
    const response = await axiosInstance.get(`/api/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Create order (for buying)
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get product statistics
export const getProductStats = async () => {
  try {
    const response = await axiosInstance.get('/api/products/stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// Get products by gender (convenience method)
export const getProductsByGender = async (gender, limit = 20) => {
  return getProducts({ gender, limit });
};

// Get featured products
export const getFeaturedProducts = async (limit = 10) => {
  return getProducts({ featured: true, limit });
};

// Search products
export const searchProducts = async (query) => {
  return getProducts({ search: query });
};

export default {
  getProducts,
  getProductById,
  createOrder,
  getProductStats,
  getProductsByGender,
  getFeaturedProducts,
  searchProducts
};