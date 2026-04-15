import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Chip, 
  IconButton, Avatar, Divider, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Tooltip,
  styled, CircularProgress, TableFooter,
  Menu, ListItemIcon, ListItemText, alpha,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Delete, Visibility, Close, FilterList, Search,
  Refresh, Download, GetApp, PictureAsPdf, TableChart,
  Email as EmailIcon, Phone as PhoneIcon,
  Message as MessageIcon, Schedule,
  MarkEmailRead, Reply, Archive, ClearAll,
  CheckCircle, Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { format } from 'date-fns';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Status colors
const STATUS_CONFIG = {
  pending: { color: COLORS.warning, bg: '#FEF3C7', label: 'Pending', icon: <Schedule sx={{ fontSize: 14 }} /> },
  read: { color: COLORS.info, bg: '#DBEAFE', label: 'Read', icon: <MarkEmailRead sx={{ fontSize: 14 }} /> },
  replied: { color: COLORS.success, bg: '#D1FAE5', label: 'Replied', icon: <Reply sx={{ fontSize: 14 }} /> },
  archived: { color: COLORS.gray500, bg: '#F3F4F6', label: 'Archived', icon: <Archive sx={{ fontSize: 14 }} /> }
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

const StatCard = styled(Paper)(({ theme, bgcolor }) => ({
  background: bgcolor || COLORS.white,
  borderRadius: '20px',
  padding: '20px',
  border: `1px solid ${COLORS.gray200}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px -12px rgba(0,0,0,0.15)',
  },
}));

const Messages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    read: 0,
    replied: 0,
    archived: 0
  });

  // Load messages on mount
  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  // Load messages with filters
  const loadMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);

      const response = await axiosInstance.get(`/contact?${params}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error loading messages', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await axiosInstance.get('/contact/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Update message status
  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/contact/${id}/status`, { status });
      setSnackbar({ open: true, message: `Message marked as ${status}`, severity: 'success' });
      loadMessages();
      loadStats();
      if (viewDialog) {
        setSelectedMessage(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  // Delete message
  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/contact/${selectedMessage._id}`);
      setSnackbar({ open: true, message: 'Message deleted successfully!', severity: 'success' });
      setDeleteDialog(false);
      setViewDialog(false);
      await loadMessages();
      await loadStats();
    } catch (error) {
      console.error('Error deleting message:', error);
      setSnackbar({ open: true, message: 'Error deleting message', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle view message
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setSelectedStatus(message.status);
    setViewDialog(true);
  };

  // Handle status change from dialog
  const handleStatusChangeFromDialog = async () => {
    if (selectedStatus !== selectedMessage.status) {
      await updateStatus(selectedMessage._id, selectedStatus);
    }
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
    loadMessages();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setPage(0);
    setTimeout(() => loadMessages(), 100);
  };

  // Export to CSV
  const exportCSV = () => {
    const csvHeaders = ['Name', 'Email', 'Phone', 'Message', 'Status', 'Date'];
    const csvRows = messages.map(msg => [
      msg.name,
      msg.email,
      msg.phone,
      msg.message,
      msg.status,
      new Date(msg.createdAt).toLocaleString()
    ]);
    
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'CSV exported successfully!', severity: 'success' });
  };

  // Export to Excel
  const exportExcel = () => {
    const wsData = messages.map(msg => ({
      'Name': msg.name,
      'Email': msg.email,
      'Phone': msg.phone,
      'Message': msg.message,
      'Status': msg.status,
      'Date': new Date(msg.createdAt).toLocaleString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Messages');
    XLSX.writeFile(wb, `messages-${new Date().toISOString()}.xlsx`);
    setSnackbar({ open: true, message: 'Excel exported successfully!', severity: 'success' });
  };

  // Export to PDF
  const exportPDF = async () => {
    const element = document.getElementById('messages-table');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`messages-report-${new Date().toISOString()}.pdf`);
      setSnackbar({ open: true, message: 'PDF exported successfully!', severity: 'success' });
    }
  };

  // Effect to reload when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 0) {
        loadMessages();
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterStatus, orderBy, order]);

  useEffect(() => {
    loadMessages();
  }, [page, rowsPerPage]);

  // Get status chip
  const getStatusChip = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bg,
          color: config.color,
          fontWeight: 600,
          fontSize: '11px',
          height: '26px',
          '& .MuiChip-icon': {
            color: config.color,
            fontSize: '14px'
          }
        }}
      />
    );
  };

  // Messages Table View
  const MessagesTableView = () => (
    <TableContainer id="messages-table">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: COLORS.gray50 }}>
            <TableCell>
              <TableSortLabel active={orderBy === 'name'} direction={order} onClick={() => handleSort('name')}>
                Customer
              </TableSortLabel>
            </TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>
              <TableSortLabel active={orderBy === 'createdAt'} direction={order} onClick={() => handleSort('createdAt')}>
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {messages.map((message) => (
            <TableRow 
              key={message._id} 
              hover
              sx={{ 
                bgcolor: message.status === 'pending' ? alpha(COLORS.warning, 0.05) : 'transparent',
                '&:hover': { bgcolor: COLORS.gray50 }
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: COLORS.primary, width: 40, height: 40 }}>
                    {message.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {message.name}
                    </Typography>
                    {message.status === 'pending' && (
                      <Chip 
                        label="New" 
                        size="small" 
                        sx={{ 
                          mt: 0.5, 
                          fontSize: 10, 
                          height: 18,
                          bgcolor: COLORS.error,
                          color: COLORS.white
                        }} 
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.gray600 }}>
                    <EmailIcon sx={{ fontSize: 14 }} /> {message.email}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.gray600, mt: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 14 }} /> {message.phone}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    maxWidth: 300, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: COLORS.gray700
                  }}
                >
                  {message.message}
                </Typography>
              </TableCell>
              <TableCell>
                {getStatusChip(message.status)}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                  {format(new Date(message.createdAt), 'hh:mm a')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View & Manage">
                  <IconButton size="small" onClick={() => handleViewMessage(message)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => { setSelectedMessage(message); setDeleteDialog(true); }}>
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
              colSpan={6}
              count={messages.length}
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.gray900, fontFamily: 'Oswald' }}>
          Messages & Inquiries
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
          Manage customer messages, track inquiries, and update statuses efficiently.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard bgcolor={COLORS.white}>
            <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600 }}>Total Messages</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.primary, mt: 1 }}>{stats.total}</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard bgcolor={STATUS_CONFIG.pending.bg}>
            <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600 }}>Pending</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: STATUS_CONFIG.pending.color, mt: 1 }}>{stats.pending}</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard bgcolor={STATUS_CONFIG.read.bg}>
            <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600 }}>Read</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: STATUS_CONFIG.read.color, mt: 1 }}>{stats.read}</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard bgcolor={STATUS_CONFIG.replied.bg}>
            <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600 }}>Replied</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: STATUS_CONFIG.replied.color, mt: 1 }}>{stats.replied}</Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard bgcolor={STATUS_CONFIG.archived.bg}>
            <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600 }}>Archived</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: STATUS_CONFIG.archived.color, mt: 1 }}>{stats.archived}</Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <StyledCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList /> Filter Messages
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ color: COLORS.gray400, mr: 1 }} /> }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="replied">Replied</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={clearFilters} startIcon={<ClearAll />}>
                Clear
              </Button>
              <Button variant="contained" onClick={applyFilters} sx={{ bgcolor: COLORS.primary }}>
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </StyledCard>

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button variant="outlined" startIcon={<GetApp />} onClick={exportCSV} size="small">
          CSV
        </Button>
        <Button variant="outlined" startIcon={<TableChart />} onClick={exportExcel} size="small">
          Excel
        </Button>
        <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportPDF} size="small">
          PDF
        </Button>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadMessages} size="small">
          Refresh
        </Button>
      </Box>

      {/* Messages Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : (
        <MessagesTableView />
      )}

      {/* View/Edit Message Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ bgcolor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Message Details
          </Typography>
          <IconButton onClick={() => setViewDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedMessage && (
            <Box>
              {/* Customer Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: COLORS.primary, width: 56, height: 56 }}>
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedMessage.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 14 }} /> {selectedMessage.email}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 14 }} /> {selectedMessage.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Status Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: COLORS.gray700 }}>
                  Update Status
                </Typography>
                <ToggleButtonGroup
                  value={selectedStatus}
                  exclusive
                  onChange={(e, newStatus) => {
                    if (newStatus) setSelectedStatus(newStatus);
                  }}
                  sx={{ flexWrap: 'wrap', gap: 1 }}
                >
                  <ToggleButton value="pending" sx={{ 
                    borderRadius: '20px', 
                    px: 2,
                    '&.Mui-selected': { bgcolor: STATUS_CONFIG.pending.bg, color: STATUS_CONFIG.pending.color }
                  }}>
                    <Schedule sx={{ fontSize: 16, mr: 0.5 }} /> Pending
                  </ToggleButton>
                  <ToggleButton value="read" sx={{ 
                    borderRadius: '20px', 
                    px: 2,
                    '&.Mui-selected': { bgcolor: STATUS_CONFIG.read.bg, color: STATUS_CONFIG.read.color }
                  }}>
                    <MarkEmailRead sx={{ fontSize: 16, mr: 0.5 }} /> Read
                  </ToggleButton>
                  <ToggleButton value="replied" sx={{ 
                    borderRadius: '20px', 
                    px: 2,
                    '&.Mui-selected': { bgcolor: STATUS_CONFIG.replied.bg, color: STATUS_CONFIG.replied.color }
                  }}>
                    <Reply sx={{ fontSize: 16, mr: 0.5 }} /> Replied
                  </ToggleButton>
                  <ToggleButton value="archived" sx={{ 
                    borderRadius: '20px', 
                    px: 2,
                    '&.Mui-selected': { bgcolor: STATUS_CONFIG.archived.bg, color: STATUS_CONFIG.archived.color }
                  }}>
                    <Archive sx={{ fontSize: 16, mr: 0.5 }} /> Archived
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Message Content */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: COLORS.gray700 }}>
                Message
              </Typography>
              <Paper sx={{ p: 2, bgcolor: COLORS.gray50, borderRadius: '12px', mb: 3 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.message}
                </Typography>
              </Paper>

              {/* Message Metadata */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Received</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {format(new Date(selectedMessage.createdAt), 'MMMM dd, yyyy - hh:mm a')}
                  </Typography>
                </Grid>
                {selectedMessage.repliedAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Replied On</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {format(new Date(selectedMessage.repliedAt), 'MMMM dd, yyyy - hh:mm a')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLORS.gray200}`, gap: 2 }}>
          <Button onClick={() => setViewDialog(false)} variant="outlined">
            Cancel
          </Button>
          {selectedMessage && selectedStatus !== selectedMessage.status && (
            <Button 
              variant="contained" 
              sx={{ bgcolor: COLORS.primary }}
              onClick={handleStatusChangeFromDialog}
            >
              Save Status Change
            </Button>
          )}
          <Button 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialog(true)}
          >
            Delete
          </Button>
          {selectedMessage && selectedMessage.status !== 'replied' && (
            <Button 
              variant="contained" 
              sx={{ bgcolor: COLORS.success }}
              startIcon={<Reply />}
              onClick={() => {
                window.location.href = `mailto:${selectedMessage.email}?subject=Re: Your message to WIQAR Perfumes`;
                updateStatus(selectedMessage._id, 'replied');
                setSelectedStatus('replied');
              }}
            >
              Reply via Email
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message from {selectedMessage?.name}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Messages;