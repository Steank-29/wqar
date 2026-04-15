import React, { useState, useCallback, useEffect } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Badge, useMediaQuery, useTheme, alpha, styled,
  Tooltip, InputBase, Menu, MenuItem, Divider, Avatar, Typography, Chip,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon, Search as SearchIcon, Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon, Close as CloseIcon, Notifications as NotificationsIcon,
  Person as PersonIcon, Settings as SettingsIcon, Logout as LogoutIcon,
  Dashboard as DashboardIcon, ShoppingCart as OrdersIcon, Store as ProductsIcon,
  Inventory as InventoryIcon, Message as MessageIcon, Receipt as InvoiceIcon,
  AttachMoney as IncomeIcon, Settings as SettingsNavIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLanguage } from '../components/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '@fontsource/oswald';

// Import your logo
import logo from '../assets/LogoW.png';

const COLORS = {
  primary: '#8C5A3C',
  dark: '#5C3520',
  light: '#B07850',
  accent: '#D4A574',
  background: '#F5F0EB',
  surface: '#FDFAF7',
  white: '#FFFFFF',
  error: '#C0392B',
  text: '#2C1810',
  muted: '#8B7355',
};

// Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath === 'default-avatar.jpg' || imagePath === 'default-avatar.png') {
    return '/default-avatar.jpg';
  }
  
  // Get base URL from environment or use default
  const baseUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
  // Remove any leading slashes to avoid double slashes
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

// Secondary App Bar for Tablet/Desktop
const SecondaryAppBar = styled(AppBar)(({ theme }) => ({
  background: COLORS.white,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  position: 'sticky',
  top: '72px',
  zIndex: theme.zIndex.appBar - 1,
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (p) => !['open', 'isMobile'].includes(p),
})(({ theme, open, isMobile }) => ({
  background: COLORS.white,
  boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.06)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: 280,
  }),
  ...(open && !isMobile && {
    marginLeft: 272,
    width: `calc(100% - 272px)`,
  }),
}));

// Mobile Drawer Styling
const DrawerList = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100%',
  background: COLORS.white,
  display: 'flex',
  flexDirection: 'column',
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: '24px 20px',
  borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  background: alpha(COLORS.primary, 0.02),
}));

