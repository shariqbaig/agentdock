// backend/src/server/mcpServer.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import { logger } from "../utils/logger";
import { registerGitHubTools } from "../tools/github";
import { registerSlackTools } from "../tools/slack";
import { registerJiraTools } from "../tools/jira";
import { getConfig } from "../config";

/**
 * Creates and configures the MCP server with tools and resources
 */
export async function createMCPServer() {
  const config = getConfig();
  
  // Create MCP server
  const server = new McpServer({
    name: "AgentDock",
    version: "1.0.0",
    description: "Multi-Agent MCP Server with tool integrations"
  });

  logger.info("Initializing AgentDock MCP Server...");

  // Register tool integrations
  await registerGitHubTools(server);
  await registerSlackTools(server);
  await registerJiraTools(server);

  // Register example resource
  server.resource(
    "agents",
    new ResourceTemplate("agents://{name}", { 
      list: async () => ({
        resources: [
          {
            name: "All Agents",
            uri: "agents://all",
            description: "Information about all registered agents"
          }
        ]
      })
    }),
    async (uri, { name }) => {
      if (name === "all") {
        // Get all registered agents
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({
              agents: [
                { name: "GitHubSync", description: "Synchronizes with GitHub repositories and provides PR information" },
                { name: "SlackAgent", description: "Interacts with Slack channels and messages" },
                { name: "JiraAgent", description: "Manages Jira tickets and workflows" }
              ]
            })
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: `Agent information for ${name}`
        }]
      };
    }
  );

  // Start the server with the appropriate transport
  if (config.server.transport === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("MCP Server started with stdio transport");
  } else {
    const port = config.server.port || 3001;
    // Create HTTP transport
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => Math.random().toString(36).substring(2, 15),
    });
    await server.connect(transport);
    logger.info(`MCP Server started with HTTP transport on port ${port}`);
  }

  return server;
}