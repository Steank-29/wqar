import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Badge,
  Zoom,
  alpha,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Payment,
  CheckCircle,
  ArrowBack,
  WhatsApp,
  Phone,
  Email,
  Person,
  Home,
  CreditCard,
  LocalOffer,
  Security,
  Verified,
  Inventory,
  ChevronRight,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/oswald';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const COLORS = {
  primary: '#1A1A1A',
  secondary: '#8C5A3C',
  accent: '#D4A574',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, shippingCost, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash_on_delivery',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!formData.phone.match(/^[\d\s+()-]{8,}$/)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill all required fields correctly', 
        severity: 'error' 
      });
      return;
    }

    setSubmitting(true);
    try {
      // Prepare order data for API
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId || item._id,
          variantKey: item.variantKey,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          mainImage: item.mainImage
        })),
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };
      
      // Make API call to backend
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }
      
      // Store order details for success page
      setOrderDetails(data.order);
      setOrderSuccess(true);
      clearCart();
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
      
    } catch (error) {
      console.error('Order error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error placing order. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSavings = () => {
    const originalTotal = cart.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
    return originalTotal - subtotal;
  };

  if (cart.length === 0 && !orderSuccess) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: COLORS.gray50 
      }}>
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: '32px',
                border: `1px solid ${COLORS.gray200}`,
                bgcolor: COLORS.white,
              }}
            >
              <Box sx={{ 
                width: 120, 
                height: 120, 
                borderRadius: '60px',
                bgcolor: alpha(COLORS.secondary, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <ShoppingCart sx={{ fontSize: 60, color: COLORS.secondary }} />
              </Box>
              <Typography variant="h4" sx={{ mb: 2, fontFamily: 'Oswald', fontWeight: 700 }}>
                Your Cart is Empty
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: COLORS.gray600 }}>
                Looks like you haven't added any items yet. Explore our collection and find something you'll love!
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/products')}
                sx={{ 
                  bgcolor: COLORS.primary,
                  borderRadius: '50px',
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: COLORS.gray800,
                  }
                }}
              >
                Start Shopping
              </Button>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  if (orderSuccess) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: COLORS.gray50 
      }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 8, 
                textAlign: 'center', 
                borderRadius: '32px',
                border: `1px solid ${COLORS.gray200}`,
                bgcolor: COLORS.white,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '100px',
                  bgcolor: alpha(COLORS.success, 0.05),
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 150,
                  height: 150,
                  borderRadius: '75px',
                  bgcolor: alpha(COLORS.secondary, 0.05),
                }}
              />
              
              <Zoom in={true} timeout={500}>
                <Box sx={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50px',
                  bgcolor: alpha(COLORS.success, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <CheckCircle sx={{ fontSize: 60, color: COLORS.success }} />
                </Box>
              </Zoom>
              
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Oswald' }}>
                Order Confirmed!
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: COLORS.gray600 }}>
                Order #{orderDetails?.orderNumber || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: COLORS.gray600 }}>
                Thank you for your purchase, {formData.fullName}! We've sent a confirmation to {formData.email} and will contact you via WhatsApp within 24 hours.
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  sx={{ 
                    borderRadius: '50px',
                    px: 4,
                    py: 1.5,
                    borderColor: COLORS.gray300,
                    color: COLORS.gray700,
                    '&:hover': {
                      borderColor: COLORS.primary,
                      bgcolor: alpha(COLORS.primary, 0.05),
                    }
                  }}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Inventory />}
                  onClick={() => navigate(`/order-tracking/${orderDetails?.orderNumber}`)}
                  sx={{ 
                    bgcolor: COLORS.primary,
                    borderRadius: '50px',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: COLORS.gray800,
                    }
                  }}
                >
                  Track Order
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      {/* Company Header Banner */}
      <Box sx={{ 
        bgcolor: COLORS.white, 
        color: COLORS.gray700,
        py: 1.5,
        borderBottom: `1px solid ${COLORS.gray200}`
      }}>
        <Container maxWidth="xl">
          <Stack 
            direction="row" 
            justifyContent="center" 
            alignItems="center"
            spacing={6}
            sx={{ fontSize: '0.875rem' }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalShipping sx={{ fontSize: 18, color: COLORS.secondary }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Free Shipping Over 200 TND</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Verified sx={{ fontSize: 18, color: COLORS.secondary }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Authentic Products</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WhatsApp sx={{ fontSize: 18, color: '#25D366' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>+216 XX XXX XXX</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Email sx={{ fontSize: 18, color: COLORS.secondary }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>support@company.com</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{ 
              mb: 3, 
              color: COLORS.gray700,
              '&:hover': {
                bgcolor: alpha(COLORS.secondary, 0.05),
              }
            }}
          >
            Back to Shopping
          </Button>

          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                fontFamily: 'Oswald',
                letterSpacing: '-0.02em',
                mb: 1
              }}
            >
              Secure Checkout
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.gray600 }}>
              Complete your purchase with our secure checkout process
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Left Column - Form */}
            <Grid item xs={12} lg={7}>
              <Stack spacing={3} alignItems="center">
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ width: '100%' }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      borderRadius: '24px',
                      border: `1px solid ${COLORS.gray200}`,
                      bgcolor: COLORS.white,
                      width: '100%',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '12px',
                        bgcolor: alpha(COLORS.secondary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Person sx={{ color: COLORS.secondary }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Inter' }}>
                          Contact Information
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                          We'll send order updates to these details
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          error={!!errors.fullName}
                          helperText={errors.fullName}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              '&:hover fieldset': {
                                borderColor: COLORS.secondary,
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          error={!!errors.email}
                          helperText={errors.email}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          placeholder="+216 XX XXX XXX"
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ width: '100%' }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      borderRadius: '24px',
                      border: `1px solid ${COLORS.gray200}`,
                      bgcolor: COLORS.white,
                      width: '100%',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '12px',
                        bgcolor: alpha(COLORS.secondary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Home sx={{ color: COLORS.secondary }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Inter' }}>
                          Shipping Address
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                          Where should we deliver your order?
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          error={!!errors.address}
                          helperText={errors.address}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          error={!!errors.city}
                          helperText={errors.city}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Postal Code"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ width: '100%' }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      borderRadius: '24px',
                      border: `1px solid ${COLORS.gray200}`,
                      bgcolor: COLORS.white,
                      width: '100%',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '12px',
                        bgcolor: alpha(COLORS.secondary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CreditCard sx={{ color: COLORS.secondary }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Inter' }}>
                          Payment Method
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                          Cash on delivery only
                        </Typography>
                      </Box>
                    </Stack>

                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: '16px',
                        border: `2px solid ${COLORS.secondary}`,
                        bgcolor: alpha(COLORS.secondary, 0.02),
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '10px',
                          bgcolor: alpha(COLORS.success, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Payment sx={{ color: COLORS.success }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Cash on Delivery
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                            Pay with cash when your order arrives
                          </Typography>
                        </Box>
                        <CheckCircle sx={{ color: COLORS.success }} />
                      </Stack>
                    </Paper>

                    <TextField
                      fullWidth
                      label="Order Notes (Optional)"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Special delivery instructions or order notes..."
                      variant="outlined"
                      sx={{
                        mt: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Paper>
                </motion.div>
              </Stack>
            </Grid>

            {/* Right Column - Order Summary */}
            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    borderRadius: '24px',
                    border: `1px solid ${COLORS.gray200}`,
                    bgcolor: COLORS.white,
                    position: 'sticky',
                    top: 24,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Inter' }}>
                      Order Summary
                    </Typography>
                    <Chip 
                      label={`${cart.length} ${cart.length === 1 ? 'Item' : 'Items'}`}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(COLORS.secondary, 0.1),
                        color: COLORS.secondary,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  
                  <Stack spacing={3} sx={{ mb: 3, maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                    <AnimatePresence>
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.variantKey}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar
                                src={item.mainImage ? `https://wqar-api.onrender.com/${item.mainImage}` : null}
                                variant="rounded"
                                sx={{ 
                                  width: 70, 
                                  height: 70, 
                                  borderRadius: '12px',
                                  bgcolor: COLORS.gray100,
                                }}
                              >
                                {!item.mainImage && <Inventory sx={{ color: COLORS.gray400 }} />}
                              </Avatar>
                              {item.quantity > 1 && (
                                <Badge
                                  badgeContent={item.quantity}
                                  color="primary"
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      bgcolor: COLORS.secondary,
                                      color: COLORS.white,
                                      fontWeight: 600,
                                    }
                                  }}
                                />
                              )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                  {(item.price * item.quantity).toFixed(2)} TND
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ color: COLORS.gray500, display: 'block' }}>
                                Size: {item.selectedSize}
                              </Typography>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <Typography variant="caption" sx={{ color: COLORS.success }}>
                                  Save {(item.originalPrice - item.price).toFixed(2)} TND
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" sx={{ color: COLORS.gray600 }}>
                        Subtotal
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {subtotal.toFixed(2)} TND
                      </Typography>
                    </Stack>
                    
                    {calculateSavings() > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: COLORS.success }}>
                          Savings
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.success, fontWeight: 600 }}>
                          -{calculateSavings().toFixed(2)} TND
                        </Typography>
                      </Stack>
                    )}

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" sx={{ color: COLORS.gray600 }}>
                        Shipping
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: shippingCost === 0 ? COLORS.success : 'inherit' }}>
                        {shippingCost === 0 ? 'FREE' : `${shippingCost.toFixed(2)} TND`}
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Oswald' }}>
                        Total
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary, fontFamily: 'Oswald' }}>
                          {total.toFixed(2)} TND
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                          Including VAT
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    sx={{ 
                      mt: 4,
                      bgcolor: COLORS.primary,
                      borderRadius: '50px',
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: COLORS.gray800,
                      },
                      '&:disabled': {
                        bgcolor: COLORS.gray300,
                      }
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={24} sx={{ color: COLORS.white }} />
                    ) : (
                      <>
                        Place Order • {total.toFixed(2)} TND
                        <ChevronRight sx={{ ml: 1 }} />
                      </>
                    )}
                  </Button>

                  <Stack 
                    direction="row" 
                    spacing={2} 
                    justifyContent="center" 
                    sx={{ mt: 3 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Security sx={{ fontSize: 16, color: COLORS.success }} />
                      <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                        Secure Checkout
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Verified sx={{ fontSize: 16, color: COLORS.success }} />
                      <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                        Authentic Products
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <LocalOffer sx={{ fontSize: 16, color: COLORS.success }} />
                      <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                        Best Prices
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box sx={{ 
                    mt: 3, 
                    p: 2.5, 
                    borderRadius: '16px',
                    bgcolor: COLORS.gray50,
                    textAlign: 'center',
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                      Need Help?
                    </Typography>
                    <Stack spacing={1} alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <WhatsApp sx={{ fontSize: 18, color: '#25D366' }} />
                        <Typography variant="body2">WhatsApp: +216 XX XXX XXX</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Phone sx={{ fontSize: 18, color: COLORS.gray700 }} />
                        <Typography variant="body2">Call: +216 XX XXX XXX</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Email sx={{ fontSize: 18, color: COLORS.gray700 }} />
                        <Typography variant="body2">Email: support@company.com</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box sx={{ 
        bgcolor: COLORS.white,
        borderTop: `1px solid ${COLORS.gray200}`,
        mt: 6,
        py: 3,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              justifyContent="center" 
              alignItems="center"
              spacing={{ xs: 2, md: 6 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '20px',
                  bgcolor: alpha(COLORS.success, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle sx={{ color: COLORS.success, fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  100% Authentic Products
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '20px',
                  bgcolor: alpha(COLORS.secondary, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <LocalShipping sx={{ color: COLORS.secondary, fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Fast & Secure Delivery
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '20px',
                  bgcolor: alpha(COLORS.warning, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Payment sx={{ color: COLORS.warning, fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Secure Payment Methods
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;