// components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  InputBase,
  Container,
  alpha,
  styled,
  ClickAwayListener,
  Fade,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Badge,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add,
  Remove,
  Delete,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import '@fontsource/oswald';

// Import your logo from assets
import logo from '../assets/LogoW.png';

// ==================== STYLED COMPONENTS (DEFINED FIRST) ====================

const StyledAppBar = styled(AppBar)(({ theme, isSticky }) => ({
  backgroundColor: isSticky ? '#8C5A3C' : '#FFFFFF',
  boxShadow: isSticky ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: isSticky ? 'fixed' : 'relative',
  top: 0,
  width: '100%',
  zIndex: 1100,
  direction: 'inherit',
}));

const NavLink = styled(Typography)(({ theme, isSticky, active }) => ({
  fontFamily: 'Oswald, sans-serif',
  fontSize: '16px',
  fontWeight: active ? 600 : 500,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  color: isSticky ? '#FFFFFF' : '#8C5A3C',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    opacity: 0.8,
    '&::after': {
      width: '100%',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-4px',
    [theme.direction === 'rtl' ? 'right' : 'left']: 0,
    width: active ? '100%' : '0%',
    height: '2px',
    backgroundColor: isSticky ? '#FFFFFF' : '#8C5A3C',
    transition: 'width 0.3s ease',
  },
}));

const LogoImage = styled('img')({
  height: '50px',
  width: 'auto',
  objectFit: 'contain',
});

const IconButtonStyled = styled(IconButton)(({ theme, isSticky }) => ({
  color: isSticky ? '#FFFFFF' : '#8C5A3C',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(isSticky ? '#FFFFFF' : '#8C5A3C', 0.1),
    transform: 'scale(1.05)',
  },
}));

const CartDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: { xs: '100%', sm: 420 },
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  },
}));

const CartItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 16,
  padding: '16px',
  borderBottom: `1px solid ${alpha('#000', 0.08)}`,
  '&:hover': {
    backgroundColor: alpha('#8C5A3C', 0.02),
  },
}));

const QuantityButton = styled(IconButton)({
  width: 32,
  height: 32,
  border: '1px solid #E0E0E0',
  borderRadius: '40px',
  '&:hover': {
    backgroundColor: '#8C5A3C',
    color: '#FFFFFF',
    borderColor: '#8C5A3C',
  },
});

const TopBarContainer = styled(Box)({
  backgroundColor: '#8C5A3C',
  color: '#FFFFFF',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
});

const SliderText = styled(Typography)({
  fontFamily: 'Oswald, sans-serif',
  fontSize: { xs: '11px', sm: '12px', md: '14px' },
  fontWeight: 400,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  px: { xs: 1, sm: 0 },
});

const SearchContainer = styled(Box)(({ theme, isSticky }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: isSticky ? '#8C5A3C' : '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1200,
  padding: '0 24px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  direction: 'ltr',
}));

const SearchInput = styled(InputBase)(({ theme, isSticky }) => ({
  width: '100%',
  maxWidth: '600px',
  fontSize: { xs: '18px', sm: '24px' },
  fontFamily: 'Oswald, sans-serif',
  fontWeight: 400,
  letterSpacing: '0.5px',
  color: isSticky ? '#FFFFFF' : '#8C5A3C',
  '& .MuiInputBase-input': {
    padding: '12px 0',
    textAlign: 'center',
    '&::placeholder': {
      color: alpha(isSticky ? '#FFFFFF' : '#8C5A3C', 0.6),
      fontSize: { xs: '16px', sm: '20px' },
      fontFamily: 'Oswald, sans-serif',
    },
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '280px',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    [theme.direction === 'rtl' ? 'right' : 'left']: 0,
  },
}));

const DrawerHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 16px',
  backgroundColor: '#8C5A3C',
  color: '#FFFFFF',
});

