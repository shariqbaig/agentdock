// frontend/src/pages/Logs.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  HStack,
  VStack,
  Collapse,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Code,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiClock,
  FiDownload,
  FiCopy,
  FiSend,
  FiMessageSquare,
  FiAlertCircle,
  FiUser,
  FiServer
} from 'react-icons/fi';
import apiService, { Log, PaginatedLogs } from '../services/api';

const Logs: React.FC = () => {
  // Query logs state
  const [logs, setLogs] = useState<Log[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  // System logs state
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isLoadingSystemLogs, setIsLoadingSystemLogs] = useState(false);
  
  // Error logs state
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [isLoadingErrorLogs, setIsLoadingErrorLogs] = useState(false);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  
  // Card background
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Fetch query logs
  const fetchQueryLogs = async (page: number = 1) => {
    setIsLoadingLogs(true);
    try {
      const response = await apiService.getLogs(page, pagination.limit);
      setLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching query logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };
  
  // Fetch system logs
  const fetchSystemLogs = async () => {
    setIsLoadingSystemLogs(true);
    try {
      const response = await apiService.getSystemLogs(100);
      setSystemLogs(response.logs);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setIsLoadingSystemLogs(false);
    }
  };
  
  // Fetch error logs
  const fetchErrorLogs = async () => {
    setIsLoadingErrorLogs(true);
    try {
      const response = await apiService.getErrorLogs(100);
      setErrorLogs(response.logs);
    } catch (error) {
      console.error('Error fetching error logs:', error);
    } finally {
      setIsLoadingErrorLogs(false);
    }
  };
  
  // Fetch logs on component mount
  useEffect(() => {
    fetchQueryLogs();
    fetchSystemLogs();
    fetchErrorLogs();
  }, []);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchQueryLogs(newPage);
  };
  
  // Handle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  // Handle log selection for modal
  const handleLogSelect = (log: Log) => {
    setSelectedLog(log);
    onOpen();
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Format response time
  const formatResponseTime = (responseTime: number) => {
    return (responseTime / 1000).toFixed(2) + 's';
  };
  
  // Generate pagination buttons
  const generatePaginationControls = () => {
    const { page, totalPages } = pagination;
    
    // Calculate pages to show (max 5)
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(startPage + 4, totalPages);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <HStack spacing={2} mt={4}>
        <Button
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
        >
          First
        </Button>
        
        <Button
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </Button>
        
        {pages.map(p => (
          <Button
            key={p}
            size="sm"
            colorScheme={p === page ? 'brand' : undefined}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </Button>
        ))}
        
        <Button
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
        
        <Button
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </Button>
      </HStack>
    );
  };

  return (
    <Box pt={5} pb={10}>
      <Flex mb={6} justifyContent="space-between" alignItems="center">
        <Heading size="lg">Logs & Monitoring</Heading>
        <HStack spacing={4}>
          <Button
            leftIcon={<FiRefreshCw />}
            onClick={() => {
              fetchQueryLogs();
              fetchSystemLogs();
              fetchErrorLogs();
            }}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="brand"
          >
            Export Logs
          </Button>
        </HStack>
      </Flex>
      
      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={4}>
          <Tab>Query History</Tab>
          <Tab>System Logs</Tab>
          <Tab>Error Logs</Tab>
        </TabList>
        
        <TabPanels>
          {/* Query History Tab */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader pb={2}>
                <Flex direction={{ base: 'column', md: 'row' }} gap={4} justifyContent="space-between">
                  <InputGroup maxW={{ base: 'full', md: '300px' }}>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search queries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  
                  <HStack spacing={4}>
                    <Select
                      placeholder="Filter by date"
                      icon={<FiCalendar />}
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      w={{ base: 'full', md: '200px' }}
                    >
                      <option value="all">All time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </Select>
                    
                    <Select
                      placeholder="Filter by agent"
                      icon={<FiFilter />}
                      value={agentFilter}
                      onChange={(e) => setAgentFilter(e.target.value)}
                      w={{ base: 'full', md: '200px' }}
                    >
                      <option value="all">All agents</option>
                      <option value="none">No agent</option>
                      {/* Agent options would be dynamically populated */}
                      <option value="GitHubSync">GitHubSync</option>
                      <option value="SlackAgent">SlackAgent</option>
                      <option value="JiraAgent">JiraAgent</option>
                    </Select>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingLogs ? (
                  <Flex justify="center" p={8}>
                    <Spinner size="xl" color="brand.500" />
                  </Flex>
                ) : logs.length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text>No query logs found. Try using the chat to generate some logs.</Text>
                  </Alert>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th></Th>
                          <Th>Timestamp</Th>
                          <Th>Agent</Th>
                          <Th>Query</Th>
                          <Th>Response Time</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {logs.map((log) => (
                          <React.Fragment key={log.id}>
                            <Tr>
                              <Td p={0} width="40px">
                                <IconButton
                                  aria-label="Expand row"
                                  icon={expandedRows[log.id] ? <FiChevronUp /> : <FiChevronDown />}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRowExpansion(log.id)}
                                />
                              </Td>
                              <Td whiteSpace="nowrap">{formatTimestamp(log.timestamp)}</Td>
                              <Td>
                                {log.agent ? (
                                  <Badge colorScheme="brand">{log.agent}</Badge>
                                ) : (
                                  <Badge colorScheme="gray">General</Badge>
                                )}
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
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="View details">
                                    <IconButton
                                      aria-label="View details"
                                      icon={<FiInfo />}
                                      size="sm"
                                      onClick={() => handleLogSelect(log)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Copy query">
                                    <IconButton
                                      aria-label="Copy query"
                                      icon={<FiCopy />}
                                      size="sm"
                                      onClick={() => navigator.clipboard.writeText(log.query)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Retry query">
                                    <IconButton
                                      aria-label="Retry query"
                                      icon={<FiSend />}
                                      size="sm"
                                      colorScheme="brand"
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                            <Tr>
                              <Td colSpan={6} p={0}>
                                <Collapse in={expandedRows[log.id]} animateOpacity>
                                  <Box 
                                    p={4} 
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    borderBottomWidth="1px"
                                  >
                                    <VStack align="stretch" spacing={3}>
                                      <Box>
                                        <Text fontWeight="bold" mb={1}>Query:</Text>
                                        <Code p={2} borderRadius="md" whiteSpace="pre-wrap">
                                          {log.query}
                                        </Code>
                                      </Box>
                                      <Box>
                                        <Text fontWeight="bold" mb={1}>Response:</Text>
                                        <Code p={2} borderRadius="md" whiteSpace="pre-wrap">
                                          {log.response}
                                        </Code>
                                      </Box>
                                    </VStack>
                                  </Box>
                                </Collapse>
                              </Td>
                            </Tr>
                          </React.Fragment>
                        ))}
                      </Tbody>
                    </Table>
                    
                    {/* Pagination */}
                    <Flex justifyContent="center" mt={6}>
                      {generatePaginationControls()}
                    </Flex>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* System Logs Tab */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader pb={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">System Logs</Heading>
                  <HStack>
                    <Select
                      placeholder="Log Level"
                      w="150px"
                      size="sm"
                    >
                      <option value="all">All Levels</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                      <option value="debug">Debug</option>
                    </Select>
                    <Button
                      leftIcon={<FiRefreshCw />}
                      size="sm"
                      onClick={fetchSystemLogs}
                      isLoading={isLoadingSystemLogs}
                    >
                      Refresh
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingSystemLogs ? (
                  <Flex justify="center" p={8}>
                    <Spinner size="xl" color="brand.500" />
                  </Flex>
                ) : systemLogs.length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text>No system logs found.</Text>
                  </Alert>
                ) : (
                  <Box
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    p={4}
                    borderRadius="md"
                    fontFamily="mono"
                    fontSize="sm"
                    overflowX="auto"
                    maxH="600px"
                    overflowY="auto"
                  >
                    {systemLogs.map((log, index) => {
                      // Determine log level from content
                      let color = 'gray.500';
                      if (log.includes('INFO')) color = 'blue.500';
                      if (log.includes('WARN')) color = 'orange.500';
                      if (log.includes('ERROR')) color = 'red.500';
                      if (log.includes('DEBUG')) color = 'green.500';
                      
                      return (
                        <Text key={index} color={color} mb={1} whiteSpace="pre-wrap">
                          {log}
                        </Text>
                      );
                    })}
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Error Logs Tab */}
          <TabPanel p={0}>
            <Card bg={cardBg} borderRadius="lg" boxShadow="md" mb={6}>
              <CardHeader pb={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="md">Error Logs</Heading>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                    onClick={fetchErrorLogs}
                    isLoading={isLoadingErrorLogs}
                  >
                    Refresh
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingErrorLogs ? (
                  <Flex justify="center" p={8}>
                    <Spinner size="xl" color="brand.500" />
                  </Flex>
                ) : errorLogs.length === 0 ? (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Text>No error logs found. Everything is running smoothly!</Text>
                  </Alert>
                ) : (
                  <Box
                    bg={useColorModeValue('red.50', 'red.900')}
                    p={4}
                    borderRadius="md"
                    fontFamily="mono"
                    fontSize="sm"
                    overflowX="auto"
                    maxH="600px"
                    overflowY="auto"
                  >
                    {errorLogs.map((log, index) => (
                      <Text key={index} color="red.500" mb={1} whiteSpace="pre-wrap">
                        {log}
                      </Text>
                    ))}
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Log Detail</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Flex justifyContent="space-between" mb={2}>
                    <Heading size="sm">Timestamp</Heading>
                    <Text>{formatTimestamp(selectedLog.timestamp)}</Text>
                  </Flex>
                  <Divider />
                </Box>
                
                <Box>
                  <Flex justifyContent="space-between" mb={2}>
                    <Heading size="sm">Agent</Heading>
                    <Badge colorScheme={selectedLog.agent ? 'brand' : 'gray'}>
                      {selectedLog.agent || 'General'}
                    </Badge>
                  </Flex>
                  <Divider />
                </Box>
                
                <Box>
                  <Flex justifyContent="space-between" mb={2}>
                    <Heading size="sm">Response Time</Heading>
                    <Badge colorScheme="green">
                      {formatResponseTime(selectedLog.responseTime)}
                    </Badge>
                  </Flex>
                  <Divider />
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Query</Heading>
                  <Box
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    p={3}
                    borderRadius="md"
                    mb={2}
                  >
                    <Text whiteSpace="pre-wrap">{selectedLog.query}</Text>
                  </Box>
                  <Button
                    leftIcon={<FiCopy />}
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(selectedLog.query)}
                  >
                    Copy
                  </Button>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Response</Heading>
                  <Box
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    p={3}
                    borderRadius="md"
                    maxH="300px"
                    overflowY="auto"
                    mb={2}
                  >
                    <Text whiteSpace="pre-wrap">{selectedLog.response}</Text>
                  </Box>
                  <Button
                    leftIcon={<FiCopy />}
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(selectedLog.response)}
                  >
                    Copy
                  </Button>
                </Box>
                
                {selectedLog.context && (
                  <Box>
                    <Heading size="sm" mb={2}>Context</Heading>
                    <Box
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      p={3}
                      borderRadius="md"
                    >
                      <pre>{JSON.stringify(selectedLog.context, null, 2)}</pre>
                    </Box>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                leftIcon={<FiSend />}
                colorScheme="brand"
                mr={3}
                onClick={onClose}
              >
                Retry Query
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default Logs;