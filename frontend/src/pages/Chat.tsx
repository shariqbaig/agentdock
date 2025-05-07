// frontend/src/pages/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Badge,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiSend,
  FiMoreVertical,
  FiCopy,
  FiRefreshCw,
  FiDownload,
  FiTrash2,
  FiUser,
  FiInfo,
} from 'react-icons/fi';
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
  const { agents, fetchAgents } = useAppContext();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Card styling
  const userBg = useColorModeValue('blue.50', 'blue.900');
  const agentBg = useColorModeValue('gray.50', 'gray.700');
  const systemBg = useColorModeValue('yellow.50', 'yellow.900');
  
  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);
  
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
  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentName = e.target.value || null;
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

  return (
    <Box pt={5} pb={10} h="calc(100vh - 150px)" display="flex" flexDirection="column">
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Chat</Heading>
        <HStack spacing={4}>
          <Select
            placeholder="Select Agent"
            value={selectedAgent || ''}
            onChange={handleAgentChange}
            width="250px"
            variant="filled"
          >
            <option value="">General Chat</option>
            {agents
              .filter(agent => agent.enabled)
              .map(agent => (
                <option key={agent.name} value={agent.name}>
                  {agent.name}
                </option>
              ))}
          </Select>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              aria-label="More options"
            />
            <MenuList>
              <MenuItem icon={<FiDownload />} onClick={() => console.log('Export chat')}>
                Export Chat
              </MenuItem>
              <MenuItem icon={<FiTrash2 />} onClick={clearChat}>
                Clear Chat
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Chat Messages */}
      <Box
        flex="1"
        overflowY="auto"
        mb={4}
        px={2}
        py={4}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        bg={useColorModeValue('white', 'gray.800')}
      >
        {messages.length === 0 ? (
          <Flex
            height="100%"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            color="gray.500"
          >
            <FiInfo size={30} />
            <Text mt={4}>No messages yet. Start a conversation!</Text>
            {selectedAgent ? (
              <Badge mt={2} colorScheme="brand">
                {selectedAgent} is ready to help
              </Badge>
            ) : (
              <Text fontSize="sm" mt={2}>
                Try selecting an agent for specialized assistance
              </Text>
            )}
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {messages.map((message) => (
              <Box key={message.id}>
                {message.role === 'system' ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text>{message.content}</Text>
                  </Alert>
                ) : (
                  <Flex justify={message.role === 'user' ? 'flex-end' : 'flex-start'}>
                    <Card
                      maxW="80%"
                      bg={message.role === 'user' ? userBg : agentBg}
                      borderRadius="lg"
                    >
                      <CardHeader pb={1}>
                        <Flex justify="space-between" align="center">
                          <HStack>
                            <Avatar
                              size="xs"
                              icon={<FiUser />}
                              bg={message.role === 'user' ? 'blue.500' : 'brand.500'}
                            />
                            <Text fontWeight="bold">
                              {message.role === 'user' ? 'You' : message.agent || 'Assistant'}
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {message.timestamp.toLocaleTimeString()}
                          </Text>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={1}>
                        <Text whiteSpace="pre-wrap">{message.content}</Text>
                        
                        {message.role === 'agent' && (
                          <Flex justifyContent="flex-end" mt={2}>
                            <Tooltip label="Copy message">
                              <IconButton
                                aria-label="Copy message"
                                icon={<FiCopy />}
                                size="xs"
                                variant="ghost"
                                onClick={() => copyMessage(message.content)}
                              />
                            </Tooltip>
                          </Flex>
                        )}
                      </CardBody>
                    </Card>
                  </Flex>
                )}
              </Box>
            ))}
            
            {/* Error message */}
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text>{error}</Text>
              </Alert>
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <Flex justify="center" p={4}>
                <HStack>
                  <Spinner size="sm" color="brand.500" />
                  <Text>Processing...</Text>
                </HStack>
              </Flex>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>
      
      {/* Chat Input */}
      <HStack spacing={2}>
        <Input
          placeholder={
            selectedAgent
              ? `Ask ${selectedAgent} anything...`
              : 'Type your message...'
          }
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          size="lg"
          disabled={isProcessing}
        />
        <IconButton
          colorScheme="brand"
          aria-label="Send message"
          icon={<FiSend />}
          size="lg"
          isLoading={isProcessing}
          onClick={sendMessage}
          disabled={!input.trim() || isProcessing}
        />
      </HStack>
    </Box>
  );
};

export default Chat;