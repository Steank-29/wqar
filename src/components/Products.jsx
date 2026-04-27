import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Rating,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Pagination,
  Skeleton,
  useMediaQuery,
  useTheme,
  Zoom,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Close,
  Favorite,
  FavoriteBorder,
  ClearAll,
  Add,
  Remove,
  Whatshot,
  LocalShipping,
  Verified,
} from '@mui/icons-material';
import { useLanguage } from '../components/LanguageContext';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import '@fontsource/oswald';

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
  if (!product) return 0;
  
  if (product.currentPrices && product.currentPrices[size]) {
    return product.currentPrices[size];
  }
  
  if (product.prices && product.prices[size]) {
    return product.prices[size];
  }
  
  if (product.prices) {
    const sizeMap = {
      '30ml': '30ml',
      '50ml': '50ml', 
      '100ml': '100ml'
    };
    const mappedSize = sizeMap[size];
    if (mappedSize && product.prices[mappedSize]) {
      return product.prices[mappedSize];
    }
  }
  
  return 0;
};

// Helper function to get all available sizes with prices
const getAvailableSizes = (product) => {
  if (!product) return [];
  
  const sizes = ['30ml', '50ml', '100ml'];
  const availableSizes = [];
  
  for (const size of sizes) {
    const price = getProductPrice(product, size);
    if (price !== null && price !== undefined && price > 0) {
      availableSizes.push(size);
    }
  }
  
  if (product.quantity && product.quantity.length > 0) {
    return product.quantity.filter(size => availableSizes.includes(size));
  }
  
  return availableSizes;
};

