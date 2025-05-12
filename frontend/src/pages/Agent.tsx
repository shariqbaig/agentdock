// frontend/src/pages/Agent.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Grid,
  Typography,
  Stack,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  AlertTitle,
  Collapse,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  Build as BuildIcon,
  AccessTime as AccessTimeIcon,
  Timeline as TimelineIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import apiService, { Log } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `agent-tab-${index}`,
    'aria-controls': `agent-tabpanel-${index}`,
  };
}

const Agent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    agents,
    loadingAgents,
    fetchAgents,
    updateAgent,
    deleteAgent,
    tools
  } = useAppContext();

  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Agent state
  const [agent, setAgent] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    totalQueries: 0,
    avgResponseTime: 0,
    successRate: 0,
    lastActive: 'Never',
  });

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Expanded state for tools
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState<any>({
    description: '',
    enabled: true,
    tools: [],
  });

  // Fetch agent on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Set agent when agents are loaded
  useEffect(() => {
    if (!loadingAgents && agents.length > 0 && id) {
      const foundAgent = agents.find(a => a.name === id);
      if (foundAgent) {
        setAgent(foundAgent);
        setFormData({
          description: foundAgent.description,
          enabled: foundAgent.enabled,
          tools: foundAgent.tools || [],
        });
      } else {
        // Agent not found, navigate back to agents page
        navigate('/agents');
      }
    }
  }, [agents, loadingAgents, id, navigate]);

  // Fetch agent logs
  useEffect(() => {
    const fetchAgentLogs = async () => {
      if (!id) return;

      setIsLoadingLogs(true);
      try {
        // This is a mock implementation - in a real app we would have a specific API endpoint
        const logsData = await apiService.getLogs(1, 5);
        // Filter logs for this agent
        const agentLogs = logsData.logs.filter(log => log.agent === id);
        setRecentLogs(agentLogs);

        // Calculate stats
        if (agentLogs.length > 0) {
          const avgTime = agentLogs.reduce((acc, log) => acc + log.responseTime, 0) / agentLogs.length;
          const lastLog = agentLogs[0];

          setStats({
            totalQueries: agentLogs.length,
            avgResponseTime: avgTime,
            successRate: 98, // Mock value
            lastActive: new Date(lastLog.timestamp).toLocaleString(),
          });
        }
      } catch (error) {
        console.error('Error fetching agent logs:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    if (agent) {
      fetchAgentLogs();
    }
  }, [agent, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle tool expansion
  const toggleToolExpansion = (toolName: string) => {
    setExpandedTools(prev => ({
      ...prev,
      [toolName]: !prev[toolName],
    }));
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle switch input changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Handle multi-select for tools
  const handleToolSelect = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({ ...formData, tools: typeof value === 'string' ? [value] : value });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!agent) return;

    try {
      await updateAgent(agent.name, formData);
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating agent:', error);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!agent) return;

    try {
      await deleteAgent(agent.name);
      navigate('/agents');
    } catch (error: any) {
      console.error('Error deleting agent:', error);
    }
    setDeleteDialogOpen(false);
  };

  // Format response time
  const formatResponseTime = (responseTime: number) => {
    return (responseTime / 1000).toFixed(2) + 's';
  };

  return (
    <Box sx={{ pt: 3, pb: 5 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            component={RouterLink}
            to="/agents"
            color="inherit"
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          {loadingAgents ? (
            <Skeleton width={200} height={40} />
          ) : (
            <Typography variant="h4" component="h1">
              {agent?.name || 'Agent not found'}
            </Typography>
          )}
          {agent && (
            <Chip
              icon={agent.enabled ? <CheckCircleIcon /> : <CancelIcon />}
              label={agent.enabled ? 'Enabled' : 'Disabled'}
              color={agent.enabled ? 'success' : 'error'}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            disabled={!agent}
            variant="outlined"
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!agent}
            variant="outlined"
          >
            Delete
          </Button>
          <Button
            startIcon={<ChatIcon />}
            color="primary"
            component={RouterLink}
            to={`/chat?agent=${id}`}
            disabled={!agent || !agent.enabled}
            variant="contained"
          >
            Chat
          </Button>
        </Stack>
      </Box>

      {loadingAgents ? (
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      ) : agent ? (
        <>
          {/* Agent Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1">{agent.description}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChatIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Total Queries</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalQueries}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Avg Response Time</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatResponseTime(stats.avgResponseTime)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Success Rate</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.successRate}%
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Last Active</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" noWrap>
                      {stats.lastActive}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="agent tabs"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Tools" {...a11yProps(0)} />
                <Tab label="Recent Activity" {...a11yProps(1)} />
                <Tab label="Settings" {...a11yProps(2)} />
              </Tabs>
            </Box>

            {/* Tools Tab */}
            <TabPanel value={tabValue} index={0}>
              <Card>
                <CardHeader title="Connected Tools" />
                <CardContent>
                  {agent.tools && agent.tools.length > 0 ? (
                    <Stack spacing={2}>
                      {agent.tools.map((toolName: string) => {
                        const tool = tools.find(t => t.name === toolName);
                        const isExpanded = expandedTools[toolName] || false;

                        return (
                          <Paper
                            key={toolName}
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 1 }}
                          >
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: isExpanded ? 1 : 0
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BuildIcon color="primary" sx={{ mr: 1 }} />
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">{toolName}</Typography>
                                  {!isExpanded && tool && (
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                      {tool.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip
                                  label={tool?.enabled ? 'Active' : 'Inactive'}
                                  color={tool?.enabled ? 'success' : 'error'}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => toggleToolExpansion(toolName)}
                                >
                                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>
                            </Box>

                            <Collapse in={isExpanded}>
                              <Box sx={{ pt: 1 }}>
                                <Typography variant="body2">
                                  {tool ? tool.description : 'Tool description not available'}
                                </Typography>
                              </Box>
                            </Collapse>
                          </Paper>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography>No tools connected to this agent.</Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Recent Activity Tab */}
            <TabPanel value={tabValue} index={1}>
              <Card>
                <CardHeader
                  title="Recent Queries"
                  action={
                    <Button
                      size="small"
                      endIcon={<ArrowBackIcon />}
                      component={RouterLink}
                      to="/logs"
                    >
                      View All Logs
                    </Button>
                  }
                />
                <CardContent>
                  {isLoadingLogs ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rectangular" height={50} />
                      <Skeleton variant="rectangular" height={50} />
                      <Skeleton variant="rectangular" height={50} />
                    </Stack>
                  ) : recentLogs.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Query</TableCell>
                            <TableCell>Response Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                              <TableCell>
                                <Typography noWrap sx={{ maxWidth: 300 }}>
                                  {log.query}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatResponseTime(log.responseTime)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No recent activity for this agent.</Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tabValue} index={2}>
              <Card>
                <CardHeader title="Agent Settings" />
                <CardContent>
                  <Stack spacing={3}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 1 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 1 }}>
                            {agent.enabled ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                          </Box>
                          <Typography fontWeight="medium">Status</Typography>
                        </Box>
                        <Chip
                          label={agent.enabled ? 'Enabled' : 'Disabled'}
                          color={agent.enabled ? 'success' : 'error'}
                        />
                      </Box>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 1 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 1 }} />
                          <Typography fontWeight="medium">Created</Typography>
                        </Box>
                        <Typography>
                          {agent.createdAt
                            ? new Date(agent.createdAt).toLocaleString()
                            : 'Not available'}
                        </Typography>
                      </Box>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 1 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 1 }} />
                          <Typography fontWeight="medium">Last Updated</Typography>
                        </Box>
                        <Typography>
                          {agent.updatedAt
                            ? new Date(agent.updatedAt).toLocaleString()
                            : 'Not available'}
                        </Typography>
                      </Box>
                    </Paper>

                    <Button
                      startIcon={<EditIcon />}
                      variant="contained"
                      color="primary"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      Edit Agent Settings
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <InfoIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" gutterBottom>Agent Not Found</Typography>
          <Typography sx={{ mb: 3 }}>
            The agent you're looking for doesn't exist or has been deleted.
          </Typography>
          <Button
            component={RouterLink}
            to="/agents"
            variant="contained"
            startIcon={<ArrowBackIcon />}
          >
            Back to Agents
          </Button>
        </Card>
      )}

      {/* Edit Agent Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Agent: {agent?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this agent does"
              multiline
              rows={3}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Switch
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Enabled"
            />

            <FormControl fullWidth>
              <InputLabel id="edit-tools-select-label">Tools</InputLabel>
              <Select
                labelId="edit-tools-select-label"
                id="edit-tools-select"
                multiple
                value={formData.tools || []}
                onChange={handleToolSelect}
                input={<OutlinedInput label="Tools" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {tools.filter(tool => tool.enabled).map((tool) => (
                  <MenuItem key={tool.name} value={tool.name}>
                    <Checkbox checked={formData.tools?.indexOf(tool.name) > -1} />
                    <ListItemText
                      primary={tool.name}
                      secondary={tool.description}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {agent?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agent;