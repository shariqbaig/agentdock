import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { getConfig } from "../../config.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();

// Define pagination parameters schema
const PaginationSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  sort: z.enum(["asc", "desc"]).optional().default("desc")
});

/**
 * Get paginated query logs
 */
router.get("/queries", (req: Request, res: Response) => {
  try {
    const { page, limit, sort } = PaginationSchema.parse(req.query);
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const queryLogsDir = path.join(process.cwd(), "logs", "queries");
    
    if (!fs.existsSync(queryLogsDir)) {
      fs.mkdirSync(queryLogsDir, { recursive: true });
      return res.status(200).json({
        logs: [],
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: 0,
          totalPages: 0
        }
      });
    }
    
    // Get list of log files (ignore daily logs)
    const logFiles = fs.readdirSync(queryLogsDir)
      .filter(file => file.endsWith(".json"));
    
    // Sort log files by creation time
    const sortedLogFiles = logFiles.sort((a, b) => {
      const aStats = fs.statSync(path.join(queryLogsDir, a));
      const bStats = fs.statSync(path.join(queryLogsDir, b));
      
      return sort === "desc"
        ? bStats.birthtimeMs - aStats.birthtimeMs
        : aStats.birthtimeMs - bStats.birthtimeMs;
    });
    
    // Paginate logs
    const totalLogs = sortedLogFiles.length;
    const totalPages = Math.ceil(totalLogs / limitNumber);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = Math.min(startIndex + limitNumber, totalLogs);
    
    const paginatedLogFiles = sortedLogFiles.slice(startIndex, endIndex);
    
    // Read log files
    const logs = paginatedLogFiles.map(file => {
      const filePath = path.join(queryLogsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent);
    });
    
    res.status(200).json({
      logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalLogs,
        totalPages
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.error(`Validation error getting query logs: ${error.message}`);
      return res.status(400).json({
        error: "Invalid pagination parameters",
        details: error.errors
      });
    }
    
    logger.error(`Error getting query logs: ${error.message}`);
    res.status(500).json({ error: "Failed to get query logs", details: error.message });
  }
});

/**
 * Get a specific query log by ID
 */
router.get("/queries/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logFilePath = path.join(process.cwd(), "logs", "queries", `${id}.json`);
    
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ error: `Log with ID '${id}' not found` });
    }
    
    const fileContent = fs.readFileSync(logFilePath, "utf-8");
    const log = JSON.parse(fileContent);
    
    res.status(200).json(log);
  } catch (error: any) {
    logger.error(`Error getting query log: ${error.message}`);
    res.status(500).json({ error: "Failed to get query log", details: error.message });
  }
});

/**
 * Get daily logs for a specific date
 */
router.get("/daily/:date", (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: "Invalid date format",
        details: "Date must be in the format YYYY-MM-DD"
      });
    }
    
    const dailyLogPath = path.join(process.cwd(), "logs", "queries", `${date}.jsonl`);
    
    if (!fs.existsSync(dailyLogPath)) {
      return res.status(404).json({ error: `Daily log for '${date}' not found` });
    }
    
    // Read and parse JSONL file
    const fileContent = fs.readFileSync(dailyLogPath, "utf-8");
    const logs = fileContent
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => JSON.parse(line));
    
    res.status(200).json({ date, logs });
  } catch (error: any) {
    logger.error(`Error getting daily logs: ${error.message}`);
    res.status(500).json({ error: "Failed to get daily logs", details: error.message });
  }
});

/**
 * Get system logs
 */
router.get("/system", (req: Request, res: Response) => {
  try {
    const { lines = "100" } = req.query;
    const linesNumber = parseInt(lines as string);
    
    if (isNaN(linesNumber) || linesNumber < 1) {
      return res.status(400).json({
        error: "Invalid lines parameter",
        details: "Lines must be a positive integer"
      });
    }
    
    const logFilePath = path.join(process.cwd(), "logs", "combined.log");
    
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ error: "System log file not found" });
    }
    
    // Read the last N lines of the log file
    const fileContent = fs.readFileSync(logFilePath, "utf-8");
    const logLines = fileContent
      .split("\n")
      .filter(line => line.trim() !== "")
      .slice(-linesNumber);
    
    res.status(200).json({ logs: logLines });
  } catch (error: any) {
    logger.error(`Error getting system logs: ${error.message}`);
    res.status(500).json({ error: "Failed to get system logs", details: error.message });
  }
});

/**
 * Get error logs
 */
router.get("/errors", (req: Request, res: Response) => {
  try {
    const { lines = "100" } = req.query;
    const linesNumber = parseInt(lines as string);
    
    if (isNaN(linesNumber) || linesNumber < 1) {
      return res.status(400).json({
        error: "Invalid lines parameter",
        details: "Lines must be a positive integer"
      });
    }
    
    const logFilePath = path.join(process.cwd(), "logs", "error.log");
    
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ error: "Error log file not found" });
    }
    
    // Read the last N lines of the log file
    const fileContent = fs.readFileSync(logFilePath, "utf-8");
    const logLines = fileContent
      .split("\n")
      .filter(line => line.trim() !== "")
      .slice(-linesNumber);
    
    res.status(200).json({ logs: logLines });
  } catch (error: any) {
    logger.error(`Error getting error logs: ${error.message}`);
    res.status(500).json({ error: "Failed to get error logs", details: error.message });
  }
});

export const logsRoutes = router;