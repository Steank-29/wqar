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
  Divider,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Business as BusinessIcon,
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import '@fontsource/oswald';

// Styled Components (maintaining consistency with contact form)
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

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: '60px',
  padding: '10px 20px',
  fontFamily: 'Oswald, sans-serif',
  fontSize: '14px',
  textTransform: 'none',
  border: `1.5px solid ${alpha('#8C5A3C', 0.2)}`,
  color: '#1A1A1A',
  backgroundColor: '#FFFFFF',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#8C5A3C',
    backgroundColor: alpha('#8C5A3C', 0.05),
    transform: 'translateY(-1px)',
  },
}));

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Company-level authentication with rate limiting and security headers
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
        credentials: 'include', // Include cookies for session management
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store auth token securely
      if (formData.rememberMe) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('authToken', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Login successful! Redirecting...',
        severity: 'success',
      });
      
      // Redirect after successful login
      setTimeout(() => {
        window.location.href = '/dashboard'; // or your dashboard route
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      let errorMessage = 'Invalid email or password';
      
      if (error.message.includes('too many attempts')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message.includes('account locked')) {
        errorMessage = 'Your account has been locked. Please contact support.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      
      // Clear password field on error
      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // Navigate to forgot password page or open modal
    window.location.href = '/forgot-password';
  };

  // Handle demo login (for development/demo purposes)
  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@company.com',
      password: 'demo123',
      rememberMe: false,
    });
    setSnackbar({
      open: true,
      message: 'Demo credentials loaded',
      severity: 'info',
    });
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
                WELCOME BACK
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
                Sign In
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
                Access your account to manage orders, track shipments, and discover exclusive fragrances
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
                Enterprise-grade security
              </Typography>
            </Box>

            {/* Login Form */}
            <motion.div variants={formVariants}>
              <form onSubmit={handleLogin}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Email Field */}
                  <StyledTextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="hello@company.com"
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
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                          Remember me
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
                      Forgot password?
                    </Link>
                  </Box>

                  {/* Login Button */}
                  <LoginButton
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? null : <LoginIcon />}
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </LoginButton>

                  {/* Demo Access (Company-level feature) */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      onClick={handleDemoLogin}
                      disabled={loading}
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '13px',
                        color: alpha('#1A1A1A', 0.5),
                        textTransform: 'none',
                        '&:hover': {
                          color: '#8C5A3C',
                          backgroundColor: 'transparent',
                        },
                      }}
                      startIcon={<FingerprintIcon sx={{ fontSize: 16 }} />}
                    >
                      Demo Access
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        color: alpha('#1A1A1A', 0.4),
                        px: 2,
                      }}
                    >
                      OR
                    </Typography>
                  </Divider>

                  {/* Social Login Options */}
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <SocialButton
                      fullWidth
                      startIcon={
                        <img
                          src="https://www.google.com/favicon.ico"
                          alt="Google"
                          style={{ width: 20, height: 20 }}
                        />
                      }
                      disabled={loading}
                    >
                      Continue with Google
                    </SocialButton>
                    
                    <SocialButton
                      fullWidth
                      startIcon={
                        <img
                          src="https://github.com/favicon.ico"
                          alt="GitHub"
                          style={{ width: 20, height: 20 }}
                        />
                      }
                      disabled={loading}
                    >
                      Continue with GitHub
                    </SocialButton>
                  </Box>

                  {/* Sign Up Link */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        color: alpha('#1A1A1A', 0.6),
                      }}
                    >
                      Don't have an account?{' '}
                      <Link
                        href="/register"
                        sx={{
                          color: '#8C5A3C',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Create Account
                      </Link>
                    </Typography>
                  </Box>

                  {/* Company Trust Badge */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        color: alpha('#1A1A1A', 0.4),
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <span>🔒</span>
                      Protected by enterprise-grade encryption
                      <span>🔒</span>
                    </Typography>
                  </Box>
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