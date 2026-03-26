import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './i18n'; // Import i18n configuration
import './App.css';

// Create emotion cache based on direction
const createEmotionCache = (direction) => {
  return createCache({
    key: direction === 'rtl' ? 'mui-rtl' : 'mui-ltr',
    prepend: true,
    stylisPlugins: [],
  });
};

// Wrapper component to access language context
const AppContent = () => {
  const { isRTL, currentLanguage } = useLanguage();
  const emotionCache = createEmotionCache(isRTL ? 'rtl' : 'ltr');

  return (
    <CacheProvider value={emotionCache}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={{ ...theme, direction: isRTL ? 'rtl' : 'ltr' }}>
          <CssBaseline />
          <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </Layout>
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