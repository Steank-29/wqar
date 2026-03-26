import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  InputAdornment,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  alpha,
  styled,
  Stack,
} from '@mui/material';
import {
  Send as SendIcon,
  Instagram as InstagramIcon,
  Copyright as CopyrightIcon,
} from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';
import '@fontsource/oswald';

// Import your logo
import logo from '../assets/LogoW.png';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#8C5A3C',
  borderTop: `1px solid ${alpha('#ffffff', 0.2)}`,
  position: 'relative',
  marginTop: 'auto',
}));

const NewsletterSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha('#ffffff', 1)} 0%, ${alpha('#ffffff', 1)} 100%)`,
  borderRadius: '16px',
  padding: theme.spacing(4, 5),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#8C5A3C', 0.2)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 150,
    height: 150,
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 3),
  },
}));

const NewsletterInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha('#8C5A3C', 0.1),
    borderRadius: '60px',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha('#8C5A3C', 0.3),
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      '& fieldset': {
        borderColor: '#8C5A3C',
      },
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(0,0,0,0.25)',
      '& fieldset': {
        borderColor: '#8C5A3C',
      },
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Oswald, sans-serif',
    padding: '14px 24px',
    fontSize: '14px',
    color: '#8C5A3C',
    '&::placeholder': {
      color: alpha('#8C5A3C', 0.6),
    },
  },
}));

const SocialIcon = styled(motion(IconButton))(({ theme }) => ({
  backgroundColor: alpha('#ffffff', 0.08),
  color: '#ffffff',
  margin: theme.spacing(0, 0.75),
  width: 48,
  height: 48,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#8C5A3C',
    color: '#ffffff',
  },
}));

const Footer = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setTimeout(() => {
      console.log('Newsletter subscription:', email);
      setShowSuccess(true);
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  const handleSocialClick = (platform) => {
    const links = {
      instagram: 'https://instagram.com/wqar',
      tiktok: 'https://tiktok.com/@wqar',
    };
    window.open(links[platform], '_blank');
  };

  // Bounce animation variants
  const bounceAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <FooterContainer>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <Grid container spacing={5} alignItems="center">
              {/* Logo & Brand */}
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        component="img"
                        src={logo}
                        alt="Wqar"
                        sx={{ 
                          height: { xs: '55px', sm: '65px', md: '75px' },
                          width: 'auto',
                          cursor: 'pointer',
                          filter: 'brightness(0) invert(1)',
                        }}
                      />
                    </motion.div>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '3px',
                        color: '#FFFFFF',
                        fontSize: { xs: '28px', sm: '32px', md: '36px' },
                      }}
                    >
                      WQAR
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      color: alpha('#FFFFFF', 0.7),
                      lineHeight: 1.6,
                      maxWidth: '350px',
                      fontSize: { xs: '14px', sm: '15px' },
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                  >
                    {t('footer.brandDescription')}
                  </Typography>
                </motion.div>
              </Grid>

              {/* Social Links with Bounce Animation */}
              <Grid item xs={12} md={3}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ textAlign: isMobile ? (isRTL ? 'right' : 'left') : 'center' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: 'Oswald, sans-serif',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        mb: 2.5,
                        letterSpacing: '1px',
                        fontSize: { xs: '14px', sm: '15px' },
                      }}
                    >
                      {t('footer.connectWithUs')}
                    </Typography>
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      justifyContent={isMobile ? (isRTL ? 'flex-start' : 'flex-start') : 'center'}
                    >
                      <SocialIcon
                        onClick={() => handleSocialClick('instagram')}
                        variants={bounceAnimation}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        whileTap={{ scale: 0.95 }}
                      >
                        <InstagramIcon sx={{ fontSize: '24px' }} />
                      </SocialIcon>
                      <SocialIcon
                        onClick={() => handleSocialClick('tiktok')}
                        variants={bounceAnimation}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        whileTap={{ scale: 0.95 }}
                      >
                        <FontAwesomeIcon icon={faTiktok} style={{ fontSize: '22px' }} />
                      </SocialIcon>
                    </Stack>
                    
                    {/* Additional decorative element */}
                    <Box sx={{ mt: 3, display: isMobile ? 'none' : 'block' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'Oswald, sans-serif',
                          color: alpha('#FFFFFF', 0.4),
                          letterSpacing: '0.5px',
                        }}
                      >
                        WQAR SCENT
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>

              {/* Newsletter Section */}
              <Grid item xs={12} md={5}>
                <motion.div variants={itemVariants}>
                  <NewsletterSection>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'Oswald, sans-serif',
                            color: '#8C5A3C',
                            fontWeight: 600,
                            fontSize: { xs: '16px', sm: '18px' },
                            letterSpacing: '0.5px',
                            mb: 0.5,
                          }}
                        >
                          {t('footer.getDiscount')}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'Oswald, sans-serif',
                            color: alpha('#8C5A3C', 0.8),
                            fontSize: '12px',
                            lineHeight: 1.4,
                          }}
                        >
                          {t('footer.subscribeOffer')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={7}>
                        <form onSubmit={handleNewsletterSubmit}>
                          <NewsletterInput
                            fullWidth
                            placeholder={t('footer.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      type="submit"
                                      disabled={loading}
                                      sx={{
                                        minWidth: 'auto',
                                        bgcolor: '#8C5A3C',
                                        color: '#ffffff',
                                        borderRadius: '60px',
                                        px: 2.5,
                                        py: 1,
                                        fontFamily: 'Oswald, sans-serif',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        '&:hover': {
                                          bgcolor: alpha('#8C5A3C', 0.9),
                                        },
                                      }}
                                    >
                                      {loading ? '...' : <SendIcon sx={{ fontSize: '18px' }} />}
                                    </Button>
                                  </motion.div>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </form>
                      </Grid>
                    </Grid>
                  </NewsletterSection>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>

          <Divider sx={{ my: 4, bgcolor: alpha('#FFFFFF', 0.1) }} />

          {/* Bottom Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  color: alpha('#FFFFFF', 0.6),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '11px', sm: '12px' },
                }}
              >
                <CopyrightIcon sx={{ fontSize: '12px' }} />
                {new Date().getFullYear()} {t('footer.copyright')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    color: alpha('#FFFFFF', 0.5),
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {t('footer.privacy')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    color: alpha('#FFFFFF', 0.5),
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {t('footer.terms')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    color: alpha('#FFFFFF', 0.5),
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {t('footer.support')}
                </Typography>
              </Box>
              
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  color: alpha('#FFFFFF', 0.5),
                  letterSpacing: '0.5px',
                }}
              >
                {t('footer.tagline')}
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </FooterContainer>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          elevation={6}
          sx={{
            width: '100%',
            fontFamily: 'Oswald, sans-serif',
            bgcolor: '#8C5A3C',
            color: '#FFFFFF',
            '& .MuiAlert-icon': {
              color: '#FFFFFF',
            },
          }}
        >
          {t('footer.subscribeSuccess')}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Footer;