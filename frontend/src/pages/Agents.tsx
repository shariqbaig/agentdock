// frontend/src/pages/Agents.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  IconButton,
  Badge,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  Select,
  useDisclosure,
  useToast,
  useColorModeValue,
  Divider,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSettings, 
  FiCheckCircle, 
  FiXCircle,
  FiMessageSquare 
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { Agent, Tool } from '../services/api';

const AgentCard: React.FC<{
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}> = ({ agent, onEdit, onDelete }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"
    >
      <CardHeader pb={0}>
        <Flex justify="space-between" align="center">
          <Heading size="md" noOfLines={1}>{agent.name}</Heading>
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
        </Flex>
      </CardHeader>
      <CardBody>
        <Text noOfLines={3} mb={3}>{agent.description}</Text>
        
        {agent.tools && agent.tools.length > 0 && (
          <Box mt={3}>
            <Text fontWeight="medium" mb={1}>Tools:</Text>
            <Flex wrap="wrap" gap={2}>
              {agent.tools.map((tool) => (
                <Badge key={tool} py={1} px={2} borderRadius="full">
                  {tool}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}
      </CardBody>
      <CardFooter pt={0}>
        <Flex justify="space-between" w="100%">
          <Button 
            as={RouterLink}
            to={`/chat?agent=${agent.name}`}
            leftIcon={<FiMessageSquare />}
            colorScheme="brand"
            size="sm"
            variant="ghost"
          >
            Chat
          </Button>
          <Flex>
            <IconButton
              icon={<FiEdit2 />}
              aria-label="Edit agent"
              size="sm"
              mr={2}
              onClick={() => onEdit(agent)}
            />
            <IconButton
              icon={<FiTrash2 />}
              aria-label="Delete agent"
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(agent)}
            />
          </Flex>
        </Flex>
      </CardFooter>
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
  
  const toast = useToast();
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  // Load agents and tools on component mount
  useEffect(() => {
    fetchAgents();
    fetchTools();
  }, []);
  
  // Open edit modal
  const handleEditAgent = (agent: Agent) => {
    setIsEditing(true);
    setCurrentAgent(agent);
    setFormData({ ...agent });
    onOpen();
  };
  
  // Open create modal
  const handleAddAgent = () => {
    setIsEditing(false);
    setCurrentAgent(null);
    setFormData({
      name: '',
      description: '',
      enabled: true,
      tools: [],
    });
    onOpen();
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogIsOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    try {
      if (isEditing && currentAgent) {
        await updateAgent(currentAgent.name, formData);
        toast({
          title: 'Agent updated',
          description: `${formData.name} has been updated successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await createAgent(formData);
        toast({
          title: 'Agent created',
          description: `${formData.name} has been created successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      onClose();
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
    if (agentToDelete) {
      try {
        await deleteAgent(agentToDelete.name);
        toast({
          title: 'Agent deleted',
          description: `${agentToDelete.name} has been deleted successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'An error occurred.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
    setDeleteDialogIsOpen(false);
    setAgentToDelete(null);
  };

  return (
    <Box pt={5} pb={10}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Agents</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="brand" 
          onClick={handleAddAgent}
        >
          Add Agent
        </Button>
      </Flex>
      
      {agents.length === 0 ? (
        <Card p={6} textAlign="center">
          <Text mb={4}>No agents found. Create your first agent to get started.</Text>
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="brand" 
            onClick={handleAddAgent}
            mx="auto"
          >
            Add Agent
          </Button>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {agents.map((agent) => (
            <AgentCard 
              key={agent.name}
              agent={agent}
              onEdit={handleEditAgent}
              onDelete={handleDeleteClick}
            />
          ))}
        </SimpleGrid>
      )}
      
      {/* Add/Edit Agent Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Agent' : 'Add Agent'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Agent name"
                  isReadOnly={isEditing} // Name cannot be changed when editing
                />
              </FormControl>
              
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
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialogIsOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteDialogIsOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Agent
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {agentToDelete?.name}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteDialogIsOpen(false)}>
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

export default Agents;