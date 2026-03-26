import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Import map components
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import images from assets folder
import desertOud from '../assets/wqar-C.png';
import coastalBreeze from '../assets/wqar-D.png';
import saharaAmber from '../assets/wqar-S.png';
import mediterraneanSalt from '../assets/wqar-C.png';
import midnightDune from '../assets/wqar-S.png';
import coralReef from '../assets/wqar-D.png';
import goldenSand from '../assets/wqar-C.png';
import saltStone from '../assets/wqar-S.png';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Store locations data (random locations in Dubai for demo)
const storeLocations = [
  {
    id: 1,
    name: 'Wqar Flagship Store',
    address: '123 Luxury Avenue, Downtown Dubai, UAE',
    coordinates: [25.2048, 55.2708],
  },
  {
    id: 2,
    name: 'Wqar Boutique',
    address: '45 Beach Road, Jumeirah, Dubai',
    coordinates: [25.2082, 55.2571],
  },
  {
    id: 3,
    name: 'Wqar Signature Store',
    address: 'The Palm, Palm Jumeirah, Dubai',
    coordinates: [25.1122, 55.1399],
  },
];

const products = [
  {
    id: 1,
    name: 'Desert Oud',
    description: 'Warm amber, sandalwood, and rare oud blend. A sophisticated fragrance that captures the essence of endless golden dunes.',
    price: 89,
    oldPrice: 120,
    image: desertOud,
    sizes: ['50ml', '100ml'],
    rating: 4.8,
    reviews: 124,
    badge: 'Bestseller',
    isNew: false,
    notes: { top: ['Saffron', 'Bergamot'], heart: ['Oud Wood', 'Amber'], base: ['Vanilla', 'Musk'] },
    season: ['Fall', 'Winter'],
  },
  {
    id: 2,
    name: 'Coastal Breeze',
    description: 'Fresh sea salt, bergamot, and white musk. A refreshing journey along pristine shorelines.',
    price: 79,
    oldPrice: 110,
    image: coastalBreeze,
    sizes: ['50ml', '100ml'],
    rating: 4.9,
    reviews: 98,
    badge: 'New Arrival',
    isNew: true,
    notes: { top: ['Bergamot', 'Sea Salt'], heart: ['Jasmine', 'Marine'], base: ['White Musk', 'Ambergris'] },
    season: ['Spring', 'Summer'],
  },
  {
    id: 3,
    name: 'Sahara Amber',
    description: 'Rich amber, vanilla, and exotic spices. A warm embrace reminiscent of desert nights.',
    price: 94,
    oldPrice: 125,
    image: saharaAmber,
    sizes: ['50ml', '100ml'],
    rating: 4.7,
    reviews: 87,
    badge: 'Limited Edition',
    isNew: false,
    notes: { top: ['Cinnamon', 'Cardamom'], heart: ['Amber', 'Vanilla'], base: ['Benzoin', 'Sandalwood'] },
    season: ['Fall', 'Winter'],
  },
  {
    id: 4,
    name: 'Mediterranean Salt',
    description: 'Crisp ocean air, jasmine, and driftwood. An aromatic voyage across turquoise waters.',
    price: 84,
    oldPrice: 115,
    image: mediterraneanSalt,
    sizes: ['50ml', '100ml'],
    rating: 4.8,
    reviews: 112,
    badge: 'Summer Edit',
    isNew: false,
    notes: { top: ['Lemon', 'Rosemary'], heart: ['Jasmine', 'Fig Leaf'], base: ['Driftwood', 'Cedar'] },
    season: ['Spring', 'Summer'],
  },
  {
    id: 5,
    name: 'Midnight Dune',
    description: 'Dark leather, smoky incense, and cedarwood. A mysterious scent for the night.',
    price: 99,
    oldPrice: 135,
    image: midnightDune,
    sizes: ['50ml', '100ml'],
    rating: 4.9,
    reviews: 156,
    badge: "Editor's Pick",
    isNew: false,
    notes: { top: ['Incense', 'Saffron'], heart: ['Leather', 'Tobacco'], base: ['Cedarwood', 'Amber'] },
    season: ['Fall', 'Winter'],
  },
  {
    id: 6,
    name: 'Coral Reef',
    description: 'Tropical fruits, sea moss, and coral flower. A vibrant underwater paradise.',
    price: 74,
    oldPrice: 105,
    image: coralReef,
    sizes: ['50ml', '100ml'],
    rating: 4.6,
    reviews: 73,
    badge: 'New Arrival',
    isNew: true,
    notes: { top: ['Tropical Fruits', 'Mandarin'], heart: ['Coral Flower', 'Sea Moss'], base: ['Musk', 'Ambergris'] },
    season: ['Summer'],
  },
  {
    id: 7,
    name: 'Golden Sand',
    description: 'Warm vanilla, tonka bean, and sun-kissed musk. A radiant beachside glow.',
    price: 86,
    oldPrice: 118,
    image: goldenSand,
    sizes: ['50ml', '100ml'],
    rating: 4.8,
    reviews: 104,
    badge: 'Customer Favorite',
    isNew: false,
    notes: { top: ['Coconut', 'Bergamot'], heart: ['Vanilla', 'Tonka Bean'], base: ['Sandalwood', 'Caramel'] },
    season: ['Summer'],
  },
  {
    id: 8,
    name: 'Salt & Stone',
    description: 'Mineral accord, sage, and sea salt crystals. An earthy coastal mineral blend.',
    price: 81,
    oldPrice: 112,
    image: saltStone,
    sizes: ['50ml', '100ml'],
    rating: 4.7,
    reviews: 91,
    badge: 'Artisan Blend',
    isNew: false,
    notes: { top: ['Sea Salt', 'Citrus'], heart: ['Sage', 'Lavender'], base: ['Vetiver', 'Oakmoss'] },
    season: ['Spring', 'Fall'],
  },
];

