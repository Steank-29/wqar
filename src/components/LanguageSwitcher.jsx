import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Box,
  alpha,
  styled,
} from '@mui/material';
import { Language as LanguageIcon, Check as CheckIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../components/LanguageContext';

const LanguageButton = styled(IconButton)(({ theme, isSticky }) => ({
  color: isSticky ? '#FFFFFF' : '#8C5A3C',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(isSticky ? '#FFFFFF' : '#8C5A3C', 0.1),
    transform: 'scale(1.05)',
  },
}));

const LanguageMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    marginTop: '8px',
    minWidth: '180px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  },
  '& .MuiMenuItem-root': {
    fontFamily: 'Oswald, sans-serif',
    padding: '10px 20px',
    gap: '12px',
  },
}));

const LanguageSwitcher = ({ isSticky, isMobile }) => {
  const { t, i18n } = useTranslation();
  const { changeLanguage, currentLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: 'en', name: t('navbar.english'), flag: '🇬🇧', dir: 'ltr' },
    { code: 'ar', name: t('navbar.arabic'), flag: '🇸🇦', dir: 'rtl' },
    { code: 'fr', name: t('navbar.french'), flag: '🇫🇷', dir: 'ltr' },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleClose();
  };

  const getCurrentLanguageDisplay = () => {
    const current = languages.find(lang => lang.code === currentLanguage);
    return current ? `${current.flag} ${current.name}` : '🌐';
  };

  return (
    <>
      <LanguageButton
        onClick={handleClick}
        isSticky={isSticky ? 1 : 0}
        size={isMobile ? "small" : "medium"}
      >
        <LanguageIcon />
      </LanguageButton>

      <LanguageMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLanguage === lang.code}
            sx={{
              justifyContent: 'space-between',
              backgroundColor: currentLanguage === lang.code ? alpha('#8C5A3C', 0.1) : 'transparent',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body1" sx={{ fontSize: '20px' }}>
                {lang.flag}
              </Typography>
              <ListItemText
                primary={lang.name}
                primaryTypographyProps={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '14px',
                  fontWeight: currentLanguage === lang.code ? 600 : 400,
                  color: '#1A1A1A',
                }}
              />
            </Box>
            {currentLanguage === lang.code && (
              <CheckIcon sx={{ color: '#8C5A3C', fontSize: '18px' }} />
            )}
          </MenuItem>
        ))}
      </LanguageMenu>
    </>
  );
};

export default LanguageSwitcher;