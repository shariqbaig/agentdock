// frontend/src/components/Navbar.tsx
import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  InputGroup,
  Input,
  InputRightElement,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  onMenuOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuOpen }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      position="fixed"
      top="0"
      width="100%"
      zIndex="1000"
      bg={navBg}
      borderBottom="1px"
      borderBottomColor={borderColor}
    >
      <Flex
        h="64px"
        alignItems="center"
        justifyContent="space-between"
        px={{ base: 4, md: 8 }}
      >
        <Flex alignItems="center">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onMenuOpen}
            variant="ghost"
            aria-label="open menu"
            icon={<HamburgerIcon />}
            mr={2}
          />
          
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={useColorModeValue('brand.500', 'white')}
              display={{ base: 'none', md: 'block' }}
            >
              AgentDock
            </Text>
          </Link>
        </Flex>

        <HStack spacing={2} flex="1" mx={8}>
          <InputGroup maxW="600px" mx="auto">
            <Input 
              placeholder="Ask anything..."
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.700')}
              _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
            />
            <InputRightElement>
              <IconButton
                aria-label="Search"
                icon={<SearchIcon />}
                variant="ghost"
                borderRadius="full"
              />
            </InputRightElement>
          </InputGroup>
        </HStack>

        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <Avatar size="sm" src="https://bit.ly/broken-link" />
            </MenuButton>
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuDivider />
              <MenuItem>Documentation</MenuItem>
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;