// ==================== MAIN COMPONENT ====================

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { cart, cartCount, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, subtotal, shippingCost, total } = useCart();

  // Update theme direction
  useEffect(() => {
    theme.direction = isRTL ? 'rtl' : 'ltr';
  }, [isRTL, theme]);

  const sliderTexts = [
    t('navbar.newArrivals'),
    t('navbar.discoverSignature'),
    t('navbar.inspiredByNature'),
  ];

  const navItems = [
    { label: t('navbar.home'), path: '/' },
    { label: t('navbar.shopAll'), path: '/products' },
    { label: t('navbar.contact'), path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderTexts.length]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderTexts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderTexts.length) % sliderTexts.length);
  };

  const handleSearchOpen = () => {
    setShowSearch(true);
    setMobileMenuOpen(false);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      handleSearchClose();
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleCartOpen = () => {
    setIsCartOpen(true);
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${cleanBaseUrl}/${cleanPath}`;
  };

  const menuItems = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LogoImage src={logo} alt="Wiqar Logo" style={{ height: '40px' }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 600,
              letterSpacing: '2px',
              color: '#FFFFFF',
              textTransform: 'uppercase',
            }}
          >
            {t('navbar.wqar')}
          </Typography>
        </Box>
        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </DrawerHeader>
      
      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            onClick={() => {
              navigate(item.path);
              setMobileMenuOpen(false);
            }}
            sx={{
              backgroundColor: location.pathname === item.path ? alpha('#8C5A3C', 0.1) : 'transparent',
              '&:hover': {
                backgroundColor: alpha('#8C5A3C', 0.1),
              },
            }}
          >
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: '18px',
                fontWeight: location.pathname === item.path ? 600 : 500,
                letterSpacing: '1px',
                color: '#8C5A3C',
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
          </ListItem>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <ListItem
          onClick={() => {
            setMobileMenuOpen(false);
            handleSearchOpen();
          }}
          sx={{
            '&:hover': {
              backgroundColor: alpha('#8C5A3C', 0.1),
            },
          }}
        >
          <SearchIcon sx={{ color: '#8C5A3C', ml: isRTL ? 2 : 0, mr: isRTL ? 0 : 2 }} />
          <ListItemText
            primary={t('navbar.search')}
            primaryTypographyProps={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              color: '#8C5A3C',
              textAlign: isRTL ? 'right' : 'left',
            }}
          />
        </ListItem>

        <ListItem>
          <Box sx={{ width: '100%', mt: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Oswald, sans-serif',
                color: alpha('#1A1A1A', 0.6),
                mb: 1,
                display: 'block',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('navbar.language')}
            </Typography>
            <LanguageSwitcher isSticky={isSticky} isMobile={true} />
          </Box>
        </ListItem>
      </List>
      
      <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0' }}>
        <Button
          fullWidth
          onClick={() => {
            handleLogin();
            setMobileMenuOpen(false);
          }}
          sx={{
            fontFamily: 'Oswald, sans-serif',
            backgroundColor: '#8C5A3C',
            color: '#FFFFFF',
            py: 1.5,
            '&:hover': {
              backgroundColor: alpha('#8C5A3C', 0.9),
            },
          }}
        >
          <PersonIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0 }} />
          {t('navbar.loginSignUp')}
        </Button>
        
        <Typography
          sx={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
            mt: 2,
          }}
        >
          {t('navbar.copyright')}
        </Typography>
      </Box>
    </Box>
  );

  // Cart Drawer Component - Updated to show original and discounted prices
  const CartDrawerComponent = () => (
    <CartDrawer
      anchor={isRTL ? 'left' : 'right'}
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #E0E0E0',
            backgroundColor: '#8C5A3C',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: 'Oswald', fontWeight: 600 }}>
            Your Cart ({cartCount} items)
          </Typography>
          <IconButton onClick={() => setIsCartOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {cart.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                textAlign: 'center',
                p: 3,
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 64, color: '#CCC', mb: 2 }} />
              <Typography variant="h6" sx={{ fontFamily: 'Oswald', color: '#666', mb: 1 }}>
                Your cart is empty
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                Add some products to your cart and they will appear here
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                sx={{
                  backgroundColor: '#8C5A3C',
                  borderRadius: '40px',
                  '&:hover': { backgroundColor: '#5C3520' },
                }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            cart.map((item) => {
              // Determine if item has discount
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const displayPrice = item.price;
              const originalPrice = item.originalPrice || item.price;
              
              return (
                <CartItem key={item.variantKey}>
                  {/* Product Image */}
                  <Avatar
                    src={getFullImageUrl(item.mainImage)}
                    variant="rounded"
                    sx={{ width: 80, height: 80, borderRadius: '12px' }}
                  >
                    {item.name?.[0]}
                  </Avatar>

                  {/* Product Details */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Oswald',
                        fontWeight: 600,
                        fontSize: '16px',
                        mb: 0.5,
                      }}
                    >
                      {item.name}
                    </Typography>
                    {item.selectedSize && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#666', display: 'block', mb: 0.5 }}
                      >
                        Size: {item.selectedSize}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                      <Typography
                        sx={{
                          fontFamily: 'Oswald',
                          fontWeight: 700,
                          color: '#8C5A3C',
                          fontSize: '16px',
                        }}
                      >
                        {displayPrice} TND
                      </Typography>
                      {hasDiscount && (
                        <Typography
                          sx={{
                            textDecoration: 'line-through',
                            color: '#999',
                            fontSize: '12px',
                          }}
                        >
                          {originalPrice} TND
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Quantity Controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuantityButton
                      size="small"
                      onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedSize)}
                    >
                      <Remove sx={{ fontSize: 14 }} />
                    </QuantityButton>
                    <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </Typography>
                    <QuantityButton
                      size="small"
                      onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedSize)}
                    >
                      <Add sx={{ fontSize: 14 }} />
                    </QuantityButton>
                  </Box>

                  {/* Delete Button */}
                  <IconButton
                    onClick={() => removeFromCart(item._id, item.selectedSize)}
                    sx={{ color: '#999', '&:hover': { color: '#EF4444' } }}
                  >
                    <Delete sx={{ fontSize: 18 }} />
                  </IconButton>
                </CartItem>
              );
            })
          )}
        </Box>

        {/* Footer */}
        {cart.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0', backgroundColor: '#FAFAFA' }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Subtotal
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {subtotal.toFixed(2)} TND
                </Typography>
              </Stack>
              {shippingCost > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Shipping
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {shippingCost.toFixed(2)} TND
                  </Typography>
                </Stack>
              )}
              {shippingCost === 0 && subtotal > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>
                    Free Shipping
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>
                    Included
                  </Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" sx={{ fontFamily: 'Oswald', fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'Oswald', fontWeight: 700, color: '#8C5A3C' }}>
                  {total.toFixed(2)} TND
                </Typography>
              </Stack>
              
              {/* Free Shipping Progress Bar */}
              {subtotal > 0 && subtotal < 100 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Add {100 - subtotal} TND more for free shipping
                  </Typography>
                  <Box
                    sx={{
                      height: 4,
                      bgcolor: '#E0E0E0',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(subtotal / 100) * 100}%`,
                        height: '100%',
                        bgcolor: '#8C5A3C',
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                </Box>
              )}
              
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                sx={{
                  backgroundColor: '#8C5A3C',
                  borderRadius: '40px',
                  py: 1.5,
                  mt: 1,
                  fontFamily: 'Oswald',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#5C3520' },
                }}
              >
                Proceed to Checkout
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setIsCartOpen(false)}
                sx={{
                  borderColor: '#8C5A3C',
                  color: '#8C5A3C',
                  borderRadius: '40px',
                  py: 1,
                  fontFamily: 'Oswald',
                  '&:hover': { borderColor: '#5C3520', backgroundColor: alpha('#8C5A3C', 0.05) },
                }}
              >
                Continue Shopping
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </CartDrawer>
  );

  return (
    <>
      {/* Top Bar Slider */}
      <TopBarContainer>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
            <IconButton
              size="small"
              sx={{ color: 'white', '&:hover': { backgroundColor: alpha('#fff', 0.1) } }}
              onClick={prevSlide}
            >
              {isRTL ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>

            <Box sx={{ flex: 1, textAlign: 'center', overflow: 'hidden', position: 'relative', height: { xs: '32px', sm: '28px', md: '24px' } }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <SliderText>{sliderTexts[currentSlide]}</SliderText>
                </motion.div>
              </AnimatePresence>
            </Box>

            <IconButton
              size="small"
              sx={{ color: 'white', '&:hover': { backgroundColor: alpha('#fff', 0.1) } }}
              onClick={nextSlide}
            >
              {isRTL ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Container>
      </TopBarContainer>

      {/* Main Navbar */}
      <StyledAppBar position="relative" isSticky={isSticky ? 1 : 0}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 1, minHeight: { xs: '60px', sm: '70px' } }}>
            
            {/* Left Section */}
            {isMobile || isTablet ? (
              <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButtonStyled>
            ) : (
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {navItems.map((item) => (
                  <NavLink 
                    key={item.label} 
                    isSticky={isSticky ? 1 : 0}
                    active={location.pathname === item.path ? 1 : 0}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </Box>
            )}

            {/* Center Logo */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <LogoImage src={logo} alt="Wiqar Logo" />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  color: isSticky ? '#FFFFFF' : '#8C5A3C',
                  fontSize: { xs: '18px', sm: '20px', md: '24px' },
                  textTransform: 'uppercase',
                }}
              >
                {t('navbar.wqar')}
              </Typography>
            </Box>

            {/* Right Icons */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <LanguageSwitcher isSticky={isSticky} isMobile={false} />
              
              {!isMobile && !isTablet && (
                <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={handleSearchOpen}>
                  <SearchIcon />
                </IconButtonStyled>
              )}
              
              {!isMobile && !isTablet && (
                <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={handleLogin}>
                  <PersonIcon />
                </IconButtonStyled>
              )}
              
              {/* Cart Icon with Badge */}
              <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={handleCartOpen}>
                <Badge badgeContent={cartCount} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#EF4444' } }}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButtonStyled>
            </Box>
          </Toolbar>
        </Container>

        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <Fade in={showSearch} timeout={300}>
              <SearchContainer isSticky={isSticky ? 1 : 0}>
                <ClickAwayListener onClickAway={handleSearchClose}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <SearchInput
                      inputRef={searchInputRef}
                      placeholder={t('navbar.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchSubmit}
                      isSticky={isSticky ? 1 : 0}
                      fullWidth
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        [isRTL ? 'left' : 'right']: { xs: 0, sm: 20 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: isSticky ? '#FFFFFF' : '#8C5A3C',
                      }}
                      onClick={handleSearchClose}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </ClickAwayListener>
              </SearchContainer>
            </Fade>
          )}
        </AnimatePresence>
      </StyledAppBar>

      {/* Mobile Drawer Menu */}
      <MobileDrawer
        anchor={isRTL ? 'right' : 'left'}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {menuItems}
      </MobileDrawer>

      {/* Cart Drawer */}
      <CartDrawerComponent />

      {/* Spacer for fixed navbar */}
      {isSticky && <Box sx={{ height: { xs: '60px', sm: '70px' } }} />}
    </>
  );
};

export default Navbar;