import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Define configuration schema
const ConfigSchema = z.object({
  server: z.object({
    port: z.number().default(3001),
    transport: z.enum(["stdio", "http"]).default("http"),
    logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
  }),
  groq: z.object({
    apiKey: z.string().min(1),
    model: z.string().default("llama-3.1-8b-instant"),
  }),
  github: z.object({
    token: z.string().optional(),
    enabled: z.boolean().default(false),
  }),
  slack: z.object({
    token: z.string().optional(),
    enabled: z.boolean().default(false),
  }),
  jira: z.object({
    host: z.string().optional(),
    username: z.string().optional(),
    apiToken: z.string().optional(),
    enabled: z.boolean().default(false),
  }),
  agents: z.object({
    registryPath: z.string().default("./data/agents"),
  }),
});

// Configuration type
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Get configuration from environment variables and defaults
 */
export function getConfig(): Config {
  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), "data");
  const agentsDir = path.resolve(dataDir, "agents");
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  // Parse configuration
  const config = {
    server: {
      port: parseInt(process.env.PORT || "3001"),
      transport: (process.env.TRANSPORT || "http") as "stdio" | "http",
      logLevel: (process.env.LOG_LEVEL || "info") as "error" | "warn" | "info" | "debug",
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || "[GROQ API KEY]", //random key for testing
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    },
    github: {
      token: process.env.GITHUB_TOKEN,
      enabled: process.env.GITHUB_TOKEN ? true : false,
    },
    slack: {
      token: process.env.SLACK_TOKEN,
      enabled: process.env.SLACK_TOKEN ? true : false,
    },
    jira: {
      host: process.env.JIRA_HOST,
      username: process.env.JIRA_USERNAME,
      apiToken: process.env.JIRA_API_TOKEN,
      enabled: process.env.JIRA_HOST && process.env.JIRA_USERNAME && process.env.JIRA_API_TOKEN ? true : false,
    },
    agents: {
      registryPath: process.env.AGENTS_REGISTRY_PATH || "./data/agents",
    },
  };

  // Validate configuration
  return ConfigSchema.parse(config);
}