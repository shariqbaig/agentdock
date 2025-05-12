// frontend/src/pages/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  useTheme,
  CircularProgress,
  Alert,
  AlertTitle,
  Tooltip,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import apiService, { QueryRequest, QueryResponse } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { agents, fetchAgents } = useAppContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User and agent message styling
  const userBg = theme.palette.primary.light;
  const userText = theme.palette.getContrastText(userBg);
  const agentBg = theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800];

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Parse agent from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const agentParam = params.get('agent');

    if (agentParam && agents.some(a => a.name === agentParam)) {
      setSelectedAgent(agentParam);

      // Add system message about selected agent
      const agent = agents.find(a => a.name === agentParam);
      if (agent) {
        setMessages([
          {
            id: 'system-1',
            role: 'system',
            content: `You are now chatting with ${agent.name}. ${agent.description}`,
            timestamp: new Date(),
          }
        ]);
      }
    }
  }, [location.search, agents]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle agent selection
  const handleAgentChange = (event: SelectChangeEvent<string>) => {
    const agentName = event.target.value || null;
    setSelectedAgent(agentName);

    // Update URL with selected agent
    const params = new URLSearchParams(location.search);
    if (agentName) {
      params.set('agent', agentName);

      // Add system message about selected agent
      const agent = agents.find(a => a.name === agentName);
      if (agent) {
        setMessages([
          {
            id: 'system-1',
            role: 'system',
            content: `You are now chatting with ${agent.name}. ${agent.description}`,
            timestamp: new Date(),
          }
        ]);
      }
    } else {
      params.delete('agent');

      // Add system message about general chat
      setMessages([
        {
          id: 'system-1',
          role: 'system',
          content: 'You are now in a general chat. You can ask questions or issue commands to the system.',
          timestamp: new Date(),
        }
      ]);
    }

    navigate({ search: params.toString() });
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setError(null);

    try {
      // Prepare query request
      const queryRequest: QueryRequest = {
        query: input,
        agent: selectedAgent || undefined,
      };

      // Process query
      const response = await apiService.processQuery(queryRequest);

      // Add agent response
      const agentMessage: Message = {
        id: response.id,
        role: 'agent',
        content: response.response,
        timestamp: new Date(),
        agent: selectedAgent || undefined,
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error: any) {
      console.error('Error processing query:', error);
      setError(error.message || 'Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Clear chat history
  const clearChat = () => {
    // Keep system message if agent is selected
    if (selectedAgent) {
      const agent = agents.find(a => a.name === selectedAgent);
      if (agent) {
        setMessages([
          {
            id: 'system-1',
            role: 'system',
            content: `You are now chatting with ${agent.name}. ${agent.description}`,
            timestamp: new Date(),
          }
        ]);
        return;
      }
    }

    setMessages([]);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{ pt: 5, pb: 10, height: "calc(100vh - 150px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Chat</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl variant="outlined" sx={{ minWidth: 250 }}>
            <InputLabel id="agent-select-label">Select Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              id="agent-select"
              value={selectedAgent || ''}
              onChange={handleAgentChange}
              label="Select Agent"
            >
              <MenuItem value="">General Chat</MenuItem>
              {agents
                .filter(agent => agent.enabled)
                .map(agent => (
                  <MenuItem key={agent.name} value={agent.name}>
                    {agent.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <IconButton
            aria-label="more options"
            aria-controls="chat-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="chat-menu"
            anchorEl={menuAnchorEl}
            keepMounted
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); console.log('Export chat'); }}>
              <DownloadIcon sx={{ mr: 1 }} />
              Export Chat
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); clearChat(); }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Clear Chat
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Chat Messages */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          overflowY: "auto",
          mb: 3,
          px: 2,
          py: 3,
          borderRadius: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "text.secondary",
            }}
          >
            <InfoIcon sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              No messages yet. Start a conversation!
            </Typography>
            {selectedAgent ? (
              <Chip
                label={`${selectedAgent} is ready to help`}
                color="primary"
                sx={{ mt: 1 }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try selecting an agent for specialized assistance
              </Typography>
            )}
          </Box>
        ) : (
          <Stack spacing={2}>
            {messages.map((message) => (
              <Box key={message.id}>
                {message.role === 'system' ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography>{message.content}</Typography>
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Card
                      elevation={1}
                      sx={{
                        maxWidth: '80%',
                        bgcolor: message.role === 'user' ? userBg : agentBg,
                        color: message.role === 'user' ? userText : 'text.primary',
                        borderRadius: 2,
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                              width: 32,
                              height: 32
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        }
                        title={message.role === 'user' ? 'You' : message.agent || 'Assistant'}
                        subheader={message.timestamp.toLocaleTimeString()}
                        subheaderTypographyProps={{
                          variant: 'caption',
                          color: message.role === 'user' ? 'primary.contrastText' : 'text.secondary'
                        }}
                        titleTypographyProps={{
                          variant: 'subtitle2',
                          color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                        sx={{ pb: 0.5 }}
                      />
                      <CardContent sx={{ pt: 0.5 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                          }}
                        >
                          {message.content}
                        </Typography>

                        {message.role === 'agent' && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Tooltip title="Copy message">
                              <IconButton
                                size="small"
                                onClick={() => copyMessage(message.content)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            ))}

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Processing...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Paper>

      {/* Chat Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder={
            selectedAgent
              ? `Ask ${selectedAgent} anything...`
              : 'Type your message...'
          }
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          variant="outlined"
          disabled={isProcessing}
          size="medium"
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={sendMessage}
          disabled={!input.trim() || isProcessing}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;