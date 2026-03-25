import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, maxWidth = 'lg', disableGutters = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Navbar />
      
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
        }}
      >
        {disableGutters ? (
          children
        ) : (
          <Container maxWidth={maxWidth}>
            <Box sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
              {children}
            </Box>
          </Container>
        )}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;