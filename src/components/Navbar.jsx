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
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import '@fontsource/oswald';

// Import your logo from assets
import logo from '../assets/LogoW.png';

// Styled components for professional look
const StyledAppBar = styled(AppBar)(({ theme, isSticky }) => ({
  backgroundColor: isSticky ? '#8C5A3C' : '#FFFFFF',
  boxShadow: isSticky ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: isSticky ? 'fixed' : 'relative',
  top: 0,
  width: '100%',
  zIndex: 1100,
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
    left: 0,
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

// Mobile Menu Drawer
const MobileDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '280px',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  },
});

const DrawerHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 16px',
  backgroundColor: '#8C5A3C',
  color: '#FFFFFF',
});

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const sliderTexts = [
    "NEW ARRIVALS JUST LANDED",
    "DISCOVER YOUR SIGNATURE SCENT",
    "INSPIRED BY NATURE, CRAFTED FOR YOU"
  ];

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Wqar', path: '/wqar' },
    { label: 'Contact', path: '/contact' },
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
      console.log('Searching for:', searchQuery);
      handleSearchClose();
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleCart = () => {
    console.log('Cart clicked');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const menuItems = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LogoImage src={logo} alt="Wqar Logo" style={{ height: '40px' }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 600,
              letterSpacing: '2px',
              color: '#FFFFFF',
            }}
          >
            Wqar
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
            onClick={() => handleNavClick(item.path)}
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
              }}
            />
          </ListItem>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Search in mobile menu */}
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
          <SearchIcon sx={{ color: '#8C5A3C', mr: 2 }} />
          <ListItemText
            primary="Search"
            primaryTypographyProps={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              color: '#8C5A3C',
            }}
          />
        </ListItem>
      </List>
      
      {/* Login at bottom of drawer */}
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
          <PersonIcon sx={{ mr: 1 }} />
          Login / Sign Up
        </Button>
        
        {/* Footer in drawer */}
        <Typography
          sx={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
            mt: 2,
          }}
        >
          © 2026, Wqar, all rights reserved
        </Typography>
      </Box>
    </Box>
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
              <ChevronLeftIcon fontSize="small" />
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
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Container>
      </TopBarContainer>

      {/* Main Navbar */}
      <StyledAppBar position="relative" isSticky={isSticky ? 1 : 0}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 1, minHeight: { xs: '60px', sm: '70px' } }}>
            
            {/* Left Section - Mobile Menu or Desktop Navigation */}
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

            {/* Center Logo - Click to go home */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <LogoImage src={logo} alt="Wqar Logo" />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  color: isSticky ? '#FFFFFF' : '#8C5A3C',
                  textTransform: 'uppercase',
                  fontSize: { xs: '18px', sm: '20px', md: '24px' },
                }}
              >
                Wqar
              </Typography>
            </Box>

            {/* Right Icons */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {/* Search Icon - Hide on mobile since it's in drawer */}
              {!isMobile && !isTablet && (
                <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={handleSearchOpen}>
                  <SearchIcon />
                </IconButtonStyled>
              )}
              
              {/* Login Icon - Hide on mobile since it's in drawer */}
              {!isMobile && !isTablet && (
                <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={handleLogin}>
                  <PersonIcon />
                </IconButtonStyled>
              )}
              
              {/* Cart Icon - Always visible */}
              <IconButtonStyled isSticky={isSticky ? 1 : 0} onClick={handleCart}>
                <ShoppingCartIcon />
              </IconButtonStyled>
            </Box>
          </Toolbar>
        </Container>

        {/* Full-width Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <Fade in={showSearch} timeout={300}>
              <SearchContainer isSticky={isSticky ? 1 : 0}>
                <ClickAwayListener onClickAway={handleSearchClose}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <SearchInput
                      inputRef={searchInputRef}
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchSubmit}
                      isSticky={isSticky ? 1 : 0}
                      fullWidth
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: { xs: 0, sm: 20 },
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
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        {menuItems}
      </MobileDrawer>

      {/* Spacer for fixed navbar */}
      {isSticky && <Box sx={{ height: { xs: '60px', sm: '70px' } }} />}
    </>
  );
};

export default Navbar;