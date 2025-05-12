// frontend/src/pages/Tools.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  FormControlLabel,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  Select,
  Switch,
  Divider,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  AlertTitle,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Announcement as SlackIcon,
  List as ListIcon,
  CheckCircle as CheckIcon,
  Cancel as XIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
// For Jira - we'll use a custom icon since it's not in Material UI
import SvgIcon from '@mui/material/SvgIcon';
import { useAppContext } from '../context/AppContext';
import { SxProps } from '@mui/material/styles';

interface ToolIconProps {
  category: string;
  sx?: SxProps; // 👈 add this line
}


// Define a custom Jira icon as SVG
const JiraIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M11.53 2C11.53 2 4.4 2 4.4 9.06C4.4 16.18 11.53 16.18 11.53 16.18V14.05C11.53 14.05 6.55 14.05 6.55 9.06C6.55 4.06 11.53 4.06 11.53 4.06V2Z M12.47 7.97L12.47 10.03C12.47 10.03 17.45 10.03 17.45 15.03C17.45 20.03 12.47 20.03 12.47 20.03V22C12.47 22 19.6 22 19.6 15.03C19.6 8 12.47 7.97 12.47 7.97Z M7.32 9.03L10.88 12.59L7.32 16.15L4.96 13.79L7.32 11.42L8.52 12.61L10.88 10.25L7.32 6.67L4.96 9.03H7.32Z M16.68 10.25L13.12 6.67L15.48 4.31L18.65 7.47L16.68 9.45L14.32 7.08L13.12 8.28L16.68 11.84L19.04 9.48L16.68 7.11V10.25Z" />
  </SvgIcon>
);

interface ToolIconProps {
  category: string;
  sx?: SxProps;
}

const ToolIcon: React.FC<ToolIconProps> = ({ category, sx }) => {
  let icon: any;

  switch (category.toLowerCase()) {
    case 'github':
      icon = <GitHubIcon />;
      break;
    case 'slack':
      icon = <SlackIcon />;
      break;
    case 'jira':
      icon = <JiraIcon />;
      break;
    default:
      icon = <ListIcon />;
  }

  return <Box sx={sx}>{icon}</Box>;
};

const Tools: React.FC = () => {
  const { tools, toolCategories, fetchTools, fetchToolCategories } = useAppContext();
  const theme = useTheme();

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);

  // Settings state
  const [githubToken, setGithubToken] = useState<string>('');
  const [slackToken, setSlackToken] = useState<string>('');
  const [jiraHost, setJiraHost] = useState<string>('');
  const [jiraUsername, setJiraUsername] = useState<string>('');
  const [jiraApiToken, setJiraApiToken] = useState<string>('');

  // Password visibility
  const [showGithubToken, setShowGithubToken] = useState<boolean>(false);
  const [showSlackToken, setShowSlackToken] = useState<boolean>(false);
  const [showJiraApiToken, setShowJiraApiToken] = useState<boolean>(false);

  // Group tools by category
  const toolsByCategory = tools.reduce((acc: Record<string, typeof tools>, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  // Fetch tools and categories on component mount
  useEffect(() => {
    fetchTools();
    fetchToolCategories();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Toggle password visibility
  const toggleGithubTokenVisibility = () => {
    setShowGithubToken(!showGithubToken);
  };

  const toggleSlackTokenVisibility = () => {
    setShowSlackToken(!showSlackToken);
  };

  const toggleJiraApiTokenVisibility = () => {
    setShowJiraApiToken(!showJiraApiToken);
  };

  // Save settings functions
  const saveGithubSettings = () => {
    console.log('GitHub settings saved');
    // Toast notification would be handled by the UI framework
  };

  const saveSlackSettings = () => {
    console.log('Slack settings saved');
    // Toast notification would be handled by the UI framework
  };

  const saveJiraSettings = () => {
    console.log('Jira settings saved');
    // Toast notification would be handled by the UI framework
  };

  return (
    <Box sx={{ pt: 5, pb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Tools & Integrations</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="tool tabs"
        >
          <Tab label="Tool Overview" />
          <Tab label="GitHub Settings" />
          <Tab label="Slack Settings" />
          <Tab label="Jira Settings" />
        </Tabs>
      </Box>

      <TabPanel value={tabIndex} index={0}>
        {/* Tool Overview */}
        {Object.keys(toolCategories).length > 0 ? (
          <>
            <Alert severity="info" sx={{ mb: 4 }}>
              <AlertTitle>Configuration Required</AlertTitle>
              Tool integrations need to be configured in their respective settings tabs.
            </Alert>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {Object.entries(toolCategories).map(([category, categoryInfo]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Card elevation={2}>
                    <CardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ToolIcon category={category} sx={{ mr: 1 }} />
                          <Typography variant="h6">{categoryInfo.name}</Typography>
                        </Box>
                      }
                      action={
                        <Chip
                          icon={categoryInfo.enabled ? <CheckIcon /> : <XIcon />}
                          label={categoryInfo.enabled ? 'Enabled' : 'Disabled'}
                          color={categoryInfo.enabled ? 'success' : 'error'}
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {categoryInfo.description}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Available Tools:
                      </Typography>
                      <Stack spacing={1}>
                        {toolsByCategory[category]?.map((tool) => (
                          <Box
                            key={tool.name}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Typography variant="body2">{tool.name}</Typography>
                            <Chip
                              label={tool.enabled ? 'Enabled' : 'Disabled'}
                              color={tool.enabled ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        )) || (
                            <Typography variant="body2" color="text.secondary">
                              No tools available
                            </Typography>
                          )}
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!categoryInfo.enabled}
                      >
                        Configure
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h5" gutterBottom>All Available Tools</Typography>
            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tool Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tools.map((tool) => (
                    <TableRow key={tool.name}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {tool.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ToolIcon category={tool.category} sx={{ mr: 1 }} />
                          <Typography variant="body2">{tool.category}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{tool.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tool.enabled ? 'Enabled' : 'Disabled'}
                          color={tool.enabled ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Alert severity="warning">
            <AlertTitle>No tools configured</AlertTitle>
            Please configure integration settings in the respective tabs.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        {/* GitHub Settings */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GitHubIcon sx={{ mr: 1 }} />
                <Typography variant="h6">GitHub Integration</Typography>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              Connect to GitHub to enable repository synchronization, PR reviews, and CI/CD triggers.
            </Typography>

            <Stack spacing={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="github-token">GitHub API Token</InputLabel>
                <Input
                  id="github-token"
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="Enter your GitHub personal access token"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle token visibility"
                        onClick={toggleGithubTokenVisibility}
                        edge="end"
                      >
                        {showGithubToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }

                />
              </FormControl>

              <Alert severity="info">
                <AlertTitle>Token Requirements</AlertTitle>
                Your token needs the following scopes: repo, workflow, read:user.
              </Alert>

              <Divider />

              <FormControlLabel
                control={
                  <Switch color="primary" defaultChecked />
                }
                label="Enable GitHub Integration"
              />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={saveGithubSettings}
            >
              Save Settings
            </Button>
          </CardActions>
        </Card>

        <Typography variant="h6" gutterBottom>Available GitHub Tools</Typography>
        {toolsByCategory['github']?.map((tool) => (
          <Accordion key={tool.name} elevation={1}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${tool.name}-content`}
              id={`panel-${tool.name}-header`}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                pr: 2
              }}>
                <Typography variant="subtitle1">{tool.name}</Typography>
                <Chip
                  label={tool.enabled ? 'Enabled' : 'Disabled'}
                  color={tool.enabled ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{tool.description}</Typography>
            </AccordionDetails>
          </Accordion>
        )) || (
            <Alert severity="warning">
              No GitHub tools available. Please set up the GitHub integration.
            </Alert>
          )}
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        {/* Slack Settings */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SlackIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Slack Integration</Typography>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              Connect to Slack to enable channel monitoring, message sending, and notifications.
            </Typography>

            <Stack spacing={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="slack-token">Slack Bot Token</InputLabel>
                <Input
                  id="slack-token"
                  type={showSlackToken ? 'text' : 'password'}
                  value={slackToken}
                  onChange={(e) => setSlackToken(e.target.value)}
                  placeholder="Enter your Slack bot token (xoxb-...)"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle token visibility"
                        onClick={toggleSlackTokenVisibility}
                        edge="end"
                      >
                        {showSlackToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <Alert severity="info">
                <AlertTitle>Bot Permissions</AlertTitle>
                Your Slack bot needs the following scopes: channels:read, channels:history, chat:write, reactions:write.
              </Alert>

              <Divider />

              <FormControlLabel
                control={
                  <Switch color="primary" defaultChecked />
                }
                label="Enable Slack Integration"
              />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={saveSlackSettings}
            >
              Save Settings
            </Button>
          </CardActions>
        </Card>

        <Typography variant="h6" gutterBottom>Available Slack Tools</Typography>
        {toolsByCategory['slack']?.map((tool) => (
          <Accordion key={tool.name} elevation={1}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${tool.name}-content`}
              id={`panel-${tool.name}-header`}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                pr: 2
              }}>
                <Typography variant="subtitle1">{tool.name}</Typography>
                <Chip
                  label={tool.enabled ? 'Enabled' : 'Disabled'}
                  color={tool.enabled ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{tool.description}</Typography>
            </AccordionDetails>
          </Accordion>
        )) || (
            <Alert severity="warning">
              No Slack tools available. Please set up the Slack integration.
            </Alert>
          )}
      </TabPanel>

      <TabPanel value={tabIndex} index={3}>
        {/* Jira Settings */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <JiraIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Jira Integration</Typography>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              Connect to Jira to enable ticket management, issue tracking, and workflow automation.
            </Typography>

            <Stack spacing={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="jira-host">Jira Host URL</InputLabel>
                <Input
                  id="jira-host"
                  type="text"
                  value={jiraHost}
                  onChange={(e) => setJiraHost(e.target.value)}
                  placeholder="https://your-domain.atlassian.net"
                />
              </FormControl>

              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="jira-username">Jira Username/Email</InputLabel>
                <Input
                  id="jira-username"
                  type="text"
                  value={jiraUsername}
                  onChange={(e) => setJiraUsername(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </FormControl>

              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="jira-token">Jira API Token</InputLabel>
                <Input
                  id="jira-token"
                  type={showJiraApiToken ? 'text' : 'password'}
                  value={jiraApiToken}
                  onChange={(e) => setJiraApiToken(e.target.value)}
                  placeholder="Enter your Jira API token"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle token visibility"
                        onClick={toggleJiraApiTokenVisibility}
                        edge="end"
                      >
                        {showJiraApiToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <Alert severity="info">
                <AlertTitle>API Token</AlertTitle>
                You can generate an API token from your Atlassian account settings.
              </Alert>

              <Divider />

              <FormControlLabel
                control={
                  <Switch color="primary" defaultChecked />
                }
                label="Enable Jira Integration"
              />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={saveJiraSettings}
            >
              Save Settings
            </Button>
          </CardActions>
        </Card>

        <Typography variant="h6" gutterBottom>Available Jira Tools</Typography>
        {toolsByCategory['jira']?.map((tool) => (
          <Accordion key={tool.name} elevation={1}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${tool.name}-content`}
              id={`panel-${tool.name}-header`}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                pr: 2
              }}>
                <Typography variant="subtitle1">{tool.name}</Typography>
                <Chip
                  label={tool.enabled ? 'Enabled' : 'Disabled'}
                  color={tool.enabled ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{tool.description}</Typography>
            </AccordionDetails>
          </Accordion>
        )) || (
            <Alert severity="warning">
              No Jira tools available. Please set up the Jira integration.
            </Alert>
          )}
      </TabPanel>
    </Box>
  );
};

// TabPanel component for tab content
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
      id={`tool-tabpanel-${index}`}
      aria-labelledby={`tool-tab-${index}`}
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

export default Tools;