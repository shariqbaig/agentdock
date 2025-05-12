// frontend/src/components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  // No props needed, but we're defining interface for potential future use
}

const Layout: React.FC<LayoutProps> = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar onMenuOpen={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar for desktop */}
        {!isMobile && (
          <Box
            component="nav"
            sx={{
              width: 260,
              flexShrink: 0,
              position: 'fixed',
              top: '64px',
              height: 'calc(100vh - 64px)',
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
              overflowY: 'auto',
            }}
          >
            <Sidebar />
          </Box>
        )}

        {/* Drawer for mobile */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            sx={{
              '& .MuiDrawer-paper': {
                width: '100%',
                boxSizing: 'border-box',
              },
            }}
          >
            <Sidebar onClose={handleDrawerToggle} />
          </Drawer>
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { xs: 0, md: '260px' },
            p: 4,
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: theme.palette.background.default,
            height: 'calc(100vh - 64px)',
            mt: '20px',
          }}
        >
          <Box
            sx={{
              maxWidth: '1600px',
              mx: 'auto',
              height: '100%',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;