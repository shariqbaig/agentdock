// frontend/src/pages/Logs.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  IconButton,
  Stack,
  Collapse,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowUp as ChevronUpIcon,
  Refresh as RefreshIcon,
  AccessTime as ClockIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Warning as AlertCircleIcon,
  Person as UserIcon,
  Storage as ServerIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import apiService, { Log, PaginatedLogs } from '../services/api';

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
      id={`log-tabpanel-${index}`}
      aria-labelledby={`log-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `log-tab-${index}`,
    'aria-controls': `log-tabpanel-${index}`,
  };
}

const Logs: React.FC = () => {
  const theme = useTheme();

  // Query logs state
  const [logs, setLogs] = useState<Log[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // System logs state
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isLoadingSystemLogs, setIsLoadingSystemLogs] = useState(false);

  // Error logs state
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [isLoadingErrorLogs, setIsLoadingErrorLogs] = useState(false);

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  // Fetch query logs
  const fetchQueryLogs = async (page: number = 1) => {
    setIsLoadingLogs(true);
    try {
      const response = await apiService.getLogs(page, pagination.limit);
      setLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching query logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Fetch system logs
  const fetchSystemLogs = async () => {
    setIsLoadingSystemLogs(true);
    try {
      const response = await apiService.getSystemLogs(100);
      setSystemLogs(response.logs);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setIsLoadingSystemLogs(false);
    }
  };

  // Fetch error logs
  const fetchErrorLogs = async () => {
    setIsLoadingErrorLogs(true);
    try {
      const response = await apiService.getErrorLogs(100);
      setErrorLogs(response.logs);
    } catch (error) {
      console.error('Error fetching error logs:', error);
    } finally {
      setIsLoadingErrorLogs(false);
    }
  };

  // Fetch logs on component mount
  useEffect(() => {
    fetchQueryLogs();
    fetchSystemLogs();
    fetchErrorLogs();
  }, []);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchQueryLogs(newPage);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle log selection for dialog
  const handleLogSelect = (log: Log) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format response time
  const formatResponseTime = (responseTime: number) => {
    return (responseTime / 1000).toFixed(2) + 's';
  };

  // Generate pagination buttons
  const generatePaginationControls = () => {
    const { page, totalPages } = pagination;

    // Calculate pages to show (max 5)
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(startPage + 4, totalPages);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    const pages: any = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'center' }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
        >
          First
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </Button>

        {pages.map(p => (
          <Button
            key={p}
            size="small"
            variant={p === page ? "contained" : "outlined"}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          size="small"
          variant="outlined"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </Button>
      </Stack>
    );
  };

  // Handle date filter change
  const handleDateFilterChange = (event: SelectChangeEvent) => {
    setDateFilter(event.target.value);
  };

  // Handle agent filter change
  const handleAgentFilterChange = (event: SelectChangeEvent) => {
    setAgentFilter(event.target.value);
  };

  return (
    <Box sx={{ pt: 5, pb: 10 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Logs & Monitoring</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchQueryLogs();
              fetchSystemLogs();
              fetchErrorLogs();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            color="primary"
          >
            Export Logs
          </Button>
        </Stack>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Query History" {...a11yProps(0)} />
          <Tab label="System Logs" {...a11yProps(1)} />
          <Tab label="Error Logs" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Query History Tab */}
        <Card elevation={2}>
          <CardHeader
            title="Query Logs"
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 300 } }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="date-filter-label">Date</InputLabel>
                  <Select
                    labelId="date-filter-label"
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                    label="Date"
                  >
                    <MenuItem value="all">All time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="yesterday">Yesterday</MenuItem>
                    <MenuItem value="week">This week</MenuItem>
                    <MenuItem value="month">This month</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="agent-filter-label">Agent</InputLabel>
                  <Select
                    labelId="agent-filter-label"
                    value={agentFilter}
                    onChange={handleAgentFilterChange}
                    label="Agent"
                  >
                    <MenuItem value="all">All agents</MenuItem>
                    <MenuItem value="none">No agent</MenuItem>
                    {/* Agent options would be dynamically populated */}
                    <MenuItem value="GitHubSync">GitHubSync</MenuItem>
                    <MenuItem value="SlackAgent">SlackAgent</MenuItem>
                    <MenuItem value="JiraAgent">JiraAgent</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            }
          />
          <CardContent>
            {isLoadingLogs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : logs.length === 0 ? (
              <Alert severity="info">
                No query logs found. Try using the chat to generate some logs.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="48px"></TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Agent</TableCell>
                      <TableCell>Query</TableCell>
                      <TableCell>Response Time</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <TableRow
                          hover
                          sx={{
                            '& > *': { borderBottom: 'unset' },
                            cursor: 'pointer'
                          }}
                        >
                          <TableCell>
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => toggleRowExpansion(log.id)}
                            >
                              {expandedRows[log.id] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell>
                            {log.agent ? (
                              <Chip
                                label={log.agent}
                                color="primary"
                                size="small"
                              />
                            ) : (
                              <Chip
                                label="General"
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography noWrap sx={{ maxWidth: 300 }}>
                              {log.query}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatResponseTime(log.responseTime)}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="View details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleLogSelect(log)}
                                >
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Copy query">
                                <IconButton
                                  size="small"
                                  onClick={() => navigator.clipboard.writeText(log.query)}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Retry query">
                                <IconButton
                                  size="small"
                                  color="primary"
                                >
                                  <SendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 0 }}>
                            <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2, px: 3, bgcolor: theme.palette.action.hover }}>
                                <Stack spacing={2}>
                                  <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Query:
                                    </Typography>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 2,
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        bgcolor: theme.palette.background.paper
                                      }}
                                    >
                                      {log.query}
                                    </Paper>
                                  </Box>
                                  <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Response:
                                    </Typography>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 2,
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        bgcolor: theme.palette.background.paper,
                                        maxHeight: 200,
                                        overflow: 'auto'
                                      }}
                                    >
                                      {log.response}
                                    </Paper>
                                  </Box>
                                </Stack>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {generatePaginationControls()}
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* System Logs Tab */}
        <Card elevation={2}>
          <CardHeader
            title="System Logs"
            action={
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel id="log-level-label">Log Level</InputLabel>
                  <Select
                    labelId="log-level-label"
                    defaultValue="all"
                    label="Log Level"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="debug">Debug</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchSystemLogs}
                  disabled={isLoadingSystemLogs}
                >
                  Refresh
                </Button>
              </Stack>
            }
          />
          <CardContent>
            {isLoadingSystemLogs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : systemLogs.length === 0 ? (
              <Alert severity="info">
                No system logs found.
              </Alert>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
                  overflow: 'auto',
                  maxHeight: 600,
                }}
              >
                {systemLogs.map((log, index) => {
                  // Determine log level from content
                  let color = theme.palette.text.secondary;
                  if (log.includes('INFO')) color = theme.palette.info.main;
                  if (log.includes('WARN')) color = theme.palette.warning.main;
                  if (log.includes('ERROR')) color = theme.palette.error.main;
                  if (log.includes('DEBUG')) color = theme.palette.success.main;

                  return (
                    <Typography key={index} color={color} sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
                      {log}
                    </Typography>
                  );
                })}
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Error Logs Tab */}
        <Card elevation={2}>
          <CardHeader
            title="Error Logs"
            action={
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchErrorLogs}
                disabled={isLoadingErrorLogs}
              >
                Refresh
              </Button>
            }
          />
          <CardContent>
            {isLoadingErrorLogs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : errorLogs.length === 0 ? (
              <Alert severity="success">
                No error logs found. Everything is running smoothly!
              </Alert>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.2)',
                  color: theme.palette.error.main,
                  overflow: 'auto',
                  maxHeight: 600,
                }}
              >
                {errorLogs.map((log, index) => (
                  <Typography key={index} sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
                    {log}
                  </Typography>
                ))}
              </Paper>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Log Detail
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Timestamp</Typography>
                <Typography>{formatTimestamp(selectedLog.timestamp)}</Typography>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Agent</Typography>
                <Chip
                  label={selectedLog.agent || 'General'}
                  color={selectedLog.agent ? 'primary' : 'default'}
                />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Response Time</Typography>
                <Chip
                  label={formatResponseTime(selectedLog.responseTime)}
                  color="success"
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>Query</Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    bgcolor: theme.palette.action.hover
                  }}
                >
                  {selectedLog.query}
                </Paper>
                <Button
                  startIcon={<CopyIcon />}
                  size="small"
                  onClick={() => navigator.clipboard.writeText(selectedLog.query)}
                >
                  Copy
                </Button>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Response</Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    bgcolor: theme.palette.action.hover,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  {selectedLog.response}
                </Paper>
                <Button
                  startIcon={<CopyIcon />}
                  size="small"
                  onClick={() => navigator.clipboard.writeText(selectedLog.response)}
                >
                  Copy
                </Button>
              </Box>

              {selectedLog.context && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Context</Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      bgcolor: theme.palette.action.hover
                    }}
                  >
                    <pre>{JSON.stringify(selectedLog.context, null, 2)}</pre>
                  </Paper>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              startIcon={<SendIcon />}
              variant="contained"
              color="primary"
            >
              Retry Query
            </Button>
            <Button onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Logs;