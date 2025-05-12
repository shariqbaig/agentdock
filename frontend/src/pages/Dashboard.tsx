// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Link,
  Stack,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  People as PeopleIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Chat as ChatIcon,
  AccessTime as AccessTimeIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import apiService, { Log } from '../services/api';

const Dashboard: React.FC = () => {
  const { agents, tools, isOnline, serverStatus } = useAppContext();
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTools: 0,
    enabledTools: 0,
    totalQueries: 0,
    avgResponseTime: 0,
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get recent logs
        const logsData = await apiService.getLogs(1, 5);
        setRecentLogs(logsData.logs);

        // Calculate statistics
        setStats({
          totalAgents: agents.length,
          activeAgents: agents.filter(agent => agent.enabled).length,
          totalTools: tools.length,
          enabledTools: tools.filter(tool => tool.enabled).length,
          totalQueries: logsData.pagination.total,
          avgResponseTime: logsData.logs.length > 0
            ? logsData.logs.reduce((acc, log) => acc + log.responseTime, 0) / logsData.logs.length
            : 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOnline) {
      fetchDashboardData();
    }
  }, [isOnline, agents, tools]);

  // Format response time
  const formatResponseTime = (responseTime: number) => {
    return (responseTime / 1000).toFixed(2) + 's';
  };

  return (
    <Box sx={{ pt: 3, pb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <Chip
            icon={isOnline ? <CheckCircleIcon /> : <WarningIcon />}
            label={`Server ${serverStatus}`}
            color={isOnline ? "success" : "error"}
            variant="outlined"
          />
          <Button
            component={RouterLink}
            to="/chat"
            variant="contained"
            startIcon={<ChatIcon />}
          >
            Chat
          </Button>
        </Stack>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }} elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Agents</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h4">{stats.activeAgents} / {stats.totalAgents}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {stats.activeAgents} active agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }} elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Tools</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <BuildIcon sx={{ mr: 1 }} />
                <Typography variant="h4">{stats.enabledTools} / {stats.totalTools}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {stats.enabledTools} enabled tools
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }} elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Total Queries</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ChatIcon sx={{ mr: 1 }} />
                <Typography variant="h4">{stats.totalQueries}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                  23% from last week
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }} elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Avg Response Time</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="h4">{formatResponseTime(stats.avgResponseTime)}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                  10% from last week
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main content grid */}
      <Grid container spacing={3}>
        {/* Left Column - Recent Queries */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardHeader title="Recent Queries" />
            <CardContent>
              {recentLogs.length > 0 ? (
                <Stack spacing={2}>
                  {recentLogs.map((log) => (
                    <Paper
                      key={log.id}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ChatIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">{log.agent || 'General Query'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ mb: 1 }}>
                        {log.query}
                      </Typography>
                      <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                        {log.response}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={formatResponseTime(log.responseTime)}
                          color="primary"
                          size="small"
                        />
                        <Button
                          component={RouterLink}
                          to={`/logs#${log.id}`}
                          size="small"
                          color="primary"
                        >
                          View Details
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography>No queries yet. Try asking something!</Typography>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/logs"
                color="primary"
                size="small"
              >
                View All Logs
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Right Column - System Status & Quick Actions */}
        <Grid item xs={12} lg={4}>
          {/* System Status */}
          <Card sx={{ mb: 3 }} elevation={2}>
            <CardHeader title="System Status" />
            <CardContent>
              <List dense disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary="MCP Server" />
                  <Chip
                    label={isOnline ? "Running" : "Offline"}
                    color={isOnline ? "success" : "error"}
                    size="small"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TimelineIcon />
                  </ListItemIcon>
                  <ListItemText primary="API Service" />
                  <Chip
                    label={isOnline ? "Running" : "Offline"}
                    color={isOnline ? "success" : "error"}
                    size="small"
                  />
                </ListItem>

                <Divider sx={{ my: 1.5 }} />

                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="GitHub Integration" />
                  <Chip
                    label={tools.some(t => t.category === 'github' && t.enabled) ? "Enabled" : "Disabled"}
                    color={tools.some(t => t.category === 'github' && t.enabled) ? "success" : "error"}
                    size="small"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Slack Integration" />
                  <Chip
                    label={tools.some(t => t.category === 'slack' && t.enabled) ? "Enabled" : "Disabled"}
                    color={tools.some(t => t.category === 'slack' && t.enabled) ? "success" : "error"}
                    size="small"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Jira Integration" />
                  <Chip
                    label={tools.some(t => t.category === 'jira' && t.enabled) ? "Enabled" : "Disabled"}
                    color={tools.some(t => t.category === 'jira' && t.enabled) ? "success" : "error"}
                    size="small"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card elevation={2}>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <List>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/agents">
                    <ListItemIcon>
                      <PeopleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Manage Agents" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/tools">
                    <ListItemIcon>
                      <BuildIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Configure Tools" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/logs">
                    <ListItemIcon>
                      <TimelineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="View Logs" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/settings">
                    <ListItemIcon>
                      <StorageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="System Settings" />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;