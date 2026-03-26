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
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import '@fontsource/oswald';


const FormContainer = styled(Paper)(({ theme }) => ({
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
  '& .MuiInputBase-multiline': {
    padding: '12px 14px',
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
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
  '&:hover': {
    backgroundColor: '#6B4423',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(140, 90, 60, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-+()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Contact Form Submitted:', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setLoading(false);
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
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
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <FormContainer elevation={0}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
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
                CONTACT US
              </Typography>
              
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  mb: 2,
                  fontSize: { xs: '32px', sm: '40px', md: '48px' },
                  letterSpacing: '-0.5px',
                }}
              >
                Let's Talk
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  color: alpha('#1A1A1A', 0.6),
                  maxWidth: '450px',
                  mx: 'auto',
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
              >
                Have a question about our fragrances? We'd love to hear from you.
              </Typography>
            </Box>

            {/* Form */}
            <motion.div variants={formVariants}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <StyledTextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="hello@wqar.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    fullWidth
                    label="Your Message"
                    name="message"
                    multiline
                    rows={5}
                    placeholder="Tell us about your fragrance preferences or any questions you have..."
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={errors.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <MessageIcon sx={{ color: '#8C5A3C', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <SubmitButton
                      type="submit"
                      disabled={loading}
                      startIcon={loading ? null : <SendIcon />}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </SubmitButton>
                  </Box>

                  {/* Trust Badge */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        color: alpha('#1A1A1A', 0.4),
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <span>✨</span>
                      We typically respond within 24 hours
                      <span>✨</span>
                    </Typography>
                  </Box>
                </Box>
              </form>
            </motion.div>
          </FormContainer>
        </motion.div>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={submitted}
        autoHideDuration={5000}
        onClose={() => setSubmitted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSubmitted(false)}
          severity="success"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{
            borderRadius: '16px',
            fontFamily: 'Oswald, sans-serif',
            bgcolor: '#8C5A3C',
            color: '#FFFFFF',
            '& .MuiAlert-icon': {
              color: '#FFFFFF',
            },
            '& .MuiAlert-message': {
              fontFamily: 'Oswald, sans-serif',
            },
          }}
        >
          Thank you! We'll get back to you soon. 
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;