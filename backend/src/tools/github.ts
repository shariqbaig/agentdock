import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import { getConfig } from "../config.js";
import { logger } from "../utils/logger.js";

/**
 * Register GitHub tools with the MCP server
 */
export async function registerGitHubTools(server: McpServer) {
  const config = getConfig();
  
  if (!config.github.enabled) {
    logger.warn("GitHub integration disabled. Skipping GitHub tools registration.");
    return;
  }
  
  logger.info("Registering GitHub tools...");
  
  // GitHub API client setup
  const githubClient = axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `token ${config.github.token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });
  
  // List repositories tool
  server.tool(
    "github_list_repos",
    z.object({
      page: z.number().optional().default(1),
      per_page: z.number().optional().default(30)
    }),
    async ({ page, per_page }) => {
      try {
        const response = await githubClient.get("/user/repos", {
          params: { page, per_page, sort: "updated" }
        });
        
        const repos = response.data.map((repo: any) => ({
          name: repo.name,
          description: repo.description,
          full_name: repo.full_name,
          html_url: repo.html_url,
          language: repo.language,
          updated_at: repo.updated_at
        }));
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ repos, page, per_page, total_count: repos.length })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error listing GitHub repositories: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to list repositories", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Get PR details tool
  server.tool(
    "github_get_pr",
    z.object({
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number()
    }),
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await githubClient.get(`/repos/${owner}/${repo}/pulls/${pull_number}`);
        const pr = response.data;
        
        // Get PR reviews
        const reviewsResponse = await githubClient.get(`/repos/${owner}/${repo}/pulls/${pull_number}/reviews`);
        const reviews = reviewsResponse.data;
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: pr.id,
                number: pr.number,
                title: pr.title,
                state: pr.state,
                user: {
                  login: pr.user.login,
                  avatar_url: pr.user.avatar_url
                },
                body: pr.body,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                html_url: pr.html_url,
                diff_url: pr.diff_url,
                additions: pr.additions,
                deletions: pr.deletions,
                changed_files: pr.changed_files,
                reviews: reviews.map((review: any) => ({
                  id: review.id,
                  user: {
                    login: review.user.login,
                    avatar_url: review.user.avatar_url
                  },
                  body: review.body,
                  state: review.state,
                  submitted_at: review.submitted_at
                }))
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error fetching GitHub PR details: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to get PR details", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Create comment on PR tool
  server.tool(
    "github_create_pr_comment",
    z.object({
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
      body: z.string()
    }),
    async ({ owner, repo, pull_number, body }) => {
      try {
        const response = await githubClient.post(
          `/repos/${owner}/${repo}/issues/${pull_number}/comments`,
          { body }
        );
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: response.data.id,
                html_url: response.data.html_url,
                body: response.data.body,
                created_at: response.data.created_at
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error creating GitHub PR comment: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to create PR comment", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Trigger CI/CD workflow tool
  server.tool(
    "github_trigger_workflow",
    z.object({
      owner: z.string(),
      repo: z.string(),
      workflow_id: z.string(), // Can be workflow file name or ID
      ref: z.string().default("main"), // Branch or tag reference
      inputs: z.record(z.string()).optional() // Workflow inputs if any
    }),
    async ({ owner, repo, workflow_id, ref, inputs }) => {
      try {
        const response = await githubClient.post(
          `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
          { ref, inputs }
        );
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Workflow ${workflow_id} triggered successfully on ${ref}`,
                status: response.status
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error triggering GitHub workflow: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to trigger workflow", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  logger.info("GitHub tools registered successfully");
}