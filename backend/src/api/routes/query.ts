// backend/src/api/routes/query.ts
import express, { Request, Response } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { groqClient } from "../../services/groq";
import { getConfig } from "../../config";
import { logger } from "../../utils/logger";

const router = express.Router();
const config = getConfig();

// Define the query request schema
const QueryRequestSchema = z.object({
  query: z.string().min(1),
  agent: z.string().optional(),
  context: z.record(z.any()).optional()
});

// Define the schema for logging queries and responses
const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  query: z.string(),
  response: z.string(),
  agent: z.string().optional(),
  context: z.record(z.any()).optional(),
  responseTime: z.number()
});

type LogEntry = z.infer<typeof LogEntrySchema>;

/**
 * Process a natural language query
 */
router.post("/", async (req: Request, res: Response): Promise<any> => {
  const startTime = Date.now();
  let logEntry: Partial<LogEntry> = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    query: "",
    response: "",
    responseTime: 0
  };

  try {
    logger.info(`Process a natural language query`);
    const { query, agent, context } = QueryRequestSchema.parse(req.body);
    logEntry.query = query;
    logEntry.agent = agent;
    logEntry.context = context;

    let response: string;

    // Process query with specific agent if provided
    if (agent) {
      const agentPath = path.join(process.cwd(), config.agents.registryPath, `${agent}.json`);
      
      if (!fs.existsSync(agentPath)) {
        throw new Error(`Agent '${agent}' not found`);
      }
      
      const agentData = JSON.parse(fs.readFileSync(agentPath, "utf-8"));
      
      if (!agentData.enabled) {
        throw new Error(`Agent '${agent}' is disabled`);
      }
      
      logger.info(`Processing query with agent ${agent}: ${query}`);
      response = await groqClient.generateAgentResponse(
        agentData.name,
        agentData.description,
        query
      );
    } else {
      // Process general query
      logger.info(`Processing general query: ${query}`);
      response = await groqClient.processQuery(query);
    }

    // Calculate response time
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log the query and response
    logEntry = {
      ...logEntry,
      response,
      responseTime
    };
    
    logQueryResponse(logEntry as LogEntry);
    
    res.status(200).json({
      id: logEntry.id,
      response,
      responseTime
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.error(`Validation error processing query: ${error.message}`);
      return res.status(400).json({
        error: "Invalid query request",
        details: error.errors
      });
    }
    
    logger.error(`Error processing query: ${error.message}`);
    
    // Log the error
    logEntry.response = `Error: ${error.message}`;
    logEntry.responseTime = Date.now() - startTime;
    logQueryResponse(logEntry as LogEntry);
    
    res.status(500).json({ error: "Failed to process query", details: error.message });
  }
});

/**
 * Log query and response to file system
 */
function logQueryResponse(logEntry: LogEntry) {
  try {
    const logsDir = path.join(process.cwd(), "logs");
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const queryLogsDir = path.join(logsDir, "queries");
    
    if (!fs.existsSync(queryLogsDir)) {
      fs.mkdirSync(queryLogsDir, { recursive: true });
    }
    
    const logFilePath = path.join(queryLogsDir, `${logEntry.id}.json`);
    fs.writeFileSync(logFilePath, JSON.stringify(logEntry, null, 2));
    
    // Also append to a daily log file
    const today = new Date().toISOString().split("T")[0];
    const dailyLogPath = path.join(queryLogsDir, `${today}.jsonl`);
    
    fs.appendFileSync(dailyLogPath, JSON.stringify(logEntry) + "\n");
  } catch (error: any) {
    logger.error(`Error logging query response: ${error.message}`);
  }
}

export const queryRoutes = router;