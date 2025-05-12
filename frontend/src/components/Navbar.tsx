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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;