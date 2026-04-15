import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, CardHeader, 
  IconButton, Avatar, Chip, Button, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, List, ListItem,
  ListItemText, ListItemAvatar, ListItemSecondaryAction, useTheme,
  alpha, styled, Tooltip, LinearProgress, Container, Zoom, Fade,
  Snackbar, Alert
} from '@mui/material';
import {
  TrendingUp, TrendingDown, ShoppingCart, AttachMoney, People,
  Inventory, ArrowUpward, ArrowDownward, Receipt, Message,
  Settings, Warning, Schedule, Refresh, Download, Print,
  Visibility, Add, MoreHoriz, CheckCircle, Pending,
  LocalShipping, Star, StarBorder, Assessment, Category,
  Storefront, Timeline, PieChart as PieChartIcon
} from '@mui/icons-material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
const StyledContainer = styled(Box)({
  background: COLORS.white,
  minHeight: '100vh',
  padding: '32px',
});

const HeroSection = styled(Box)({
  marginBottom: '40px',
  padding: '24px 0',
  borderBottom: `2px solid ${COLORS.gray100}`,
});

const StatCard = styled(Paper)(({ theme, color }) => ({
  padding: '24px',
  borderRadius: '20px',
  background: COLORS.white,
  border: `1px solid ${COLORS.gray200}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 25px -12px rgba(0,0,0,0.1)',
    borderColor: color,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: color,
  },
}));

const GlassCard = styled(Card)({
  background: COLORS.white,
  borderRadius: '20px',
  border: `1px solid ${COLORS.gray200}`,
  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  height: '100%',
  '&:hover': {
    boxShadow: '0 10px 40px -12px rgba(0,0,0,0.15)',
  },
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalRevenue: 125430,
    totalOrders: 342,
    totalCustomers: 1289,
    totalProducts: 156,
    lowStock: 12,
    pendingOrders: 23,
    revenueGrowth: 23.5,
    ordersGrowth: 15.2,
    customersGrowth: 18.7,
  });

  // Chart Data - Wider and more detailed
  const revenueData = [
    { month: 'Jan', revenue: 8500, orders: 45, profit: 2800, expenses: 5700 },
    { month: 'Feb', revenue: 9200, orders: 52, profit: 3100, expenses: 6100 },
    { month: 'Mar', revenue: 10800, orders: 68, profit: 3650, expenses: 7150 },
    { month: 'Apr', revenue: 12400, orders: 75, profit: 4200, expenses: 8200 },
    { month: 'May', revenue: 13100, orders: 82, profit: 4450, expenses: 8650 },
    { month: 'Jun', revenue: 14800, orders: 94, profit: 5020, expenses: 9780 },
    { month: 'Jul', revenue: 15600, orders: 105, profit: 5300, expenses: 10300 },
    { month: 'Aug', revenue: 16200, orders: 112, profit: 5510, expenses: 10690 },
    { month: 'Sep', revenue: 17500, orders: 128, profit: 5950, expenses: 11550 },
    { month: 'Oct', revenue: 18900, orders: 142, profit: 6420, expenses: 12480 },
    { month: 'Nov', revenue: 20400, orders: 158, profit: 6930, expenses: 13470 },
    { month: 'Dec', revenue: 22500, orders: 175, profit: 7650, expenses: 14850 },
  ];

  const categoryData = [
    { name: 'Perfumes', value: 45, color: COLORS.primary, icon: '🌸', revenue: 56450 },
    { name: 'Cosmetics', value: 30, color: COLORS.primaryLight, icon: '💄', revenue: 37630 },
    { name: 'Skincare', value: 15, color: COLORS.secondary, icon: '🧴', revenue: 18815 },
    { name: 'Accessories', value: 10, color: COLORS.gray400, icon: '💍', revenue: 12543 },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Sarah Johnson', amount: 245.50, status: 'Completed', date: '2024-01-15', items: 3, payment: 'Card' },
    { id: '#ORD-002', customer: 'Michael Chen', amount: 189.90, status: 'Processing', date: '2024-01-15', items: 2, payment: 'PayPal' },
    { id: '#ORD-003', customer: 'Emma Wilson', amount: 432.00, status: 'Pending', date: '2024-01-14', items: 5, payment: 'Card' },
    { id: '#ORD-004', customer: 'James Brown', amount: 78.50, status: 'Completed', date: '2024-01-14', items: 1, payment: 'Cash' },
    { id: '#ORD-005', customer: 'Lisa Anderson', amount: 567.30, status: 'Shipped', date: '2024-01-13', items: 4, payment: 'Card' },
  ];

  const topProducts = [
    { name: 'Rose Perfume', sales: 234, revenue: 4680, growth: 12.5, trend: 'up', rating: 4.8, stock: 45 },
    { name: 'Lavender Oil', sales: 187, revenue: 3740, growth: 8.3, trend: 'up', rating: 4.6, stock: 38 },
    { name: 'Vanilla Extract', sales: 156, revenue: 3120, growth: -3.2, trend: 'down', rating: 4.4, stock: 12 },
    { name: 'Citrus Spray', sales: 134, revenue: 2680, growth: 15.7, trend: 'up', rating: 4.9, stock: 28 },
    { name: 'Musk Blend', sales: 112, revenue: 2240, growth: 5.8, trend: 'up', rating: 4.7, stock: 32 },
  ];

  // Function to handle refresh
  const handleRefresh = () => {
    setSnackbar({ open: true, message: 'Dashboard data refreshed successfully!', severity: 'success' });
    // Simulate data refresh
    setTimeout(() => {
      setSnackbar({ open: false, message: '', severity: 'success' });
    }, 3000);
  };

  // Function to handle download as PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (element) {
      setSnackbar({ open: true, message: 'Generating PDF...', severity: 'info' });
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: COLORS.white,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: 'a4'
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('wiqar-dashboard-report.pdf');
        setSnackbar({ open: true, message: 'PDF downloaded successfully!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error generating PDF', severity: 'error' });
      }
      setTimeout(() => {
        setSnackbar({ open: false, message: '', severity: 'success' });
      }, 3000);
    }
  };

  // Function to handle print
  const handlePrint = () => {
    setSnackbar({ open: true, message: 'Preparing print...', severity: 'info' });
    setTimeout(() => {
      window.print();
      setSnackbar({ open: true, message: 'Print dialog opened', severity: 'success' });
      setTimeout(() => {
        setSnackbar({ open: false, message: '', severity: 'success' });
      }, 2000);
    }, 500);
  };

  const StatCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard color={COLORS.success}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600, letterSpacing: '0.5px' }}>
                  TOTAL REVENUE
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.gray900, mt: 1, mb: 1 }}>
                  ${stats.totalRevenue.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<TrendingUp sx={{ fontSize: 14 }} />} 
                    label={`+${stats.revenueGrowth}%`}
                    size="small"
                    sx={{ bgcolor: `${COLORS.success}15`, color: COLORS.success, fontWeight: 600 }}
                  />
                  <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                    vs last month
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: `${COLORS.success}10`, color: COLORS.success, width: 56, height: 56 }}>
                <AttachMoney sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </StatCard>
        </motion.div>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard color={COLORS.primary}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600, letterSpacing: '0.5px' }}>
                  TOTAL ORDERS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.gray900, mt: 1, mb: 1 }}>
                  {stats.totalOrders.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<TrendingUp sx={{ fontSize: 14 }} />} 
                    label={`+${stats.ordersGrowth}%`}
                    size="small"
                    sx={{ bgcolor: `${COLORS.success}15`, color: COLORS.success, fontWeight: 600 }}
                  />
                  <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                    vs last month
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: `${COLORS.primary}10`, color: COLORS.primary, width: 56, height: 56 }}>
                <ShoppingCart sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </StatCard>
        </motion.div>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard color={COLORS.info}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600, letterSpacing: '0.5px' }}>
                  ACTIVE CUSTOMERS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.gray900, mt: 1, mb: 1 }}>
                  {stats.totalCustomers.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<TrendingUp sx={{ fontSize: 14 }} />} 
                    label={`+${stats.customersGrowth}%`}
                    size="small"
                    sx={{ bgcolor: `${COLORS.success}15`, color: COLORS.success, fontWeight: 600 }}
                  />
                  <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                    vs last month
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: `${COLORS.info}10`, color: COLORS.info, width: 56, height: 56 }}>
                <People sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </StatCard>
        </motion.div>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard color={COLORS.warning}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: COLORS.gray500, fontWeight: 600, letterSpacing: '0.5px' }}>
                  INVENTORY ITEMS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.gray900, mt: 1, mb: 1 }}>
                  {stats.totalProducts}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`${stats.lowStock} Low Stock`}
                    size="small"
                    sx={{ bgcolor: `${COLORS.error}15`, color: COLORS.error, fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: `${COLORS.warning}10`, color: COLORS.warning, width: 56, height: 56 }}>
                <Inventory sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </StatCard>
        </motion.div>
      </Grid>
    </Grid>
  );

  return (
    <StyledContainer>
      <HeroSection>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Storefront sx={{ fontSize: 40, color: COLORS.primary }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.gray900, fontFamily: 'Oswald' }}>
                  WIQAR Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
                  Premium Fragrance & Beauty Management System
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={handleRefresh}
                  sx={{ bgcolor: COLORS.gray100, borderRadius: '12px', '&:hover': { bgcolor: COLORS.primary, color: COLORS.white } }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF Report">
                <IconButton 
                  onClick={handleDownloadPDF}
                  sx={{ bgcolor: COLORS.gray100, borderRadius: '12px', '&:hover': { bgcolor: COLORS.primary, color: COLORS.white } }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print Dashboard">
                <IconButton 
                  onClick={handlePrint}
                  sx={{ bgcolor: COLORS.gray100, borderRadius: '12px', '&:hover': { bgcolor: COLORS.primary, color: COLORS.white } }}
                >
                  <Print />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </HeroSection>

      <div id="dashboard-content">
        <StatCards />

        {/* Wider Charts Section - Equal width and height */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={7}>
            <GlassCard>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.gray800 }}>
                    Revenue & Profit Analytics
                  </Typography>
                }
                subheader="Monthly performance tracking with expense breakdown"
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['Week', 'Month', 'Year'].map((period) => (
                      <Button
                        key={period}
                        size="small"
                        variant={selectedPeriod === period.toLowerCase() ? 'contained' : 'text'}
                        onClick={() => setSelectedPeriod(period.toLowerCase())}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          bgcolor: selectedPeriod === period.toLowerCase() ? COLORS.primary : 'transparent',
                          color: selectedPeriod === period.toLowerCase() ? COLORS.white : COLORS.gray600,
                        }}
                      >
                        {period}
                      </Button>
                    ))}
                  </Box>
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} />
                    <XAxis dataKey="month" stroke={COLORS.gray500} fontSize={12} />
                    <YAxis stroke={COLORS.gray500} fontSize={12} />
                    <ChartTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} fill="url(#revenueGradient)" name="Revenue ($)" strokeWidth={2} />
                    <Area type="monotone" dataKey="profit" stroke={COLORS.success} fill="url(#profitGradient)" name="Profit ($)" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke={COLORS.warning} name="Expenses ($)" strokeWidth={2} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <GlassCard>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.gray800 }}>
                    Category Performance
                  </Typography>
                }
                subheader="Sales distribution by product category"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {categoryData.map((category, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, p: 1, borderRadius: '8px', '&:hover': { bgcolor: COLORS.gray50 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: category.color }} />
                        <Typography variant="body2" sx={{ color: COLORS.gray700 }}>{category.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.gray900 }}>
                          ${category.revenue.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {/* Order Analytics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={7}>
            <GlassCard>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.gray800 }}>
                    Recent Transactions
                  </Typography>
                }
                subheader="Latest customer orders and payments"
                action={
                  <Button 
                    size="small" 
                    onClick={() => navigate('/Admin-Panel/Orders')}
                    sx={{ color: COLORS.primary, textTransform: 'none' }}
                  >
                    View All Orders →
                  </Button>
                }
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: COLORS.gray50 }}>
                      <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} hover sx={{ '&:hover': { bgcolor: COLORS.gray50 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                            {order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customer}</Typography>
                            <Typography variant="caption" sx={{ color: COLORS.gray500 }}>{order.items} items • {order.payment}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>${order.amount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status}
                            size="small"
                            sx={{
                              bgcolor: 
                                order.status === 'Completed' ? `${COLORS.success}15` :
                                order.status === 'Processing' ? `${COLORS.info}15` :
                                order.status === 'Pending' ? `${COLORS.warning}15` :
                                `${COLORS.primary}15`,
                              color:
                                order.status === 'Completed' ? COLORS.success :
                                order.status === 'Processing' ? COLORS.info :
                                order.status === 'Pending' ? COLORS.warning :
                                COLORS.primary,
                              fontWeight: 600,
                              fontSize: '11px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: COLORS.gray600 }}>{order.date}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <GlassCard>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.gray800 }}>
                    Top Products
                  </Typography>
                }
                subheader="Best selling items this month"
              />
              <List>
                {topProducts.map((product, index) => (
                  <React.Fragment key={product.name}>
                    <ListItem sx={{ '&:hover': { bgcolor: COLORS.gray50 } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${COLORS.primary}10`, color: COLORS.primary }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 14, color: COLORS.warning }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{product.rating}</Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                              {product.sales} sales
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                              ${product.revenue} revenue
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.gray600 }}>
                              Stock: {product.stock}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          icon={product.trend === 'up' ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                          label={`${Math.abs(product.growth)}%`}
                          size="small"
                          sx={{
                            bgcolor: product.trend === 'up' ? `${COLORS.success}15` : `${COLORS.error}15`,
                            color: product.trend === 'up' ? COLORS.success : COLORS.error,
                            fontWeight: 600,
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < topProducts.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </GlassCard>
          </Grid>
        </Grid>

        {/* Separated Sections - Inventory Alerts & Quick Navigation */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <GlassCard>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.gray800 }}>
                    Inventory Alerts
                  </Typography>
                }
                subheader="Products requiring immediate attention"
                avatar={<Warning sx={{ color: COLORS.warning }} />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {[
                    { name: 'Rose Perfume', stock: 5, threshold: 20, status: 'Critical', action: 'Reorder Now', sku: 'PRF-001' },
                    { name: 'Lavender Oil', stock: 8, threshold: 20, status: 'Low', action: 'Check Stock', sku: 'LVD-002' },
                    { name: 'Vanilla Extract', stock: 3, threshold: 20, status: 'Critical', action: 'Reorder Now', sku: 'VNL-003' },
                    { name: 'Citrus Spray', stock: 12, threshold: 20, status: 'Low', action: 'Order More', sku: 'CTR-004' },
                  ].map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Paper sx={{ 
                          p: 2, 
                          bgcolor: item.status === 'Critical' ? `${COLORS.error}05` : `${COLORS.warning}05`, 
                          borderRadius: '12px',
                          border: `1px solid ${item.status === 'Critical' ? COLORS.error : COLORS.warning}20`
                        }}>
                          <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item xs={8}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: item.status === 'Critical' ? `${COLORS.error}20` : `${COLORS.warning}20` }}>
                                  {item.status === 'Critical' ? <Warning /> : <Schedule />}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                  <Typography variant="caption" sx={{ color: COLORS.gray600, display: 'block' }}>
                                    SKU: {item.sku} | Stock: {item.stock} / {item.threshold} units
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(item.stock / item.threshold) * 100} 
                                    sx={{ 
                                      mt: 1, 
                                      height: 4, 
                                      borderRadius: 2,
                                      width: 200,
                                      bgcolor: COLORS.gray200,
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: item.status === 'Critical' ? COLORS.error : COLORS.warning,
                                      }
                                    }} 
                                  />
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item>
                              <Button 
                                variant="contained" 
                                size="small"
                                sx={{ 
                                  bgcolor: COLORS.primary,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: COLORS.primaryDark }
                                }}
                              >
                                {item.action}
                              </Button>
                            </Grid>
                          </Grid>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <GlassCard>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.gray800 }}>
                    Quick Navigation
                  </Typography>
                }
                subheader="Frequently accessed sections"
              />
              <CardContent>
                <Grid container spacing={2}>
                  {[
                    { label: 'Add New Product', icon: <Add />, path: '/Admin-Panel/Products', color: COLORS.primary, description: 'Add products to inventory' },
                    { label: 'Create Order', icon: <ShoppingCart />, path: '/Admin-Panel/Orders', color: COLORS.success, description: 'Process customer orders' },
                    { label: 'View Messages', icon: <Message />, path: '/Admin-Panel/Messages', color: COLORS.info, description: 'Customer inquiries' },
                    { label: 'Generate Report', icon: <Assessment />, path: '/Admin-Panel/Reports', color: COLORS.warning, description: 'Business analytics' },
                    { label: 'Manage Categories', icon: <Category />, path: '/Admin-Panel/Categories', color: COLORS.secondary, description: 'Organize products' },
                    { label: 'System Settings', icon: <Settings />, path: '/Admin-Panel/Settings', color: COLORS.gray600, description: 'Configure preferences' },
                  ].map((action, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          fullWidth
                          onClick={() => navigate(action.path)}
                          sx={{
                            justifyContent: 'flex-start',
                            py: 2,
                            px: 2,
                            borderRadius: '12px',
                            color: action.color,
                            bgcolor: `${action.color}05`,
                            border: `1px solid ${action.color}20`,
                            textTransform: 'none',
                            fontWeight: 600,
                            textAlign: 'left',
                            '&:hover': {
                              bgcolor: `${action.color}10`,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar sx={{ bgcolor: `${action.color}20`, color: action.color, width: 40, height: 40 }}>
                              {action.icon}
                            </Avatar>
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: action.color }}>
                                {action.label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: COLORS.gray500 }}>
                                {action.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Button>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      </div>

      {/* Footer with Wiqar Branding */}
      <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${COLORS.gray200}`, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: COLORS.gray500 }}>
          © 2025 WIQAR - Premium Fragrance Management System. All rights reserved.
        </Typography>
        <Typography variant="caption" sx={{ color: COLORS.gray400, mt: 1, display: 'block' }}>
          Data updates in real-time | Last sync: {new Date().toLocaleString()}
        </Typography>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default Dashboard;