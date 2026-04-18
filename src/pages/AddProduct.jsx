import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Chip, 
  IconButton, Avatar, Divider, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, RadioGroup, Radio, Checkbox,
  Switch, Rating, Card, CardMedia, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Tooltip, InputAdornment,
  styled, CircularProgress, TableFooter, LinearProgress
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, CloudUpload, 
  AttachMoney, Inventory, LocalOffer, Warning, Close,
  Male, Female, Transgender, FilterList, Search,
  Refresh, Download, Print, Star, GetApp, PictureAsPdf, TableChart,
  GridView, Save, Cancel, Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Axios instance with auth header
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
  (error) => {
    return Promise.reject(error);
  }
);

// Professional Color Palette
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
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Styled Components
const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: '24px',
  border: `1px solid ${COLORS.gray200}`,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  background: COLORS.white,
  '&:hover': {
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.gray50} 100%)`,
  borderRadius: '20px',
  border: `1px solid ${COLORS.gray200}`,
  padding: '24px',
}));

const DropzoneContainer = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? COLORS.primary : COLORS.gray300}`,
  borderRadius: '16px',
  padding: '30px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isDragActive ? `${COLORS.primary}05` : COLORS.white,
  '&:hover': {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
}));

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('uploads/')) return `https://wqar-api.onrender.com/${imagePath}`;
  return `https://wqar-api.onrender.com/${imagePath}`;
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState([0, 200]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0
  });

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    fragrance: '',
    quantity: [],
    stock: '',
    gender: 'unisex',
    price: '',
    discountedPrice: '',
    description: '',
    rating: 0,
    featured: false,
    inStock: true,
    tags: [],
    category: 'Perfumes',
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const quantityOptions = ['50ml', '100ml', '150ml'];
  const genderOptions = [
    { value: 'men', label: 'Men', icon: <Male /> },
    { value: 'women', label: 'Women', icon: <Female /> },
    { value: 'unisex', label: 'Unisex', icon: <Transgender /> },
  ];

  // Dropzone for images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages([...images, ...newImages]);
      setPreviewImages([...previewImages, ...newImages.map(img => img.preview)]);
    },
    maxFiles: 5,
    maxSize: 5242880,
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  // Load products with filters
  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterGender !== 'all') params.append('gender', filterGender);
      if (filterStock !== 'all') params.append('stockStatus', filterStock);
      if (filterPriceRange[0] > 0) params.append('minPrice', filterPriceRange[0]);
      if (filterPriceRange[1] < 200) params.append('maxPrice', filterPriceRange[1]);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('order', order);

      const response = await axiosInstance.get(`/products?${params}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading perfumes:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error loading Perfumes', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await axiosInstance.get('/products/stats/summary');
      setStats(response.data.data.overview);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle quantity change
  const handleQuantityChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      quantity: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle tags change
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData({
      ...formData,
      tags: tags,
    });
  };

  // Create form data for API
  const createFormData = () => {
    const formDataToSend = new FormData();
    
    // Add all text fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('fragrance', formData.fragrance);
    formDataToSend.append('quantity', JSON.stringify(formData.quantity));
    formDataToSend.append('stock', formData.stock);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('price', formData.price);
    if (formData.discountedPrice) formDataToSend.append('discountedPrice', formData.discountedPrice);
    if (formData.description) formDataToSend.append('description', formData.description);
    formDataToSend.append('rating', formData.rating);
    formDataToSend.append('featured', formData.featured);
    formDataToSend.append('inStock', formData.inStock);
    formDataToSend.append('tags', JSON.stringify(formData.tags));
    formDataToSend.append('category', formData.category);
    
    // Add images
    images.forEach(image => {
      formDataToSend.append('images', image.file);
    });
    
    return formDataToSend;
  };

  // Handle product save (Create/Update)
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = createFormData();
      
      let response;
      if (editProduct) {
        // Update existing product
        response = await axiosInstance.put(`/products/${editProduct._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({ open: true, message: 'Perfume updated successfully!', severity: 'success' });
      } else {
        // Create new product
        response = await axiosInstance.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({ open: true, message: 'Perfume added successfully!', severity: 'success' });
      }
      
      resetForm();
      setOpenDialog(false);
      await loadProducts();
      await loadStats();
    } catch (error) {
      console.error('Error saving perfume:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error saving perfume', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/products/${selectedProduct._id}`);
      setSnackbar({ open: true, message: 'Perfume deleted successfully!', severity: 'success' });
      setDeleteDialog(false);
      await loadProducts();
      await loadStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error deleting perfume', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle view product
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewDialog(true);
  };

  // Download products as CSV
  const downloadCSV = () => {
    const csvHeaders = ['Name', 'Fragrance', 'Sizes', 'Stock', 'Gender', 'Price', 'Discounted Price', 'Category', 'Created Date'];
    const csvRows = products.map(product => [
      product.name,
      product.fragrance,
      product.quantity.join(', '),
      product.stock,
      product.gender,
      product.price,
      product.discountedPrice || '',
      product.category,
      new Date(product.createdAt).toLocaleDateString(),
    ]);
    
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'CSV downloaded successfully!', severity: 'success' });
  };

  // Download as PDF
  const downloadPDF = async () => {
    const element = document.getElementById('product-table');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`products-report-${new Date().toISOString()}.pdf`);
      setSnackbar({ open: true, message: 'PDF downloaded successfully!', severity: 'success' });
    }
  };

  // Download as Excel
  const downloadExcel = () => {
    const wsData = products.map(product => ({
      'Product Name': product.name,
      'Fragrance': product.fragrance,
      'Sizes': product.quantity.join(', '),
      'Stock': product.stock,
      'Gender': product.gender,
      'Price': product.price,
      'Discounted Price': product.discountedPrice || '',
      'Category': product.category,
      'Created Date': new Date(product.createdAt).toLocaleDateString(),
    }));
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, `products-${new Date().toISOString()}.xlsx`);
    setSnackbar({ open: true, message: 'Excel file downloaded successfully!', severity: 'success' });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      fragrance: '',
      quantity: [],
      stock: '',
      gender: 'unisex',
      price: '',
      discountedPrice: '',
      description: '',
      rating: 0,
      featured: false,
      inStock: true,
      tags: [],
      category: 'Perfumes',
    });
    setImages([]);
    setPreviewImages([]);
    setEditProduct(null);
    setUploadProgress(0);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      fragrance: product.fragrance,
      quantity: product.quantity,
      stock: product.stock,
      gender: product.gender,
      price: product.price,
      discountedPrice: product.discountedPrice || '',
      description: product.description || '',
      rating: product.rating || 0,
      featured: product.featured || false,
      inStock: product.inStock,
      tags: product.tags || [],
      category: product.category || 'Perfumes',
    });
    // Set preview images from product images
    if (product.images && product.images.length > 0) {
      const imageUrls = product.images.map(img => getImageUrl(img.url));
      setPreviewImages(imageUrls);
    }
    setOpenDialog(true);
  };

  // Handle sort
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Apply filters and reload
  const applyFilters = () => {
    setPage(0);
    loadProducts();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterGender('all');
    setFilterStock('all');
    setFilterPriceRange([0, 200]);
    setDateRange({ start: '', end: '' });
    setPage(0);
    setTimeout(() => loadProducts(), 100);
  };

  // Effect to reload when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 0) {
        loadProducts();
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterGender, filterStock, filterPriceRange, dateRange, orderBy, order]);

  useEffect(() => {
    loadProducts();
  }, [page, rowsPerPage]);

  // Product Table View
  const ProductTableView = () => (
    <TableContainer id="product-table">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: COLORS.gray50 }}>
            <TableCell>Image</TableCell>
            <TableCell>
              <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleSort('name')}>
                Perfume Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Fragrance</TableCell>
            <TableCell>Sizes</TableCell>
            <TableCell align="right">
              <TableSortLabel active={orderBy === 'stock'} direction={order} onClick={() => handleSort('stock')}>
                Stock
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel active={orderBy === 'price'} direction={order} onClick={() => handleSort('price')}>
                Price
              </TableSortLabel>
            </TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>
              <TableSortLabel active={orderBy === 'createdAt'} direction={order} onClick={() => handleSort('createdAt')}>
                Date Added
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id} hover>
              <TableCell>
                <Avatar 
                  src={product.images && product.images[0] ? getImageUrl(product.images[0].url) : '/placeholder-image.jpg'}
                  variant="rounded" 
                  sx={{ width: 50, height: 50 }}
                >
                  {(!product.images || product.images.length === 0) && <ImageIcon />}
                </Avatar>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {product.name}
                </Typography>
                {product.featured && <Chip label="Featured" size="small" sx={{ mt: 0.5, fontSize: 10, bgcolor: `${COLORS.warning}15`, color: COLORS.warning }} />}
              </TableCell>
              <TableCell>{product.fragrance}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {product.quantity.map((q) => (<Chip key={q} label={q} size="small" variant="outlined" />))}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Chip 
                  label={`${product.stock} units`} 
                  size="small" 
                  sx={{ bgcolor: product.stock < 20 ? `${COLORS.error}15` : `${COLORS.success}15`, color: product.stock < 20 ? COLORS.error : COLORS.success }} 
                />
              </TableCell>
              <TableCell align="right">
                {product.discountedPrice ? (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.success }}>TND{product.discountedPrice}</Typography>
                    <Typography variant="caption" sx={{ textDecoration: 'line-through', color: COLORS.gray500 }}>TND{product.price}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>TND{product.price}</Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip 
                  icon={product.gender === 'men' ? <Male /> : product.gender === 'women' ? <Female /> : <Transgender />} 
                  label={product.gender} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{new Date(product.createdAt).toLocaleDateString()}</Typography>
                <Typography variant="caption" sx={{ color: COLORS.gray500 }}>{new Date(product.createdAt).toLocaleTimeString()}</Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => handleViewProduct(product)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEditProduct(product)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => { setSelectedProduct(product); setDeleteDialog(true); }}>
                    <Delete fontSize="small" sx={{ color: COLORS.error }} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              colSpan={9}
              count={products.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );

  // Product Grid View
  const ProductGridView = () => (
    <Grid container spacing={3}>
      {products.map((product, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card sx={{ borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: '0.3s' } }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia 
                  component="img" 
                  height="200" 
                  image={product.images && product.images[0] ? getImageUrl(product.images[0].url) : '/placeholder-image.jpg'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {product.discountedPrice && (
                  <Chip
                    label={`-${Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%`}
                    size="small"
                    sx={{ position: 'absolute', top: 10, right: 10, bgcolor: COLORS.error, color: COLORS.white }}
                  />
                )}
                {product.featured && (
                  <Chip label="Featured" size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: COLORS.warning, color: COLORS.white }} />
                )}
              </Box>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 1 }}>{product.name}</Typography>
                <Typography variant="body2" sx={{ color: COLORS.gray600, mb: 1 }}>{product.fragrance}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={product.rating} precision={0.5} size="small" readOnly />
                  <Typography variant="caption">({product.rating})</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    {product.discountedPrice ? (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary }}>TND{product.discountedPrice}</Typography>
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: COLORS.gray500 }}>TND{product.price}</Typography>
                      </>
                    ) : (
                      <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary }}>TND{product.price}</Typography>
                    )}
                  </Box>
                  <Chip label={`${product.stock} left`} size="small" sx={{ bgcolor: product.stock < 20 ? `${COLORS.error}15` : `${COLORS.success}15`, color: product.stock < 20 ? COLORS.error : COLORS.success }} />
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" fullWidth onClick={() => handleViewProduct(product)}>View</Button>
                <Button size="small" variant="outlined" fullWidth onClick={() => handleEditProduct(product)}>Edit</Button>
                <Button size="small" variant="outlined" color="error" fullWidth onClick={() => { setSelectedProduct(product); setDeleteDialog(true); }}>Delete</Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      ))}
      {products.length === 0 && (
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: COLORS.gray500 }}>No perfumes found</Typography>
          </Box>
        </Grid>
      )}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={products.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.gray900, fontFamily: 'Oswald' }}>
          Perfume Management
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
          Manage your perfume catalog comes to life, Add new fragrances, update existing ones, and keep your inventory fresh and organized.
        </Typography>
      </Box>

      {/* Advanced Filters */}
      <StyledCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList /> Advanced Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name or fragrance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ color: COLORS.gray400, mr: 1 }} /> }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} label="Gender">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="men">Men</MenuItem>
                <MenuItem value="women">Women</MenuItem>
                <MenuItem value="unisex">Unisex</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} label="Stock Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="in">In Stock</MenuItem>
                <MenuItem value="low">Low Stock (&lt;20)</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filterPriceRange[0]}
              onChange={(e) => setFilterPriceRange([parseFloat(e.target.value), filterPriceRange[1]])}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filterPriceRange[1]}
              onChange={(e) => setFilterPriceRange([filterPriceRange[0], parseFloat(e.target.value)])}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="contained" onClick={applyFilters} sx={{ bgcolor: COLORS.primary }}>
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </StyledCard>

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant={viewMode === 'table' ? 'contained' : 'outlined'} onClick={() => setViewMode('table')} startIcon={<TableChart />} size="small">
            Table View
          </Button>
          <Button variant={viewMode === 'grid' ? 'contained' : 'outlined'} onClick={() => setViewMode('grid')} startIcon={<GridView />} size="small">
            Grid View
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<GetApp />} onClick={downloadCSV} size="small">
            CSV
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={downloadPDF} size="small">
            PDF
          </Button>
          <Button variant="outlined" startIcon={<TableChart />} onClick={downloadExcel} size="small">
            Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpenDialog(true); }} sx={{ bgcolor: COLORS.primary }}>
            Add Perfume
          </Button>
        </Box>
      </Box>

      {/* Product Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : (
        viewMode === 'table' ? <ProductTableView /> : <ProductGridView />
      )}

      {/* Stats Summary */}
      <GlassCard sx={{ mt: 3, textAlign: 'center' }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.primary }}>{stats.totalProducts}</Typography>
            <Typography variant="caption" sx={{ color: COLORS.gray600 }}>Total Perfumes</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.success }}>
              TND{stats.totalValue?.toLocaleString() || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.gray600 }}>Total Value</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.warning }}>{stats.lowStockCount}</Typography>
            <Typography variant="caption" sx={{ color: COLORS.gray600 }}>Low Stock Items</Typography>
          </Grid>
        </Grid>
      </GlassCard>

      {/* View Product Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Perfume Details
          </Typography>
          <IconButton onClick={() => setViewDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedProduct && (
            <Box>
              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Images</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {selectedProduct.images.map((img, index) => (
                      <img 
                        key={index}
                        src={getImageUrl(img.url)}
                        alt={`${selectedProduct.name} - ${index + 1}`}
                        style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Product Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Perfume Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{selectedProduct.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Fragrance Notes</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{selectedProduct.fragrance}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Price</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {selectedProduct.discountedPrice ? (
                      <>
                        <span style={{ color: COLORS.success }}>TND{selectedProduct.discountedPrice}</span>
                        {' '}<span style={{ textDecoration: 'line-through', color: COLORS.gray500 }}>TND{selectedProduct.price}</span>
                      </>
                    ) : (
                      `TND${selectedProduct.price}`
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Stock</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{selectedProduct.stock} units</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Gender</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{selectedProduct.gender}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Category</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{selectedProduct.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Available Sizes</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {selectedProduct.quantity.map((size) => (
                      <Chip key={size} label={size} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Rating</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Rating value={selectedProduct.rating} precision={0.5} readOnly />
                    <Typography>({selectedProduct.rating})</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {selectedProduct.tags?.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
                {selectedProduct.description && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Description</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>{selectedProduct.description}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">Created At</Typography>
                  <Typography variant="body2">{new Date(selectedProduct.createdAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLORS.gray200}` }}>
          <Button onClick={() => setViewDialog(false)} variant="contained" sx={{ bgcolor: COLORS.primary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: '20px', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editProduct ? 'Edit Perfume' : 'Add New Perfume'}
          </Typography>
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Product Image Upload Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon /> Perfume Images
              </Typography>
              <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: COLORS.primary, mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  {isDragActive ? 'Drop your images here' : 'Drag & drop perfume images here'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  or click to select files (Max 5 images, up to 5MB each)
                </Typography>
              </DropzoneContainer>
              
              {previewImages.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {previewImages.map((img, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img 
                        src={img} 
                        alt={`Preview ${index}`} 
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: `2px solid ${COLORS.gray200}` }} 
                      />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: COLORS.white, boxShadow: 1 }}
                        onClick={() => {
                          setPreviewImages(previewImages.filter((_, i) => i !== index));
                          setImages(images.filter((_, i) => i !== index));
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider />

            {/* Product Basic Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Basic Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Perfume Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Rose Petals Perfume"
                />
                
                <TextField
                  fullWidth
                  label="Fragrance Notes *"
                  name="fragrance"
                  value={formData.fragrance}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Rose, Jasmine, Vanilla"
                  helperText="Separate fragrance notes with commas"
                />
                
                <TextField
                  fullWidth
                  label="Perfume Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  placeholder="Detailed description of the perfume..."
                />

                <TextField
                  fullWidth
                  label="Tags"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="e.g., bestseller, organic, summer"
                  helperText="Separate tags with commas"
                />
              </Box>
            </Box>

            <Divider />

            {/* Pricing & Stock */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Pricing & Inventory</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Original Price *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
                  placeholder="0.00"
                />
                
                <TextField
                  fullWidth
                  label="Discounted Price"
                  name="discountedPrice"
                  type="number"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">TND</InputAdornment> }}
                  placeholder="0.00"
                  helperText="Leave empty if no discount"
                />
                
                <TextField
                  fullWidth
                  label="Stock Quantity *"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  placeholder="0"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Available Sizes *</InputLabel>
                  <Select
                    multiple
                    value={formData.quantity}
                    onChange={handleQuantityChange}
                    label="Available Sizes *"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((v) => (<Chip key={v} label={v} size="small" />))}
                      </Box>
                    )}
                  >
                    {quantityOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={formData.quantity.indexOf(option) > -1} />
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* Classification */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Classification</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    <MenuItem value="Perfumes">Perfumes</MenuItem>
                    <MenuItem value="Attars">Attars</MenuItem>
                    <MenuItem value="Oils">Oils</MenuItem>
                    <MenuItem value="Gifts">Gifts</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>Target Gender *</Typography>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleInputChange}>
                    {genderOptions.map((option) => (
                      <FormControlLabel 
                        key={option.value} 
                        value={option.value} 
                        control={<Radio />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{option.icon}{option.label}</Box>} 
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Rating</Typography>
                  <Rating 
                    name="rating" 
                    value={parseFloat(formData.rating)} 
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, rating: newValue });
                    }} 
                    precision={0.5} 
                    size="large" 
                  />
                </Box>
                
                <FormControlLabel
                  control={<Switch checked={formData.featured} onChange={handleInputChange} name="featured" />}
                  label="Featured Perfume"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLORS.gray200}`, gap: 2 }}>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained" 
            startIcon={<Save />}
            sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.primaryDark } }}
          >
            {editProduct ? 'Update Perfume' : 'Add Perfume'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteProduct} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AddProduct;