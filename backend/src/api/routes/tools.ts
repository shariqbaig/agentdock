// backend/src/api/routes/tools.ts
import express, { Request, Response } from "express";
import { z } from "zod";
import { getConfig } from "../../config.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

// Define available tool categories
const availableTools = {
  github: [
    {
      name: "github_list_repos",
      description: "List GitHub repositories for the authenticated user",
      enabled: true
    },
    {
      name: "github_get_pr",
      description: "Get details of a GitHub Pull Request",
      enabled: true
    },
    {
      name: "github_create_pr_comment",
      description: "Create a comment on a GitHub Pull Request",
      enabled: true
    },
    {
      name: "github_trigger_workflow",
      description: "Trigger a GitHub Actions workflow",
      enabled: true
    }
  ],
  slack: [
    {
      name: "slack_list_channels",
      description: "List available Slack channels",
      enabled: true
    },
    {
      name: "slack_get_channel_history",
      description: "Get message history from a Slack channel",
      enabled: true
    },
    {
      name: "slack_send_message",
      description: "Send a message to a Slack channel",
      enabled: true
    },
    {
      name: "slack_update_message",
      description: "Update an existing Slack message",
      enabled: true
    },
    {
      name: "slack_add_reaction",
      description: "Add a reaction to a Slack message",
      enabled: true
    }
  ],
  jira: [
    {
      name: "jira_search_issues",
      description: "Search Jira issues using JQL",
      enabled: true
    },
    {
      name: "jira_get_issue",
      description: "Get details of a specific Jira issue",
      enabled: true
    },
    {
      name: "jira_create_issue",
      description: "Create a new Jira issue",
      enabled: true
    },
    {
      name: "jira_update_issue",
      description: "Update an existing Jira issue",
      enabled: true
    },
    {
      name: "jira_add_comment",
      description: "Add a comment to a Jira issue",
      enabled: true
    },
    {
      name: "jira_transition_issue",
      description: "Transition a Jira issue to a new status",
      enabled: true
    }
  ]
};

/**
 * Get all available tool categories
 */
router.get("/categories", (req: Request, res: Response) => {
  try {
    const config = getConfig();
    
    // Set enabled status based on configuration
    const categories = {
      github: {
        name: "GitHub",
        description: "GitHub repository management and CI/CD tools",
        enabled: config.github.enabled
      },
      slack: {
        name: "Slack",
        description: "Slack messaging and channel management tools",
        enabled: config.slack.enabled
      },
      jira: {
        name: "Jira",
        description: "Jira issue tracking and project management tools",
        enabled: config.jira.enabled
      }
    };
    
    res.status(200).json(categories);
  } catch (error: any) {
    logger.error(`Error getting tool categories: ${error.message}`);
    res.status(500).json({ error: "Failed to get tool categories", details: error.message });
  }
});

/**
 * Get tools for a specific category
 */
router.get("/category/:category", (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    // Check if category exists
    if (!(category in availableTools)) {
      return res.status(404).json({ error: `Tool category '${category}' not found` });
    }
    
    const config = getConfig();
    let tools = availableTools[category as keyof typeof availableTools];
    
    // Filter out disabled tools based on config
    const categoryEnabled = config[category as keyof typeof config]?.enabled || false;
    if (!categoryEnabled) {
      tools = tools.map(tool => ({ ...tool, enabled: false }));
    }
    
    res.status(200).json(tools);
  } catch (error: any) {
    logger.error(`Error getting tools for category: ${error.message}`);
    res.status(500).json({ error: "Failed to get tools for category", details: error.message });
  }
});

/**
 * Get all available tools
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const config = getConfig();
    
    // Combine all tools and set enabled status based on configuration
    const allTools = Object.entries(availableTools).flatMap(([category, tools]) => {
      const categoryEnabled = config[category as keyof typeof config]?.enabled || false;
      return tools.map(tool => ({
        ...tool,
        category,
        enabled: categoryEnabled && tool.enabled
      }));
    });
    
    res.status(200).json(allTools);
  } catch (error: any) {
    logger.error(`Error getting all tools: ${error.message}`);
    res.status(500).json({ error: "Failed to get all tools", details: error.message });
  }
});

/**
 * Get details for a specific tool
 */
router.get("/:toolName", (req: Request, res: Response) => {
  try {
    const { toolName } = req.params;
    
    // Find the tool in any category
    for (const [category, tools] of Object.entries(availableTools)) {
      const tool = tools.find(t => t.name === toolName);
      
      if (tool) {
        const config = getConfig();
        const categoryEnabled = config[category as keyof typeof config]?.enabled || false;
        
        return res.status(200).json({
          ...tool,
          category,
          enabled: categoryEnabled && tool.enabled
        });
      }
    }
    
    res.status(404).json({ error: `Tool '${toolName}' not found` });
  } catch (error: any) {
    logger.error(`Error getting tool details: ${error.message}`);
    res.status(500).json({ error: "Failed to get tool details", details: error.message });
  }
});

/**
 * Register a custom tool (for future extensibility)
 */
router.post("/custom", (req: Request, res: Response) => {
  try {
    // This is a placeholder for future extensibility
    // In a production implementation, this would validate and register
    // custom tools dynamically
    
    res.status(501).json({ error: "Custom tool registration not implemented yet" });
  } catch (error: any) {
    logger.error(`Error registering custom tool: ${error.message}`);
    res.status(500).json({ error: "Failed to register custom tool", details: error.message });
  }
});

export const toolRoutes = router;