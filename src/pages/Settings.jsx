import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Chip,
  IconButton, Avatar, Divider, Alert, Snackbar,
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Tooltip, styled, CircularProgress,
  Tabs, Tab, InputAdornment,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  ButtonGroup, Switch,
  Collapse, Stack, TableFooter
} from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  Email,
  Phone,
  Lock,
  Delete,
  Edit,
  Add,
  Save,
  Cancel,
  Notifications,
  NotificationsOff,
  Block,
  Visibility,
  VisibilityOff,
  Api,
  Security,
  Save as SaveIcon,
  People,
  KeyboardArrowDown,
  KeyboardArrowUp,
  GppGood,
  CheckCircle,
  Close,
  Key,
  Image,
  NoAccounts,
  AccountCircle,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

// ==================== API CONFIGURATION ====================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getStoredUser = () => {
  const userStr = sessionStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
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

// ==================== COLOR PALETTE ====================
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

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath === 'default-avatar.jpg' || imagePath === 'default-avatar.png') {
    return null;
  }
  // Fix the URL construction
  const cleanPath = imagePath.replace(/\\/g, '/');
  return `${API_URL}/${cleanPath}`;
};

// ==================== MAIN COMPONENT ====================
const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const storedUser = getStoredUser();
  
  // Profile State
  const [profile, setProfile] = useState({
    _id: storedUser?._id || '',
    firstName: storedUser?.firstName || '',
    lastName: storedUser?.lastName || '',
    email: storedUser?.email || '',
    phoneNumber: storedUser?.phoneNumber || '',
    profilePicture: storedUser?.profilePicture || '',
    role: storedUser?.role || 'admin',
    dateOfBirth: storedUser?.dateOfBirth || '',
    gender: storedUser?.gender || '',
  });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [blockDialog, setBlockDialog] = useState({ open: false, user: null });
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState(0);
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'admin',
    dateOfBirth: '',
    gender: 'male'
  });
  const [userProfilePictureFile, setUserProfilePictureFile] = useState(null);
  const [userProfilePicturePreview, setUserProfilePicturePreview] = useState('');
  
  // API Blocklist State
  const [blockedApis, setBlockedApis] = useState([]);
  const [availableApis, setAvailableApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('GET');
  const [apiBlockReason, setApiBlockReason] = useState('');
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false
  });
  
  // UI State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', data: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedUser, setExpandedUser] = useState(null);

  const isSuperAdmin = profile.role === 'super-admin';

  // Load Data
  useEffect(() => {
    loadProfile();
    if (isSuperAdmin) {
      loadUsers();
      loadAvailableApis();
      loadSystemSettings();
    }
  }, [isSuperAdmin]);

  // Initialize profile form when edit mode opens
  useEffect(() => {
    if (profileEditMode) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
      });
      setProfilePicturePreview(getImageUrl(profile.profilePicture));
    }
  }, [profileEditMode, profile]);

  const loadProfile = async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      setProfile(response.data);
      const updatedUser = { ...storedUser, ...response.data };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', profileForm.firstName);
      formData.append('lastName', profileForm.lastName);
      formData.append('email', profileForm.email);
      formData.append('phoneNumber', profileForm.phoneNumber);
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }
      
      const response = await axiosInstance.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(response.data);
      setProfileEditMode(false);
      setProfilePictureFile(null);
      
      const updatedUser = { ...storedUser, ...response.data };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match!', severity: 'error' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters!', severity: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      await axiosInstance.put('/users/profile', {
        ...profile,
        password: passwordData.newPassword
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error changing password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAvailableApis = async () => {
    try {
      const response = await axiosInstance.get('/users/api-endpoints');
      setAvailableApis(response.data);
      setBlockedApis([]);
    } catch (error) {
      console.error('Error loading APIs:', error);
      const apis = [
        { path: '/api/products', method: 'GET', description: 'Get all products' },
        { path: '/api/products', method: 'POST', description: 'Create product' },
        { path: '/api/products/:id', method: 'PUT', description: 'Update product' },
        { path: '/api/products/:id', method: 'DELETE', description: 'Delete product' },
        { path: '/api/users/profile', method: 'GET', description: 'Get user profile' },
        { path: '/api/users/profile', method: 'PUT', description: 'Update user profile' },
        { path: '/api/contact', method: 'GET', description: 'Get contact messages' },
        { path: '/api/contact/:id/status', method: 'PUT', description: 'Update contact status' },
        { path: '/api/contact/:id', method: 'DELETE', description: 'Delete contact message' },
      ];
      setAvailableApis(apis);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const response = await axiosInstance.get('/settings/system');
      setSystemSettings(response.data);
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const updateSystemSetting = async (key, value) => {
    setLoading(true);
    try {
      await axiosInstance.put('/settings/system', { [key]: value });
      setSystemSettings({ ...systemSettings, [key]: value });
      setSnackbar({ open: true, message: 'System setting updated!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating setting', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addToBlockedApis = async () => {
    if (!selectedApi) {
      setSnackbar({ open: true, message: 'Please select an API endpoint', severity: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      const newBlockedApi = {
        path: selectedApi,
        method: selectedMethod,
        reason: apiBlockReason,
        blockedAt: new Date()
      };
      setBlockedApis([...blockedApis, newBlockedApi]);
      setSelectedApi('');
      setSelectedMethod('GET');
      setApiBlockReason('');
      setSnackbar({ open: true, message: 'API endpoint blocked successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error blocking API', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromBlockedApis = async (index) => {
    setLoading(true);
    try {
      const newBlockedApis = [...blockedApis];
      newBlockedApis.splice(index, 1);
      setBlockedApis(newBlockedApis);
      setSnackbar({ open: true, message: 'API endpoint unblocked!', severity: 'success' });
      setDeleteDialog({ open: false, type: '', data: null });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error unblocking API', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUserProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUser = async () => {
    if (!userForm.firstName || !userForm.email) {
      setSnackbar({ open: true, message: 'Name and email are required!', severity: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', userForm.firstName);
      formData.append('lastName', userForm.lastName);
      formData.append('email', userForm.email);
      formData.append('phoneNumber', userForm.phoneNumber);
      formData.append('role', userForm.role);
      formData.append('dateOfBirth', userForm.dateOfBirth);
      formData.append('gender', userForm.gender);
      
      if (userProfilePictureFile) {
        formData.append('profilePicture', userProfilePictureFile);
      }
      
      if (editingUser) {
        await axiosInstance.put(`/users/${editingUser._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      } else {
        if (!userForm.password) {
          setSnackbar({ open: true, message: 'Password is required for new user!', severity: 'error' });
          return;
        }
        formData.append('password', userForm.password);
        await axiosInstance.post('/users/create-admin', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({ open: true, message: 'User created successfully!', severity: 'success' });
      }
      
      await loadUsers();
      setUserDialog(false);
      setEditingUser(null);
      setUserProfilePictureFile(null);
      setUserProfilePicturePreview('');
      setUserForm({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', role: 'admin', dateOfBirth: '', gender: 'male' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving user', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'admin',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: user.gender || 'male',
      password: ''
    });
    setUserProfilePicturePreview(getImageUrl(user.profilePicture));
    setUserProfilePictureFile(null);
    setUserDialog(true);
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/users/${id}`);
      setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
      await loadUsers();
      setDeleteDialog({ open: false, type: '', data: null });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting user', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async () => {
    if (!blockDialog.user) return;
    
    setLoading(true);
    try {
      await axiosInstance.put(`/users/${blockDialog.user._id}/block`, {
        blockReason,
        blockDuration: blockDuration || undefined
      });
      setSnackbar({ open: true, message: `${blockDialog.user.firstName} has been blocked!`, severity: 'success' });
      await loadUsers();
      setBlockDialog({ open: false, user: null });
      setBlockReason('');
      setBlockDuration(0);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error blocking user', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (user) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/users/${user._id}/unblock`);
      setSnackbar({ open: true, message: `${user.firstName} has been unblocked!`, severity: 'success' });
      await loadUsers();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error unblocking user', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/users/${user._id}/toggle-status`);
      setSnackbar({ open: true, message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully!`, severity: 'success' });
      await loadUsers();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating user status', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  // Profile Tab - FIXED: Removed disabled={!profileEditMode} to allow typing
  const ProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledCard sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: COLORS.primary,
                fontSize: 48,
                margin: '0 auto 16px',
                cursor: profileEditMode ? 'pointer' : 'default'
              }}
              src={profilePicturePreview || getImageUrl(profile.profilePicture)}
              onClick={() => profileEditMode && document.getElementById('profile-picture-input')?.click()}
            >
              {!profilePicturePreview && !getImageUrl(profile.profilePicture) && (profile.firstName?.charAt(0)?.toUpperCase() || 'A')}
            </Avatar>
            {profileEditMode && (
              <IconButton
                sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: COLORS.white, boxShadow: 1 }}
                size="small"
                onClick={() => document.getElementById('profile-picture-input')?.click()}
              >
                <Image fontSize="small" />
              </IconButton>
            )}
            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePictureChange}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {profile.firstName} {profile.lastName}
          </Typography>
          <Chip
            icon={profile.role === 'super-admin' ? <GppGood sx={{ fontSize: 14 }} /> : <AdminPanelSettings sx={{ fontSize: 14 }} />}
            label={profile.role?.toUpperCase()}
            sx={{ mt: 1, bgcolor: profile.role === 'super-admin' ? COLORS.warning : COLORS.primaryLight, color: COLORS.white }}
          />
        </StyledCard>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <StyledCard sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Profile Information
            </Typography>
            {!profileEditMode ? (
              <Button
                startIcon={<Edit />}
                onClick={() => setProfileEditMode(true)}
                variant="outlined"
                size="small"
              >
                Edit Profile
              </Button>
            ) : (
              <ButtonGroup size="small">
                <Button startIcon={<SaveIcon />} onClick={updateProfile} variant="contained" sx={{ bgcolor: COLORS.success }}>
                  Save
                </Button>
                <Button startIcon={<Cancel />} onClick={() => {
                  setProfileEditMode(false);
                  setProfilePictureFile(null);
                  setProfilePicturePreview(getImageUrl(profile.profilePicture));
                  setProfileForm({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email || '',
                    phoneNumber: profile.phoneNumber || '',
                  });
                }} variant="outlined" color="error">
                  Cancel
                </Button>
              </ButtonGroup>
            )}
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                disabled={!profileEditMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: COLORS.gray400 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                disabled={!profileEditMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                disabled={!profileEditMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: COLORS.gray400 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                disabled={!profileEditMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: COLORS.gray400 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </StyledCard>

        <StyledCard sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Change Password
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={changePassword}
                startIcon={<Lock />}
                sx={{ bgcolor: COLORS.primary }}
                disabled={!passwordData.newPassword}
              >
                Update Password
              </Button>
            </Grid>
          </Grid>
        </StyledCard>
      </Grid>
    </Grid>
  );

  // API Blocklist Tab
  const ApiBlocklistTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Api /> Block API Endpoints
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Block specific API endpoints from being accessed by admin users
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth size="small">
                <InputLabel>API Endpoint</InputLabel>
                <Select
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value)}
                  label="API Endpoint"
                >
                  {availableApis.map((api, idx) => (
                    <MenuItem key={idx} value={api.path}>
                      {api.method} - {api.path}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Method</InputLabel>
                <Select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  label="Method"
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Reason (Optional)"
                value={apiBlockReason}
                onChange={(e) => setApiBlockReason(e.target.value)}
                placeholder="Why block this API?"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={addToBlockedApis}
                startIcon={<Block />}
                sx={{ bgcolor: COLORS.error, height: '40px' }}
              >
                Block API
              </Button>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Blocked API Endpoints
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: COLORS.gray50 }}>
                  <TableCell>Method</TableCell>
                  <TableCell>API Endpoint</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Blocked At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blockedApis.map((api, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip 
                        label={api.method} 
                        size="small" 
                        sx={{ 
                          bgcolor: api.method === 'DELETE' ? COLORS.error : 
                                  api.method === 'POST' ? COLORS.success : 
                                  api.method === 'PUT' ? COLORS.warning : COLORS.info,
                          color: COLORS.white,
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {api.path}
                      </Typography>
                    </TableCell>
                    <TableCell>{api.reason || '-'}</TableCell>
                    <TableCell>
                      {api.blockedAt ? format(new Date(api.blockedAt), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Unblock API">
                        <IconButton 
                          size="small" 
                          onClick={() => setDeleteDialog({ open: true, type: 'api', data: { index, api } })}
                          sx={{ color: COLORS.success }}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {blockedApis.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        No blocked API endpoints
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );

  // User Management Tab
  const UserManagementTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <People /> User Accounts
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingUser(null);
                setUserForm({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', role: 'admin', dateOfBirth: '', gender: 'male' });
                setUserProfilePicturePreview('');
                setUserProfilePictureFile(null);
                setUserDialog(true);
              }}
              sx={{ bgcolor: COLORS.primary }}
            >
              Create User
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: COLORS.gray50 }}>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <React.Fragment key={user._id}>
                    <TableRow hover sx={{ bgcolor: user.isBlocked ? COLORS.error + '10' : 'inherit' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={getImageUrl(user.profilePicture)}
                            sx={{ bgcolor: user.role === 'super-admin' ? COLORS.warning : COLORS.primary, width: 40, height: 40 }}
                          >
                            {!getImageUrl(user.profilePicture) && user.firstName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.firstName} {user.lastName}
                              {user.isBlocked && <Chip label="BLOCKED" size="small" sx={{ ml: 1, bgcolor: COLORS.error, color: COLORS.white, height: 18, fontSize: 10 }} />}
                            </Typography>
                            {user._id === profile._id && (
                              <Chip label="You" size="small" sx={{ fontSize: 10, height: 18, bgcolor: COLORS.info, color: COLORS.white }} />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ display: 'block' }}>{user.email}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: COLORS.gray500 }}>{user.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'super-admin' ? <GppGood sx={{ fontSize: 12 }} /> : <AdminPanelSettings sx={{ fontSize: 12 }} />}
                          label={user.role}
                          size="small"
                          sx={{ bgcolor: user.role === 'super-admin' ? COLORS.warning : COLORS.primaryLight, color: COLORS.white }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isActive ? <CheckCircle sx={{ fontSize: 12 }} /> : <Block sx={{ fontSize: 12 }} />}
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{ bgcolor: user.isActive ? COLORS.success : COLORS.error, color: COLORS.white }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {!user.isBlocked ? (
                            <Tooltip title="Block User">
                              <IconButton size="small" onClick={() => setBlockDialog({ open: true, user })} sx={{ color: COLORS.error }}>
                                <NoAccounts fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Unblock User">
                              <IconButton size="small" onClick={() => unblockUser(user)} sx={{ color: COLORS.success }}>
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => editUser(user)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Toggle Status">
                            <IconButton size="small" onClick={() => toggleUserStatus(user)}>
                              {user.isActive ? <Block fontSize="small" sx={{ color: COLORS.warning }} /> : <CheckCircle fontSize="small" sx={{ color: COLORS.success }} />}
                            </IconButton>
                          </Tooltip>
                          {user._id !== profile._id && (
                            <Tooltip title="Delete User">
                              <IconButton size="small" onClick={() => setDeleteDialog({ open: true, type: 'user', data: user })}>
                                <Delete fontSize="small" sx={{ color: COLORS.error }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Details">
                            <IconButton size="small" onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}>
                              {expandedUser === user._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse in={expandedUser === user._id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: COLORS.gray50 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Personal Information</Typography>
                                <Typography variant="body2"><strong>Date of Birth:</strong> {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}</Typography>
                                <Typography variant="body2"><strong>Gender:</strong> {user.gender || 'N/A'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Account Information</Typography>
                                <Typography variant="body2"><strong>User ID:</strong> {user._id}</Typography>
                                <Typography variant="body2"><strong>Created By:</strong> {user.createdBy?.firstName || 'System'}</Typography>
                              </Grid>
                              {user.isBlocked && (
                                <Grid item xs={12}>
                                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    <Typography variant="body2"><strong>Block Reason:</strong> {user.blockReason || 'No reason provided'}</Typography>
                                    {user.blockedUntil && (
                                      <Typography variant="body2"><strong>Blocked Until:</strong> {format(new Date(user.blockedUntil), 'MMM dd, yyyy')}</Typography>
                                    )}
                                  </Alert>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={users.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </StyledCard>
      </Grid>
    </Grid>
  );

  // System Settings Tab
  const SystemSettingsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <StyledCard sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security /> System Controls
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Maintenance Mode" 
                secondary="Put the site in maintenance mode. Only admins can access." 
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => updateSystemSetting('maintenanceMode', e.target.checked)}
                  disabled={!isSuperAdmin}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Allow New Registrations" 
                secondary="Allow new users to register on the platform" 
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemSettings.allowRegistration}
                  onChange={(e) => updateSystemSetting('allowRegistration', e.target.checked)}
                  disabled={!isSuperAdmin}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Email Verification" 
                secondary="Require email verification for new registrations" 
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={systemSettings.requireEmailVerification}
                  onChange={(e) => updateSystemSetting('requireEmailVerification', e.target.checked)}
                  disabled={!isSuperAdmin}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <StyledCard sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Key /> Security Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Two-Factor Authentication" 
                secondary="Add an extra layer of security to your account" 
              />
              <ListItemSecondaryAction>
                <Chip label="Coming Soon" size="small" variant="outlined" />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Session Timeout" 
                secondary="Automatically logout after period of inactivity" 
              />
              <ListItemSecondaryAction>
                <Button size="small" variant="outlined">Configure</Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Activity Log" 
                secondary="View your recent account activity" 
              />
              <ListItemSecondaryAction>
                <Button size="small" variant="outlined">View Logs</Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </StyledCard>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: COLORS.gray50, minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.gray900 }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.gray600 }}>
          Manage your profile, API settings, and user accounts
        </Typography>
      </Box>

      <StyledCard>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            pt: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 48,
            }
          }}
        >
          <Tab icon={<Person />} label="Profile" />
          {isSuperAdmin && <Tab icon={<Api />} label="API Blocklist" />}
          {isSuperAdmin && <Tab icon={<People />} label="User Management" />}
          <Tab icon={<Security />} label="System" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <ProfileTab />
          </TabPanel>
          {isSuperAdmin && (
            <TabPanel value={activeTab} index={1}>
              <ApiBlocklistTab />
            </TabPanel>
          )}
          {isSuperAdmin && (
            <TabPanel value={activeTab} index={2}>
              <UserManagementTab />
            </TabPanel>
          )}
          <TabPanel value={activeTab} index={isSuperAdmin ? 3 : 1}>
            <SystemSettingsTab />
          </TabPanel>
        </Box>
      </StyledCard>

      {/* User Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: COLORS.gray50 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingUser ? 'Edit User Account' : 'Create New User Account'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{ width: 100, height: 100, bgcolor: COLORS.primary, cursor: 'pointer' }}
                src={userProfilePicturePreview}
                onClick={() => document.getElementById('user-picture-input')?.click()}
              >
                {!userProfilePicturePreview && <AccountCircle sx={{ fontSize: 60 }} />}
              </Avatar>
              <IconButton
                sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: COLORS.white }}
                size="small"
                onClick={() => document.getElementById('user-picture-input')?.click()}
              >
                <Image fontSize="small" />
              </IconButton>
              <input
                id="user-picture-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUserProfilePictureChange}
              />
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="First Name" 
                value={userForm.firstName} 
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Last Name" 
                value={userForm.lastName} 
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Email Address" 
                type="email" 
                value={userForm.email} 
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Phone Number" 
                value={userForm.phoneNumber} 
                onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })} 
              />
            </Grid>
            {!editingUser && (
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  type="password" 
                  label="Password" 
                  value={userForm.password} 
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                  required 
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                type="date" 
                label="Date of Birth" 
                value={userForm.dateOfBirth} 
                onChange={(e) => setUserForm({ ...userForm, dateOfBirth: e.target.value })} 
                InputLabelProps={{ shrink: true }} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select 
                  value={userForm.gender} 
                  onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })} 
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select 
                  value={userForm.role} 
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} 
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="super-admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUserDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={saveUser} variant="contained" sx={{ bgcolor: COLORS.primary }}>
            {editingUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NoAccounts sx={{ color: COLORS.error }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Block User</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to block <strong>{blockDialog.user?.firstName} {blockDialog.user?.lastName}</strong>?
            Blocked users will not be able to access the system.
          </Typography>
          <TextField
            fullWidth
            label="Reason for blocking"
            multiline
            rows={3}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Enter reason for blocking this user..."
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Block Duration (Optional)</InputLabel>
            <Select value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)} label="Block Duration (Optional)">
              <MenuItem value={0}>Permanent</MenuItem>
              <MenuItem value={1}>1 Day</MenuItem>
              <MenuItem value={7}>7 Days</MenuItem>
              <MenuItem value={30}>30 Days</MenuItem>
              <MenuItem value={90}>90 Days</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={blockUser} variant="contained" color="error" startIcon={<Block />}>
            Block User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', data: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {deleteDialog.type === 'api' ? 'unblock this API' : `delete this ${deleteDialog.type}`}?
          </Typography>
          {deleteDialog.data && (
            <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.gray50, borderRadius: 2 }}>
              <Typography variant="body2">
                {deleteDialog.type === 'api' && `API: ${deleteDialog.data.api?.method} ${deleteDialog.data.api?.path}`}
                {deleteDialog.type === 'user' && `User: ${deleteDialog.data.firstName} ${deleteDialog.data.lastName}`}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', data: null })}>Cancel</Button>
          <Button 
            onClick={() => {
              if (deleteDialog.type === 'api') removeFromBlockedApis(deleteDialog.data.index);
              if (deleteDialog.type === 'user') deleteUser(deleteDialog.data._id);
            }} 
            variant="contained" 
            color={deleteDialog.type === 'api' ? 'success' : 'error'}
          >
            {deleteDialog.type === 'api' ? 'Unblock' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;