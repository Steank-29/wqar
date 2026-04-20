import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Paper, Alert, Snackbar,
  useMediaQuery, useTheme, alpha, styled, InputAdornment, IconButton,
  MenuItem, FormControl, InputLabel, Select, FormHelperText, Avatar,
  CircularProgress, Grid, Divider, Chip
} from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff,
  PersonAdd as PersonAddIcon, Person as PersonIcon, Phone as PhoneIcon,
  CalendarToday as CalendarIcon, AdminPanelSettings as AdminIcon,
  CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon,
  Security as SecurityIcon, VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '@fontsource/oswald';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    '& fieldset': { borderColor: alpha('#8C5A3C', 0.2), borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: alpha('#8C5A3C', 0.5) },
    '&.Mui-focused fieldset': { borderColor: '#8C5A3C', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Oswald, sans-serif',
    color: alpha('#1A1A1A', 0.6),
    '&.Mui-focused': { color: '#8C5A3C' },
  },
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#8C5A3C',
  color: '#FFFFFF',
  borderRadius: '60px',
  padding: '14px 40px',
  fontFamily: 'Oswald, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  '&:hover': { backgroundColor: '#6B4423', transform: 'translateY(-2px)' },
}));

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'Profile picture must be less than 5MB', severity: 'error' });
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth required';
    if (!formData.gender) newErrors.gender = 'Gender required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword' && formData[key]) {
          formDataToSend.append(key, formData[key].trim());
        }
      });
      if (profilePicture) formDataToSend.append('profilePicture', profilePicture);
      
      // Add a special flag to indicate this should be a super admin
      formDataToSend.append('isFirstUser', 'true');
      
      const API_BASE = import.meta.env.VITE_API_URL || 'https://wqar-api.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setSnackbar({ 
        open: true, 
        message: '✅ Super Admin account created successfully! Please login.', 
        severity: 'success' 
      });
      
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F9F6F1', minHeight: '100vh', py: { xs: 4, sm: 6, md: 8 }, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={0} sx={{ borderRadius: '32px', p: { xs: 3, sm: 5 }, background: '#FFFFFF', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: alpha('#8C5A3C', 0.1), px: 2, py: 1, borderRadius: '60px', mb: 3 }}>
                <SecurityIcon sx={{ color: '#8C5A3C' }} />
                <Typography variant="caption" sx={{ fontFamily: 'Oswald', color: '#8C5A3C', fontWeight: 500 }}>FIRST TIME SETUP</Typography>
              </Box>
              
              <Typography variant="h2" sx={{ fontFamily: 'Oswald', fontWeight: 700, color: '#1A1A1A', mb: 2, fontSize: { xs: '32px', md: '40px' } }}>
                Create Super Admin Account
              </Typography>
              
              <Typography variant="body1" sx={{ fontFamily: 'Roboto', color: alpha('#1A1A1A', 0.6) }}>
                This will create the first Super Administrator with full system access
              </Typography>
            </Box>

            {/* Profile Picture */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box textAlign="center">
                <Avatar src={profilePreview} sx={{ width: 100, height: 100, mb: 2, bgcolor: alpha('#8C5A3C', 0.1), border: `2px solid ${alpha('#8C5A3C', 0.3)}` }}>
                  {!profilePreview && <AdminIcon sx={{ fontSize: 50, color: '#8C5A3C' }} />}
                </Avatar>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: '60px', borderColor: '#8C5A3C', color: '#8C5A3C' }}>
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handleProfilePictureChange} />
                </Button>
              </Box>
            </Box>

            <form onSubmit={handleRegister}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} disabled={loading} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} disabled={loading} />
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} disabled={loading} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#8C5A3C' }} /></InputAdornment> }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} disabled={loading} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField fullWidth label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} disabled={loading} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth} disabled={loading} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender" disabled={loading} sx={{ borderRadius: '16px' }}>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} error={!!errors.phoneNumber} helperText={errors.phoneNumber} disabled={loading} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#8C5A3C' }} /></InputAdornment> }} />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <RegisterButton type="submit" disabled={loading} fullWidth startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}>
                {loading ? 'Creating Super Admin...' : 'Create Super Admin Account'}
              </RegisterButton>
            </form>
          </Paper>
        </motion.div>
      </Container>
      
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '16px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;