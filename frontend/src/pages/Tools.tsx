// frontend/src/pages/Tools.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Divider,
  Icon,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { 
  FiGithub, 
  FiSlack, 
  FiList,
  FiCheck,
  FiX,
  FiInfo,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { SiJira } from 'react-icons/si';
import { useAppContext } from '../context/AppContext';

const ToolIcon: React.FC<{ category: string }> = ({ category }) => {
  switch (category.toLowerCase()) {
    case 'github':
      return <Icon as={FiGithub} />;
    case 'slack':
      return <Icon as={FiSlack} />;
    case 'jira':
      return <Icon as={SiJira} />;
    default:
      return <Icon as={FiList} />;
  }
};

const Tools: React.FC = () => {
  const { tools, toolCategories, fetchTools, fetchToolCategories } = useAppContext();
  const toast = useToast();
  
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
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
  
  // Mock save settings functions
  const saveGithubSettings = () => {
    toast({
      title: 'GitHub settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const saveSlackSettings = () => {
    toast({
      title: 'Slack settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const saveJiraSettings = () => {
    toast({
      title: 'Jira settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box pt={5} pb={10}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Tools & Integrations</Heading>
      </Flex>
      
      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={4}>
          <Tab>Tool Overview</Tab>
          <Tab>GitHub Settings</Tab>
          <Tab>Slack Settings</Tab>
          <Tab>Jira Settings</Tab>
        </TabList>
        
        <TabPanels>
          {/* Tool Overview */}
          <TabPanel p={0}>
            {Object.keys(toolCategories).length > 0 ? (
              <>
                <Alert status="info" mb={6} borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Tool integrations need to be configured in their respective settings tabs.
                  </AlertDescription>
                </Alert>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
                  {Object.entries(toolCategories).map(([category, categoryInfo]) => (
                    <Card 
                      key={category} 
                      bg={cardBg} 
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      boxShadow="md"
                    >
                      <CardHeader>
                        <Flex align="center" justify="space-between">
                          <HStack>
                            <ToolIcon category={category} />
                            <Heading size="md">{categoryInfo.name}</Heading>
                          </HStack>
                          <Badge 
                            colorScheme={categoryInfo.enabled ? 'green' : 'red'}
                            display="flex"
                            alignItems="center"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            <Icon as={categoryInfo.enabled ? FiCheck : FiX} mr={1} />
                            {categoryInfo.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Text mb={3}>{categoryInfo.description}</Text>
                        <Text fontWeight="medium" mb={1}>Available Tools:</Text>
                        <VStack align="stretch" spacing={1}>
                          {toolsByCategory[category]?.map((tool) => (
                            <HStack key={tool.name} justify="space-between">
                              <Text fontSize="sm">{tool.name}</Text>
                              <Badge colorScheme={tool.enabled ? 'green' : 'gray'} size="sm">
                                {tool.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </HStack>
                          )) || (
                            <Text fontSize="sm" color="gray.500">No tools available</Text>
                          )}
                        </VStack>
                      </CardBody>
                      <CardFooter pt={0}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="brand"
                          isDisabled={!categoryInfo.enabled}
                        >
                          Configure
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </SimpleGrid>
                
                <Heading size="md" mb={4}>All Available Tools</Heading>
                <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
                  <CardBody p={0}>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Tool Name</Th>
                          <Th>Category</Th>
                          <Th>Description</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tools.map((tool) => (
                          <Tr key={tool.name}>
                            <Td fontWeight="medium">{tool.name}</Td>
                            <Td>
                              <HStack>
                                <ToolIcon category={tool.category} />
                                <Text>{tool.category}</Text>
                              </HStack>
                            </Td>
                            <Td>{tool.description}</Td>
                            <Td>
                              <Badge colorScheme={tool.enabled ? 'green' : 'red'}>
                                {tool.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </>
            ) : (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>No tools configured</AlertTitle>
                  <AlertDescription>
                    Please configure integration settings in the respective tabs.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </TabPanel>
          
          {/* GitHub Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiGithub} boxSize={5} mr={2} />
                  <Heading size="md">GitHub Integration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Connect to GitHub to enable repository synchronization, PR reviews, and CI/CD triggers.
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>GitHub API Token</FormLabel>
                    <InputGroup>
                      <Input
                        type={showGithubToken ? 'text' : 'password'}
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="Enter your GitHub personal access token"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowGithubToken(!showGithubToken)}
                        >
                          {showGithubToken ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Token Requirements</AlertTitle>
                      <AlertDescription>
                        Your token needs the following scopes: repo, workflow, read:user.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <Divider />
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-github" mb="0">
                      Enable GitHub Integration
                    </FormLabel>
                    <Switch id="enable-github" colorScheme="brand" />
                  </FormControl>
                </VStack>
              </CardBody>
              <CardFooter>
                <Button colorScheme="brand" onClick={saveGithubSettings}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
            
            <Heading size="md" mb={4}>Available GitHub Tools</Heading>
            <Accordion allowMultiple>
              {toolsByCategory['github']?.map((tool) => (
                <AccordionItem key={tool.name}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="medium">
                        {tool.name}
                      </Box>
                      <Badge colorScheme={tool.enabled ? 'green' : 'red'} mr={2}>
                        {tool.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text>{tool.description}</Text>
                  </AccordionPanel>
                </AccordionItem>
              )) || (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    No GitHub tools available. Please set up the GitHub integration.
                  </AlertDescription>
                </Alert>
              )}
            </Accordion>
          </TabPanel>
          
          {/* Slack Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={FiSlack} boxSize={5} mr={2} />
                  <Heading size="md">Slack Integration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Connect to Slack to enable channel monitoring, message sending, and notifications.
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Slack Bot Token</FormLabel>
                    <InputGroup>
                      <Input
                        type={showSlackToken ? 'text' : 'password'}
                        value={slackToken}
                        onChange={(e) => setSlackToken(e.target.value)}
                        placeholder="Enter your Slack bot token (xoxb-...)"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowSlackToken(!showSlackToken)}
                        >
                          {showSlackToken ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Bot Permissions</AlertTitle>
                      <AlertDescription>
                        Your Slack bot needs the following scopes: channels:read, channels:history, chat:write, reactions:write.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <Divider />
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-slack" mb="0">
                      Enable Slack Integration
                    </FormLabel>
                    <Switch id="enable-slack" colorScheme="brand" />
                  </FormControl>
                </VStack>
              </CardBody>
              <CardFooter>
                <Button colorScheme="brand" onClick={saveSlackSettings}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
            
            <Heading size="md" mb={4}>Available Slack Tools</Heading>
            <Accordion allowMultiple>
              {toolsByCategory['slack']?.map((tool) => (
                <AccordionItem key={tool.name}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="medium">
                        {tool.name}
                      </Box>
                      <Badge colorScheme={tool.enabled ? 'green' : 'red'} mr={2}>
                        {tool.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text>{tool.description}</Text>
                  </AccordionPanel>
                </AccordionItem>
              )) || (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    No Slack tools available. Please set up the Slack integration.
                  </AlertDescription>
                </Alert>
              )}
            </Accordion>
          </TabPanel>
          
          {/* Jira Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={SiJira} boxSize={5} mr={2} />
                  <Heading size="md">Jira Integration</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Connect to Jira to enable ticket management, issue tracking, and workflow automation.
                </Text>
                
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Jira Host URL</FormLabel>
                    <Input
                      value={jiraHost}
                      onChange={(e) => setJiraHost(e.target.value)}
                      placeholder="https://your-domain.atlassian.net"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Jira Username/Email</FormLabel>
                    <Input
                      value={jiraUsername}
                      onChange={(e) => setJiraUsername(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Jira API Token</FormLabel>
                    <InputGroup>
                      <Input
                        type={showJiraApiToken ? 'text' : 'password'}
                        value={jiraApiToken}
                        onChange={(e) => setJiraApiToken(e.target.value)}
                        placeholder="Enter your Jira API token"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowJiraApiToken(!showJiraApiToken)}
                        >
                          {showJiraApiToken ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>API Token</AlertTitle>
                      <AlertDescription>
                        You can generate an API token from your Atlassian account settings.
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <Divider />
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-jira" mb="0">
                      Enable Jira Integration
                    </FormLabel>
                    <Switch id="enable-jira" colorScheme="brand" />
                  </FormControl>
                </VStack>
              </CardBody>
              <CardFooter>
                <Button colorScheme="brand" onClick={saveJiraSettings}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
            
            <Heading size="md" mb={4}>Available Jira Tools</Heading>
            <Accordion allowMultiple>
              {toolsByCategory['jira']?.map((tool) => (
                <AccordionItem key={tool.name}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="medium">
                        {tool.name}
                      </Box>
                      <Badge colorScheme={tool.enabled ? 'green' : 'red'} mr={2}>
                        {tool.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text>{tool.description}</Text>
                  </AccordionPanel>
                </AccordionItem>
              )) || (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    No Jira tools available. Please set up the Jira integration.
                  </AlertDescription>
                </Alert>
              )}
            </Accordion>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Tools;