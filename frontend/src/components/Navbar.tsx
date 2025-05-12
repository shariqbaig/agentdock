// frontend/src/components/Navbar.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  onMenuOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleColorMode = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
    // Implement theme switcher in context or layout if needed
  };

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            AgentDock
          </Typography>
        </Box>

        <Box sx={{ flex: 1, maxWidth: 600, mx: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: theme.palette.mode === 'light' ? '#f1f1f1' : '#424242',
              borderRadius: 20,
              px: 2,
              py: 0.5,
            }}
          >
            <InputBase
              placeholder="Ask anything..."
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton size="small">
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>

          <IconButton onClick={handleMenu}>
            <Avatar src="https://bit.ly/broken-link" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>Documentation</MenuItem>
            <MenuItem onClick={handleClose}>Sign out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;