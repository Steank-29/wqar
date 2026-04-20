import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Stack,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  alpha,
  styled,
  Tooltip,
  Badge,
  Card,
  CardContent,
} from '@mui/material';
import {
  Print,
  WhatsApp,
  Email,
  Phone,
  LocationOn,
  Receipt,
  LocalShipping,
  ArrowBack,
  PictureAsPdf,
  Edit,
  CalendarToday,
  CheckCircle,
  Storefront,
  Verified,
  Payment,
  Inventory,
  Close,
  Save,
  Share,
  QrCode,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import '@fontsource/oswald';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
};

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Premium Color Palette
const COLORS = {
  primary: '#0F172A',
  secondary: '#8C5A3C',
  accent: '#D4A574',
  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',
  info: '#0284C7',
  white: '#FFFFFF',
  cream: '#FDFBF7',
  gold: '#C6A15B',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
};

// Company Information
const COMPANY_INFO = {
  name: 'WIQAR',
  fullName: 'WIQAR',
  address: '123 Avenue Habib Bourguiba',
  city: 'Tunis',
  country: 'Tunisia',
  phone: '+216 71 234 567',
  mobile: '+216 12 345 678',
  email: 'contact@wiqar.com',
  website: 'www.wiqar.com',
  taxId: 'TUN123456789',
  rc: 'RC1234567',
  slogan: 'L\'Art du Parfum d\'Exception',
};

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: `linear-gradient(135deg, ${COLORS.gray50} 0%, ${COLORS.cream} 100%)`,
  padding: 0,
  margin: 0,
}));

const InvoiceContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  borderRadius: '32px',
  border: `1px solid ${alpha(COLORS.secondary, 0.15)}`,
  background: COLORS.white,
  padding: '48px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(90deg, ${COLORS.secondary} 0%, ${COLORS.accent} 50%, ${COLORS.gold} 100%)`,
  },
}));

const Watermark = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) rotate(-45deg)',
  opacity: 0.02,
  pointerEvents: 'none',
  zIndex: 0,
  '& .MuiTypography-root': {
    fontSize: '180px',
    fontWeight: 900,
    fontFamily: '"Playfair Display", serif',
    color: COLORS.secondary,
    whiteSpace: 'nowrap',
  },
}));

