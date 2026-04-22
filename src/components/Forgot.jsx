import React, { useState, useEffect } from 'react';
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
  Link,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../components/LanguageContext';
import '@fontsource/oswald';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Styled Components matching the login theme
const ForgotContainer = styled(Paper)(({ theme }) => ({
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

const ActionButton = styled(Button)(({ theme }) => ({
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

const VerificationCodeInput = styled(TextField)(({ theme }) => ({
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
  '& .MuiInputBase-input': {
    fontFamily: 'Oswald, sans-serif',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '8px',
    padding: '14px',
  },
}));

const Forgot = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Verify Email', 'Enter Code', 'Reset Password'];
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  // Countdown timer for resend code
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Step 1 (Email)
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2 (Verification Code)
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Code must be 6 digits';
    } else if (!/^\d+$/.test(formData.verificationCode)) {
      newErrors.verificationCode = 'Code must contain only numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 3 (New Password)
  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Send verification code to email
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }
    
    setSendingCode(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://wqar-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      
      // Store user ID for later use
      setUserId(data.userId);
      
      setSnackbar({
        open: true,
        message: `Verification code sent to ${formData.email}`,
        severity: 'success',
      });
      
      // Start countdown for resend (60 seconds)
      setCountdown(60);
      setCanResend(false);
      
      // Move to next step
      setActiveStep(1);
      
    } catch (error) {
      console.error('Send code error:', error);
      
      setSnackbar({
        open: true,
        message: error.message || 'Email not found. Please check and try again.',
        severity: 'error',
      });
    } finally {
      setSendingCode(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (!canResend) return;
    
    setSendingCode(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://wqar-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/users/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          userId: userId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }
      
      setSnackbar({
        open: true,
        message: 'New verification code sent!',
        severity: 'success',
      });
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      
    } catch (error) {
      console.error('Resend code error:', error);
      
      setSnackbar({
        open: true,
        message: error.message || 'Failed to resend code',
        severity: 'error',
      });
    } finally {
      setSendingCode(false);
    }
  };

  // Step 2: Verify the code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setVerifyingCode(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://wqar-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/users/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          code: formData.verificationCode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }
      
      // Store reset token for password update
      setResetToken(data.resetToken);
      setEmailVerified(true);
      
      setSnackbar({
        open: true,
        message: 'Code verified successfully!',
        severity: 'success',
      });
      
      // Move to next step
      setActiveStep(2);
      
    } catch (error) {
      console.error('Code verification error:', error);
      
      setSnackbar({
        open: true,
        message: error.message || 'Invalid or expired code',
        severity: 'error',
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://wqar-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          resetToken: resetToken,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
      
      setSnackbar({
        open: true,
        message: 'Password reset successful! Redirecting to login...',
        severity: 'success',
      });
      
      // Clear form data
      setFormData({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reset password. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate('/login');
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

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div variants={formVariants}>
            <form onSubmit={handleSendVerificationCode}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    color: alpha('#1A1A1A', 0.7),
                    fontSize: '14px',
                    textAlign: 'center',
                    mb: 2,
                  }}
                >
                  Enter your email address and we'll send you a verification code to reset your password.
                </Typography>
                
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={sendingCode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <ActionButton
                  type="submit"
                  disabled={sendingCode}
                  startIcon={sendingCode ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                >
                  {sendingCode ? 'Sending...' : 'Send Verification Code'}
                </ActionButton>
              </Box>
            </form>
          </motion.div>
        );
        
      case 1:
        return (
          <motion.div variants={formVariants}>
            <form onSubmit={handleVerifyCode}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <MarkEmailReadIcon sx={{ color: '#8C5A3C', fontSize: '28px' }} />
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      color: alpha('#1A1A1A', 0.7),
                      fontSize: '14px',
                    }}
                  >
                    Code sent to: <strong>{formData.email}</strong>
                  </Typography>
                </Box>
                
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    color: alpha('#1A1A1A', 0.6),
                    fontSize: '13px',
                    textAlign: 'center',
                  }}
                >
                  Please enter the 6-digit verification code
                </Typography>
                
                <VerificationCodeInput
                  fullWidth
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  error={!!errors.verificationCode}
                  helperText={errors.verificationCode}
                  disabled={verifyingCode}
                  placeholder="000000"
                  inputProps={{
                    maxLength: 6,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <ActionButton
                  type="submit"
                  disabled={verifyingCode}
                  startIcon={verifyingCode ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                >
                  {verifyingCode ? 'Verifying...' : 'Verify Code'}
                </ActionButton>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      color: alpha('#1A1A1A', 0.5),
                      fontSize: '13px',
                      mb: 1,
                    }}
                  >
                    Didn't receive the code?
                  </Typography>
                  
                  {countdown > 0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        color: '#8C5A3C',
                        fontSize: '14px',
                      }}
                    >
                      Resend in {countdown}s
                    </Typography>
                  ) : (
                    <Link
                      component="button"
                      type="button"
                      onClick={handleResendCode}
                      disabled={!canResend || sendingCode}
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '14px',
                        color: '#8C5A3C',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                        '&.Mui-disabled': {
                          color: alpha('#8C5A3C', 0.5),
                        },
                      }}
                    >
                      {sendingCode ? 'Sending...' : 'Resend Code'}
                    </Link>
                  )}
                </Box>
              </Box>
            </form>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div variants={formVariants}>
            <form onSubmit={handleResetPassword}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 2,
                    p: 1.5,
                    bgcolor: alpha('#4CAF50', 0.1),
                    borderRadius: '60px',
                  }}
                >
                  <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: '20px' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      color: '#4CAF50',
                      fontSize: '14px',
                    }}
                  >
                    Email verified successfully!
                  </Typography>
                </Box>
                
                <StyledTextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
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
                
                <StyledTextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: alpha('#1A1A1A', 0.5) }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <ActionButton
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </ActionButton>
              </Box>
            </form>
          </motion.div>
        );
        
      default:
        return null;
    }
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
          <ForgotContainer elevation={0}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {/* Back button */}
              <Button
                onClick={handleBackToLogin}
                startIcon={<ArrowBackIcon />}
                sx={{
                  position: 'absolute',
                  left: 24,
                  top: 24,
                  fontFamily: 'Oswald, sans-serif',
                  color: alpha('#1A1A1A', 0.6),
                  '&:hover': {
                    color: '#8C5A3C',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Back
              </Button>
              
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
                <LockIcon sx={{ fontSize: 32, color: '#8C5A3C' }} />
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
                Password Recovery
              </Typography>
              
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  mb: 2,
                  fontSize: { xs: '28px', sm: '32px', md: '36px' },
                  letterSpacing: '-0.5px',
                }}
              >
                Forgot Password
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
                We'll help you reset your password and get back to your account
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
                Secure Password Recovery
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-label': {
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '13px',
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: '#8C5A3C',
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#8C5A3C',
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Form Content */}
            {renderStepContent()}
          </ForgotContainer>
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

export default Forgot;