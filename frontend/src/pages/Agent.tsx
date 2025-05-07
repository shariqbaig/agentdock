// frontend/src/pages/Agent.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Skeleton,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Switch,
  Textarea,
  Select,
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiTool,
  FiClock,
  FiActivity,
  FiArrowLeft,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import apiService, { Log } from '../services/api';

const Agent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
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
  
  // Edit modal
  const { 
    isOpen: isEditModalOpen, 
    onOpen: onOpenEditModal, 
    onClose: onCloseEditModal 
  } = useDisclosure();
  
  // Delete confirmation dialog
  const { 
    isOpen: isDeleteDialogOpen, 
    onOpen: onOpenDeleteDialog, 
    onClose: onCloseDeleteDialog 
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({
    description: '',
    enabled: true,
    tools: [],
  });
  
  // Styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
        // Agent not found
        toast({
          title: 'Agent not found',
          description: `No agent with the name "${id}" exists.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/agents');
      }
    }
  }, [agents, loadingAgents, id]);
  
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
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle switch input changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  // Handle multi-select for tools
  const handleToolSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, tools: options });
  };
  
  // Submit form
  const handleSubmit = async () => {
    if (!agent) return;
    
    try {
      await updateAgent(agent.name, formData);
      toast({
        title: 'Agent updated',
        description: `${agent.name} has been updated successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onCloseEditModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!agent) return;
    
    try {
      await deleteAgent(agent.name);
      toast({
        title: 'Agent deleted',
        description: `${agent.name} has been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/agents');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    onCloseDeleteDialog();
  };
  
  // Format response time
  const formatResponseTime = (responseTime: number) => {
    return (responseTime / 1000).toFixed(2) + 's';
  };

  return (
    <Box pt={5} pb={10}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <HStack>
          <IconButton
            aria-label="Back to agents"
            icon={<FiArrowLeft />}
            variant="ghost"
            as={RouterLink}
            to="/agents"
          />
          <Heading size="lg">
            {loadingAgents ? (
              <Skeleton height="36px" width="200px" />
            ) : (
              agent?.name || 'Agent not found'
            )}
          </Heading>
          {agent && (
            <Badge 
              colorScheme={agent.enabled ? 'green' : 'red'}
              display="flex"
              alignItems="center"
              px={2}
              py={1}
              borderRadius="full"
            >
              <Icon as={agent.enabled ? FiCheckCircle : FiXCircle} mr={1} />
              {agent.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          )}
        </HStack>
        
        <HStack spacing={2}>
          <Button
            leftIcon={<FiEdit2 />}
            onClick={onOpenEditModal}
            isDisabled={!agent}
            variant="outline"
          >
            Edit
          </Button>
          <Button
            leftIcon={<FiTrash2 />}
            colorScheme="red"
            onClick={onOpenDeleteDialog}
            isDisabled={!agent}
            variant="outline"
          >
            Delete
          </Button>
          <Button
            leftIcon={<FiMessageSquare />}
            colorScheme="brand"
            as={RouterLink}
            to={`/chat?agent=${id}`}
            isDisabled={!agent || !agent.enabled}
          >
            Chat
          </Button>
        </HStack>
      </Flex>
      
      {loadingAgents ? (
        <VStack spacing={4} align="stretch">
          <Skeleton height="100px" />
          <Skeleton height="200px" />
          <Skeleton height="300px" />
        </VStack>
      ) : agent ? (
        <>
          {/* Agent Overview */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={6}>
            <GridItem colSpan={{ base: 1, md: 4 }}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md">
                <CardBody>
                  <Text fontSize="lg">{agent.description}</Text>
                </CardBody>
              </Card>
            </GridItem>
            
            {/* Stats Cards */}
            <GridItem colSpan={1}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" height="100%">
                <CardBody>
                  <VStack align="stretch">
                    <HStack>
                      <Icon as={FiMessageSquare} color="brand.500" />
                      <Text fontWeight="medium">Total Queries</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stats.totalQueries}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem colSpan={1}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" height="100%">
                <CardBody>
                  <VStack align="stretch">
                    <HStack>
                      <Icon as={FiClock} color="brand.500" />
                      <Text fontWeight="medium">Avg Response Time</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {formatResponseTime(stats.avgResponseTime)}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem colSpan={1}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" height="100%">
                <CardBody>
                  <VStack align="stretch">
                    <HStack>
                      <Icon as={FiCheckCircle} color="brand.500" />
                      <Text fontWeight="medium">Success Rate</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {stats.successRate}%
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem colSpan={1}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="md" height="100%">
                <CardBody>
                  <VStack align="stretch">
                    <HStack>
                      <Icon as={FiActivity} color="brand.500" />
                      <Text fontWeight="medium">Last Active</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" noOfLines={1}>
                      {stats.lastActive}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
          
          <Tabs variant="soft-rounded" colorScheme="brand">
            <TabList mb={4}>
              <Tab>Tools</Tab>
              <Tab>Recent Activity</Tab>
              <Tab>Settings</Tab>
            </TabList>
            
            <TabPanels>
              {/* Tools Tab */}
              <TabPanel p={0}>
                <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
                  <CardHeader>
                    <Heading size="md">Connected Tools</Heading>
                  </CardHeader>
                  <CardBody>
                    {agent.tools && agent.tools.length > 0 ? (
                      <VStack align="stretch" spacing={4}>
                        {agent.tools.map((toolName: string) => {
                          const tool = tools.find(t => t.name === toolName);
                          return (
                            <Card 
                              key={toolName} 
                              variant="outline" 
                              p={4} 
                              borderRadius="md"
                              borderColor={borderColor}
                            >
                              <Flex justify="space-between" align="center">
                                <HStack>
                                  <Icon as={FiTool} color="brand.500" />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold">{toolName}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {tool ? tool.description : 'Tool description not available'}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Badge colorScheme={tool?.enabled ? 'green' : 'red'}>
                                  {tool?.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                              </Flex>
                            </Card>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Text>No tools connected to this agent.</Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Recent Activity Tab */}
              <TabPanel p={0}>
                <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
                  <CardHeader>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Heading size="md">Recent Queries</Heading>
                      <Button
                        size="sm"
                        rightIcon={<FiArrowLeft />}
                        variant="ghost"
                        as={RouterLink}
                        to="/logs"
                      >
                        View All Logs
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    {isLoadingLogs ? (
                      <VStack spacing={4} align="stretch">
                        <Skeleton height="50px" />
                        <Skeleton height="50px" />
                        <Skeleton height="50px" />
                      </VStack>
                    ) : recentLogs.length > 0 ? (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Timestamp</Th>
                            <Th>Query</Th>
                            <Th>Response Time</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {recentLogs.map((log) => (
                            <Tr key={log.id}>
                              <Td whiteSpace="nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </Td>
                              <Td>
                                <Text noOfLines={1} maxW="300px">
                                  {log.query}
                                </Text>
                              </Td>
                              <Td>
                                <Badge>
                                  {formatResponseTime(log.responseTime)}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No recent activity for this agent.</Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel p={0}>
                <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
                  <CardHeader>
                    <Heading size="md">Agent Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={6}>
                      <Flex 
                        justify="space-between" 
                        align="center"
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                      >
                        <HStack>
                          <Icon as={agent.enabled ? FiCheckCircle : FiXCircle} />
                          <Text fontWeight="medium">Status</Text>
                        </HStack>
                        <Badge colorScheme={agent.enabled ? 'green' : 'red'}>
                          {agent.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Flex>
                      
                      <Flex 
                        justify="space-between" 
                        align="center"
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                      >
                        <HStack>
                          <Icon as={FiClock} />
                          <Text fontWeight="medium">Created</Text>
                        </HStack>
                        <Text>
                          {agent.createdAt 
                            ? new Date(agent.createdAt).toLocaleString() 
                            : 'Not available'}
                        </Text>
                      </Flex>
                      
                      <Flex 
                        justify="space-between" 
                        align="center"
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                      >
                        <HStack>
                          <Icon as={FiClock} />
                          <Text fontWeight="medium">Last Updated</Text>
                        </HStack>
                        <Text>
                          {agent.updatedAt 
                            ? new Date(agent.updatedAt).toLocaleString() 
                            : 'Not available'}
                        </Text>
                      </Flex>
                      
                      <Button
                        leftIcon={<FiEdit2 />}
                        colorScheme="brand"
                        onClick={onOpenEditModal}
                      >
                        Edit Agent Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : (
        <Card bg={cardBg} p={6} textAlign="center">
          <Icon as={FiAlertCircle} boxSize={10} color="red.500" mb={4} />
          <Heading size="md" mb={2}>Agent Not Found</Heading>
          <Text mb={4}>The agent you're looking for doesn't exist or has been deleted.</Text>
          <Button
            as={RouterLink}
            to="/agents"
            colorScheme="brand"
            leftIcon={<FiArrowLeft />}
          >
            Back to Agents
          </Button>
        </Card>
      )}
      
      {/* Edit Agent Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Agent: {agent?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Enabled</FormLabel>
                <Switch 
                  name="enabled"
                  isChecked={formData.enabled}
                  onChange={handleSwitchChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tools</FormLabel>
                <Select 
                  multiple
                  size="sm"
                  height="120px"
                  onChange={handleToolSelect}
                  value={formData.tools || []}
                >
                  {tools.filter(tool => tool.enabled).map((tool) => (
                    <option key={tool.name} value={tool.name}>
                      {tool.name} - {tool.description}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseEditModal}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Agent
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {agent?.name}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDeleteDialog}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Agent;