const Products = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  
  const { addToCart, updateQuantity, cart } = useCart();
  
  const [cartSnackbar, setCartSnackbar] = useState({ open: false, message: '' });
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceSize, setPriceSize] = useState('30ml');
  
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [priceRangeMax, setPriceRangeMax] = useState(500);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sizes = ['30ml', '50ml', '100ml'];

  // Load products on mount - FIXED to not cause infinite refresh
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters when dependencies change - FIXED with useCallback
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...products];

      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.fragrance?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedGender) {
        filtered = filtered.filter(p => p.gender === selectedGender);
      }

      filtered = filtered.filter(p => {
        const price = getProductPrice(p, priceSize);
        return price > 0 && price >= priceRange[0] && price <= priceRange[1];
      });

      if (selectedSizes.length > 0) {
        filtered = filtered.filter(p => {
          const availableSizes = getAvailableSizes(p);
          return selectedSizes.some(size => availableSizes.includes(size));
        });
      }

      if (inStockOnly) {
        filtered = filtered.filter(p => p.stock > 0);
      }

      switch (sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => getProductPrice(a, priceSize) - getProductPrice(b, priceSize));
          break;
        case 'price_desc':
          filtered.sort((a, b) => getProductPrice(b, priceSize) - getProductPrice(a, priceSize));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }

      setFilteredProducts(filtered);
      setPage(1);
    };

    applyFilters();
  }, [products, searchQuery, selectedGender, priceRange, selectedSizes, sortBy, inStockOnly, priceSize]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({ limit: 100 });
      const allProducts = response.data || [];
      setProducts(allProducts);
      
      let maxPrice = 0;
      allProducts.forEach(product => {
        const price30 = getProductPrice(product, '30ml');
        const price50 = getProductPrice(product, '50ml');
        const price100 = getProductPrice(product, '100ml');
        
        maxPrice = Math.max(maxPrice, price30, price50, price100);
      });
      
      const finalMaxPrice = Math.max(maxPrice, 500);
      setPriceRangeMax(finalMaxPrice);
      setPriceRange([0, finalMaxPrice]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGender('');
    setPriceRange([0, priceRangeMax]);
    setSelectedSizes([]);
    setSortBy('newest');
    setInStockOnly(false);
    setPriceSize('30ml');
  };

  const toggleWishlist = (e, productId) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
    setSnackbar({ 
      open: true, 
      message: wishlist[productId] ? 'Removed from wishlist' : 'Added to wishlist', 
      severity: 'success' 
    });
  };

  const handleAddToCart = (e, product, selectedSize) => {
    e.stopPropagation();
    const price = getProductPrice(product, selectedSize);
    if (price > 0) {
      addToCart(product, 1, selectedSize, price);
      setCartSnackbar({ 
        open: true, 
        message: `${product.name} (${selectedSize}) added to cart`
      });
    } else {
      setSnackbar({ 
        open: true, 
        message: `Price not available for ${selectedSize}`, 
        severity: 'error' 
      });
    }
  };

  const handleUpdateQuantity = (e, productId, size, delta) => {
    e.stopPropagation();
    const cartItem = cart.find(item => item._id === productId && item.selectedSize === size);
    if (cartItem) {
      updateQuantity(productId, cartItem.quantity + delta, size);
    }
  };

  const getCartItem = useCallback((productId, size) => {
    return cart.find(item => item._id === productId && item.selectedSize === size);
  }, [cart]);

  const getCurrentProducts = useMemo(() => {
    const startIndex = (page - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, page, productsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Product Card Component
  const ProductCard = useCallback(({ product }) => {
    const [hovered, setHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState(() => {
      const availableSizes = getAvailableSizes(product);
      return availableSizes[0] || '30ml';
    });
    
    const cartItem = getCartItem(product._id, selectedSize);
    const currentPrice = getProductPrice(product, selectedSize);
    const isOutOfStock = product.stock === 0;
    const availableSizes = getAvailableSizes(product);
    const isSizeAvailable = availableSizes.includes(selectedSize);
    
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const imageUrl = getFullImageUrl(primaryImage?.url);

    // Split fragrance notes into chips
    const fragranceNotes = product.fragrance?.split(',').map(note => note.trim()) || [];

    if (availableSizes.length === 0) return null;

    return (
      <Zoom in={true} style={{ transitionDelay: '30ms' }}>
        <Card
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          elevation={0}
          sx={{
            borderRadius: isMobile ? '20px' : '24px',
            overflow: 'hidden',
            bgcolor: COLORS.white,
            border: `1px solid ${hovered ? alpha(COLORS.primary, 0.3) : COLORS.gray200}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            height: '100%',
            minHeight: isMobile ? 480 : 520,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            cursor: 'pointer',
            '&:hover': {
              transform: isMobile ? 'translateY(-4px)' : 'translateY(-8px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              border: `1px solid ${alpha(COLORS.primary, 0.3)}`,
            },
          }}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 0.75, flexDirection: 'column' }}>
            {product.featured && (
              <Chip
                label="Featured"
                size="small"
                sx={{ 
                  bgcolor: COLORS.warning, 
                  color: COLORS.white, 
                  fontWeight: 700, 
                  fontSize: isMobile ? '9px' : '11px', 
                  height: isMobile ? 20 : 24,
                  borderRadius: '8px'
                }}
              />
            )}
          </Box>

          {/* Wishlist Button */}
          <IconButton
            onClick={(e) => toggleWishlist(e, product._id)}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(4px)',
              width: isMobile ? 32 : 36,
              height: isMobile ? 32 : 36,
              '&:hover': { bgcolor: COLORS.white, transform: 'scale(1.1)' },
              transition: 'transform 0.2s',
            }}
          >
            {wishlist[product._id] ? <Favorite sx={{ color: COLORS.error, fontSize: isMobile ? 16 : 18 }} /> : <FavoriteBorder sx={{ fontSize: isMobile ? 16 : 18 }} />}
          </IconButton>

          {/* Image Container */}
          <Box 
            sx={{ 
              position: 'relative', 
              height: isMobile ? 240 : isTablet ? 260 : 280,
              overflow: 'hidden', 
              bgcolor: COLORS.gray50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src={imageUrl || '/placeholder-image.jpg'}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
              onError={(e) => { 
                e.target.src = '/placeholder-image.jpg';
                e.target.style.objectFit = 'contain';
              }}
              loading="lazy"
            />
            {isOutOfStock && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(2px)',
              }}>
                <Chip 
                  label="Out of Stock" 
                  sx={{ 
                    bgcolor: COLORS.white, 
                    fontWeight: 700, 
                    fontSize: isMobile ? '11px' : '12px', 
                    borderRadius: '12px', 
                    height: isMobile ? 26 : 32,
                    px: 1
                  }} 
                />
              </Box>
            )}
          </Box>

          {/* Content */}
          <CardContent sx={{ p: isMobile ? 2 : 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Gender Chip */}
            <Chip
              label={product.gender?.toUpperCase()}
              size="small"
              sx={{ 
                bgcolor: alpha(COLORS.primary, 0.1), 
                color: COLORS.primary, 
                fontSize: isMobile ? '9px' : '10px', 
                fontWeight: 600,
                height: isMobile ? 20 : 24, 
                mb: 1,
                borderRadius: '6px',
                alignSelf: 'flex-start'
              }}
            />
            
            {/* Title */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '14px' : '16px',
                fontFamily: 'Oswald',
                mb: 1,
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: isMobile ? '44px' : '48px',
              }}
            >
              {product.name}
            </Typography>

            {/* Fragrance Notes as Chips - NEW */}
            {fragranceNotes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1, minHeight: '40px' }}>
                {fragranceNotes.slice(0, 3).map((note, idx) => (
                  <Chip
                    key={idx}
                    label={note}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: isMobile ? '8px' : '9px',
                      fontFamily: 'Oswald, sans-serif',
                      borderColor: alpha(COLORS.primary, 0.3),
                      color: alpha(COLORS.gray700, 0.8),
                      height: isMobile ? 22 : 24,
                    }}
                  />
                ))}
                {fragranceNotes.length > 3 && (
                  <Chip
                    label={`+${fragranceNotes.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: isMobile ? '8px' : '9px',
                      fontFamily: 'Oswald, sans-serif',
                      height: isMobile ? 22 : 24,
                    }}
                  />
                )}
              </Box>
            )}

            {/* Rating */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5, minHeight: '28px' }}>
              <Rating value={product.rating || 0} readOnly size="small" precision={0.5} sx={{ '& .MuiRating-icon': { fontSize: isMobile ? '14px' : '16px' } }} />
              <Typography variant="caption" sx={{ color: COLORS.gray500, fontSize: isMobile ? '10px' : '11px', fontWeight: 500 }}>
                ({product.reviewCount || 0})
              </Typography>
            </Stack>

            {/* Price - No discount display */}
            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2, minHeight: '36px' }}>
              <Typography sx={{ fontWeight: 800, fontSize: isMobile ? '20px' : '24px', color: COLORS.primary, fontFamily: 'Oswald' }}>
                {currentPrice} TND
              </Typography>
            </Stack>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1, minHeight: '36px' }}>
                {sizes.map((size) => {
                  const sizePrice = getProductPrice(product, size);
                  const isAvailable = sizePrice > 0 && availableSizes.includes(size);
                  
                  return (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'contained' : 'outlined'}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAvailable) {
                          setSelectedSize(size);
                        }
                      }}
                      disabled={!isAvailable}
                      sx={{
                        borderRadius: '8px',
                        fontSize: isMobile ? '10px' : '11px',
                        fontWeight: 600,
                        minWidth: isMobile ? '70px' : '80px',
                        py: isMobile ? 0.5 : 0.75,
                        bgcolor: selectedSize === size ? COLORS.primary : 'transparent',
                        borderColor: selectedSize === size ? COLORS.primary : COLORS.gray300,
                        color: selectedSize === size ? COLORS.white : (isAvailable ? COLORS.gray700 : COLORS.gray400),
                        opacity: isAvailable ? 1 : 0.5,
                        '&:hover': {
                          bgcolor: isAvailable && selectedSize !== size ? alpha(COLORS.primary, 0.1) : (selectedSize === size ? COLORS.primaryDark : 'transparent'),
                          borderColor: isAvailable ? COLORS.primary : COLORS.gray300,
                        }
                      }}
                    >
                      {size}
                      <Typography component="span" sx={{ ml: 0.5, fontSize: isMobile ? '8px' : '9px', fontWeight: 400 }}>
                        ({sizePrice} TND)
                      </Typography>
                    </Button>
                  );
                })}
              </Stack>
            )}

            {/* Add to Cart Button */}
            <Box sx={{ mt: 'auto' }}>
              <Button
                fullWidth
                variant="contained"
                disabled={isOutOfStock || !isSizeAvailable || currentPrice === 0}
                size="medium"
                onClick={(e) => {
                  e.stopPropagation();
                  if (cartItem) {
                    handleUpdateQuantity(e, product._id, selectedSize, 1);
                  } else {
                    handleAddToCart(e, product, selectedSize);
                  }
                }}
                sx={{
                  bgcolor: COLORS.primary,
                  borderRadius: '12px',
                  py: isMobile ? 1 : 1.25,
                  fontFamily: 'Oswald',
                  fontWeight: 600,
                  fontSize: isMobile ? '12px' : '14px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: COLORS.primaryDark, transform: 'translateY(-1px)' },
                  transition: 'all 0.2s',
                }}
              >
                {cartItem ? `+ Add More (${cartItem.quantity})` : 'Add to Cart'}
              </Button>

              {/* Quantity controls if in cart */}
              {cartItem && cartItem.quantity > 0 && (
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mt: 1.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleUpdateQuantity(e, product._id, selectedSize, -1)}
                    sx={{ 
                      border: `1px solid ${COLORS.gray300}`, 
                      borderRadius: '10px', 
                      width: 32, 
                      height: 32,
                      '&:hover': { borderColor: COLORS.primary, bgcolor: alpha(COLORS.primary, 0.1) }
                    }}
                  >
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: '14px' }}>
                    {cartItem.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleUpdateQuantity(e, product._id, selectedSize, 1)}
                    sx={{ 
                      border: `1px solid ${COLORS.gray300}`, 
                      borderRadius: '10px', 
                      width: 32, 
                      height: 32,
                      '&:hover': { borderColor: COLORS.primary, bgcolor: alpha(COLORS.primary, 0.1) }
                    }}
                  >
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    );
  }, [isMobile, isTablet, wishlist, getCartItem, handleAddToCart, handleUpdateQuantity, navigate, toggleWishlist]);

  // Skeleton Loader
  const ProductSkeleton = () => (
    <Card sx={{ 
      borderRadius: isMobile ? '20px' : '24px', 
      overflow: 'hidden',
      height: '100%',
      minHeight: isMobile ? 480 : 520,
    }}>
      <Skeleton variant="rectangular" height={isMobile ? 240 : 280} animation="wave" />
      <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
        <Skeleton variant="text" width="40%" height={24} animation="wave" />
        <Skeleton variant="text" width="85%" height={32} animation="wave" sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Skeleton variant="rectangular" width={40} height={22} sx={{ borderRadius: '16px' }} />
          <Skeleton variant="rectangular" width={50} height={22} sx={{ borderRadius: '16px' }} />
          <Skeleton variant="rectangular" width={35} height={22} sx={{ borderRadius: '16px' }} />
        </Box>
        <Skeleton variant="text" width="50%" height={40} animation="wave" sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '8px' }} />
        </Stack>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '12px', mt: 1 }} animation="wave" />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: COLORS.primaryDark,
          backgroundImage: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
          color: COLORS.white,
          pt: { xs: 6, md: 8 },
          pb: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha(COLORS.white, 0.05),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha(COLORS.white, 0.03),
          }}
        />
        
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Oswald',
                fontWeight: 700,
                fontSize: { xs: '32px', sm: '42px', md: '52px', lg: '64px' },
                letterSpacing: '-0.02em',
                mb: 2,
                textAlign: 'center',
              }}
            >
              Our Fragrance Collection
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Inter',
                fontSize: { xs: '14px', md: '16px' },
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              Discover our exquisite range of artisanal perfumes, carefully crafted by master perfumers 
              using the finest ingredients from around the country.
            </Typography>
            
            <Stack
              direction="row"
              spacing={4}
              justifyContent="center"
              sx={{ mt: 5, flexWrap: 'wrap', gap: 3 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Whatshot sx={{ fontSize: 24, color: COLORS.secondary }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  50+ Elegant Scents
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalShipping sx={{ fontSize: 24, color: COLORS.secondary }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Shipping around the country
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Verified sx={{ fontSize: 24, color: COLORS.secondary }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Authentic Guarantee
                </Typography>
              </Stack>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Search and Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 4,
            borderRadius: '60px',
            bgcolor: COLORS.white,
            border: `1px solid ${COLORS.gray100}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <TextField
            placeholder="Search fragrances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flex: 2,
              minWidth: 150,
              '& .MuiOutlinedInput-root': { borderRadius: '40px', bgcolor: COLORS.gray50, fontSize: '13px' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: COLORS.gray400, fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 90 }}>
            <Select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '40px', bgcolor: COLORS.gray50, fontSize: '13px' }}
            >
              <MenuItem value="" sx={{ fontSize: '13px' }}>All Genders</MenuItem>
              <MenuItem value="men" sx={{ fontSize: '13px' }}>Men</MenuItem>
              <MenuItem value="women" sx={{ fontSize: '13px' }}>Women</MenuItem>
              <MenuItem value="unisex" sx={{ fontSize: '13px' }}>Unisex</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={`${priceRange[0]}-${priceRange[1]}`}
              onChange={(e) => {
                const [min, max] = e.target.value.split('-').map(Number);
                setPriceRange([min, max]);
              }}
              displayEmpty
              sx={{ borderRadius: '40px', bgcolor: COLORS.gray50, fontSize: '13px' }}
            >
              <MenuItem value={`0-${priceRangeMax}`} sx={{ fontSize: '13px' }}>All Prices</MenuItem>
              <MenuItem value={`0-50`} sx={{ fontSize: '13px' }}>Under 50 TND</MenuItem>
              <MenuItem value={`50-100`} sx={{ fontSize: '13px' }}>50-100 TND</MenuItem>
              <MenuItem value={`100-200`} sx={{ fontSize: '13px' }}>100-200 TND</MenuItem>
              <MenuItem value={`200-${priceRangeMax}`} sx={{ fontSize: '13px' }}>200+ TND</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={priceSize}
              onChange={(e) => setPriceSize(e.target.value)}
              sx={{ borderRadius: '40px', bgcolor: COLORS.gray50, fontSize: '13px' }}
            >
              <MenuItem value="30ml">Show 30ml Price</MenuItem>
              <MenuItem value="50ml">Show 50ml Price</MenuItem>
              <MenuItem value="100ml">Show 100ml Price</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 90 }}>
            <Select
              value={selectedSizes}
              onChange={(e) => setSelectedSizes(e.target.value)}
              multiple
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) return 'Filter by Size';
                return selected.join(', ');
              }}
              sx={{ borderRadius: '40px', bgcolor: COLORS.gray50, fontSize: '13px' }}
            >
              {sizes.map((size) => (
                <MenuItem key={size} value={size}>
                  <Checkbox checked={selectedSizes.indexOf(size) !== -1} size="small" />
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 90 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ borderRadius: '40px', bgcolor: COLORS.gray50, fontSize: '13px' }}
            >
              <MenuItem value="newest" sx={{ fontSize: '13px' }}>Newest</MenuItem>
              <MenuItem value="price_asc" sx={{ fontSize: '13px' }}>Price ↑</MenuItem>
              <MenuItem value="price_desc" sx={{ fontSize: '13px' }}>Price ↓</MenuItem>
              <MenuItem value="rating" sx={{ fontSize: '13px' }}>Top Rated</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant={inStockOnly ? 'contained' : 'outlined'}
            onClick={() => setInStockOnly(!inStockOnly)}
            size="small"
            sx={{
              borderRadius: '40px',
              textTransform: 'none',
              bgcolor: inStockOnly ? COLORS.primary : 'transparent',
              fontSize: '12px',
              px: 1.5,
            }}
          >
            In Stock Only
          </Button>

          {(searchQuery || selectedGender || selectedSizes.length > 0 || inStockOnly || priceRange[0] > 0 || priceRange[1] < priceRangeMax) && (
            <Button
              startIcon={<ClearAll sx={{ fontSize: 16 }} />}
              onClick={clearAllFilters}
              size="small"
              sx={{ borderRadius: '40px', textTransform: 'none', color: COLORS.error, fontSize: '12px' }}
            >
              Clear All
            </Button>
          )}
        </Paper>

        {/* Products Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(12)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i} sx={{ display: 'flex' }}>
                <ProductSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: COLORS.gray600, mb: 2 }}>
              No products found
            </Typography>
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ borderRadius: '40px', borderColor: COLORS.primary, color: COLORS.primary }}
            >
              Clear all filters
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              <AnimatePresence>
                {getCurrentProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product._id} sx={{ display: 'flex' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    '& .MuiPaginationItem-root': { borderRadius: '40px', fontSize: isMobile ? '13px' : '14px' },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Snackbars */}
      <Snackbar
        open={cartSnackbar.open}
        autoHideDuration={2000}
        onClose={() => setCartSnackbar({ ...cartSnackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: '12px', fontSize: '13px' }}>
          {cartSnackbar.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontSize: '13px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;