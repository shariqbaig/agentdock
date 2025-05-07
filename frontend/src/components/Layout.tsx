// frontend/src/components/Layout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  useColorMode,
} from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  return (
    <Flex flexDirection="column" height="100vh">
      <Navbar onMenuOpen={onOpen} />
      <Flex flex="1" overflow="hidden">
        {/* Sidebar for desktop */}
        <Box
          display={{ base: 'none', md: 'block' }}
          w="260px"
          position="fixed"
          top="64px"
          h="calc(100vh - 64px)"
          bg={useColorModeValue('white', 'gray.800')}
          borderRight="1px"
          borderRightColor={useColorModeValue('gray.200', 'gray.700')}
          overflowY="auto"
        >
          <Sidebar />
        </Box>

        {/* Drawer for mobile */}
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full"
        >
          <DrawerContent>
            <Sidebar onClose={onClose} />
          </DrawerContent>
        </Drawer>

        {/* Main content */}
        <Box
          ml={{ base: 0, md: '260px' }}
          p={4}
          flex="1"
          overflowY="auto"
          overflowX="hidden"
          bg={useColorModeValue('gray.50', 'gray.900')}
          h="calc(100vh - 64px)"
          mt="64px"
        >
          <Box
            maxW="1600px"
            mx="auto"
            h="100%"
          >
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;