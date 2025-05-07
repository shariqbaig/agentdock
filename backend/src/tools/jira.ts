import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import axios from "axios";
import { getConfig } from "../config";
import { logger } from "../utils/logger";

/**
 * Register Jira tools with the MCP server
 */
export async function registerJiraTools(server: McpServer) {
  const config = getConfig();
  
  if (!config.jira.enabled) {
    logger.warn("Jira integration disabled. Skipping Jira tools registration.");
    return;
  }
  
  logger.info("Registering Jira tools...");
  
  // Jira API client setup
  const jiraClient = axios.create({
    baseURL: `${config.jira.host}/rest/api/2`,
    auth: {
      username: config.jira.username || "",
      password: config.jira.apiToken || ""
    },
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  // Search issues with JQL tool
  server.tool(
    "jira_search_issues",
    {
      jql: z.string(),
      maxResults: z.number().optional().default(50),
      startAt: z.number().optional().default(0),
      fields: z.array(z.string()).optional().default([
        "summary", "status", "assignee", "reporter", "priority",
        "issuetype", "created", "updated", "description"
      ])
    },
    async ({ jql, maxResults, startAt, fields }) => {
      try {
        const response = await jiraClient.post("/search", {
          jql,
          maxResults,
          startAt,
          fields
        });
        
        const issues = response.data.issues.map((issue: any) => ({
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status?.name,
          assignee: issue.fields.assignee ? {
            name: issue.fields.assignee.displayName,
            email: issue.fields.assignee.emailAddress
          } : null,
          reporter: issue.fields.reporter ? {
            name: issue.fields.reporter.displayName,
            email: issue.fields.reporter.emailAddress
          } : null,
          priority: issue.fields.priority?.name,
          issuetype: issue.fields.issuetype?.name,
          created: issue.fields.created,
          updated: issue.fields.updated,
          description: issue.fields.description
        }));
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                issues,
                total: response.data.total,
                startAt: response.data.startAt,
                maxResults: response.data.maxResults
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error searching Jira issues: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to search issues", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Get issue details tool
  server.tool(
    "jira_get_issue",
    {
      issueKey: z.string(),
      fields: z.array(z.string()).optional().default([
        "summary", "status", "assignee", "reporter", "priority",
        "issuetype", "created", "updated", "description", "comment"
      ])
    },
    async ({ issueKey, fields }) => {
      try {
        const response = await jiraClient.get(`/issue/${issueKey}`, {
          params: { fields: fields.join(",") }
        });
        
        const issue = response.data;
        
        // Format the issue data
        const formattedIssue = {
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status?.name,
          assignee: issue.fields.assignee ? {
            name: issue.fields.assignee.displayName,
            email: issue.fields.assignee.emailAddress
          } : null,
          reporter: issue.fields.reporter ? {
            name: issue.fields.reporter.displayName,
            email: issue.fields.reporter.emailAddress
          } : null,
          priority: issue.fields.priority?.name,
          issuetype: issue.fields.issuetype?.name,
          created: issue.fields.created,
          updated: issue.fields.updated,
          description: issue.fields.description,
          comments: issue.fields.comment ? issue.fields.comment.comments.map((comment: any) => ({
            id: comment.id,
            author: {
              name: comment.author.displayName,
              email: comment.author.emailAddress
            },
            body: comment.body,
            created: comment.created,
            updated: comment.updated
          })) : []
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedIssue)
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error fetching Jira issue details: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to get issue details", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Create issue tool
  server.tool(
    "jira_create_issue",
    {
      projectKey: z.string(),
      summary: z.string(),
      description: z.string().optional(),
      issueType: z.string().default("Task"),
      priority: z.string().optional(),
      assignee: z.string().optional(),
      labels: z.array(z.string()).optional(),
      components: z.array(z.string()).optional(),
      customFields: z.record(z.any()).optional() // For custom fields
    },
    async ({ projectKey, summary, description, issueType, priority, assignee, labels, components, customFields }) => {
      try {
        // Build the issue creation payload
        const payload: any = {
          fields: {
            project: { key: projectKey },
            summary,
            issuetype: { name: issueType }
          }
        };
        
        // Add optional fields if provided
        if (description) payload.fields.description = description;
        if (priority) payload.fields.priority = { name: priority };
        if (assignee) payload.fields.assignee = { name: assignee };
        if (labels) payload.fields.labels = labels;
        if (components) payload.fields.components = components.map(name => ({ name }));
        
        // Add custom fields if provided
        if (customFields) {
          Object.entries(customFields).forEach(([key, value]) => {
            payload.fields[key] = value;
          });
        }
        
        const response = await jiraClient.post("/issue", payload);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: response.data.id,
                key: response.data.key,
                self: response.data.self
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error creating Jira issue: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to create issue", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Update issue tool
  server.tool(
    "jira_update_issue",
    {
      issueKey: z.string(),
      summary: z.string().optional(),
      description: z.string().optional(),
      assignee: z.string().optional(),
      priority: z.string().optional(),
      labels: z.array(z.string()).optional(),
      components: z.array(z.string()).optional(),
      customFields: z.record(z.any()).optional() // For custom fields
    },
    async ({ issueKey, summary, description, assignee, priority, labels, components, customFields }) => {
      try {
        // Build the issue update payload
        const payload: any = {
          fields: {}
        };
        
        // Add fields if provided
        if (summary) payload.fields.summary = summary;
        if (description) payload.fields.description = description;
        if (assignee) payload.fields.assignee = { name: assignee };
        if (priority) payload.fields.priority = { name: priority };
        if (labels) payload.fields.labels = labels;
        if (components) payload.fields.components = components.map(name => ({ name }));
        
        // Add custom fields if provided
        if (customFields) {
          Object.entries(customFields).forEach(([key, value]) => {
            payload.fields[key] = value;
          });
        }
        
        await jiraClient.put(`/issue/${issueKey}`, payload);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Issue ${issueKey} updated successfully`
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error updating Jira issue: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to update issue", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Add comment to issue tool
  server.tool(
    "jira_add_comment",
    {
      issueKey: z.string(),
      comment: z.string()
    },
    async ({ issueKey, comment }) => {
      try {
        const response = await jiraClient.post(`/issue/${issueKey}/comment`, {
          body: comment
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: response.data.id,
                author: {
                  name: response.data.author.displayName,
                  email: response.data.author.emailAddress
                },
                body: response.data.body,
                created: response.data.created,
                updated: response.data.updated
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error adding comment to Jira issue: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to add comment", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Transition issue tool
  server.tool(
    "jira_transition_issue",
    {
      issueKey: z.string(),
      transitionId: z.string().optional(),
      transitionName: z.string().optional(),
      comment: z.string().optional(),
      resolution: z.string().optional()
    },
    async ({ issueKey, transitionId, transitionName, comment, resolution }) => {
      try {
        // If transitionName is provided but not transitionId, find the transition ID
        if (transitionName && !transitionId) {
          const transitionsResponse = await jiraClient.get(`/issue/${issueKey}/transitions`);
          const transition = transitionsResponse.data.transitions.find(
            (t: any) => t.name.toLowerCase() === transitionName.toLowerCase()
          );
          
          if (!transition) {
            throw new Error(`Transition '${transitionName}' not found`);
          }
          
          transitionId = transition.id;
        }
        
        if (!transitionId) {
          throw new Error("Either transitionId or transitionName must be provided");
        }
        
        const payload: any = {
          transition: { id: transitionId }
        };
        
        if (comment) {
          payload.update = {
            comment: [
              {
                add: { body: comment }
              }
            ]
          };
        }
        
        if (resolution) {
          payload.fields = {
            resolution: { name: resolution }
          };
        }
        
        await jiraClient.post(`/issue/${issueKey}/transitions`, payload);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Issue ${issueKey} transitioned successfully`
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error transitioning Jira issue: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to transition issue", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  logger.info("Jira tools registered successfully");
}