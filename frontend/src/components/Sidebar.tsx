import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  List as ListIcon,
  Settings as SettingsIcon,
  Message as MessageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export default function Sidebar({ onClose }) {
  const items = [
    { text: 'Home', icon: <HomeIcon /> },
    { text: 'Users', icon: <PeopleIcon /> },
    { text: 'Tools', icon: <BuildIcon /> },
    { text: 'List', icon: <ListIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
    { text: 'Messages', icon: <MessageIcon /> },
  ];

  return (
    <Drawer variant="permanent" anchor="left">
      <Box
        sx={{
          width: 240,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Menu</Typography>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <List>
          {items.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
