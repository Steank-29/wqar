import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Chip, 
  IconButton, Avatar, Divider, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem,
  Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Tooltip, InputAdornment,
  styled, CircularProgress, Stack, Badge, alpha, Checkbox
} from '@mui/material';
import {
  Visibility, Edit, Delete, LocalShipping, Cancel, Refresh,
  Download, Print, Search, FilterList, ShoppingBag, AttachMoney,
  PendingActions, LocalShipping as ShippingIcon, Close,
  Person, Email, Phone, LocationOn, Schedule, Note, Receipt,
  CheckCircle, WhatsApp, Inventory, ChevronRight, ArrowBack,
  PictureAsPdf, TableChart, GetApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '@fontsource/oswald';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('authToken');
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
  primary: '#1A1A1A',
  secondary: '#8C5A3C',
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

const statusColors = {
  pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
  confirmed: { bg: '#DBEAFE', color: '#2563EB', label: 'Confirmed' },
  processing: { bg: '#E0E7FF', color: '#4F46E5', label: 'Processing' },
  shipped: { bg: '#D1FAE5', color: '#059669', label: 'Shipped' },
  delivered: { bg: '#D1FAE5', color: '#059669', label: 'Delivered' },
  cancelled: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
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

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    totalRevenue: 0,
    confirmedOrders: 0,
    deliveredOrders: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Please login to access this page',
        severity: 'error'
      });
      navigate('/login');
    } else {
      fetchOrders();
      fetchStats();
    }
  }, [navigate]);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        order: order
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.paymentMethod = paymentFilter;
      if (searchTerm) params.search = searchTerm;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const response = await axiosInstance.get('/orders', { params });
      setOrders(response.data.orders);
      setTotalOrders(response.data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: 'Session expired. Please login again.',
          severity: 'error'
        });
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error fetching orders',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/orders/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Reload data when filters change
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchOrders();
    }
  }, [page, rowsPerPage, statusFilter, paymentFilter, orderBy, order]);

  // Apply filters
  const applyFilters = () => {
    setPage(0);
    fetchOrders();
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateRange({ start: '', end: '' });
    setPage(0);
    setTimeout(() => fetchOrders(), 100);
  };

  // Handle sort
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setProcessing(true);
    try {
      await axiosInstance.put(`/orders/${selectedOrder._id}/status`, { 
        status: newStatus 
      });
      
      setSnackbar({
        open: true,
        message: 'Order status updated successfully',
        severity: 'success'
      });
      
      setStatusDialogOpen(false);
      setNewStatus('');
      fetchOrders();
      fetchStats();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating order status',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle tracking update
  const handleTrackingUpdate = async () => {
    if (!selectedOrder || !trackingNumber) return;
    
    setProcessing(true);
    try {
      await axiosInstance.put(`/orders/${selectedOrder._id}/tracking`, { 
        trackingNumber, 
        shippingCarrier 
      });
      
      setSnackbar({
        open: true,
        message: 'Tracking information updated successfully',
        severity: 'success'
      });
      
      setTrackingDialogOpen(false);
      setTrackingNumber('');
      setShippingCarrier('');
      fetchOrders();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating tracking information',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      await axiosInstance.put(`/orders/${selectedOrder._id}/cancel`, { 
        reason: cancellationReason 
      });
      
      setSnackbar({
        open: true,
        message: 'Order cancelled successfully',
        severity: 'success'
      });
      
      setCancelDialogOpen(false);
      setCancellationReason('');
      fetchOrders();
      fetchStats();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error cancelling order',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      await axiosInstance.delete(`/orders/${selectedOrder._id}`);
      
      setSnackbar({
        open: true,
        message: 'Order deleted successfully',
        severity: 'success'
      });
      
      setDeleteDialogOpen(false);
      fetchOrders();
      fetchStats();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting order',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    
    setProcessing(true);
    try {
      await axiosInstance.delete('/orders/bulk/delete', {
        data: { orderIds: selectedOrders }
      });
      
      setSnackbar({
        open: true,
        message: `${selectedOrders.length} orders deleted successfully`,
        severity: 'success'
      });
      
      setSelectedOrders([]);
      fetchOrders();
      fetchStats();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting orders',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Export as CSV/Excel
  const exportCSV = () => {
    const csvData = orders.map(order => ({
      'Order Number': order.orderNumber,
      'Customer': order.customer.fullName,
      'Email': order.customer.email,
      'Phone': order.customer.phone,
      'Total': order.total,
      'Status': order.orderStatus,
      'Payment Method': order.paymentMethod,
      'Date': new Date(order.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    setSnackbar({
      open: true,
      message: 'Orders exported successfully',
      severity: 'success'
    });
  };

  // Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Orders Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableColumn = ['Order #', 'Customer', 'Total', 'Status', 'Date'];
    const tableRows = orders.map(order => [
      order.orderNumber,
      order.customer.fullName,
      `${order.total.toFixed(2)} TND`,
      order.orderStatus,
      new Date(order.createdAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [140, 90, 60] }
    });
    
    doc.save(`orders-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    setSnackbar({
      open: true,
      message: 'PDF downloaded successfully',
      severity: 'success'
    });
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      borderRadius: '16px',
      border: `1px solid ${COLORS.gray200}`,
      boxShadow: 'none',
      height: '100%',
    }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" sx={{ color: COLORS.gray600, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Oswald' }}>
              {typeof value === 'number' && title.includes('Revenue') ? `${value.toFixed(2)} TND` : value}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: '12px',
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.gray900, fontFamily: 'Oswald' }}>
              Orders Management
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
              Manage and track all customer orders
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchOrders();
                fetchStats();
              }}
              sx={{ 
                borderRadius: '50px',
                borderColor: COLORS.gray300,
                color: COLORS.gray700,
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={exportCSV}
              sx={{ 
                borderRadius: '50px',
                borderColor: COLORS.gray300,
                color: COLORS.gray700,
              }}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={exportPDF}
              sx={{ 
                borderRadius: '50px',
                borderColor: COLORS.gray300,
                color: COLORS.gray700,
              }}
            >
              PDF
            </Button>
            {selectedOrders.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                disabled={processing}
                sx={{ borderRadius: '50px' }}
              >
                Delete Selected ({selectedOrders.length})
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={<ShoppingBag sx={{ color: COLORS.secondary }} />}
            color={COLORS.secondary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders || 0}
            icon={<PendingActions sx={{ color: COLORS.warning }} />}
            color={COLORS.warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shipped Orders"
            value={stats.shippedOrders || 0}
            icon={<ShippingIcon sx={{ color: COLORS.info }} />}
            color={COLORS.info}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue || 0}
            icon={<AttachMoney sx={{ color: COLORS.success }} />}
            color={COLORS.success}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <StyledCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList /> Advanced Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by order #, customer or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ 
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: COLORS.gray400 }} />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} label="Payment Method">
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="cash_on_delivery">Cash on Delivery</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="contained" onClick={applyFilters} sx={{ bgcolor: COLORS.secondary }}>
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </StyledCard>

      {/* Orders Table */}
      <StyledCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.gray50 }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(orders.map(o => o._id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'orderNumber'}
                    direction={order}
                    onClick={() => handleSort('orderNumber')}
                  >
                    Order #
                  </TableSortLabel>
                </TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={order}
                    onClick={() => handleSort('createdAt')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'total'}
                    direction={order}
                    onClick={() => handleSort('total')}
                  >
                    Total
                  </TableSortLabel>
                </TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'orderStatus'}
                    direction={order}
                    onClick={() => handleSort('orderStatus')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress sx={{ color: COLORS.secondary }} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <ShoppingBag sx={{ fontSize: 48, color: COLORS.gray400, mb: 2 }} />
                    <Typography variant="body1" sx={{ color: COLORS.gray600 }}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order._id}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: COLORS.gray50 },
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order._id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(COLORS.secondary, 0.1) }}>
                          <Person sx={{ fontSize: 18, color: COLORS.secondary }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.customer.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                            {order.customer.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.total.toFixed(2)} TND
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                      <Chip
                        label={order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Bank Transfer'}
                        size="small"
                        sx={{ 
                          bgcolor: order.paymentMethod === 'cash_on_delivery' 
                            ? alpha(COLORS.info, 0.1) 
                            : alpha(COLORS.secondary, 0.1),
                          color: order.paymentMethod === 'cash_on_delivery' 
                            ? COLORS.info 
                            : COLORS.secondary,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                      <Chip
                        label={statusColors[order.orderStatus]?.label || order.orderStatus}
                        size="small"
                        sx={{ 
                          bgcolor: statusColors[order.orderStatus]?.bg,
                          color: statusColors[order.orderStatus]?.color,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setViewDialogOpen(true);
                            }}
                            sx={{ color: COLORS.gray600 }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Bon de Livraison (BDL)">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/admin/orders/${order._id}/invoice`)}
                            sx={{ color: COLORS.secondary }}
                          >
                            <Receipt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.orderStatus);
                              setStatusDialogOpen(true);
                            }}
                            sx={{ color: COLORS.info }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Add Tracking">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingNumber(order.trackingNumber || '');
                              setShippingCarrier(order.shippingCarrier || '');
                              setTrackingDialogOpen(true);
                            }}
                            sx={{ color: COLORS.success }}
                          >
                            <LocalShipping fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Cancel Order">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setCancelDialogOpen(true);
                            }}
                            disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                            sx={{ color: COLORS.warning }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Order">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDeleteDialogOpen(true);
                            }}
                            sx={{ color: COLORS.error }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalOrders}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </StyledCard>

      {/* View Order Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ pb: 2, bgcolor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Order Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                    {selectedOrder.orderNumber}
                  </Typography>
                </Box>
                <IconButton onClick={() => setViewDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Customer Information
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Person sx={{ fontSize: 18, color: COLORS.gray600 }} />
                      <Typography variant="body2">{selectedOrder.customer.fullName}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Email sx={{ fontSize: 18, color: COLORS.gray600 }} />
                      <Typography variant="body2">{selectedOrder.customer.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone sx={{ fontSize: 18, color: COLORS.gray600 }} />
                      <Typography variant="body2">{selectedOrder.customer.phone}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <LocationOn sx={{ fontSize: 18, color: COLORS.gray600, mt: 0.2 }} />
                      <Typography variant="body2">
                        {selectedOrder.customer.address}, {selectedOrder.customer.city} {selectedOrder.customer.postalCode}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Order Information
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Schedule sx={{ fontSize: 18, color: COLORS.gray600 }} />
                      <Typography variant="body2">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Receipt sx={{ fontSize: 18, color: COLORS.gray600 }} />
                      <Typography variant="body2">
                        Payment: {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}
                      </Typography>
                    </Stack>
                    {selectedOrder.trackingNumber && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocalShipping sx={{ fontSize: 18, color: COLORS.gray600 }} />
                        <Typography variant="body2">
                          Tracking: {selectedOrder.trackingNumber} ({selectedOrder.shippingCarrier || 'N/A'})
                        </Typography>
                      </Stack>
                    )}
                    {selectedOrder.notes && (
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <Note sx={{ fontSize: 18, color: COLORS.gray600, mt: 0.2 }} />
                        <Typography variant="body2">{selectedOrder.notes}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Order Items
                  </Typography>
                  <Stack spacing={2}>
                    {selectedOrder.items.map((item, index) => (
                      <Stack key={index} direction="row" alignItems="center" spacing={2}>
                        <Avatar 
                          src={item.mainImage ? `http://localhost:5000/${item.mainImage}` : null}
                          variant="rounded"
                          sx={{ width: 50, height: 50, borderRadius: '8px' }}
                        >
                          <Inventory />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                            Size: {item.selectedSize} | Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(item.price * item.quantity).toFixed(2)} TND
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>Subtotal</Typography>
                      <Typography variant="body2">{selectedOrder.subtotal.toFixed(2)} TND</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: COLORS.gray600 }}>Shipping</Typography>
                      <Typography variant="body2">{selectedOrder.shippingCost.toFixed(2)} TND</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.secondary }}>
                        {selectedOrder.total.toFixed(2)} TND
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLORS.gray200}` }}>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained"
                startIcon={<Receipt />}
                onClick={() => {
                  setViewDialogOpen(false);
                  navigate(`/admin/orders/${selectedOrder._id}/invoice`);
                }}
                sx={{ bgcolor: COLORS.secondary, borderRadius: '50px' }}
              >
                Generate BDL
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50 }}>Update Order Status</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={processing || !newStatus}
            sx={{ bgcolor: COLORS.secondary, borderRadius: '50px' }}
          >
            {processing ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog 
        open={trackingDialogOpen} 
        onClose={() => setTrackingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50 }}>Add Tracking Information</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Shipping Carrier"
              value={shippingCarrier}
              onChange={(e) => setShippingCarrier(e.target.value)}
              placeholder="e.g., DHL, FedEx, UPS"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setTrackingDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleTrackingUpdate}
            variant="contained"
            disabled={processing || !trackingNumber}
            sx={{ bgcolor: COLORS.secondary, borderRadius: '50px' }}
          >
            {processing ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50 }}>Cancel Order</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Cancellation Reason"
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>Back</Button>
          <Button 
            onClick={handleCancelOrder}
            variant="contained"
            color="error"
            disabled={processing}
            sx={{ borderRadius: '50px' }}
          >
            {processing ? <CircularProgress size={24} /> : 'Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50 }}>Delete Order</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning">
            Are you sure you want to delete this order? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteOrder}
            variant="contained"
            color="error"
            disabled={processing}
            sx={{ borderRadius: '50px' }}
          >
            {processing ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ borderRadius: '12px' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;