const DrawerNavItem = styled(ListItem)(({ theme, active }) => ({
  margin: '4px 12px',
  borderRadius: 12,
  transition: 'all 0.2s ease',
  backgroundColor: active ? alpha(COLORS.primary, 0.08) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(COLORS.primary, 0.05),
  },
  '& .MuiListItemIcon-root': {
    color: active ? COLORS.primary : COLORS.muted,
    minWidth: 40,
  },
  '& .MuiListItemText-primary': {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    color: active ? COLORS.primary : COLORS.text,
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 48,
  background: '#F5F5F5',
  border: '1px solid #E0E0E0',
  transition: 'all 0.2s ease',
  width: '100%',
  maxWidth: 520,
  '&:focus-within': {
    background: COLORS.white,
    border: `1px solid ${COLORS.primary}`,
    boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.1)}`,
  },
  display: 'flex',
  alignItems: 'center',
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  color: COLORS.text,
  fontFamily: 'Oswald, sans-serif',
  fontSize: 15,
  letterSpacing: 0.3,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '12px 16px 12px 0',
    width: '100%',
    '&::placeholder': { 
      color: '#9E9E9E', 
      opacity: 1,
      fontWeight: 400,
    },
  },
}));

const TopAction = styled(IconButton)({
  color: '#5C5C5C',
  borderRadius: 12,
  padding: 10,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha(COLORS.primary, 0.08),
    color: COLORS.primary,
  },
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: COLORS.error,
    color: COLORS.white,
    fontSize: 11,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    fontWeight: 600,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 42,
  height: 42,
  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.light})`,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 2px 12px ${alpha(COLORS.primary, 0.3)}`,
  },
}));

const LogoImage = styled('img')({
  height: 36,
  width: 'auto',
  objectFit: 'contain',
});

const LogoTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Oswald, sans-serif',
  fontWeight: 700,
  fontSize: 20,
  letterSpacing: 2,
  color: COLORS.primary,
  textTransform: 'uppercase',
  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.dark} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

// Navigation items - Mobile Drawer (all items)
const mobileNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/products', label: 'Perfumes', icon: <ProductsIcon /> },
  { path: '/orders', label: 'Orders', icon: <OrdersIcon /> },
  { path: '/messages', label: 'Messages', icon: <MessageIcon /> },
  { path: '/invoices', label: 'Factures', icon: <InvoiceIcon /> },
  { path: '/inventory', label: 'Inventory', icon: <InventoryIcon /> },
  { path: '/income', label: 'Income', icon: <IncomeIcon /> },
  { path: '/Admin-Panel/Settings', label: 'Settings', icon: <SettingsNavIcon /> },
];

// Desktop Navigation items
const desktopNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/products', label: 'Perfumes', icon: <ProductsIcon /> },
  { path: '/orders', label: 'Orders', icon: <OrdersIcon /> },
  { path: '/messages', label: 'Messages', icon: <MessageIcon /> },
  { path: '/invoices', label: 'Factures', icon: <InvoiceIcon /> },
  { path: '/inventory', label: 'Inventory', icon: <InventoryIcon /> },
  { path: '/income', label: 'Income', icon: <IncomeIcon /> },
  { path: '/Admin-Panel/Settings', label: 'Settings', icon: <SettingsNavIcon /> },
];

const AdminBar = ({ sidebarOpen, onMenuClick, isMobile: propIsMobile, onLogout }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // Responsive breakpoints
  const isMobile = propIsMobile !== undefined ? propIsMobile : useMediaQuery(theme.breakpoints.down('md'));

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  const unreadCount = 3;

  useEffect(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleProfileClose();
    setMobileDrawerOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
    setMobileDrawerOpen(false);
  };

  const handleLogoutClick = () => {
    handleProfileClose();
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useHotkeys('mod+b', (e) => { 
    e.preventDefault(); 
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  }, [isMobile]);
  
  useHotkeys('mod+k', (e) => { e.preventDefault(); setSearchFocused(true); }, []);
  useHotkeys('mod+shift+f', (e) => { e.preventDefault(); handleFullscreen(); }, [handleFullscreen]);
  useHotkeys('escape', () => {
    setSearchQuery('');
    setSearchFocused(false);
    setNotificationAnchor(null);
    setProfileAnchor(null);
    setMobileDrawerOpen(false);
  }, []);

  // Get profile picture URL with full path
  const profilePictureUrl = user?.profilePicture ? getFullImageUrl(user.profilePicture) : null;
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.firstName?.[0]?.toUpperCase() || 'A';
  };

  // Mobile Drawer Content
  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          borderRadius: '0 20px 20px 0',
        }
      }}
    >
      <DrawerList>
        <DrawerHeader>
          <LogoImage src={logo} alt="Logo" />
          <LogoTitle variant="h6">WIQAR</LogoTitle>
        </DrawerHeader>
        
        <Box sx={{ flex: 1, py: 2 }}>
          {mobileNavItems.map((item) => (
            <DrawerNavItem
              key={item.path}
              active={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              button
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </DrawerNavItem>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: `1px solid ${alpha(COLORS.primary, 0.1)}` }}>
          <Typography sx={{ color: COLORS.muted, fontSize: 12, textAlign: 'center' }}>
            © 2025 WIQAR · v2.0
          </Typography>
        </Box>
      </DrawerList>
    </Drawer>
  );

  // Secondary Navigation Bar for Tablet/Desktop
  const SecondaryNavigation = () => (
    <SecondaryAppBar position="sticky">
      <Toolbar sx={{ 
        minHeight: '56px !important', 
        px: { sm: 3, md: 4 },
        gap: 1,
        justifyContent: 'center',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 4,
        },
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          width: '100%', 
          maxWidth: 1000,
          justifyContent: 'center',
        }}>
          {desktopNavItems.map((item) => (
            <TopAction
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                flexDirection: 'column',
                borderRadius: 2,
                px: 2,
                py: 1,
                minWidth: '80px',
                backgroundColor: location.pathname === item.path ? alpha(COLORS.primary, 0.08) : 'transparent',
                color: location.pathname === item.path ? COLORS.primary : COLORS.muted,
                '&:hover': {
                  backgroundColor: alpha(COLORS.primary, 0.08),
                  color: COLORS.primary,
                },
              }}
            >
              {item.icon}
              <Typography sx={{ 
                fontSize: 12, 
                mt: 0.5, 
                fontFamily: 'Oswald',
                fontWeight: location.pathname === item.path ? 600 : 500,
              }}>
                {item.label}
              </Typography>
            </TopAction>
          ))}
        </Box>
      </Toolbar>
    </SecondaryAppBar>
  );

  return (
    <>
      {/* Main App Bar */}
      <StyledAppBar position="sticky" open={sidebarOpen} isMobile={isMobile}>
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          minHeight: '72px !important', 
          px: { xs: 2, sm: 3 },
          gap: 3,
        }}>
          {/* Left Section - Menu Button (Mobile ONLY) + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {isMobile && (
              <Tooltip title="Open menu">
                <TopAction onClick={handleMenuClick} size="large">
                  <MenuIcon sx={{ fontSize: 24 }} />
                </TopAction>
              </Tooltip>
            )}

            <Box 
              onClick={handleLogoClick}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <LogoImage src={logo} alt="WIQAR Logo" />
              <LogoTitle variant="h6">
                WIQAR
              </LogoTitle>
            </Box>
          </Box>

          {/* Center Section - Search Bar (hide on mobile) */}
          {!isMobile && (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center',
              maxWidth: '50%',
              mx: 'auto',
            }}>
              <SearchBox>
                <SearchIcon sx={{ color: '#9E9E9E', fontSize: 20, ml: 2, mr: 0.5 }} />
                <SearchInput
                  placeholder=" Search for what you need... (⌘K) "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  fullWidth
                  inputProps={{ 'aria-label': 'search' }}
                  inputRef={(ref) => { if (searchFocused && ref) ref.focus(); }}
                />
                {searchQuery && (
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchQuery('')} 
                    sx={{ color: '#9E9E9E', mr: 1.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </SearchBox>
            </Box>
          )}

          {/* Right Section - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Tooltip title={t('admin.language')}>
              <Box>
                <LanguageSwitcher isSticky={false} isMobile={isMobile} />
              </Box>
            </Tooltip>

            <Tooltip title={fullscreen ? 'Exit fullscreen (⌘⇧F)' : 'Fullscreen (⌘⇧F)'}>
              <TopAction onClick={handleFullscreen} size="large">
                {fullscreen ? <FullscreenExitIcon sx={{ fontSize: 22 }} /> : <FullscreenIcon sx={{ fontSize: 22 }} />}
              </TopAction>
            </Tooltip>

            <Tooltip title={`${t('admin.notifications')} (${unreadCount} unread)`}>
              <TopAction onClick={(e) => setNotificationAnchor(e.currentTarget)} size="large">
                <StyledBadge badgeContent={unreadCount}>
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                </StyledBadge>
              </TopAction>
            </Tooltip>

            <Tooltip title={t('admin.account')}>
              <IconButton onClick={handleProfileClick} size="large" sx={{ p: 0.5 }}>
                <ProfileAvatar 
                  src={!imageError ? profilePictureUrl : null}
                  onError={handleImageError}
                >
                  {getInitials()}
                </ProfileAvatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Secondary Navigation - ONLY for Tablet and Desktop */}
      {!isMobile && <SecondaryNavigation />}

      {/* Mobile Drawer - ONLY visible on mobile */}
      {isMobile && <MobileDrawer />}

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 260,
            borderRadius: 3,
            mt: 1.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #E8E8E8',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          px: 2.5, 
          py: 2.5, 
          bgcolor: alpha(COLORS.primary, 0.04),
          borderBottom: '1px solid #E8E8E8',
          textAlign: 'center',
        }}>
          <ProfileAvatar 
            src={!imageError ? profilePictureUrl : null}
            onError={handleImageError}
            sx={{ 
              width: 56, 
              height: 56, 
              margin: '0 auto 12px',
              fontSize: 20,
            }}
          >
            {getInitials()}
          </ProfileAvatar>
          <Typography sx={{ 
            fontFamily: 'Oswald', 
            fontWeight: 600, 
            fontSize: 16, 
            color: COLORS.text,
            mb: 0.5,
          }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography sx={{ 
            color: COLORS.muted, 
            fontSize: 12,
            fontFamily: 'Oswald',
          }}>
            {user?.email || 'admin@wiqar.com'}
          </Typography>
          <Chip
            label={user?.role === 'admin' ? 'Super Admin' : 'Staff'}
            size="small"
            sx={{
              mt: 1.5,
              bgcolor: alpha(COLORS.primary, 0.1),
              color: COLORS.primary,
              fontFamily: 'Oswald',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          />
        </Box>

        <MenuItem onClick={() => handleNavigate('/profile')} sx={{ gap: 1.5, py: 1.3, px: 2.5 }}>
          <PersonIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
          <Typography sx={{ fontFamily: 'Oswald', fontSize: 14, fontWeight: 500 }}>
            My Profile
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => handleNavigate('/Admin-Panel/Settings')} sx={{ gap: 1.5, py: 1.3, px: 2.5 }}>
          <SettingsIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
          <Typography sx={{ fontFamily: 'Oswald', fontSize: 14, fontWeight: 500 }}>
            Settings
          </Typography>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleLogoutClick} sx={{ gap: 1.5, py: 1.3, px: 2.5 }}>
          <LogoutIcon sx={{ color: COLORS.error, fontSize: 20 }} />
          <Typography sx={{ 
            fontFamily: 'Oswald', 
            fontSize: 14, 
            fontWeight: 500, 
            color: COLORS.error,
          }}>
            Logout
          </Typography>
        </MenuItem>

        <Box sx={{ 
          px: 2.5, 
          py: 1.5, 
          bgcolor: '#FAFAFA',
          borderTop: '1px solid #E8E8E8',
          textAlign: 'center',
        }}>
          <Typography sx={{ 
            color: '#BDBDBD', 
            fontSize: 11, 
            fontFamily: 'Oswald',
            letterSpacing: 0.5,
          }}>
            © 2025 WIQAR · v2.0
          </Typography>
        </Box>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 440,
            borderRadius: 3,
            mt: 1.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #E8E8E8',
          },
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E8E8E8' }}>
          <Typography sx={{ fontFamily: 'Oswald', fontWeight: 600, fontSize: 16, color: COLORS.text }}>
            Notifications
          </Typography>
        </Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary" sx={{ fontFamily: 'Oswald' }}>
            No new notifications
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default AdminBar;