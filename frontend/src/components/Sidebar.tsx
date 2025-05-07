// frontend/src/components/Sidebar.tsx
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Icon,
  Link,
  VStack,
  CloseButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiTool,
  FiList,
  FiSettings,
  FiMessageSquare,
} from 'react-icons/fi';

interface SidebarProps {
  onClose?: () => void;
}

interface LinkItemProps {
  name: string;
  icon: React.ReactElement;
  path: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: <Icon as={FiHome} />, path: '/' },
  { name: 'Agents', icon: <Icon as={FiUsers} />, path: '/agents' },
  { name: 'Tools', icon: <Icon as={FiTool} />, path: '/tools' },
  { name: 'Logs', icon: <Icon as={FiList} />, path: '/logs' },
  { name: 'Chat', icon: <Icon as={FiMessageSquare} />, path: '/chat' },
  { name: 'Settings', icon: <Icon as={FiSettings} />, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const activeColor = useColorModeValue('brand.600', 'white');
  const inactiveBg = useColorModeValue('white', 'gray.800');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      w={{ base: 'full', md: '260px' }}
      h="full"
      borderRightWidth={{ base: 0, md: 1 }}
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color={useColorModeValue('brand.500', 'white')}
        >
          AgentDock
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      <VStack spacing={0} align="stretch" px={3}>
        {LinkItems.map((link) => {
          const isActive = location.pathname === link.path || 
            (link.path !== '/' && location.pathname.startsWith(link.path));
          
          return (
            <Link
              key={link.name}
              as={RouterLink}
              to={link.path}
              style={{ textDecoration: 'none' }}
              _focus={{ boxShadow: 'none' }}
            >
              <Flex
                align="center"
                p="4"
                mx="1"
                my="1"
                role="group"
                cursor="pointer"
                borderRadius="lg"
                bg={isActive ? activeBg : inactiveBg}
                color={isActive ? activeColor : inactiveColor}
                fontWeight={isActive ? 'semibold' : 'medium'}
                _hover={{
                  bg: activeBg,
                  color: activeColor,
                }}
                transition="all 0.2s"
              >
                {link.icon}
                <Text ml="4">{link.name}</Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>
      
      <Flex
        direction="column"
        position="absolute"
        bottom="0"
        w="full"
        p={4}
        borderTopWidth={1}
        borderTopColor={useColorModeValue('gray.200', 'gray.700')}
        bg={useColorModeValue('gray.50', 'gray.800')}
      >
        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center">
          AgentDock v1.0.0
        </Text>
      </Flex>
    </Box>
  );
};

export default Sidebar;