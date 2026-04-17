import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Rating,
  alpha,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  LinearProgress,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageContext';
import '@fontsource/oswald';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Import map components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import services
import { getProducts } from '../services/productService';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Store locations data
const storeLocations = [
  {
    id: 1,
    name: 'Wiqar Store',
    nameAr: 'متجر وقار',
    address: 'Sousse, Tunisie',
    addressAr: 'سوسة، تونس',
    addressFr: 'Sousse, Tunisie',
    coordinates: [35.8254, 10.6370],
  },
];

const badgeColors = {
  'Bestseller': { bg: '#6B4423', color: '#FFF8F0' },
  'New Arrival': { bg: '#2C6E61', color: '#F0FAF7' },
  'Limited Edition': { bg: '#1A1A1A', color: '#F5F0EA' },
  'Summer Edit': { bg: '#C4884A', color: '#FFF8F0' },
  "Editor's Pick": { bg: '#4A3F6B', color: '#F5F0FA' },
  'Customer Favorite': { bg: '#6B4423', color: '#FFF8F0' },
  'Artisan Blend': { bg: '#5C4A32', color: '#FFF8F0' },
};

// Helper function to get full image URL (matching AdminBar)
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Default avatars
  if (imagePath === 'default-avatar.jpg' || imagePath === 'default-avatar.png') {
    return '/default-avatar.jpg';
  }
  
  // Get base URL from environment (without /api)
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove /api from the end if present
  const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
  // Remove leading slashes from image path
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${cleanBaseUrl}/${cleanPath}`;
};

// Helper function to get product image URL
const getProductImageUrl = (product) => {
  if (!product) return '/placeholder-image.jpg';
  
  // Check if product has images array
  if (product.images && product.images.length > 0) {
    // Get the primary image or first image
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    if (primaryImage && primaryImage.url) {
      return getFullImageUrl(primaryImage.url);
    }
  }
  return '/placeholder-image.jpg';
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  
  // State for real products
  const [products, setProducts] = useState({
    men: [],
    women: [],
    unisex: [],
    featured: []
  });
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  // Load products from API
  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      // Fetch limited products (only 8-10 per category)
      const [menRes, womenRes, unisexRes, featuredRes] = await Promise.all([
        getProducts({ gender: 'men', limit: 8 }),
        getProducts({ gender: 'women', limit: 8 }),
        getProducts({ gender: 'unisex', limit: 8 }),
        getProducts({ featured: true, limit: 10 })
      ]);
      
      setProducts({
        men: menRes.data || [],
        women: womenRes.data || [],
        unisex: unisexRes.data || [],
        featured: featuredRes.data || []
      });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ bgcolor: '#F9F6F1', minHeight: '100vh' }}>
        <Container sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#6B4423' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#F9F6F1',
        minHeight: '100vh',
        fontFamily: 'Oswald, sans-serif',
        direction: isRTL ? 'rtl' : 'ltr',
        backgroundImage: `radial-gradient(ellipse at 20% 0%, rgba(184,124,79,0.07) 0%, transparent 55%),
                          radial-gradient(ellipse at 80% 100%, rgba(107,68,35,0.06) 0%, transparent 55%)`,
      }}
    >
      {/* ── HERO SECTION ── */}
      <Box
        sx={{
          pt: { xs: 4, md: 4 },
          pb: { xs: 4, md: 4 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              width: '1px',
              height: '64px',
              bgcolor: alpha('#6B4423', 0.3),
              mx: 'auto',
              mb: 4,
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Typography
            component="p"
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 400,
              fontSize: { xs: '11px', md: '12px' },
              letterSpacing: '0.35em',
              color: '#1A1A1A',
              textTransform: 'uppercase',
              mb: 3,
            }}
          >
            {t('hero.subtitle')}
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '42px', sm: '58px', md: '80px', lg: '96px' },
              lineHeight: 0.92,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              color: '#6B4423',
              mb: 1,
            }}
          >
            {t('hero.title1')}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: { xs: '42px', sm: '58px', md: '80px', lg: '96px' },
              lineHeight: 1.3,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              background: 'linear-gradient(120deg, #B87C4F 0%, #6B4423 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 5,
            }}
          >
            {t('hero.title2')}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontSize: { xs: '15px', md: '17px' },
              letterSpacing: '0.05em',
              color: alpha('#1A1A1A'),
              maxWidth: '540px',
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            {t('hero.description')}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              width: '1px',
              height: '48px',
              bgcolor: alpha('#6B4423', 0.3),
              mx: 'auto',
              mt: 6,
            }}
          />
        </motion.div>
      </Box>

      {/* ── PREMIUM SLIDER SECTION (FEATURED PRODUCTS) ── */}
      {products.featured.length > 0 && (
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 4, sm: 5, md: 6 } }}>
          <Box sx={{ mb: { xs: 4, sm: 5, md: 6 }, textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: { xs: '10px', sm: '11px' },
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: alpha('#6B4423', 0.6),
                  mb: 1.5,
                  fontWeight: 600,
                }}
              >
                {t('signature.title')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: { xs: '32px', sm: '40px', md: '48px' },
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#1A1A1A',
                  mb: 2,
                  textTransform: 'uppercase',
                }}
              >
                {t('signature.subtitle')}
              </Typography>
              <Box
                sx={{
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #6B4423 0%, #B87C4F 100%)',
                  mx: 'auto',
                  borderRadius: '3px',
                }}
              />
            </motion.div>
          </Box>

          <Box sx={{ position: 'relative', px: { xs: 0, md: 2 } }}>
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              centeredSlides={false}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                900: { slidesPerView: 3, spaceBetween: 24 },
                1200: { slidesPerView: 4, spaceBetween: 28 },
              }}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              style={{ padding: '20px 0 50px 0' }}
            >
              {products.featured.map((product, index) => (
                <SwiperSlide key={product._id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ height: '100%' }}
                  >
                    <ProductCard
                      product={product}
                      wishlisted={wishlisted[product._id]}
                      onWishlist={(e) => toggleWishlist(e, product._id)}
                      onClick={() => navigate(`/product/${product._id}`)}
                      isActive={index === activeIndex}
                      t={t}
                      isRTL={isRTL}
                      currentLanguage={currentLanguage}
                      isMobile={isMobile}
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <IconButton
              className="swiper-button-prev-custom"
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: '#6B4423',
                  color: '#FFFFFF',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.3s ease',
                display: { xs: 'none', md: 'flex' },
              }}
            >
              {isRTL ? <ArrowForwardIosIcon sx={{ fontSize: 20 }} /> : <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />}
            </IconButton>

            <IconButton
              className="swiper-button-next-custom"
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: '#6B4423',
                  color: '#FFFFFF',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.3s ease',
                display: { xs: 'none', md: 'flex' },
              }}
            >
              {isRTL ? <ArrowBackIosNewIcon sx={{ fontSize: 20 }} /> : <ArrowForwardIosIcon sx={{ fontSize: 20 }} />}
            </IconButton>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', mt: 3, px: 4 }}>
              <LinearProgress
                variant="determinate"
                value={((activeIndex + 1) / products.featured.length) * 100}
                sx={{
                  height: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#6B4423', 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#6B4423',
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Slide Counter */}
            <Typography
              sx={{
                position: 'absolute',
                bottom: 10,
                [isRTL ? 'left' : 'right']: 20,
                fontSize: '12px',
                color: alpha('#1A1A1A', 0.5),
                fontFamily: 'Oswald',
                letterSpacing: '0.05em',
              }}
            >
              {activeIndex + 1} / {products.featured.length}
            </Typography>
          </Box>
        </Container>
      )}

      {/* ── GENDER SECTIONS (MEN, WOMEN, UNISEX) ── */}
      {/* MEN SECTION */}
      {products.men.length > 0 && (
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 4, sm: 5, md: 6 } }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: { xs: '28px', sm: '36px', md: '42px' },
                fontWeight: 700,
                color: '#1A1A1A',
                mb: 1,
                textTransform: 'uppercase',
              }}
            >
              FOR MEN
            </Typography>
            <Box
              sx={{
                width: '50px',
                height: '2px',
                background: 'linear-gradient(90deg, #6B4423 0%, #B87C4F 100%)',
                mx: 'auto',
                borderRadius: '2px',
              }}
            />
          </Box>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {products.men.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlisted={wishlisted[product._id]}
                onWishlist={(e) => toggleWishlist(e, product._id)}
                onClick={() => navigate(`/product/${product._id}`)}
                isActive={false}
                t={t}
                isRTL={isRTL}
                currentLanguage={currentLanguage}
                isMobile={isMobile}
              />
            ))}
          </Box>
        </Container>
      )}

      {/* WOMEN SECTION */}
      {products.women.length > 0 && (
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 4, sm: 5, md: 6 } }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: { xs: '28px', sm: '36px', md: '42px' },
                fontWeight: 700,
                color: '#1A1A1A',
                mb: 1,
                textTransform: 'uppercase',
              }}
            >
              FOR WOMEN
            </Typography>
            <Box
              sx={{
                width: '50px',
                height: '2px',
                background: 'linear-gradient(90deg, #6B4423 0%, #B87C4F 100%)',
                mx: 'auto',
                borderRadius: '2px',
              }}
            />
          </Box>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {products.women.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlisted={wishlisted[product._id]}
                onWishlist={(e) => toggleWishlist(e, product._id)}
                onClick={() => navigate(`/product/${product._id}`)}
                isActive={false}
                t={t}
                isRTL={isRTL}
                currentLanguage={currentLanguage}
                isMobile={isMobile}
              />
            ))}
          </Box>
        </Container>
      )}

      {/* UNISEX SECTION */}
      {products.unisex.length > 0 && (
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 4, sm: 5, md: 6 } }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: { xs: '28px', sm: '36px', md: '42px' },
                fontWeight: 700,
                color: '#1A1A1A',
                mb: 1,
                textTransform: 'uppercase',
              }}
            >
              UNISEX
            </Typography>
            <Box
              sx={{
                width: '50px',
                height: '2px',
                background: 'linear-gradient(90deg, #6B4423 0%, #B87C4F 100%)',
                mx: 'auto',
                borderRadius: '2px',
              }}
            />
          </Box>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {products.unisex.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlisted={wishlisted[product._id]}
                onWishlist={(e) => toggleWishlist(e, product._id)}
                onClick={() => navigate(`/product/${product._id}`)}
                isActive={false}
                t={t}
                isRTL={isRTL}
                currentLanguage={currentLanguage}
                isMobile={isMobile}
              />
            ))}
          </Box>
        </Container>
      )}

      {/* ── STORE LOCATOR MAP SECTION ── */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 2, md: 2, lg: 2 }, py: { xs: 4, sm: 5, md: 6 } }}>
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6 }, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: { xs: '10px', sm: '11px' },
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: alpha('#6B4423', 0.6),
                mb: 1.5,
                fontWeight: 600,
              }}
            >
              {t('storeLocator.findUs')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: { xs: '32px', sm: '40px', md: '48px' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
                mb: 2,
                textTransform: 'uppercase',
              }}
            >
              {t('storeLocator.title')}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 300,
                color: alpha('#1A1A1A', 0.7),
                maxWidth: '600px',
                mx: 'auto',
                mb: 3,
              }}
            >
              {t('storeLocator.description')}
            </Typography>
            <Box
              sx={{
                width: '60px',
                height: '3px',
                background: 'linear-gradient(90deg, #6B4423 0%, #B87C4F 100%)',
                mx: 'auto',
                borderRadius: '3px',
              }}
            />
          </motion.div>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: `1px solid ${alpha('#6B4423', 0.1)}`,
            boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)',
            height: { xs: '400px', md: '500px' },
            position: 'relative',
          }}
        >
          <MapContainer
            center={[35.8254, 10.6370]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {storeLocations.map((store) => (
              <Marker key={store.id} position={store.coordinates}>
                <Popup>
                  <Box sx={{ p: 1, minWidth: '180px' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Oswald',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: '#6B4423',
                        mb: 0.5,
                      }}
                    >
                      {store.name}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '12px', 
                        color: alpha('#1A1A1A', 0.7),
                        mb: 1,
                      }}
                    >
                      {currentLanguage === 'ar' ? store.addressAr : store.address}
                    </Typography>
                    <Button
                      size="small"
                      href={`https://www.google.com/maps/dir//${store.coordinates[0]},${store.coordinates[1]}`}
                      target="_blank"
                      sx={{
                        fontSize: '10px',
                        fontFamily: 'Oswald',
                        color: '#6B4423',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t('storeLocator.getDirections')}
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              [isRTL ? 'left' : 'right']: 16,
              zIndex: 1000,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '30px',
              px: 2,
              py: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocationOnIcon sx={{ fontSize: 16, color: '#6B4423' }} />
            <Typography sx={{ fontFamily: 'Oswald', fontSize: '11px', fontWeight: 600 }}>
              {storeLocations.length} {t('storeLocator.locations')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

/* ── PRODUCT CARD COMPONENT ── */
const ProductCard = ({ product, wishlisted, onWishlist, onClick, isActive, t, isRTL, currentLanguage, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  // Get badge color based on product tags
  const getBadgeColor = () => {
    if (product.tags && product.tags.length > 0) {
      const tag = product.tags[0];
      if (badgeColors[tag]) return badgeColors[tag];
    }
    return { bg: '#6B4423', color: '#FFF8F0' };
  };
  
  const badge = getBadgeColor();
  const discount = product.discountPercentage || 0;
  const currentPrice = product.currentPrice || product.price;
  const hasDiscount = discount > 0;
  
  // Get image URL - using the helper function
  const imageUrl = getProductImageUrl(product);

  // Get translated badge text
  const getBadgeText = () => {
    if (!product.tags || product.tags.length === 0) return null;
    const tag = product.tags[0];
    if (currentLanguage === 'ar') {
      const badgeMap = {
        'Bestseller': 'الأكثر مبيعاً',
        'New Arrival': 'وافد جديد',
        'Limited Edition': 'إصدار محدود',
        'Summer Edit': 'تشكيلة الصيف',
        "Editor's Pick": 'اختيار المحررين',
        'Customer Favorite': 'المفضل لدى العملاء',
        'Artisan Blend': 'مزيج حرفي',
      };
      return badgeMap[tag] || tag;
    }
    if (currentLanguage === 'fr') {
      const badgeMap = {
        'Bestseller': 'Meilleure Vente',
        'New Arrival': 'Nouveauté',
        'Limited Edition': 'Édition Limitée',
        'Summer Edit': 'Édition Été',
        "Editor's Pick": 'Choix de la Rédaction',
        'Customer Favorite': 'Favori des Clients',
        'Artisan Blend': 'Mélange Artisanal',
      };
      return badgeMap[tag] || tag;
    }
    return tag;
  };

  const handleSizeClick = (e, size) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 1,
        opacity: isActive ? 1 : 1,
      }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        elevation={0}
        sx={{
          borderRadius: { xs: '16px', md: '20px' },
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${alpha('#6B4423', 0.08)}`,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'all 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)',
          '&:hover': {
            borderColor: alpha('#6B4423', 0.3),
            boxShadow: `0 30px 50px -20px rgba(107, 68, 35, 0.35), 0 0 0 1px ${alpha('#6B4423', 0.1)}`,
            transform: 'translateY(-8px)',
          },
        }}
      >
        {/* Premium Badge */}
        {product.tags && product.tags.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: { xs: 12, md: 20 },
              [isRTL ? 'right' : 'left']: { xs: 12, md: 20 },
              zIndex: 3,
              background: `linear-gradient(135deg, ${badge.bg} 0%, ${alpha(badge.bg, 0.9)} 50%, ${alpha(badge.bg, 0.7)} 100%)`,
              backdropFilter: 'blur(8px)',
              color: badge.color,
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 600,
              fontSize: { xs: '8px', md: '10px' },
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              px: { xs: 1, md: 2 },
              py: { xs: 0.5, md: 1 },
              borderRadius: '30px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {getBadgeText()}
          </Paper>
        )}

        {/* Wishlist Button */}
        <Tooltip 
          title={wishlisted ? t('productCard.removeFromWishlist') : t('productCard.addToWishlist')} 
          placement="top" 
          arrow
        >
          <IconButton
            size="small"
            onClick={onWishlist}
            sx={{
              position: 'absolute',
              top: { xs: 12, md: 20 },
              [isRTL ? 'left' : 'right']: { xs: 12, md: 20 },
              zIndex: 3,
              bgcolor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(12px)',
              width: { xs: 32, md: 40 },
              height: { xs: 32, md: 40 },
              transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '50%',
              '&:hover': { 
                transform: 'scale(1.12) rotate(5deg)', 
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(107, 68, 35, 0.25)',
              },
            }}
          >
            {wishlisted
              ? <FavoriteIcon sx={{ fontSize: { xs: 16, md: 20 }, color: '#C4364A' }} />
              : <FavoriteBorderIcon sx={{ fontSize: { xs: 16, md: 20 }, color: '#6B4423' }} />
            }
          </IconButton>
        </Tooltip>

        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            height: { xs: '200px', sm: '250px', md: '340px' },
            flexShrink: 0,
            bgcolor: '#F9F5F0',
            overflow: 'hidden',
            borderBottom: `1px solid ${alpha('#6B4423', 0.05)}`,
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}
            image={imageUrl}
            alt={product.name}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.target.src = '/placeholder-image.jpg';
            }}
          />

          {/* Overlay with fragrance notes - hide on mobile */}
          {!isMobile && (
            <Fade in={hovered} timeout={400}>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {product.fragrance?.split(',').slice(0, 3).map((note, idx) => (
                    <motion.div
                      key={note}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          fontFamily: 'Oswald, sans-serif',
                          fontSize: '10px',
                          fontWeight: 500,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#FFFFFF',
                          background: alpha('#FFFFFF', 0.2),
                          backdropFilter: 'blur(8px)',
                          px: 1.5,
                          py: 0.8,
                          borderRadius: '30px',
                          border: `1px solid ${alpha('#FFFFFF', 0.25)}`,
                        }}
                      >
                        {note.trim()}
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            </Fade>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 12, md: 20 },
                [isRTL ? 'left' : 'right']: { xs: 12, md: 20 },
                zIndex: 2,
                background: 'linear-gradient(135deg, #2C6E61 0%, #1E4F45 100%)',
                color: '#FFFFFF',
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '10px', md: '13px' },
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.5, md: 0.8 },
                borderRadius: '30px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                letterSpacing: '0.05em',
              }}
            >
              -{discount}% OFF
            </Box>
          )}
        </Box>

        {/* Content */}
        <CardContent
          sx={{
            p: { xs: 2, md: 3.5 },
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1, md: 1.5 },
          }}
        >
          {/* Name */}
          <Typography
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '16px', md: '24px' },
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              lineHeight: 1.2,
              mb: 0.5,
              transition: 'color 0.2s ease',
              textAlign: isRTL ? 'right' : 'left',
              '&:hover': {
                color: '#6B4423',
              },
            }}
          >
            {product.name.length > 20 && isMobile ? `${product.name.substring(0, 18)}...` : product.name}
          </Typography>

          {/* Gender Chip */}
          <Chip
            label={product.gender?.toUpperCase()}
            size="small"
            sx={{
              alignSelf: isRTL ? 'flex-end' : 'flex-start',
              bgcolor: alpha('#6B4423', 0.1),
              color: '#6B4423',
              fontWeight: 600,
              fontSize: { xs: '8px', md: '10px' },
              fontFamily: 'Oswald, sans-serif',
              height: { xs: 20, md: 24 },
            }}
          />

          {/* Fragrance preview - hide on mobile */}
          {!isMobile && (
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 300,
                fontSize: '12px',
                color: alpha('#1A1A1A', 0.7),
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {product.fragrance}
            </Typography>
          )}

          {/* Rating */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating
              value={product.rating || 0}
              precision={0.1}
              size="small"
              readOnly
              sx={{
                '& .MuiRating-iconFilled': { color: '#B87C4F' },
                '& .MuiRating-iconEmpty': { color: alpha('#B87C4F', 0.2) },
                '& .MuiRating-icon': { fontSize: { xs: '14px', md: '18px' } },
              }}
            />
            {!isMobile && (
              <Typography
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '11px',
                  color: alpha('#1A1A1A', 0.6),
                }}
              >
                ({product.reviewCount || 0} reviews)
              </Typography>
            )}
          </Stack>

          {!isMobile && <Divider sx={{ borderColor: alpha('#6B4423', 0.1) }} />}

          {/* Price Section - Using TND */}
          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mt: { xs: 0, md: 0 } }}>
            <Box>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 800,
                    fontSize: { xs: '18px', md: '32px' },
                    letterSpacing: '-0.5px',
                    color: '#6B4423',
                    lineHeight: 1,
                  }}
                >
                  {currentPrice} TND
                </Typography>
                {hasDiscount && !isMobile && (
                  <Typography
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 400,
                      fontSize: { xs: '10px', md: '14px' },
                      color: alpha('#1A1A1A', 0.4),
                      textDecoration: 'line-through',
                    }}
                  >
                    {product.price} TND
                  </Typography>
                )}
              </Stack>
              {!isMobile && (
                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 12, color: '#2C6E61' }} />
                  <Typography
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#2C6E61',
                    }}
                  >
                    FREE SHIPPING
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Add to Bag Button */}
            <Tooltip title="Add to Cart" placement="top" arrow>
              <Button
                variant="contained"
                disableElevation
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: '#1A1A1A',
                  color: '#FFF8F0',
                  borderRadius: '40px',
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: { xs: '8px', md: '12px' },
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  px: { xs: 1.5, md: 3 },
                  py: { xs: 0.8, md: 1.2 },
                  minWidth: { xs: '70px', md: '120px' },
                  transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                  '&:hover': {
                    bgcolor: '#6B4423',
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(107, 68, 35, 0.35)',
                  },
                }}
              >
                {isMobile ? 'BUY' : 'ADD TO CART'}
              </Button>
            </Tooltip>
          </Stack>

          {/* Size Selector - simplified on mobile */}
          {product.quantity && product.quantity.length > 0 && !isMobile && (
            <Stack direction="row" spacing={1.5} mt={1} useFlexGap>
              {product.quantity.slice(0, 2).map((size) => (
                <motion.div
                  key={size}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={(e) => handleSizeClick(e, size)}
                    sx={{
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: selectedSize === size ? '#FFFFFF' : alpha('#1A1A1A', 0.7),
                      bgcolor: selectedSize === size ? '#6B4423' : 'transparent',
                      border: `1.5px solid ${selectedSize === size ? '#6B4423' : alpha('#1A1A1A', 0.2)}`,
                      px: 2,
                      py: 0.8,
                      borderRadius: '30px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1)',
                      minWidth: '48px',
                      textAlign: 'center',
                      '&:hover': {
                        borderColor: '#6B4423',
                        color: '#6B4423',
                        bgcolor: alpha('#6B4423', 0.05),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {size}
                  </Box>
                </motion.div>
              ))}
            </Stack>
          )}

          {/* Assurance Badge - simplified on mobile */}
          {!isMobile && (
            <Stack 
              direction="row" 
              spacing={1.5} 
              alignItems="center" 
              justifyContent="center" 
              mt={2.5}
              sx={{
                pt: 2,
                borderTop: `1px solid ${alpha('#6B4423', 0.08)}`,
              }}
            >
              <SpaOutlinedIcon sx={{ fontSize: 14, color: '#6B4423' }} />
              <Typography
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha('#1A1A1A', 0.55),
                  textAlign: 'center',
                }}
              >
                ARTISANAL FRAGRANCES
              </Typography>
              <VerifiedOutlinedIcon sx={{ fontSize: 12, color: alpha('#6B4423', 0.5) }} />
            </Stack>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home;