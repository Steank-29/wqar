// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation  } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import { LanguageProvider } from './components/LanguageContext';
import { useLanguage } from './components/LanguageContext';
import Layout from './components/Layout';
import Contact from './components/Contact';
import Home from './components/Home';
import Login from './components/Login';
import ProductDetail from './components/ProductDetail';
import theme from './theme';
import ProtectedRoute from './utils/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Products from './components/Products'
import Order from './pages/Order';
import Facture from './pages/Facture';
import Register from './components/Register';
import './i18n'; // Import i18n configuration
import './App.css';
import AdminLayout from './admin/AdminLayout';
import Checkout from './components/Checkout';

// Create emotion cache based on direction
const createEmotionCache = (direction) => {
  return createCache({
    key: direction === 'rtl' ? 'mui-rtl' : 'mui-ltr',
    prepend: true,
    stylisPlugins: [],
  });
};

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);
  
  return null;
};

// Wrapper component to access language context
const AppContent = () => {
  const { isRTL, currentLanguage } = useLanguage();
  const emotionCache = createEmotionCache(isRTL ? 'rtl' : 'ltr');
  const location = useLocation();

  return (
    <CacheProvider value={emotionCache}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={{ ...theme, direction: isRTL ? 'rtl' : 'ltr' }}>
          <CssBaseline />
          <ScrollToTop />
          <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh' }}>
            <Routes>
              {/* Public Routes - with Layout */}
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
              <Route path="/contact" element={
                <Layout>
                  <Contact />
                </Layout>
              } />
              <Route path="/products" element={
                <Layout>
                  <Products />
                </Layout>
              } />
              <Route path="/checkout" element={
                <Layout>
                  <Checkout />
                </Layout>
              } />
              <Route path="/product/:id" element={
                <Layout>
                  <ProductDetail />
                </Layout>
              } />
              <Route path="/login" element={
                <Layout>
                  <Login />
                </Layout>
              } />

              <Route path="/registernewadminaccountforwiqar" element={
                <Layout>
                  <Register />
                </Layout>
              } />
              
              {/* Protected Routes - User Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/messages" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Messages />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/order" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Order />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/orders/:orderId/invoice" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Facture />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              <Route path="/perfumes" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AddProduct />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              
              {/* Redirect root to home or dashboard based on auth */}
              <Route path="/" element={<Navigate to="/" replace />} />
              
              {/* 404 Not Found */}
              <Route path="*" element={
                <Layout>
                  <div style={{ textAlign: 'center', py: 8 }}>
                    <h1>404 - Page Not Found</h1>
                  </div>
                </Layout>
              } />
            </Routes>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </CacheProvider>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Router>
  );
}

export default App;