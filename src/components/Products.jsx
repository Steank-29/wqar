import React, { useState, useEffect, useCallback } from 'react';
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

const Products = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  
  // Use CartContext
  const { addToCart, updateQuantity, cart, cartCount } = useCart();
  
  const [cartSnackbar, setCartSnackbar] = useState({ open: false, message: '' });
  
  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // UI State
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [priceRangeMax, setPriceRangeMax] = useState(500);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sizes = ['50ml', '100ml', '150ml'];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedGender, priceRange, selectedSizes, sortBy, inStockOnly]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({ limit: 100 });
      const allProducts = response.data || [];
      setProducts(allProducts);
      const maxPrice = Math.max(...allProducts.map(p => p.price || 0), 500);
      setPriceRangeMax(maxPrice);
      setPriceRange([0, maxPrice]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

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

    filtered = filtered.filter(p => 
      (p.discountedPrice || p.price) >= priceRange[0] && 
      (p.discountedPrice || p.price) <= priceRange[1]
    );

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => 
        p.quantity && p.quantity.some(size => selectedSizes.includes(size))
      );
    }

    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
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

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGender('');
    setPriceRange([0, priceRangeMax]);
    setSelectedSizes([]);
    setSortBy('newest');
    setInStockOnly(false);
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
    addToCart(product, 1, selectedSize);
    setCartSnackbar({ 
      open: true, 
      message: `${product.name} (${selectedSize}) added to cart`
    });
  };

  const handleUpdateQuantity = (e, productId, size, delta) => {
    e.stopPropagation();
    const cartItem = cart.find(item => item._id === productId && item.selectedSize === size);
    if (cartItem) {
      updateQuantity(productId, cartItem.quantity + delta, size);
    }
  };

  const getCartItem = (productId, size) => {
    return cart.find(item => item._id === productId && item.selectedSize === size);
  };

  const getCurrentProducts = () => {
    const startIndex = (page - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Product Card Component
  const ProductCard = ({ product }) => {
    const discount = product.discountPercentage || 0;
    const currentPrice = product.discountedPrice || product.price;
    const isOutOfStock = product.stock === 0;
    const [hovered, setHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState(product.quantity?.[0] || '50ml');
    const cartItem = getCartItem(product._id, selectedSize);

    return (
      <Zoom in={true} style={{ transitionDelay: '30ms' }}>
        <Card
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          elevation={0}
          sx={{
            borderRadius: isMobile ? '16px' : '20px',
            overflow: 'hidden',
            bgcolor: COLORS.white,
            border: `1px solid ${hovered ? alpha(COLORS.primary, 0.2) : COLORS.gray100}`,
            transition: 'all 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            cursor: 'pointer',
            '&:hover': {
              transform: isMobile ? 'translateY(-2px)' : 'translateY(-4px)',
              boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
            },
          }}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 2, display: 'flex', gap: 0.5, flexDirection: 'column' }}>
            {discount > 0 && (
              <Chip
                label={`-${discount}%`}
                size="small"
                sx={{ bgcolor: COLORS.success, color: COLORS.white, fontWeight: 600, fontSize: isMobile ? '8px' : '10px', height: isMobile ? 18 : 22 }}
              />
            )}
            {product.featured && (
              <Chip
                label="Featured"
                size="small"
                sx={{ bgcolor: COLORS.warning, color: COLORS.white, fontWeight: 600, fontSize: isMobile ? '8px' : '10px', height: isMobile ? 18 : 22 }}
              />
            )}
          </Box>

          {/* Wishlist Button */}
          <IconButton
            onClick={(e) => toggleWishlist(e, product._id)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.9)',
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              '&:hover': { bgcolor: COLORS.white },
            }}
          >
            {wishlist[product._id] ? <Favorite sx={{ color: COLORS.error, fontSize: isMobile ? 14 : 16 }} /> : <FavoriteBorder sx={{ fontSize: isMobile ? 14 : 16 }} />}
          </IconButton>

          {/* Image */}
          <Box sx={{ position: 'relative', height: isMobile ? 180 : 220, overflow: 'hidden', bgcolor: COLORS.gray50 }}>
            <img
              src={getFullImageUrl(product.images?.[0]?.url)}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
              onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
            />
            {isOutOfStock && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Chip label="Out of Stock" sx={{ bgcolor: COLORS.white, fontWeight: 600, fontSize: isMobile ? '9px' : '10px', borderRadius: '20px', height: isMobile ? 22 : 26 }} />
              </Box>
            )}
          </Box>

          {/* Content */}
          <CardContent sx={{ p: isMobile ? 1.5 : 2, flexGrow: 1 }}>
            {/* Gender */}
            <Chip
              label={product.gender?.toUpperCase()}
              size="small"
              sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontSize: isMobile ? '8px' : '9px', height: isMobile ? 18 : 20, mb: 0.5 }}
            />
            
            {/* Title */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '13px' : '14px',
                fontFamily: 'Oswald',
                mb: 0.5,
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.name}
            </Typography>

            {/* Rating */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
              <Rating value={product.rating || 0} readOnly size="small" precision={0.5} sx={{ '& .MuiRating-icon': { fontSize: isMobile ? '11px' : '12px' } }} />
              <Typography variant="caption" sx={{ color: COLORS.gray500, fontSize: isMobile ? '9px' : '10px' }}>({product.reviewCount || 0})</Typography>
            </Stack>

            {/* Price */}
            <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: isMobile ? '16px' : '18px', color: COLORS.primary, fontFamily: 'Oswald' }}>
                {currentPrice} TND
              </Typography>
              {discount > 0 && (
                <Typography sx={{ textDecoration: 'line-through', color: COLORS.gray400, fontSize: isMobile ? '10px' : '11px' }}>
                  {product.price} TND
                </Typography>
              )}
            </Stack>

            {/* Size Selector */}
            {product.quantity && product.quantity.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                {product.quantity.slice(0, isMobile ? 2 : 3).map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    sx={{
                      fontSize: isMobile ? '8px' : '9px',
                      height: isMobile ? 20 : 22,
                      bgcolor: selectedSize === size ? COLORS.primary : COLORS.gray100,
                      color: selectedSize === size ? COLORS.white : COLORS.gray600,
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Add to Cart Button */}
            <Button
              fullWidth
              variant="contained"
              disabled={isOutOfStock}
              size="small"
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
                borderRadius: '40px',
                py: isMobile ? 0.8 : 1,
                fontFamily: 'Oswald',
                fontWeight: 600,
                fontSize: isMobile ? '10px' : '11px',
                textTransform: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark },
              }}
            >
              {cartItem ? `+ Add (${cartItem.quantity})` : 'Add to Cart'}
            </Button>

            {/* Quantity controls if in cart */}
            {cartItem && cartItem.quantity > 0 && (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => handleUpdateQuantity(e, product._id, selectedSize, -1)}
                  sx={{ border: `1px solid ${COLORS.gray300}`, borderRadius: '20px', width: 28, height: 28 }}
                >
                  <Remove sx={{ fontSize: 12 }} />
                </IconButton>
                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                  {cartItem.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleUpdateQuantity(e, product._id, selectedSize, 1)}
                  sx={{ border: `1px solid ${COLORS.gray300}`, borderRadius: '20px', width: 28, height: 28 }}
                >
                  <Add sx={{ fontSize: 12 }} />
                </IconButton>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Zoom>
    );
  };

  // Skeleton Loader
  const ProductSkeleton = () => (
    <Card sx={{ borderRadius: isMobile ? '16px' : '20px', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={isMobile ? 180 : 220} />
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Skeleton variant="text" width="40%" height={18} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="50%" height={24} />
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: '40px', mt: 1 }} />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      {/* Professional Hero Section */}
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

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Search and Filter Bar - Removed Cart Icon */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 3,
            borderRadius: '50px',
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
              <MenuItem value="" sx={{ fontSize: '13px' }}>All</MenuItem>
              <MenuItem value="men" sx={{ fontSize: '13px' }}>Men</MenuItem>
              <MenuItem value="women" sx={{ fontSize: '13px' }}>Women</MenuItem>
              <MenuItem value="unisex" sx={{ fontSize: '13px' }}>Unisex</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
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
              <MenuItem value={`0-50`} sx={{ fontSize: '13px' }}>Under 50</MenuItem>
              <MenuItem value={`50-100`} sx={{ fontSize: '13px' }}>50-100</MenuItem>
              <MenuItem value={`100-200`} sx={{ fontSize: '13px' }}>100-200</MenuItem>
              <MenuItem value={`200-${priceRangeMax}`} sx={{ fontSize: '13px' }}>200+</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 90 }}>
            <Select
              value={selectedSizes}
              onChange={(e) => setSelectedSizes(e.target.value)}
              multiple
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) return 'Size';
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
            In Stock
          </Button>

          {(searchQuery || selectedGender || selectedSizes.length > 0 || inStockOnly || priceRange[0] > 0 || priceRange[1] < priceRangeMax) && (
            <Button
              startIcon={<ClearAll sx={{ fontSize: 16 }} />}
              onClick={clearAllFilters}
              size="small"
              sx={{ borderRadius: '40px', textTransform: 'none', color: COLORS.error, fontSize: '12px' }}
            >
              Clear
            </Button>
          )}
        </Paper>

        {/* Products Grid */}
        {loading ? (
          <Grid container spacing={2} justifyContent="center">
            {[...Array(12)].map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
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
            <Grid container spacing={2} justifyContent="center">
              <AnimatePresence>
                {getCurrentProducts().map((product, index) => (
                  <Grid item xs={6} sm={4} md={3} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    '& .MuiPaginationItem-root': { borderRadius: '40px' },
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