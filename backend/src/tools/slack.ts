import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import axios from "axios";
import { getConfig } from "../config";
import { logger } from "../utils/logger";

/**
 * Register Slack tools with the MCP server
 */
export async function registerSlackTools(server: McpServer) {
  const config = getConfig();
  
  if (!config.slack.enabled) {
    logger.warn("Slack integration disabled. Skipping Slack tools registration.");
    return;
  }
  
  logger.info("Registering Slack tools...");
  
  // Slack API client setup
  const slackClient = axios.create({
    baseURL: "https://slack.com/api",
    headers: {
      Authorization: `Bearer ${config.slack.token}`,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
  
  // List channels tool
  server.tool(
    "slack_list_channels",
    "Slack List Channels",
    {
      limit: z.number().optional().default(100),
      exclude_archived: z.boolean().optional().default(true)
    },
    async ({ limit, exclude_archived }) => {
      try {
        const response = await slackClient.get("/conversations.list", {
          params: { limit, exclude_archived, types: "public_channel,private_channel" }
        });
        
        if (!response.data.ok) {
          throw new Error(response.data.error);
        }
        
        const channels = response.data.channels.map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          is_private: channel.is_private,
          is_archived: channel.is_archived,
          topic: channel.topic?.value,
          purpose: channel.purpose?.value,
          num_members: channel.num_members
        }));
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ channels })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error listing Slack channels: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to list channels", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Get channel history tool
  server.tool(
    "slack_get_channel_history",
    "Slack Get Channel History",
    {
      channel: z.string(),
      limit: z.number().optional().default(50),
      oldest: z.string().optional(), // Unix timestamp
      latest: z.string().optional() // Unix timestamp
    },
    async ({ channel, limit, oldest, latest }) => {
      try {
        const response = await slackClient.get("/conversations.history", {
          params: { channel, limit, oldest, latest }
        });
        
        if (!response.data.ok) {
          throw new Error(response.data.error);
        }
        
        const messages = response.data.messages.map((message: any) => ({
          type: message.type,
          user: message.user,
          text: message.text,
          ts: message.ts,
          thread_ts: message.thread_ts,
          reply_count: message.reply_count,
          reactions: message.reactions
        }));
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                messages,
                has_more: response.data.has_more
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error fetching Slack channel history: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to get channel history", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Send message tool
  server.tool(
    "slack_send_message",
    "Slack Send Message",
    {
      channel: z.string(),
      text: z.string(),
      thread_ts: z.string().optional(), // Reply in thread if provided
      unfurl_links: z.boolean().optional().default(true),
      unfurl_media: z.boolean().optional().default(true)
    },
    async ({ channel, text, thread_ts, unfurl_links, unfurl_media }) => {
      try {
        const response = await slackClient.post("/chat.postMessage", {
          channel,
          text,
          thread_ts,
          unfurl_links,
          unfurl_media
        });
        
        if (!response.data.ok) {
          throw new Error(response.data.error);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ts: response.data.ts,
                channel: response.data.channel,
                message: {
                  text: response.data.message.text,
                  user: response.data.message.user,
                  bot_id: response.data.message.bot_id,
                  ts: response.data.message.ts
                }
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error sending Slack message: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to send message", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Update message tool
  server.tool(
    "slack_update_message",
    "Slack Update Message",
    {
      channel: z.string(),
      ts: z.string(), // Timestamp of message to update
      text: z.string()
    },
    async ({ channel, ts, text }) => {
      try {
        const response = await slackClient.post("/chat.update", {
          channel,
          ts,
          text
        });
        
        if (!response.data.ok) {
          throw new Error(response.data.error);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ts: response.data.ts,
                channel: response.data.channel,
                text: response.data.text
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error updating Slack message: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to update message", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  // Add reaction tool
  server.tool(
    "slack_add_reaction",
    "Slack Add Reaction",
    {
      channel: z.string(),
      timestamp: z.string(),
      name: z.string() // Emoji name without colons
    },
    async ({ channel, timestamp, name }) => {
      try {
        const response = await slackClient.post("/reactions.add", {
          channel,
          timestamp,
          name
        });
        
        if (!response.data.ok) {
          throw new Error(response.data.error);
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                reaction: name
              })
            }
          ]
        };
      } catch (error: any) {
        logger.error(`Error adding Slack reaction: ${error.message}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to add reaction", details: error.message })
            }
          ]
        };
      }
    }
  );
  
  logger.info("Slack tools registered successfully");
}