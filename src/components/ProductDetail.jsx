import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Chip,
  Button,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  alpha,
  Stack,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import '@fontsource/oswald';

// Import the same product data (you can move this to a separate file)
import desertOud from '../assets/wqar-C.png';
import coastalBreeze from '../assets/wqar-D.png';
import saharaAmber from '../assets/wqar-S.png';
import mediterraneanSalt from '../assets/wqar-C.png';
import midnightDune from '../assets/wqar-S.png';
import coralReef from '../assets/wqar-D.png';
import goldenSand from '../assets/wqar-C.png';
import saltStone from '../assets/wqar-S.png';

const productsData = {
  1: {
    id: 1,
    name: 'Desert Oud',
    description: 'Desert Oud is a masterful blend that transports you to the heart of the Arabian desert.',
    fullDescription: 'Desert Oud is a masterful blend that transports you to the heart of the Arabian desert.',
    price: 89,
    oldPrice: 120,
    image: desertOud,
    sizes: ['50ml', '100ml'],
    rating: 4.8,
    reviews: 124,
    notes: {
      top: ['Saffron', 'Bergamot'],
      heart: ['Oud Wood', 'Amber', 'Sandalwood'],
      base: ['Vanilla', 'Musk', 'Patchouli']
    },
    longevity: '8-10 hours',
    sillage: 'Heavy',
    season: ['Fall', 'Winter']
  },
  2: {
    id: 2,
    name: 'Coastal Breeze',
    description: 'Fresh sea salt, bergamot, and white musk. A refreshing journey along pristine shorelines.',
    fullDescription: 'Coastal Breeze captures the invigorating essence of a seaside morning.',
    price: 79,
    oldPrice: 110,
    image: coastalBreeze,
    sizes: ['50ml', '100ml'],
    rating: 4.9,
    reviews: 98,
    notes: {
      top: ['Bergamot', 'Lemon', 'Sea Salt'],
      heart: ['Jasmine', 'Marine Accord', 'Algae'],
      base: ['White Musk', 'Driftwood', 'Ambergris']
    },
    longevity: '6-8 hours',
    sillage: 'Moderate',
    season: ['Spring', 'Summer']
  },
  3: {
    id: 3,
    name: 'Sahara Amber',
    description: 'Rich amber, vanilla, and exotic spices. A warm embrace reminiscent of desert nights.',
    fullDescription: 'Sahara Amber is a luxurious oriental fragrance inspired by the mystique of the Sahara.',
    price: 94,
    oldPrice: 125,
    image: saharaAmber,
    sizes: ['50ml', '100ml'],
    rating: 4.7,
    reviews: 87,
    notes: {
      top: ['Cinnamon', 'Cardamom', 'Orange Blossom'],
      heart: ['Amber', 'Vanilla Absolute', 'Exotic Spices'],
      base: ['Benzoin', 'Labdanum', 'Sandalwood']
    },
    longevity: '10-12 hours',
    sillage: 'Heavy',
    season: ['Fall', 'Winter']
  },
  4: {
    id: 4,
    name: 'Mediterranean Salt',
    description: 'Crisp ocean air, jasmine, and driftwood. An aromatic voyage across turquoise waters.',
    fullDescription: 'Mediterranean Salt evokes the vibrant energy of the Mediterranean coast.',
    price: 84,
    oldPrice: 115,
    image: mediterraneanSalt,
    sizes: ['50ml', '100ml'],
    rating: 4.8,
    reviews: 112,
    notes: {
      top: ['Lemon', 'Bergamot', 'Rosemary'],
      heart: ['Jasmine', 'Fig Leaf', 'Sea Breeze'],
      base: ['Driftwood', 'Cedar', 'Moss']
    },
    longevity: '7-9 hours',
    sillage: 'Moderate',
    season: ['Spring', 'Summer']
  },
  5: {
    id: 5,
    name: 'Midnight Dune',
    description: 'Dark leather, smoky incense, and cedarwood. A mysterious scent for the night.',
    fullDescription: 'Midnight Dune is a bold, sophisticated fragrance for those who command the night.',
    price: 99,
    oldPrice: 135,
    image: midnightDune,
    sizes: ['50ml', '100ml'],
    rating: 4.9,
    reviews: 156,
    notes: {
      top: ['Smoky Incense', 'Black Pepper', 'Saffron'],
      heart: ['Dark Leather', 'Oud', 'Tobacco'],
      base: ['Cedarwood', 'Vetiver', 'Amber']
    },
    longevity: '10-12 hours',
    sillage: 'Very Heavy',
    season: ['Fall', 'Winter']
  },
  6: {
    id: 6,
    name: 'Coral Reef',
    description: 'Tropical fruits, sea moss, and coral flower. A vibrant underwater paradise.',
    fullDescription: 'Coral Reef is a vibrant, aquatic fragrance that celebrates the beauty of coral gardens.',
    price: 74,
    oldPrice: 105,
    image: coralReef,
    sizes: ['50ml', '100ml'],
    rating: 4.6,
    reviews: 73,
    notes: {
      top: ['Tropical Fruits', 'Mandarin', 'Watermelon'],
      heart: ['Coral Flower', 'Sea Moss', 'Ylang-Ylang'],
      base: ['White Woods', 'Musk', 'Ambergris']
    },
    longevity: '5-7 hours',
    sillage: 'Light',
    season: ['Summer']
  },
  7: {
    id: 7,
    name: 'Golden Sand',
    description: 'Warm vanilla, tonka bean, and sun-kissed musk. A radiant beachside glow.',
    fullDescription: 'Golden Sand captures the warmth of sun-drenched shores.',
    price: 86,
    oldPrice: 118,
    image: goldenSand,
    sizes: ['50ml', '100ml'],
    rating: 4.8,
    reviews: 104,
    notes: {
      top: ['Coconut', 'Solar Notes', 'Bergamot'],
      heart: ['Vanilla', 'Tonka Bean', 'Tiare Flower'],
      base: ['Sun-kissed Musk', 'Sandalwood', 'Caramel']
    },
    longevity: '8-10 hours',
    sillage: 'Moderate',
    season: ['Summer']
  },
  8: {
    id: 8,
    name: 'Salt & Stone',
    description: 'Mineral accord, sage, and sea salt crystals. An earthy coastal mineral blend.',
    fullDescription: 'Salt & Stone is a unique, mineral-forward fragrance that bridges earth and sea.',
    price: 81,
    oldPrice: 112,
    image: saltStone,
    sizes: ['50ml', '100ml'],
    rating: 4.7,
    reviews: 91,
    notes: {
      top: ['Sea Salt Crystals', 'Mineral Accord', 'Citrus'],
      heart: ['Sage', 'Lavender', 'Geranium'],
      base: ['Vetiver', 'Oakmoss', 'Driftwood']
    },
    longevity: '7-9 hours',
    sillage: 'Moderate',
    season: ['Spring', 'Fall']
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productsData[id];

  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Product not found</Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          Home
        </Link>
        <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          The Wqar Collection
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                image={product.image}
                alt={product.name}
                sx={{ width: '100%', height: 'auto' }}
              />
            </Card>
          </motion.div>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 600,
                color: '#8C5A3C',
                mb: 1,
              }}
            >
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.rating} readOnly sx={{ color: '#8C5A3C' }} />
              <Typography variant="body2" color="text.secondary">
                ({product.reviews} reviews)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  color: '#8C5A3C',
                }}
              >
                ${product.price}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: alpha('#1A1A1A', 0.4),
                  textDecoration: 'line-through',
                }}
              >
                ${product.oldPrice}
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {product.fullDescription}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Size Selection */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Size
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant="outlined"
                  sx={{
                    borderColor: '#8C5A3C',
                    color: '#8C5A3C',
                    borderRadius: '40px',
                    minWidth: '80px',
                    '&:hover': {
                      borderColor: '#6B4423',
                      backgroundColor: alpha('#8C5A3C', 0.05),
                    },
                  }}
                >
                  {size}
                </Button>
              ))}
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                sx={{
                  backgroundColor: '#8C5A3C',
                  borderRadius: '40px',
                  padding: '12px 32px',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: '#6B4423',
                  },
                }}
              >
                Add to Cart
              </Button>
              <IconButton
                sx={{
                  border: `1px solid ${alpha('#8C5A3C', 0.3)}`,
                  borderRadius: '50%',
                  '&:hover': {
                    backgroundColor: alpha('#8C5A3C', 0.05),
                  },
                }}
              >
                <FavoriteBorderIcon sx={{ color: '#8C5A3C' }} />
              </IconButton>
            </Stack>

            {/* Shipping Info */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: alpha('#8C5A3C', 0.05),
                borderRadius: '12px',
                mb: 3,
              }}
            >
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon sx={{ color: '#8C5A3C', fontSize: 20 }} />
                  <Typography variant="caption">Free Shipping</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon sx={{ color: '#8C5A3C', fontSize: 20 }} />
                  <Typography variant="caption">Secure Payment</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RefreshIcon sx={{ color: '#8C5A3C', fontSize: 20 }} />
                  <Typography variant="caption">30-Day Returns</Typography>
                </Box>
              </Stack>
            </Paper>
          </motion.div>
        </Grid>

        {/* Fragrance Notes Section */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                backgroundColor: alpha('#8C5A3C', 0.03),
                borderRadius: '20px',
                mt: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 600,
                  color: '#8C5A3C',
                  mb: 3,
                }}
              >
                Fragrance Notes
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Top Notes
                  </Typography>
                  <List dense>
                    {product.notes.top.map((note) => (
                      <ListItem key={note} sx={{ px: 0 }}>
                        <ListItemText primary={note} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Heart Notes
                  </Typography>
                  <List dense>
                    {product.notes.heart.map((note) => (
                      <ListItem key={note} sx={{ px: 0 }}>
                        <ListItemText primary={note} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Base Notes
                  </Typography>
                  <List dense>
                    {product.notes.base.map((note) => (
                      <ListItem key={note} sx={{ px: 0 }}>
                        <ListItemText primary={note} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Longevity
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {product.longevity}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Sillage
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {product.sillage}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Best Season
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {product.season.join(' • ')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;