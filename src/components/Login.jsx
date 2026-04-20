import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  alpha,
  styled,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person as BusinessIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../components/LanguageContext';
import '@fontsource/oswald';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Styled Components with RTL support
const LoginContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '32px',
  padding: theme.spacing(5),
  background: '#FFFFFF',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 1,
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: '24px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: alpha('#8C5A3C', 0.2),
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: alpha('#8C5A3C', 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8C5A3C',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '14px',
    letterSpacing: '0.5px',
    color: alpha('#1A1A1A', 0.6),
    '&.Mui-focused': {
      color: '#8C5A3C',
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '15px',
    padding: '14px 14px',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#8C5A3C',
  color: '#FFFFFF',
  borderRadius: '60px',
  padding: '14px 40px',
  fontFamily: 'Oswald, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(140, 90, 60, 0.2)',
  width: '100%',
  '&:hover': {
    backgroundColor: '#6B4423',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(140, 90, 60, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&.Mui-disabled': {
    backgroundColor: alpha('#8C5A3C', 0.5),
  },
}));

const Login = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // State management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'rememberMe' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation with translations
 const validateForm = () => {
  const newErrors = {};
  
  // Email validation
  if (!formData.email || !formData.email.trim()) {
    newErrors.email = t('login.errors.emailRequired');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = t('login.errors.emailInvalid');
  }
  
  // Password validation
  if (!formData.password) {
    newErrors.password = t('login.errors.passwordRequired');
  } else if (formData.password.length < 6) {
    newErrors.password = t('login.errors.passwordMinLength');
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Handle login submission - Updated for backend integration
const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setLoading(true);
  
  try {
    // Get API base URL with fallback
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    
    console.log('Attempting login to:', `${API_BASE}/users/login`);
    console.log('With email:', formData.email);
    
    // Call your backend login endpoint
    const response = await fetch(`https://wqar-api.onrender.com/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
      }),
    });
    
    console.log('Response status:', response.status);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error('Server error. Please try again later.');
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      // Handle specific error cases with proper messages
      if (response.status === 401) {
        throw new Error(data.message || t('login.errors.invalidCredentials'));
      } else if (response.status === 404) {
        throw new Error('Login service not found. Please contact support.');
      } else if (response.status === 500) {
        throw new Error(t('login.errors.serverError'));
      } else {
        throw new Error(data.message || t('login.errors.loginFailed'));
      }
    }
    
    // Validate response data
    if (!data.token) {
      throw new Error('Invalid response from server: missing token');
    }
    
    // Store user data and token based on remember me option
    const userData = {
      id: data._id || data.id,
      firstName: data.firstName || data.firstname || '',
      lastName: data.lastName || data.lastname || '',
      email: data.email,
      role: data.role || 'user',
      profilePicture: data.profilePicture || data.avatar || null,
      token: data.token
    };
    
    // Store auth data
    if (formData.rememberMe) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      // Set token expiry (30 days)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      localStorage.setItem('tokenExpiry', expiry.toISOString());
    } else {
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Set default authorization header for future axios requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    // Show success message
    setSnackbar({
      open: true,
      message: `${t('login.success') || 'Success!'} ${t('login.welcomeBack') || 'Welcome back'} ${userData.firstName}!`,
      severity: 'success',
    });
    
    // Redirect after successful login
    setTimeout(() => {
      if (userData.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }, 1500);
    
  } catch (error) {
    console.error('Login error details:', error);
    
    // Handle network errors
    let errorMessage = error.message;
    
    if (error.message === 'Failed to fetch') {
      errorMessage = 'Cannot connect to server. Please check if the server is running.';
    } else if (error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (!errorMessage) {
      errorMessage = t('login.errors.invalidCredentials');
    }
    
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error',
    });
    
    // Clear password field on error for security
    setFormData(prev => ({ ...prev, password: '' }));
  } finally {
    setLoading(false);
  }
};

  // Handle forgot password
  const handleForgotPassword = () => {
    window.location.href = '/forgot-password';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.2,
      },
    },
  };

  return (
    <Box
      sx={{
        bgcolor: '#F9F6F1',
        minHeight: '100vh',
        py: { xs: 4, sm: 6, md: 8 },
        display: 'flex',
        alignItems: 'center',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <LoginContainer elevation={0}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {/* Logo/Brand Icon */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '20px',
                  bgcolor: alpha('#8C5A3C', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <BusinessIcon sx={{ fontSize: 32, color: '#8C5A3C' }} />
              </Box>
              
              <Typography
                variant="overline"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  color: '#8C5A3C',
                  letterSpacing: '3px',
                  fontWeight: 500,
                  fontSize: '12px',
                  mb: 1,
                  display: 'block',
                }}
              >
                {t('login.portal')}
              </Typography>
              
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  mb: 2,
                  fontSize: { xs: '32px', sm: '36px', md: '40px' },
                  letterSpacing: '-0.5px',
                }}
              >
                {t('login.title')}
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  color: alpha('#1A1A1A', 0.6),
                  fontSize: '15px',
                  lineHeight: 1.5,
                }}
              >
                {t('login.description')}
              </Typography>
            </Box>

            {/* Security Badge */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 3,
                p: 1,
                bgcolor: alpha('#8C5A3C', 0.05),
                borderRadius: '60px',
                width: 'fit-content',
                mx: 'auto',
              }}
            >
              <SecurityIcon sx={{ fontSize: 14, color: '#8C5A3C' }} />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  color: alpha('#1A1A1A', 0.6),
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                }}
              >
                {t('login.security')}
              </Typography>
            </Box>

            {/* Login Form */}
            <motion.div variants={formVariants}>
              <form onSubmit={handleLogin}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Email Field */}
                  <StyledTextField
                    fullWidth
                    label={t('login.email')}
                    name="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password Field */}
                  <StyledTextField
                    fullWidth
                    label={t('login.password')}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: alpha('#1A1A1A', 0.5) }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Remember Me & Forgot Password */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          sx={{
                            color: alpha('#8C5A3C', 0.5),
                            '&.Mui-checked': {
                              color: '#8C5A3C',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontFamily: 'Oswald, sans-serif',
                            fontSize: '14px',
                            color: alpha('#1A1A1A', 0.7),
                          }}
                        >
                          {t('login.rememberMe')}
                        </Typography>
                      }
                    />
                    
                    <Link
                      component="button"
                      type="button"
                      onClick={handleForgotPassword}
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '14px',
                        color: '#8C5A3C',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {t('login.forgotPassword')}
                    </Link>
                  </Box>

                  {/* Login Button */}
                  <LoginButton
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? null : <LoginIcon />}
                  >
                    {loading ? t('login.authenticating') : t('login.signIn')}
                  </LoginButton>
                </Box>
              </form>
            </motion.div>
          </LoginContainer>
        </motion.div>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            borderRadius: '16px',
            fontFamily: 'Oswald, sans-serif',
            ...(snackbar.severity === 'success' && {
              bgcolor: '#8C5A3C',
              color: '#FFFFFF',
              '& .MuiAlert-icon': {
                color: '#FFFFFF',
              },
            }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;