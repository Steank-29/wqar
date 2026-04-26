import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Rating,
  Chip,
  Divider,
  TextField,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ShoppingBag,
  Favorite,
  FavoriteBorder,
  LocalShipping,
  Verified,
  ArrowBack,
  CheckCircle,
  Close,
  Share,
  Security,
  Refresh,
  Add,
  Remove,
  Inventory,
  Timeline,
  Shield,
  CreditCard,
  LocalOffer,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import { useTranslation } from 'react-i18next';
import { getProductById } from '../services/productService';

const COLORS = {
  primary: '#8C5A3C',
  primaryLight: '#B07850',
  primaryDark: '#5C3520',
  secondary: '#D4A574',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
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

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${cleanBaseUrl}/${cleanPath}`;
};

// Helper function to get product price for a specific size
const getProductPrice = (product, size) => {
  if (!product) return null;
  
  // Check prices object (new structure)
  if (product.prices && product.prices[size]) {
    return product.prices[size];
  }
  
  // Check currentPrices (from API response)
  if (product.currentPrices && product.currentPrices[size]) {
    return product.currentPrices[size];
  }
  
  // Fallback to legacy price
  return product.price || null;
};

// Helper function to get all available sizes with prices
const getAvailableSizes = (product) => {
  if (!product) return [];
  
  const sizes = product.quantity || [];
  const availableSizes = [];
  
  for (const size of sizes) {
    const price = getProductPrice(product, size);
    if (price !== null && price !== undefined) {
      availableSizes.push(size);
    }
  }
  
  return availableSizes;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderStep, setOrderStep] = useState(0);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash_on_delivery',
    notes: ''
  });

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Update price when selected size changes
  useEffect(() => {
    if (product && selectedSize) {
      const price = getProductPrice(product, selectedSize);
      setCurrentPrice(price);
    }
  }, [product, selectedSize]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await getProductById(id);
      const productData = response.data;
      setProduct(productData);
      
      // Get available sizes with prices
      const sizes = getAvailableSizes(productData);
      setAvailableSizes(sizes);
      
      // Set default selected size (first available size)
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
        const price = getProductPrice(productData, sizes[0]);
        setCurrentPrice(price);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setSnackbar({ open: true, message: 'Error loading product', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  const handleOrderFormChange = (field, value) => {
    setOrderForm({ ...orderForm, [field]: value });
  };

  const handleNextStep = () => {
    if (orderStep === 0) {
      if (!orderForm.fullName || !orderForm.email || !orderForm.phone) {
        setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
        return;
      }
      if (!orderForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setSnackbar({ open: true, message: 'Please enter a valid email', severity: 'error' });
        return;
      }
    } else if (orderStep === 1) {
      if (!orderForm.address || !orderForm.city) {
        setSnackbar({ open: true, message: 'Please fill address details', severity: 'error' });
        return;
      }
    }
    setOrderStep(orderStep + 1);
  };

  const handlePrevStep = () => {
    setOrderStep(orderStep - 1);
  };

  const handleSubmitOrder = async () => {
    if (!selectedSize) {
      setSnackbar({ open: true, message: 'Please select a size', severity: 'error' });
      return;
    }

    if (!currentPrice) {
      setSnackbar({ open: true, message: 'Price not available for selected size', severity: 'error' });
      return;
    }

    setOrderSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Format order data to match your backend API structure
      const orderData = {
        items: [{
          productId: product._id,
          variantKey: `${product._id}_${selectedSize}`,
          name: product.name,
          price: currentPrice,
          originalPrice: product.prices?.[selectedSize] || currentPrice,
          quantity: quantity,
          selectedSize: selectedSize,
          mainImage: product.images?.[0]?.url || null
        }],
        customer: {
          fullName: orderForm.fullName,
          email: orderForm.email,
          phone: orderForm.phone,
          address: orderForm.address,
          city: orderForm.city,
          postalCode: orderForm.postalCode
        },
        subtotal: currentPrice * quantity,
        shippingCost: 0,
        total: currentPrice * quantity,
        paymentMethod: orderForm.paymentMethod,
        notes: orderForm.notes
      };
      
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }
      
      setOrderNumber(data.order?.orderNumber || data.order?.id);
      setOrderSuccess(true);
      
      setTimeout(() => {
        setOrderDialogOpen(false);
        setOrderStep(0);
        setOrderSuccess(false);
        setOrderForm({
          fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', paymentMethod: 'cash_on_delivery', notes: ''
        });
        setQuantity(1);
        
        setSnackbar({ 
          open: true, 
          message: `Order placed successfully! Order #${data.order?.orderNumber || 'N/A'}`, 
          severity: 'success' 
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Error placing order. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: COLORS.gray50 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ bgcolor: COLORS.gray50, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Inter' }}>Product not found</Typography>
          <Button onClick={() => navigate('/')} variant="contained" sx={{ bgcolor: COLORS.primary, borderRadius: '40px' }}>
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  // Calculate discount (if discountedPrice is set on product level)
  const discount = product.discountedPrice && currentPrice 
    ? Math.round(((currentPrice - product.discountedPrice) / currentPrice) * 100)
    : 0;
  const finalPrice = discount > 0 ? product.discountedPrice : currentPrice;
  const isOutOfStock = product.stock === 0;
  const mainImage = product.images?.[activeImage]?.url 
    ? getFullImageUrl(product.images[activeImage].url)
    : '/placeholder-image.jpg';

  return (
    <Box sx={{ bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, color: COLORS.gray600 }}>
          <Link 
            href="/" 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ textDecoration: 'none', color: COLORS.gray600, '&:hover': { color: COLORS.primary } }}
          >
            Home
          </Link>
          <Link 
            href="/collection" 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ textDecoration: 'none', color: COLORS.gray600, '&:hover': { color: COLORS.primary } }}
          >
            Collection
          </Link>
          <Typography color={COLORS.primary} sx={{ fontWeight: 500 }}>{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={5}>
          {/* Product Images - Left Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Main Image */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  bgcolor: COLORS.white,
                  border: `1px solid ${COLORS.gray200}`,
                  mb: 2,
                  position: 'relative',
                }}
              >
                {!imageLoaded && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                  }}>
                    <CircularProgress size={40} sx={{ color: COLORS.primary }} />
                  </Box>
                )}
                <img
                  src={mainImage}
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxHeight: '500px',
                    objectFit: 'contain',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    cursor: 'zoom-in',
                  }}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => { e.target.src = '/placeholder-image.jpg'; setImageLoaded(true); }}
                />
              </Paper>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1, justifyContent: 'center' }}>
                  {product.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Paper
                        elevation={0}
                        onClick={() => { setActiveImage(idx); setImageLoaded(false); }}
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: activeImage === idx ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}`,
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: COLORS.primary },
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={getFullImageUrl(img.url)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                        />
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          {/* Product Info - Right Column */}
          <Grid item xs={12} md={6}>
            {/* Badges */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {product.featured && (
                <Chip 
                  label="Featured" 
                  size="small" 
                  sx={{ bgcolor: COLORS.warning, color: COLORS.white, fontWeight: 500, borderRadius: '20px' }} 
                />
              )}
              {discount > 0 && (
                <Chip 
                  label={`${discount}% OFF`} 
                  size="small" 
                  sx={{ bgcolor: COLORS.success, color: COLORS.white, fontWeight: 500, borderRadius: '20px' }} 
                />
              )}
              {product.stock < 10 && product.stock > 0 && (
                <Chip 
                  label={`Only ${product.stock} left`} 
                  size="small" 
                  sx={{ bgcolor: COLORS.error, color: COLORS.white, fontWeight: 500, borderRadius: '20px' }} 
                />
              )}
            </Stack>

            {/* Title */}
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1.5, 
                fontFamily: 'Oswald',
                letterSpacing: '-0.02em',
                color: COLORS.gray900,
              }}
            >
              {product.name}
            </Typography>
            
            {/* Rating */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Rating value={product.rating || 0} readOnly precision={0.5} size="small" />
              <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                {product.reviewCount || 0} reviews
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: COLORS.gray400 }} />
              <Chip
                label={product.gender?.toUpperCase()}
                size="small"
                sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 500, borderRadius: '20px' }}
              />
            </Stack>

            {/* Price - Updated for multiple sizes */}
            <Box sx={{ mb: 3 }}>
              {discount > 0 ? (
                <Stack direction="row" alignItems="baseline" spacing={2}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 800, 
                      color: COLORS.primary, 
                      fontFamily: 'Oswald',
                      fontSize: { xs: '36px', md: '48px' },
                    }}
                  >
                    {finalPrice} TND
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      textDecoration: 'line-through', 
                      color: COLORS.gray400,
                      fontWeight: 400,
                    }}
                  >
                    {currentPrice} TND
                  </Typography>
                </Stack>
              ) : (
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 800, 
                    color: COLORS.primary, 
                    fontFamily: 'Oswald',
                    fontSize: { xs: '36px', md: '48px' },
                  }}
                >
                  {currentPrice} TND
                </Typography>
              )}
              {selectedSize && (
                <Typography variant="caption" sx={{ color: COLORS.gray500, display: 'block', mt: 0.5 }}>
                  Price for {selectedSize}
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: COLORS.gray700, 
                lineHeight: 1.8,
                fontFamily: 'Inter',
              }}
            >
              {product.description || product.fragrance}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Fragrance Notes */}
            {product.fragrance && (
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1.5, 
                    fontFamily: 'Oswald',
                    letterSpacing: '0.02em',
                  }}
                >
                  Fragrance Profile
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: COLORS.gray600,
                    fontFamily: 'Inter',
                    lineHeight: 1.6,
                  }}
                >
                  {product.fragrance}
                </Typography>
              </Box>
            )}

            {/* Size Selection - Only show sizes that have prices */}
            {availableSizes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1.5, 
                    fontFamily: 'Oswald',
                  }}
                >
                  Select Size
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {availableSizes.map((size) => {
                    const sizePrice = getProductPrice(product, size);
                    return (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSize(size)}
                        disabled={isOutOfStock}
                        sx={{
                          borderRadius: '40px',
                          px: 3.5,
                          py: 1,
                          minWidth: '80px',
                          bgcolor: selectedSize === size ? COLORS.primary : 'transparent',
                          borderColor: selectedSize === size ? COLORS.primary : COLORS.gray300,
                          color: selectedSize === size ? COLORS.white : COLORS.gray700,
                          fontFamily: 'Inter',
                          fontWeight: 600,
                          flexDirection: 'column',
                          '&:hover': {
                            bgcolor: selectedSize === size ? COLORS.primaryDark : alpha(COLORS.primary, 0.05),
                            borderColor: COLORS.primary,
                          },
                        }}
                      >
                        <span>{size}</span>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '10px',
                            color: selectedSize === size ? alpha(COLORS.white, 0.8) : COLORS.gray500,
                          }}
                        >
                          {sizePrice} TND
                        </Typography>
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Quantity */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1.5, 
                  fontFamily: 'Oswald',
                }}
              >
                Quantity
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${COLORS.gray200}`,
                    borderRadius: '40px',
                    bgcolor: COLORS.white,
                  }}
                >
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    sx={{ borderRadius: '40px', px: 1.5 }}
                  >
                    <Remove sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography sx={{ minWidth: 50, textAlign: 'center', fontWeight: 600 }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 99) || isOutOfStock}
                    sx={{ borderRadius: '40px', px: 1.5 }}
                  >
                    <Add sx={{ fontSize: 18 }} />
                  </IconButton>
                </Paper>
                <Typography variant="body2" sx={{ color: COLORS.gray500 }}>
                  {product.stock} available
                </Typography>
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingBag />}
                onClick={() => setOrderDialogOpen(true)}
                disabled={isOutOfStock || !selectedSize}
                sx={{
                  bgcolor: COLORS.primary,
                  '&:hover': { bgcolor: COLORS.primaryDark },
                  borderRadius: '40px',
                  py: 1.5,
                  fontFamily: 'Oswald',
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textTransform: 'none',
                }}
              >
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </Button>
              
              <IconButton
                onClick={() => setWishlisted(!wishlisted)}
                sx={{
                  border: `1px solid ${COLORS.gray200}`,
                  borderRadius: '40px',
                  width: 56,
                  height: 56,
                  '&:hover': { borderColor: COLORS.primary, bgcolor: alpha(COLORS.primary, 0.05) },
                }}
              >
                {wishlisted ? <Favorite sx={{ color: COLORS.error }} /> : <FavoriteBorder sx={{ color: COLORS.gray600 }} />}
              </IconButton>
            </Stack>

            {/* Shipping Info Cards */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    bgcolor: COLORS.white,
                    border: `1px solid ${COLORS.gray100}`,
                    textAlign: 'center',
                  }}
                >
                  <LocalShipping sx={{ color: COLORS.primary, fontSize: 24, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ display: 'block', color: COLORS.gray700, fontWeight: 500 }}>
                    Free Shipping
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.gray500, fontSize: '10px' }}>
                    on orders over 100 TND
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    bgcolor: COLORS.white,
                    border: `1px solid ${COLORS.gray100}`,
                    textAlign: 'center',
                  }}
                >
                  <Verified sx={{ color: COLORS.primary, fontSize: 24, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ display: 'block', color: COLORS.gray700, fontWeight: 500 }}>
                    Authentic
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.gray500, fontSize: '10px' }}>
                    100% genuine products
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Order Dialog */}
      <Dialog 
        open={orderDialogOpen} 
        onClose={() => !orderSubmitting && setOrderDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', overflow: 'hidden', maxWidth: 550, mx: 'auto' }
        }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.primary, color: COLORS.white, py: 2.5, px: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Oswald', letterSpacing: '0.02em' }}>
              Complete Your Order
            </Typography>
            <IconButton onClick={() => setOrderDialogOpen(false)} sx={{ color: COLORS.white }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {!orderSuccess ? (
            <>
              {/* Order Summary - Updated to show size-specific price */}
              <Card sx={{ mb: 3, bgcolor: COLORS.gray50, borderRadius: '16px', elevation: 0, border: `1px solid ${COLORS.gray200}` }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, fontFamily: 'Oswald' }}>
                    Order Summary
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: COLORS.gray700 }}>{product.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{currentPrice} TND</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: COLORS.gray700 }}>Size: {selectedSize}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>x{quantity}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.primary }}>
                      {(currentPrice * quantity).toFixed(2)} TND
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Stepper */}
              <Stepper activeStep={orderStep} sx={{ mb: 3 }}>
                <Step><StepLabel>Info</StepLabel></Step>
                <Step><StepLabel>Address</StepLabel></Step>
                <Step><StepLabel>Payment</StepLabel></Step>
              </Stepper>

              {/* Step 1: Contact Info */}
              {orderStep === 0 && (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={orderForm.fullName}
                    onChange={(e) => handleOrderFormChange('fullName', e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={orderForm.email}
                    onChange={(e) => handleOrderFormChange('email', e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={orderForm.phone}
                    onChange={(e) => handleOrderFormChange('phone', e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>
              )}

              {/* Step 2: Shipping Address */}
              {orderStep === 1 && (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Address *"
                    value={orderForm.address}
                    onChange={(e) => handleOrderFormChange('address', e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    label="City *"
                    value={orderForm.city}
                    onChange={(e) => handleOrderFormChange('city', e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={orderForm.postalCode}
                    onChange={(e) => handleOrderFormChange('postalCode', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>
              )}

              {/* Step 3: Payment */}
              {orderStep === 2 && (
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Payment Method</Typography>
                  <RadioGroup
                    value={orderForm.paymentMethod}
                    onChange={(e) => handleOrderFormChange('paymentMethod', e.target.value)}
                  >
                    <FormControlLabel 
                      value="cash_on_delivery" 
                      control={<Radio />} 
                      label="Cash on Delivery (Pay when you receive)" 
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel 
                      value="bank_transfer" 
                      control={<Radio />} 
                      label="Bank Transfer (You will receive bank details)" 
                    />
                  </RadioGroup>
                  
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={3}
                    value={orderForm.notes}
                    onChange={(e) => handleOrderFormChange('notes', e.target.value)}
                    placeholder="Any special requests or notes for delivery..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Stack>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <CheckCircle sx={{ fontSize: 80, color: COLORS.success, mb: 2 }} />
              </motion.div>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Oswald' }}>
                Order Placed Successfully!
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Order #{orderNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Thank you for your purchase. We will contact you within 24 hours to confirm your order.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLORS.gray100}` }}>
          {!orderSuccess && (
            <>
              {orderStep > 0 && (
                <Button onClick={handlePrevStep} variant="outlined" sx={{ borderRadius: '40px' }}>
                  Back
                </Button>
              )}
              {orderStep < 2 ? (
                <Button 
                  onClick={handleNextStep} 
                  variant="contained" 
                  sx={{ bgcolor: COLORS.primary, borderRadius: '40px', px: 4, '&:hover': { bgcolor: COLORS.primaryDark } }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  variant="contained"
                  disabled={orderSubmitting}
                  sx={{ bgcolor: COLORS.primary, borderRadius: '40px', px: 4, '&:hover': { bgcolor: COLORS.primaryDark } }}
                >
                  {orderSubmitting ? <CircularProgress size={24} sx={{ color: COLORS.white }} /> : 'Place Order'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetail;