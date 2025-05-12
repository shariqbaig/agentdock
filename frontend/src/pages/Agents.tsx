// frontend/src/pages/Agents.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  Chip,
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
  ListItemText,
  Checkbox,
  FormHelperText,
  Divider,
  Stack,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { Agent, Tool } from '../services/api';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  const theme = useTheme();

  return (
    <Card variant="outlined" sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" noWrap>{agent.name}</Typography>
            <Chip
              icon={agent.enabled ? <CheckCircleIcon /> : <CancelIcon />}
              label={agent.enabled ? 'Enabled' : 'Disabled'}
              color={agent.enabled ? 'success' : 'error'}
              size="small"
            />
          </Box>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" sx={{ mb: 2 }} paragraph>
          {agent.description}
        </Typography>

        {agent.tools && agent.tools.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Tools:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {agent.tools.map((tool) => (
                <Chip key={tool} label={tool} size="small" />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/chat?agent=${agent.name}`}
          startIcon={<ChatIcon />}
          color="primary"
          size="small"
        >
          Chat
        </Button>
        <Box>
          <IconButton
            size="small"
            onClick={() => onEdit(agent)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(agent)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

const Agents: React.FC = () => {
  const {
    agents,
    loadingAgents,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    tools,
    fetchTools,
  } = useAppContext();

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  // Form state
  const [formData, setFormData] = useState<Agent>({
    name: '',
    description: '',
    enabled: true,
    tools: [],
  });

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  // Load agents and tools on component mount
  useEffect(() => {
    fetchAgents();
    fetchTools();
  }, []);

  // Open edit dialog
  const handleEditAgent = (agent: Agent) => {
    setIsEditing(true);
    setCurrentAgent(agent);
    setFormData({ ...agent });
    setOpenDialog(true);
  };

  // Open create dialog
  const handleAddAgent = () => {
    setIsEditing(false);
    setCurrentAgent(null);
    setFormData({
      name: '',
      description: '',
      enabled: true,
      tools: [],
    });
    setOpenDialog(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
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
    try {
      if (isEditing && currentAgent) {
        await updateAgent(currentAgent.name, formData);
      } else {
        await createAgent(formData);
      }
      setOpenDialog(false);
    } catch (error: any) {
      console.error('Error saving agent:', error);
      // You could add a snackbar here to show the error
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (agentToDelete) {
      try {
        await deleteAgent(agentToDelete.name);
        setDeleteDialogOpen(false);
        setAgentToDelete(null);
      } catch (error: any) {
        console.error('Error deleting agent:', error);
        // You could add a snackbar here to show the error
      }
    }
  };

  return (
    <Box sx={{ pt: 3, pb: 5 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1">Agents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAgent}
        >
          Add Agent
        </Button>
      </Box>

      {agents.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No agents found. Create your first agent to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAgent}
          >
            Add Agent
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {agents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent.name}>
              <AgentCard
                agent={agent}
                onEdit={handleEditAgent}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Agent Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Agent' : 'Add Agent'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Agent name"
              fullWidth
              required
              disabled={isEditing}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what this agent does"
              fullWidth
              required
              multiline
              rows={3}
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
              <InputLabel id="tools-select-label">Tools</InputLabel>
              <Select
                labelId="tools-select-label"
                id="tools-select"
                multiple
                value={formData.tools || []}
                onChange={handleToolSelect}
                input={<OutlinedInput label="Tools" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {tools.filter(tool => tool.enabled).map((tool) => (
                  <MenuItem key={tool.name} value={tool.name}>
                    <Checkbox checked={formData.tools?.indexOf(tool.name)! > -1} />
                    <ListItemText
                      primary={tool.name}
                      secondary={tool.description}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the tools this agent can use</FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {isEditing ? 'Update' : 'Create'}
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
            Are you sure you want to delete {agentToDelete?.name}? This action cannot be undone.
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

export default Agents;