// frontend/src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Agents', path: '/agents', icon: <PeopleIcon /> },
    { text: 'Tools', path: '/tools', icon: <BuildIcon /> },
    { text: 'Logs', path: '/logs', icon: <AssessmentIcon /> },
    { text: 'Chat', path: '/', icon: <ChatIcon /> },
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary">
          © 2025 AgentDock. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;