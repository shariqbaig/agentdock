// backend/src/index.ts
import { createMCPServer } from './server/mcpServer.js';
import { setupRESTApi } from './api/index.js';
import { getConfig } from './config.js';
import { logger } from './utils/logger.js';

/**
 * Main application entry point
 */
async function main() {
  try {
    // Initialize configuration
    const config = getConfig();
    
    // Log startup information
    logger.info('Starting AgentDock application...');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Start MCP server
    const mcpServer = await createMCPServer();
    
    // Start REST API server if configured for HTTP transport
    if (config.server.transport === 'http') {
      setupRESTApi();
    }
    
    logger.info('AgentDock application started successfully');
    
    // Handle shutdown gracefully
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    function shutdown() {
      logger.info('Shutting down AgentDock application...');
      process.exit(0);
    }
  } catch (error: any) {
    logger.error(`Error starting application: ${error.message}`);
    process.exit(1);
  }
}

// Run the application
main();