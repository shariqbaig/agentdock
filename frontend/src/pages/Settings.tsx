// frontend/src/pages/Settings.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  SimpleGrid,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw, FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';

const Settings: React.FC = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  
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
  const [theme, setTheme] = useState<string>(colorMode);
  const [language, setLanguage] = useState<string>('en');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Save settings
  const saveServerSettings = () => {
    toast({
      title: 'Server settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const saveLLMSettings = () => {
    toast({
      title: 'LLM settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const saveDockerSettings = () => {
    toast({
      title: 'Docker settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const saveUISettings = () => {
    // Apply theme change
    if (theme !== colorMode) {
      toggleColorMode();
    }
    
    toast({
      title: 'UI settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box pt={5} pb={10}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Settings</Heading>
      </Flex>
      
      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={4}>
          <Tab>Server</Tab>
          <Tab>LLM</Tab>
          <Tab>Docker</Tab>
          <Tab>UI</Tab>
        </TabList>
        
        <TabPanels>
          {/* Server Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Heading size="md">Server Configuration</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Server Port</FormLabel>
                    <Input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                    />
                    <FormHelperText>
                      The port on which the API server will run. Default: 3001
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Log Level</FormLabel>
                    <Select
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value)}
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </Select>
                    <FormHelperText>
                      Determines which logs are recorded. Debug is most verbose.
                    </FormHelperText>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Log Retention Period</FormLabel>
                    <Select defaultValue="30">
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">365 days</option>
                    </Select>
                    <FormHelperText>
                      How long to keep logs before automatic deletion.
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-restart" mb="0">
                      Auto-restart on Crash
                    </FormLabel>
                    <Switch id="auto-restart" defaultChecked />
                  </FormControl>
                  
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={saveServerSettings}
                    alignSelf="flex-start"
                  >
                    Save Server Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* LLM Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Heading size="md">LLM Configuration</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Groq API Key</FormLabel>
                    <InputGroup>
                      <Input
                        type={showGroqApiKey ? "text" : "password"}
                        value={groqApiKey}
                        onChange={(e) => setGroqApiKey(e.target.value)}
                        placeholder="Enter your Groq API key"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowGroqApiKey(!showGroqApiKey)}
                        >
                          {showGroqApiKey ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormHelperText>
                      You can get a Groq API key from your Groq account.
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Groq Model</FormLabel>
                    <Select
                      value={groqModel}
                      onChange={(e) => setGroqModel(e.target.value)}
                    >
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</option>
                      <option value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      <option value="gemma-7b-it">Gemma 7B</option>
                    </Select>
                    <FormHelperText>
                      Select the model you want to use for natural language processing.
                    </FormHelperText>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Temperature</FormLabel>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      defaultValue="0.7"
                    />
                    <FormHelperText>
                      Controls randomness. Lower values are more deterministic.
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Max Tokens</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max="4096"
                      defaultValue="2048"
                    />
                    <FormHelperText>
                      Maximum number of tokens to generate.
                    </FormHelperText>
                  </FormControl>
                  
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={saveLLMSettings}
                    alignSelf="flex-start"
                  >
                    Save LLM Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Docker Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Heading size="md">Docker Configuration</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-docker-registry" mb="0">
                      Enable Private Docker Registry
                    </FormLabel>
                    <Switch
                      id="enable-docker-registry"
                      isChecked={enableDockerRegistry}
                      onChange={(e) => setEnableDockerRegistry(e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl isDisabled={!enableDockerRegistry}>
                    <FormLabel>Registry URL</FormLabel>
                    <Input
                      value={dockerRegistryUrl}
                      onChange={(e) => setDockerRegistryUrl(e.target.value)}
                      placeholder="e.g., docker.io, registry.gitlab.com"
                    />
                  </FormControl>
                  
                  <FormControl isDisabled={!enableDockerRegistry}>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={dockerUsername}
                      onChange={(e) => setDockerUsername(e.target.value)}
                      placeholder="Enter registry username"
                    />
                  </FormControl>
                  
                  <FormControl isDisabled={!enableDockerRegistry}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showDockerPassword ? "text" : "password"}
                        value={dockerPassword}
                        onChange={(e) => setDockerPassword(e.target.value)}
                        placeholder="Enter registry password"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => setShowDockerPassword(!showDockerPassword)}
                        >
                          {showDockerPassword ? <FiEyeOff /> : <FiEye />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Resource Limits</FormLabel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Text mb={2}>CPU Limit</Text>
                        <Input defaultValue="1.0" />
                      </Box>
                      <Box>
                        <Text mb={2}>Memory Limit</Text>
                        <Input defaultValue="2Gi" />
                      </Box>
                    </SimpleGrid>
                    <FormHelperText>
                      Resource limits for the Docker containers.
                    </FormHelperText>
                  </FormControl>
                  
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={saveDockerSettings}
                    alignSelf="flex-start"
                  >
                    Save Docker Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* UI Settings */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader>
                <Heading size="md">UI Configuration</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Theme</FormLabel>
                    <Select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Select>
                    <FormHelperText>
                      Choose the UI theme for the application.
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </Select>
                    <FormHelperText>
                      Choose the display language for the application.
                    </FormHelperText>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="enable-notifications" mb="0">
                      Enable Notifications
                    </FormLabel>
                    <Switch
                      id="enable-notifications"
                      isChecked={enableNotifications}
                      onChange={(e) => setEnableNotifications(e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="auto-refresh" mb="0">
                      Auto-refresh Logs
                    </FormLabel>
                    <Switch id="auto-refresh" defaultChecked />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Items Per Page</FormLabel>
                    <Select defaultValue="20">
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </Select>
                    <FormHelperText>
                      Number of items to display on paginated tables.
                    </FormHelperText>
                  </FormControl>
                  
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={saveUISettings}
                    alignSelf="flex-start"
                  >
                    Save UI Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;