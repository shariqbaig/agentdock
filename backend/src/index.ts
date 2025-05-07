import { createMCPServer } from './server/mcpServer';
import { setupRESTApi } from './api/index';
import { getConfig } from './config';
import { logger } from './utils/logger';

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