// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Icon,
  HStack,
  VStack,
  Divider,
  List,
  ListItem,
  Link,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiTool, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiMessageSquare,
  FiClock,
  FiActivity,
  FiServer
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import apiService, { Log } from '../services/api';

const Dashboard: React.FC = () => {
  const { agents, tools, isOnline, serverStatus } = useAppContext();
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTools: 0,
    enabledTools: 0,
    totalQueries: 0,
    avgResponseTime: 0,
  });

  // Card background and border colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statCardBg = useColorModeValue('brand.50', 'gray.700');
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get recent logs
        const logsData = await apiService.getLogs(1, 5);
        setRecentLogs(logsData.logs);
        
        // Calculate statistics
        setStats({
          totalAgents: agents.length,
          activeAgents: agents.filter(agent => agent.enabled).length,
          totalTools: tools.length,
          enabledTools: tools.filter(tool => tool.enabled).length,
          totalQueries: logsData.pagination.total,
          avgResponseTime: logsData.logs.length > 0 
            ? logsData.logs.reduce((acc, log) => acc + log.responseTime, 0) / logsData.logs.length 
            : 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOnline) {
      fetchDashboardData();
    }
  }, [isOnline, agents, tools]);

  return (
    <Box pt={5} pb={10}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Dashboard</Heading>
        <HStack spacing={4}>
          <Badge colorScheme={isOnline ? 'green' : 'red'} fontSize="sm" p={2} borderRadius="md">
            <HStack spacing={2}>
              <Icon as={isOnline ? FiCheckCircle : FiAlertCircle} />
              <Text>Server {serverStatus}</Text>
            </HStack>
          </Badge>
          <Button
            as={RouterLink}
            to="/chat"
            colorScheme="brand"
            leftIcon={<FiMessageSquare />}
          >
            Chat
          </Button>
        </HStack>
      </Flex>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={6}>
        <Card bg={statCardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Agents</StatLabel>
              <HStack align="center" mt={2}>
                <Icon as={FiUsers} boxSize={5} />
                <StatNumber>{stats.activeAgents} / {stats.totalAgents}</StatNumber>
              </HStack>
              <StatHelpText>
                {stats.activeAgents} active agents
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={statCardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Tools</StatLabel>
              <HStack align="center" mt={2}>
                <Icon as={FiTool} boxSize={5} />
                <StatNumber>{stats.enabledTools} / {stats.totalTools}</StatNumber>
              </HStack>
              <StatHelpText>
                {stats.enabledTools} enabled tools
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={statCardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Total Queries</StatLabel>
              <HStack align="center" mt={2}>
                <Icon as={FiMessageSquare} boxSize={5} />
                <StatNumber>{stats.totalQueries}</StatNumber>
              </HStack>
              <StatHelpText>
                <StatArrow type='increase' />
                23% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={statCardBg} borderRadius="lg" boxShadow="md">
          <CardBody>
            <Stat>
              <StatLabel>Avg Response Time</StatLabel>
              <HStack align="center" mt={2}>
                <Icon as={FiClock} boxSize={5} />
                <StatNumber>{(stats.avgResponseTime / 1000).toFixed(2)}s</StatNumber>
              </HStack>
              <StatHelpText>
                <StatArrow type='decrease' />
                10% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main content grid */}
      <Grid
        templateColumns={{ base: "1fr", lg: "3fr 1fr" }}
        gap={6}
      >
        {/* Left Column - Recent Queries */}
        <GridItem>
          <Card mb={6} bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardHeader>
              <Heading size="md">Recent Queries</Heading>
            </CardHeader>
            <CardBody>
              {recentLogs.length > 0 ? (
                <VStack align="stretch" spacing={4}>
                  {recentLogs.map((log) => (
                    <Box 
                      key={log.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                    >
                      <Flex justifyContent="space-between" mb={2}>
                        <HStack>
                          <Icon as={FiMessageSquare} color="brand.500" />
                          <Text fontWeight="medium">{log.agent || 'General Query'}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiClock} color="gray.500" />
                          <Text fontSize="sm" color="gray.500">
                            {new Date(log.timestamp).toLocaleString()}
                          </Text>
                        </HStack>
                      </Flex>
                      <Text fontWeight="bold" mb={2} noOfLines={1}>
                        {log.query}
                      </Text>
                      <Text noOfLines={2} mb={2}>
                        {log.response}
                      </Text>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Badge colorScheme="brand" borderRadius="full" px={2}>
                          {(log.responseTime / 1000).toFixed(2)}s
                        </Badge>
                        <Button
                          as={RouterLink}
                          to={`/logs#${log.id}`}
                          size="sm"
                          variant="ghost"
                        >
                          View Details
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text>No queries yet. Try asking something!</Text>
                </Box>
              )}
            </CardBody>
            <CardFooter>
              <Button
                as={RouterLink}
                to="/logs"
                variant="ghost"
                colorScheme="brand"
                size="sm"
                ml="auto"
              >
                View All Logs
              </Button>
            </CardFooter>
          </Card>
        </GridItem>

        {/* Right Column - System Status & Quick Actions */}
        <GridItem>
          {/* System Status */}
          <Card mb={6} bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardHeader>
              <Heading size="md">System Status</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FiServer} />
                    <Text>MCP Server</Text>
                  </HStack>
                  <Badge colorScheme={isOnline ? 'green' : 'red'}>
                    {isOnline ? 'Running' : 'Offline'}
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FiActivity} />
                    <Text>API Service</Text>
                  </HStack>
                  <Badge colorScheme={isOnline ? 'green' : 'red'}>
                    {isOnline ? 'Running' : 'Offline'}
                  </Badge>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text>GitHub Integration</Text>
                  <Badge colorScheme={tools.some(t => t.category === 'github' && t.enabled) ? 'green' : 'red'}>
                    {tools.some(t => t.category === 'github' && t.enabled) ? 'Enabled' : 'Disabled'}
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Slack Integration</Text>
                  <Badge colorScheme={tools.some(t => t.category === 'slack' && t.enabled) ? 'green' : 'red'}>
                    {tools.some(t => t.category === 'slack' && t.enabled) ? 'Enabled' : 'Disabled'}
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Jira Integration</Text>
                  <Badge colorScheme={tools.some(t => t.category === 'jira' && t.enabled) ? 'green' : 'red'}>
                    {tools.some(t => t.category === 'jira' && t.enabled) ? 'Enabled' : 'Disabled'}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                <ListItem>
                  <Link as={RouterLink} to="/agents" color="brand.500">
                    <HStack>
                      <Icon as={FiUsers} />
                      <Text>Manage Agents</Text>
                    </HStack>
                  </Link>
                </ListItem>
                <ListItem>
                  <Link as={RouterLink} to="/tools" color="brand.500">
                    <HStack>
                      <Icon as={FiTool} />
                      <Text>Configure Tools</Text>
                    </HStack>
                  </Link>
                </ListItem>
                <ListItem>
                  <Link as={RouterLink} to="/logs" color="brand.500">
                    <HStack>
                      <Icon as={FiActivity} />
                      <Text>View Logs</Text>
                    </HStack>
                  </Link>
                </ListItem>
                <ListItem>
                  <Link as={RouterLink} to="/settings" color="brand.500">
                    <HStack>
                      <Icon as={FiServer} />
                      <Text>System Settings</Text>
                    </HStack>
                  </Link>
                </ListItem>
              </List>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;