const ActionBar = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto 24px auto',
  borderRadius: '20px',
  background: alpha(COLORS.white, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${COLORS.gray200}`,
  padding: '16px 24px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
}));

const CompanyLogo = styled(Box)(({ theme }) => ({
  width: 90,
  height: 90,
  borderRadius: '20px',
  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 10px 20px -5px ${alpha(COLORS.secondary, 0.3)}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Playfair Display", serif',
  fontWeight: 600,
  fontSize: '1.1rem',
  color: COLORS.gray800,
  marginBottom: '12px',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&::before': {
    content: '""',
    width: '4px',
    height: '20px',
    background: `linear-gradient(180deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%)`,
    borderRadius: '2px',
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${COLORS.gray50} 0%, ${COLORS.white} 100%)`,
  border: `1px solid ${COLORS.gray200}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: alpha(COLORS.secondary, 0.3),
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
}));

const TotalCard = styled(Box)(({ theme }) => ({
  padding: '24px',
  borderRadius: '20px',
  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
  color: COLORS.white,
  boxShadow: `0 15px 30px -10px ${alpha(COLORS.secondary, 0.4)}`,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-root': {
    background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
    color: COLORS.white,
    fontWeight: 600,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '16px',
    borderBottom: 'none',
    '&:first-of-type': {
      borderTopLeftRadius: '12px',
    },
    '&:last-of-type': {
      borderTopRightRadius: '12px',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: COLORS.gray50,
  },
  '&:hover': {
    backgroundColor: alpha(COLORS.accent, 0.05),
  },
  '& .MuiTableCell-root': {
    padding: '16px',
    borderBottom: `1px solid ${COLORS.gray200}`,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '10px 24px',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)',
  },
}));

const Facture = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const invoiceRef = useRef(null);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [companyInfo, setCompanyInfo] = useState(COMPANY_INFO);
  const [editMode, setEditMode] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [signature, setSignature] = useState({ name: 'M. Sami', title: 'Directeur Commercial' });

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setSnackbar({
        open: true,
        message: 'Aucune commande spécifiée',
        severity: 'error'
      });
      navigate('/order');
    }
  }, [orderId, navigate]);

  useEffect(() => {
    if (order) {
      setInvoiceNumber(`FAC-${order.orderNumber.replace('ORD-', '')}`);
      const orderDate = new Date(order.createdAt);
      const due = new Date(orderDate);
      due.setDate(due.getDate() + 7);
      setDueDate(due.toISOString().split('T')[0]);
      setInvoiceDate(new Date(order.createdAt).toISOString().split('T')[0]);
    }
  }, [order]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement de la commande',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTVA = () => calculateSubtotal() * 0;
  
  const calculateTotal = () => calculateSubtotal() + calculateTVA() + (order?.shippingCost || 0);

  const generatePDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      setSnackbar({
        open: true,
        message: 'Génération du PDF en cours...',
        severity: 'info'
      });

      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Bon_Livraison_${order?.orderNumber}.pdf`);
      
      setSnackbar({
        open: true,
        message: 'Bon de livraison téléchargé avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la génération du PDF',
        severity: 'error'
      });
    }
  };

  const handlePrint = () => window.print();

  const shareViaWhatsApp = () => {
    if (!order) return;
    
    const message = `*${COMPANY_INFO.fullName}*\n\n` +
      `📋 *BON DE LIVRAISON*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `N° Commande: *${order.orderNumber}*\n` +
      `N° Facture: *${invoiceNumber}*\n` +
      `Date: ${new Date(invoiceDate).toLocaleDateString('fr-FR')}\n\n` +
      `👤 Client: ${order.customer.fullName}\n` +
      `📞 Tél: ${order.customer.phone}\n` +
      `📍 ${order.customer.address}, ${order.customer.city}\n\n` +
      `💰 Total: *${calculateTotal().toFixed(3)} TND*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `✨ Merci de votre confiance !`;
    
    window.open(`https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatDateFR = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const numberToWordsFR = (num) => {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const unit = num % 10;
      const ten = Math.floor(num / 10);
      if (unit === 0) return tens[ten];
      if (ten === 7 || ten === 9) return tens[ten - 1] + '-' + teens[unit];
      return tens[ten] + '-' + units[unit];
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      if (hundred === 1) return 'cent' + (rest ? ' ' + numberToWordsFR(rest) : '');
      return units[hundred] + ' cent' + (rest ? ' ' + numberToWordsFR(rest) : '');
    }
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const rest = num % 1000;
      const thousandWord = thousand === 1 ? 'mille' : numberToWordsFR(thousand) + ' mille';
      return thousandWord + (rest ? ' ' + numberToWordsFR(rest) : '');
    }
    return num.toString();
  };

  if (loading) {
    return (
      <PageContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: COLORS.secondary, mb: 2 }} />
          <Typography variant="body1" sx={{ color: COLORS.gray600 }}>
            Chargement du bon de livraison...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 6, borderRadius: '32px', textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              Commande non trouvée
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => navigate('/order')}
              sx={{ bgcolor: COLORS.secondary, borderRadius: '50px', px: 4 }}
            >
              Retour aux commandes
            </Button>
          </Paper>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ActionBar elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton 
                  onClick={() => navigate('/order')}
                  sx={{ 
                    bgcolor: alpha(COLORS.secondary, 0.1),
                    '&:hover': { bgcolor: alpha(COLORS.secondary, 0.2) }
                  }}
                >
                  <ArrowBack sx={{ color: COLORS.secondary }} />
                </IconButton>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
                    Bon de Livraison
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                    {order.orderNumber}
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1.5}>
                <Tooltip title={editMode ? "Terminer les modifications" : "Modifier le document"}>
                  <ActionButton
                    variant={editMode ? "contained" : "outlined"}
                    startIcon={editMode ? <Save /> : <Edit />}
                    onClick={() => setEditMode(!editMode)}
                    sx={{
                      bgcolor: editMode ? COLORS.success : 'transparent',
                      borderColor: COLORS.gray300,
                      color: editMode ? COLORS.white : COLORS.gray700,
                      '&:hover': {
                        bgcolor: editMode ? COLORS.success : alpha(COLORS.secondary, 0.05),
                      }
                    }}
                  >
                    {editMode ? 'Enregistrer' : 'Modifier'}
                  </ActionButton>
                </Tooltip>
                
                <Tooltip title="Partager via WhatsApp">
                  <ActionButton
                    variant="outlined"
                    startIcon={<WhatsApp />}
                    onClick={shareViaWhatsApp}
                    sx={{
                      borderColor: '#25D366',
                      color: '#25D366',
                      '&:hover': {
                        borderColor: '#25D366',
                        bgcolor: alpha('#25D366', 0.05),
                      }
                    }}
                  >
                    WhatsApp
                  </ActionButton>
                </Tooltip>
                
                <Tooltip title="Imprimer">
                  <ActionButton
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={handlePrint}
                    sx={{ borderColor: COLORS.gray300, color: COLORS.gray700 }}
                  >
                    Imprimer
                  </ActionButton>
                </Tooltip>
                
                <Tooltip title="Télécharger PDF">
                  <ActionButton
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={generatePDF}
                    sx={{
                      bgcolor: COLORS.secondary,
                      '&:hover': { bgcolor: COLORS.primary }
                    }}
                  >
                    PDF
                  </ActionButton>
                </Tooltip>
              </Stack>
            </Stack>
          </ActionBar>
        </motion.div>

        {/* Invoice Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <InvoiceContainer ref={invoiceRef} id="invoice-content">
            {/* Watermark */}
            <Watermark>
              <Typography>{COMPANY_INFO.name}</Typography>
            </Watermark>

            {/* Header */}
            <Box sx={{ position: 'relative', zIndex: 1, mb: 5 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <Stack direction="row" spacing={3} alignItems="flex-start">
                    <CompanyLogo>
                      <Storefront sx={{ fontSize: 45, color: COLORS.white }} />
                    </CompanyLogo>
                    <Box>
                      {editMode ? (
                        <Stack spacing={1}>
                          <TextField
                            value={companyInfo.fullName}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, fullName: e.target.value })}
                            variant="standard"
                            sx={{ '& input': { fontSize: '2rem', fontWeight: 700, fontFamily: '"Playfair Display", serif' } }}
                          />
                          <TextField
                            value={companyInfo.slogan}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, slogan: e.target.value })}
                            variant="standard"
                            size="small"
                          />
                        </Stack>
                      ) : (
                        <>
                          <Typography variant="h3" sx={{ 
                            fontWeight: 700, 
                            fontFamily: '"Playfair Display", serif',
                            color: COLORS.primary,
                            letterSpacing: '-0.02em',
                            mb: 0.5
                          }}>
                            {companyInfo.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: COLORS.secondary, 
                            fontStyle: 'italic',
                            fontFamily: '"Playfair Display", serif'
                          }}>
                            {companyInfo.slogan}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Stack>
                  
                  <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        {editMode ? (
                          <Stack spacing={1}>
                            <TextField size="small" value={companyInfo.address} onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} />
                            <TextField size="small" value={companyInfo.city} onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })} />
                            <TextField size="small" value={companyInfo.phone} onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} />
                            <TextField size="small" value={companyInfo.email} onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} />
                          </Stack>
                        ) : (
                          <Stack spacing={0.8}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <LocationOn sx={{ fontSize: 16, color: COLORS.secondary }} />
                              <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                                {companyInfo.address}, {companyInfo.city}, {companyInfo.country}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Phone sx={{ fontSize: 16, color: COLORS.secondary }} />
                              <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                                {companyInfo.phone} / {companyInfo.mobile}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Email sx={{ fontSize: 16, color: COLORS.secondary }} />
                              <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                                {companyInfo.email}
                              </Typography>
                            </Stack>
                          </Stack>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <Stack spacing={0.8}>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.gray700, minWidth: 50 }}>
                              RC:
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                              {companyInfo.rc}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.gray700, minWidth: 50 }}>
                              MF:
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                              {companyInfo.taxId}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Box sx={{ 
                    textAlign: 'right',
                    p: 3,
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${alpha(COLORS.secondary, 0.03)} 0%, ${alpha(COLORS.accent, 0.05)} 100%)`,
                    border: `1px solid ${alpha(COLORS.secondary, 0.1)}`,
                  }}>
                    <Chip 
                      label="DOCUMENT OFFICIEL"
                      size="small"
                      sx={{ 
                        mb: 2,
                        bgcolor: alpha(COLORS.success, 0.1),
                        color: COLORS.success,
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      fontFamily: '"Playfair Display", serif',
                      color: COLORS.secondary,
                      mb: 2
                    }}>
                      BON DE LIVRAISON
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: alpha(COLORS.secondary, 0.2) }} />
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 1 }}>
                          N° Facture
                        </Typography>
                        {editMode ? (
                          <TextField
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            variant="standard"
                            size="small"
                            sx={{ '& input': { fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' } }}
                          />
                        ) : (
                          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace', color: COLORS.primary }}>
                            {invoiceNumber}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 1 }}>
                          N° Commande
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace', color: COLORS.primary }}>
                          {order.orderNumber}
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Date
                          </Typography>
                          {editMode ? (
                            <TextField
                              type="date"
                              value={invoiceDate}
                              onChange={(e) => setInvoiceDate(e.target.value)}
                              variant="standard"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {formatDateFR(invoiceDate)}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Échéance
                          </Typography>
                          {editMode ? (
                            <TextField
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              variant="standard"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {formatDateFR(dueDate)}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4, borderColor: alpha(COLORS.secondary, 0.15) }} />

            {/* Customer Information */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <SectionTitle>FACTURÉ À</SectionTitle>
                <InfoCard>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: '"Inter", sans-serif' }}>
                    {order.customer.fullName}
                  </Typography>
                  <Stack spacing={0.8}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Email sx={{ fontSize: 16, color: COLORS.secondary }} />
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                        {order.customer.email}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Phone sx={{ fontSize: 16, color: COLORS.secondary }} />
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                        {order.customer.phone}
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <LocationOn sx={{ fontSize: 16, color: COLORS.secondary, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                        {order.customer.address}<br />
                        {order.customer.city} {order.customer.postalCode}
                      </Typography>
                    </Stack>
                  </Stack>
                </InfoCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SectionTitle>LIVRÉ À</SectionTitle>
                <InfoCard>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: '"Inter", sans-serif' }}>
                    {order.customer.fullName}
                  </Typography>
                  <Stack spacing={0.8}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Phone sx={{ fontSize: 16, color: COLORS.secondary }} />
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                        {order.customer.phone}
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      <LocationOn sx={{ fontSize: 16, color: COLORS.secondary, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                        {order.customer.address}<br />
                        {order.customer.city} {order.customer.postalCode}
                      </Typography>
                    </Stack>
                    <Box sx={{ 
                      mt: 2, 
                      p: 1.5, 
                      borderRadius: '8px',
                      bgcolor: alpha(COLORS.success, 0.08),
                      border: `1px solid ${alpha(COLORS.success, 0.2)}`,
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalShipping sx={{ fontSize: 16, color: COLORS.success }} />
                        <Typography variant="caption" sx={{ color: COLORS.success, fontWeight: 500 }}>
                          Livraison estimée: 2-3 jours ouvrés
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </InfoCard>
              </Grid>
            </Grid>

            {/* Order Items Table */}
            <Box sx={{ mb: 4 }}>
              <SectionTitle>DÉTAIL DE LA COMMANDE</SectionTitle>
              <TableContainer component={Paper} sx={{ 
                borderRadius: '16px',
                border: `1px solid ${COLORS.gray200}`,
                overflow: 'hidden',
              }}>
                <Table>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Taille</TableCell>
                      <TableCell align="center">Quantité</TableCell>
                      <TableCell align="right">Prix Unitaire</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <StyledTableRow key={index}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar 
                              src={item.mainImage ? `http://localhost:5000/${item.mainImage}` : null}
                              variant="rounded"
                              sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '10px',
                                bgcolor: COLORS.gray100,
                              }}
                            >
                              {!item.mainImage && <Inventory sx={{ color: COLORS.gray400 }} />}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.selectedSize} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(COLORS.secondary, 0.1),
                              color: COLORS.secondary,
                              fontWeight: 500,
                            }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.price.toFixed(3)} TND
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                            {(item.price * item.quantity).toFixed(3)} TND
                          </Typography>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Totals */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Box>
                  <SectionTitle>MODE DE PAIEMENT</SectionTitle>
                  <InfoCard>
                    <Chip 
                      icon={order.paymentMethod === 'cash_on_delivery' ? <LocalShipping /> : <Payment />}
                      label={order.paymentMethod === 'cash_on_delivery' ? 'Paiement à la livraison' : 'Virement bancaire'}
                      sx={{ 
                        bgcolor: alpha(COLORS.info, 0.1),
                        color: COLORS.info,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        py: 0.5,
                        px: 1,
                      }}
                    />
                    {order.notes && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: COLORS.gray700 }}>
                          NOTES
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.gray600, fontStyle: 'italic' }}>
                          "{order.notes}"
                        </Typography>
                      </Box>
                    )}
                  </InfoCard>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TotalCard>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: alpha(COLORS.white, 0.8) }}>Sous-total</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.white }}>
                        {calculateSubtotal().toFixed(3)} TND
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: alpha(COLORS.white, 0.8) }}>TVA (19%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.white }}>
                        {calculateTVA().toFixed(3)} TND
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: alpha(COLORS.white, 0.8) }}>Frais de livraison</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.white }}>
                        {order.shippingCost === 0 ? 'Gratuit' : `${order.shippingCost.toFixed(3)} TND`}
                      </Typography>
                    </Stack>
                    <Divider sx={{ borderColor: alpha(COLORS.white, 0.2) }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: COLORS.white }}>
                        Total TTC
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: COLORS.gold }}>
                        {calculateTotal().toFixed(3)} TND
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: alpha(COLORS.white, 0.7), fontStyle: 'italic' }}>
                      {numberToWordsFR(Math.floor(calculateTotal()))} dinars tunisiens
                      {Math.round((calculateTotal() - Math.floor(calculateTotal())) * 1000)} millimes
                    </Typography>
                  </Stack>
                </TotalCard>
              </Grid>
            </Grid>

            {/* Footer */}
            <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${COLORS.gray200}` }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '12px',
                      bgcolor: alpha(COLORS.secondary, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Verified sx={{ color: COLORS.success }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                        Commande vérifiée
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {order.orderNumber}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: COLORS.gray600, textAlign: 'center' }}>
                    Nous vous remercions de votre confiance !
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.gray400, display: 'block', textAlign: 'center' }}>
                    Pour toute question: {companyInfo.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'right' }}>
                    {editMode ? (
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          placeholder="Nom du signataire"
                          value={signature.name}
                          onChange={(e) => setSignature({ ...signature, name: e.target.value })}
                        />
                        <TextField
                          size="small"
                          placeholder="Titre"
                          value={signature.title}
                          onChange={(e) => setSignature({ ...signature, title: e.target.value })}
                        />
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.gray700 }}>
                          {signature.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                          {signature.title}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: COLORS.gray400, fontStyle: 'italic' }}>
                            Signature et cachet
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Additional Notes */}
            {editMode && (
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Notes additionnelles..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                sx={{ mt: 3 }}
              />
            )}

            {additionalNotes && !editMode && (
              <Box sx={{ mt: 3, p: 2.5, bgcolor: COLORS.gray50, borderRadius: '14px', border: `1px solid ${COLORS.gray200}` }}>
                <Typography variant="caption" sx={{ color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Notes additionnelles
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.gray700 }}>
                  {additionalNotes}
                </Typography>
              </Box>
            )}
          </InvoiceContainer>
        </motion.div>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </PageContainer>
  );
};

export default Facture;