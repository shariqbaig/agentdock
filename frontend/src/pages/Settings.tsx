// frontend/src/pages/Settings.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Typography,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  Switch,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Paper,
  Alert,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const theme = useTheme();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Server settings
  const [port, setPort] = useState<string>('3001');
  const [logLevel, setLogLevel] = useState<string>('info');

  // LLM settings
  const [groqApiKey, setGroqApiKey] = useState<string>('');
  const [groqModel, setGroqModel] = useState<string>('llama-3.1-8b-instant');
  const [showGroqApiKey, setShowGroqApiKey] = useState<boolean>(false);

  // Docker settings
  const [enableDockerRegistry, setEnableDockerRegistry] = useState<boolean>(false);
  const [dockerRegistryUrl, setDockerRegistryUrl] = useState<string>('');
  const [dockerUsername, setDockerUsername] = useState<string>('');
  const [dockerPassword, setDockerPassword] = useState<string>('');
  const [showDockerPassword, setShowDockerPassword] = useState<boolean>(false);

  // UI settings
  const [themeMode, setThemeMode] = useState<string>(theme.palette.mode);
  const [language, setLanguage] = useState<string>('en');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle select changes
  const handleLogLevelChange = (event: SelectChangeEvent) => {
    setLogLevel(event.target.value);
  };

  const handleGroqModelChange = (event: SelectChangeEvent) => {
    setGroqModel(event.target.value);
  };

  const handleThemeChange = (event: SelectChangeEvent) => {
    setThemeMode(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  // Toggle password visibility
  const toggleGroqApiKeyVisibility = () => {
    setShowGroqApiKey(!showGroqApiKey);
  };

  const toggleDockerPasswordVisibility = () => {
    setShowDockerPassword(!showDockerPassword);
  };

  // Save settings
  const saveServerSettings = () => {
    console.log('Server settings saved');
    // Toast notification would be handled by the UI framework
  };

  const saveLLMSettings = () => {
    console.log('LLM settings saved');
    // Toast notification would be handled by the UI framework
  };

  const saveDockerSettings = () => {
    console.log('Docker settings saved');
    // Toast notification would be handled by the UI framework
  };

  const saveUISettings = () => {
    console.log('UI settings saved');
    // Theme change would be handled by the theme context
    // Toast notification would be handled by the UI framework
  };

  return (
    <Box sx={{ pt: 5, pb: 10 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Settings</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="settings tabs"
        >
          <Tab label="Server" {...a11yProps(0)} />
          <Tab label="LLM" {...a11yProps(1)} />
          <Tab label="Docker" {...a11yProps(2)} />
          <Tab label="UI" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Server Settings */}
        <Card elevation={2}>
          <CardHeader title="Server Configuration" />
          <CardContent>
            <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="server-port">Server Port</InputLabel>
                <Input
                  id="server-port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  aria-describedby="server-port-helper-text"
                />
                <FormHelperText id="server-port-helper-text">
                  The port on which the API server will run. Default: 3001
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="log-level-label">Log Level</InputLabel>
                <Select
                  labelId="log-level-label"
                  id="log-level"
                  value={logLevel}
                  onChange={handleLogLevelChange}
                  label="Log Level"
                >
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warn">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
                <FormHelperText>
                  Determines which logs are recorded. Debug is most verbose.
                </FormHelperText>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth variant="outlined">
                <InputLabel id="log-retention-label">Log Retention Period</InputLabel>
                <Select
                  labelId="log-retention-label"
                  id="log-retention"
                  defaultValue="30"
                  label="Log Retention Period"
                >
                  <MenuItem value="7">7 days</MenuItem>
                  <MenuItem value="14">14 days</MenuItem>
                  <MenuItem value="30">30 days</MenuItem>
                  <MenuItem value="90">90 days</MenuItem>
                  <MenuItem value="180">180 days</MenuItem>
                  <MenuItem value="365">365 days</MenuItem>
                </Select>
                <FormHelperText>
                  How long to keep logs before automatic deletion.
                </FormHelperText>
              </FormControl>

              <FormControlLabel
                control={<Switch defaultChecked color="primary" />}
                label="Auto-restart on Crash"
              />
            </Box>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveServerSettings}
            >
              Save Server Settings
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* LLM Settings */}
        <Card elevation={2}>
          <CardHeader title="LLM Configuration" />
          <CardContent>
            <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel htmlFor="groq-api-key">Groq API Key</InputLabel>
                <Input
                  id="groq-api-key"
                  type={showGroqApiKey ? 'text' : 'password'}
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="Enter your Groq API key"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle api key visibility"
                        onClick={toggleGroqApiKeyVisibility}
                        edge="end"
                      >
                        {showGroqApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText>
                  You can get a Groq API key from your Groq account.
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="groq-model-label">Groq Model</InputLabel>
                <Select
                  labelId="groq-model-label"
                  id="groq-model"
                  value={groqModel}
                  onChange={handleGroqModelChange}
                  label="Groq Model"
                >
                  <MenuItem value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</MenuItem>
                  <MenuItem value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</MenuItem>
                  <MenuItem value="mixtral-8x7b-32768">Mixtral 8x7B</MenuItem>
                  <MenuItem value="gemma-7b-it">Gemma 7B</MenuItem>
                </Select>
                <FormHelperText>
                  Select the model you want to use for natural language processing.
                </FormHelperText>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="temperature">Temperature</InputLabel>
                <Input
                  id="temperature"
                  type="number"
                  defaultValue="0.7"
                  inputProps={{
                    step: 0.1,
                    min: 0,
                    max: 1,
                  }}

                />
                <FormHelperText>
                  Controls randomness. Lower values are more deterministic.
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="max-tokens">Max Tokens</InputLabel>
                <Input
                  id="max-tokens"
                  type="number"
                  defaultValue="2048"
                  inputProps={{
                    min: 1,
                    max: 4096,
                  }}

                />
                <FormHelperText>
                  Maximum number of tokens to generate.
                </FormHelperText>
              </FormControl>
            </Box>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveLLMSettings}
            >
              Save LLM Settings
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Docker Settings */}
        <Card elevation={2}>
          <CardHeader title="Docker Configuration" />
          <CardContent>
            <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableDockerRegistry}
                    onChange={(e) => setEnableDockerRegistry(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Private Docker Registry"
              />

              <FormControl fullWidth variant="outlined" disabled={!enableDockerRegistry}>
                <InputLabel htmlFor="docker-registry-url">Registry URL</InputLabel>
                <Input
                  id="docker-registry-url"
                  value={dockerRegistryUrl}
                  onChange={(e) => setDockerRegistryUrl(e.target.value)}
                  placeholder="e.g., docker.io, registry.gitlab.com"

                />
              </FormControl>

              <FormControl fullWidth variant="outlined" disabled={!enableDockerRegistry}>
                <InputLabel htmlFor="docker-username">Username</InputLabel>
                <Input
                  id="docker-username"
                  value={dockerUsername}
                  onChange={(e) => setDockerUsername(e.target.value)}
                  placeholder="Enter registry username"

                />
              </FormControl>

              <FormControl fullWidth variant="outlined" disabled={!enableDockerRegistry}>
                <InputLabel htmlFor="docker-password">Password</InputLabel>
                <Input
                  id="docker-password"
                  type={showDockerPassword ? 'text' : 'password'}
                  value={dockerPassword}
                  onChange={(e) => setDockerPassword(e.target.value)}
                  placeholder="Enter registry password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleDockerPasswordVisibility}
                        edge="end"
                        disabled={!enableDockerRegistry}
                      >
                        {showDockerPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }

                />
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Resource Limits</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="cpu-limit">CPU Limit</InputLabel>
                    <Input
                      id="cpu-limit"
                      defaultValue="1.0"

                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="memory-limit">Memory Limit</InputLabel>
                    <Input
                      id="memory-limit"
                      defaultValue="2Gi"

                    />
                  </FormControl>
                </Grid>
              </Grid>
              <FormHelperText>
                Resource limits for the Docker containers.
              </FormHelperText>
            </Box>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveDockerSettings}
            >
              Save Docker Settings
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* UI Settings */}
        <Card elevation={2}>
          <CardHeader title="UI Configuration" />
          <CardContent>
            <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="theme-mode-label">Theme</InputLabel>
                <Select
                  labelId="theme-mode-label"
                  id="theme-mode"
                  value={themeMode}
                  onChange={handleThemeChange}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
                <FormHelperText>
                  Choose the UI theme for the application.
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
                <FormHelperText>
                  Choose the display language for the application.
                </FormHelperText>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />

              <FormControlLabel
                control={<Switch defaultChecked color="primary" />}
                label="Auto-refresh Logs"
              />

              <FormControl fullWidth variant="outlined">
                <InputLabel id="items-per-page-label">Items Per Page</InputLabel>
                <Select
                  labelId="items-per-page-label"
                  id="items-per-page"
                  defaultValue="20"
                  label="Items Per Page"
                >
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="20">20</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                  <MenuItem value="100">100</MenuItem>
                </Select>
                <FormHelperText>
                  Number of items to display on paginated tables.
                </FormHelperText>
              </FormControl>
            </Box>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveUISettings}
            >
              Save UI Settings
            </Button>
          </CardActions>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default Settings;