const badgeColors = {
  'Bestseller':        { bg: '#6B4423', color: '#FFF8F0' },
  'New Arrival':       { bg: '#2C6E61', color: '#F0FAF7' },
  'Limited Edition':   { bg: '#1A1A1A', color: '#F5F0EA' },
  'Summer Edit':       { bg: '#C4884A', color: '#FFF8F0' },
  "Editor's Pick":     { bg: '#4A3F6B', color: '#F5F0FA' },
  'Customer Favorite': { bg: '#6B4423', color: '#FFF8F0' },
  'Artisan Blend':     { bg: '#5C4A32', color: '#FFF8F0' },
};

const Home = () => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box
      sx={{
        bgcolor: '#F9F6F1',
        minHeight: '100vh',
        fontFamily: 'Oswald, sans-serif',
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
            The Wqar Collection
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
            From the Desert,
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: { xs: '42px', sm: '58px', md: '80px', lg: '96px' },
              lineHeight: 0.92,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              background: 'linear-gradient(120deg, #B87C4F 0%, #6B4423 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 5,
            }}
          >
            to the Coast
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
            Scents that tell stories of land and sea — bridging two sides of a country through artisanal fragrance.
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

      {/* ── PREMIUM SLIDER SECTION ── */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: { xs: 4, sm: 5, md: 6 } }}>
        {/* Section Header */}
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
              Signature Collection
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
              Curated Fragrances
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

        {/* Stats Badges */}
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          sx={{ mb: 5, flexWrap: 'wrap', gap: 2 }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '40px',
              bgcolor: alpha('#6B4423', 0.05),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 18, color: '#6B4423' }} />
            <Typography sx={{ fontFamily: 'Oswald', fontSize: '12px', fontWeight: 500 }}>
              Award-Winning Scents
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '40px',
              bgcolor: alpha('#6B4423', 0.05),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <WhatshotIcon sx={{ fontSize: 18, color: '#6B4423' }} />
            <Typography sx={{ fontFamily: 'Oswald', fontSize: '12px', fontWeight: 500 }}>
              Bestseller Collection
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '40px',
              bgcolor: alpha('#6B4423', 0.05),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 18, color: '#6B4423' }} />
            <Typography sx={{ fontFamily: 'Oswald', fontSize: '12px', fontWeight: 500 }}>
              4.8+ Average Rating
            </Typography>
          </Paper>
        </Stack>

        {/* Premium Slider */}
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
            {products.map((product, index) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ height: '100%' }}
                >
                  <ProductCard
                    product={product}
                    wishlisted={wishlisted[product.id]}
                    onWishlist={(e) => toggleWishlist(e, product.id)}
                    onClick={() => navigate(`/product/${product.id}`)}
                    isActive={index === activeIndex}
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
            <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
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
            <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Progress Bar */}
          <Box sx={{ width: '100%', mt: 3, px: 4 }}>
            <LinearProgress
              variant="determinate"
              value={((activeIndex + 1) / products.length) * 100}
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
              right: 20,
              fontSize: '12px',
              color: alpha('#1A1A1A', 0.5),
              fontFamily: 'Oswald',
              letterSpacing: '0.05em',
            }}
          >
            {activeIndex + 1} / {products.length}
          </Typography>
        </Box>

        {/* Quick Action Bar */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 5 }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/collection')}
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#6B4423',
              borderColor: alpha('#6B4423', 0.3),
              borderRadius: '40px',
              px: 4,
              py: 1.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#6B4423',
                backgroundColor: alpha('#6B4423', 0.05),
                transform: 'translateY(-2px)',
              },
            }}
          >
            View Full Collection
          </Button>
        </Stack>
      </Container>

      {/* ── STORE LOCATOR MAP SECTION (SIMPLE VERSION) ── */}
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 2, md: 2, lg: 2 }, py: { xs: 2, sm: 2, md: 2 } }}>
        {/* Section Header */}
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
              Find Us
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
              Our Locations
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
              Visit us at one of our boutique locations across the city
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

        {/* Simple Map */}
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
            center={[25.2048, 55.2708]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {storeLocations.map((store) => (
              <Marker
                key={store.id}
                position={store.coordinates}
              >
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
                      {store.address}
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
                        '&:hover': {
                          bgcolor: alpha('#6B4423', 0.1),
                        },
                      }}
                    >
                      Get Directions
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Overlay Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
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
              {storeLocations.length} Store Locations
            </Typography>
          </Box>
        </Paper>

        {/* Simple Store List */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          {storeLocations.map((store) => (
            <Paper
              key={store.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                border: `1px solid ${alpha('#6B4423', 0.1)}`,
                bgcolor: '#FFFFFF',
                flex: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(107,68,35,0.1)',
                  borderColor: alpha('#6B4423', 0.3),
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 20, color: '#6B4423' }} />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Oswald',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#1A1A1A',
                      mb: 0.5,
                    }}
                  >
                    {store.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: alpha('#1A1A1A', 0.6),
                    }}
                  >
                    {store.address}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

/* ── PRODUCT CARD COMPONENT ── */
const ProductCard = ({ product, wishlisted, onWishlist, onClick, isActive }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const badge = badgeColors[product.badge] || { bg: '#6B4423', color: '#FFF8F0' };
  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  const handleSizeClick = (e, size) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.98,
        opacity: isActive ? 1 : 0.95,
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
          borderRadius: '20px',
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
            transform: 'translateY(-12px)',
          },
        }}
      >
        {/* Premium Badge */}
        {product.badge && (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 3,
              background: `linear-gradient(135deg, ${badge.bg} 0%, ${alpha(badge.bg, 0.9)} 50%, ${alpha(badge.bg, 0.7)} 100%)`,
              backdropFilter: 'blur(8px)',
              color: badge.color,
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 600,
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              px: 2,
              py: 1,
              borderRadius: '30px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
            }}
          >
            {product.badge}
          </Paper>
        )}

        {/* Wishlist Button */}
        <Tooltip title={wishlisted ? "Remove from wishlist" : "Add to wishlist"} placement="top" arrow>
          <IconButton
            size="small"
            onClick={onWishlist}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 3,
              bgcolor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(12px)',
              width: 40,
              height: 40,
              transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '50%',
              '&:hover': { 
                transform: 'scale(1.12) rotate(5deg)', 
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(107, 68, 35, 0.25)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {wishlisted
              ? <FavoriteIcon sx={{ fontSize: 20, color: '#C4364A' }} />
              : <FavoriteBorderIcon sx={{ fontSize: 20, color: '#6B4423' }} />
            }
          </IconButton>
        </Tooltip>

        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            height: '340px',
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
              filter: hovered ? 'brightness(1.02)' : 'brightness(1)',
            }}
            image={product.image}
            alt={product.name}
          />

          {/* Overlay */}
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
                {[...product.notes.top, ...product.notes.heart].slice(0, 5).map((note, idx) => (
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
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: alpha('#FFFFFF', 0.3),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {note}
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </Box>
          </Fade>

          {/* Discount Badge */}
          {discount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                zIndex: 2,
                background: 'linear-gradient(135deg, #2C6E61 0%, #1E4F45 100%)',
                color: '#FFFFFF',
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                px: 1.5,
                py: 0.8,
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
            p: 3.5,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Season Tags */}
          <Stack direction="row" spacing={1.5} mb={1}>
            {product.season.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  bgcolor: alpha('#B87C4F', 0.1),
                  color: '#B87C4F',
                  height: '24px',
                  borderRadius: '12px',
                  '& .MuiChip-label': { px: 1.5 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha('#B87C4F', 0.2),
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            ))}
          </Stack>

          {/* Name */}
          <Typography
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              lineHeight: 1.2,
              mb: 0.5,
              transition: 'color 0.2s ease',
              '&:hover': {
                color: '#6B4423',
              },
            }}
          >
            {product.name}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontSize: '13px',
              letterSpacing: '0.02em',
              color: alpha('#1A1A1A', 0.7),
              lineHeight: 1.5,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {product.description}
          </Typography>

          {/* Rating */}
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Rating
              value={product.rating}
              precision={0.1}
              size="small"
              readOnly
              sx={{
                '& .MuiRating-iconFilled': { color: '#B87C4F' },
                '& .MuiRating-iconEmpty': { color: alpha('#B87C4F', 0.2) },
                '& .MuiRating-iconHover': { color: '#6B4423' },
              }}
            />
            <Typography
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: '12px',
                color: alpha('#1A1A1A', 0.6),
                letterSpacing: '0.05em',
                fontWeight: 500,
              }}
            >
              {product.rating} ({product.reviews.toLocaleString()} reviews)
            </Typography>
            <VerifiedOutlinedIcon sx={{ fontSize: 14, color: '#2C6E61' }} />
          </Stack>

          <Divider sx={{ borderColor: alpha('#6B4423', 0.1), mb: 2 }} />

          {/* Price Section */}
          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" mb={2}>
            <Box>
              <Stack direction="row" alignItems="baseline" spacing={1.5}>
                <Typography
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 800,
                    fontSize: '32px',
                    letterSpacing: '-0.5px',
                    color: '#6B4423',
                    lineHeight: 1,
                  }}
                >
                  ${product.price}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: alpha('#1A1A1A', 0.4),
                    textDecoration: 'line-through',
                  }}
                >
                  ${product.oldPrice}
                </Typography>
              </Stack>
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
                  Free Shipping • Express Available
                </Typography>
              </Stack>
            </Box>

            {/* Add to Bag Button */}
            <Tooltip title="Add to cart" placement="top" arrow>
              <Button
                variant="contained"
                disableElevation
                startIcon={<ShoppingBagIcon sx={{ fontSize: '18px !important' }} />}
                sx={{
                  bgcolor: '#1A1A1A',
                  color: '#FFF8F0',
                  borderRadius: '40px',
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  px: 3,
                  py: 1.2,
                  minWidth: '120px',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
                  '&:hover': {
                    bgcolor: '#6B4423',
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(107, 68, 35, 0.35)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(0.98)',
                  },
                }}
              >
                Add to Bag
              </Button>
            </Tooltip>
          </Stack>

          {/* Size Selector */}
          <Stack direction="row" spacing={1.5} mt={1} useFlexGap>
            {product.sizes.map((size) => (
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

          {/* Assurance Badge */}
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
              }}
            >
              Artisanal • Clean Ingredients • Cruelty-Free
            </Typography>
            <VerifiedOutlinedIcon sx={{ fontSize: 12, color: alpha('#6B4423', 0.5) }} />
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home;