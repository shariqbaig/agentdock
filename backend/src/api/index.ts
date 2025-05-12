import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { getConfig } from "../config";
import { logger } from "../utils/logger";
import { agentRoutes } from "./routes/agents";
import { toolRoutes } from "./routes/tools";
import { queryRoutes } from "./routes/query";
import { logsRoutes } from "./routes/logs";

/**
 * Configure and start the REST API server
 */
export function setupRESTApi() {
  const app = express();
  const config = getConfig();
  const port = config.server.port;

  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`API Error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // Register routes
  app.use("/api/agents", agentRoutes);
  app.use("/api/tools", toolRoutes);
  app.use("/api/query", queryRoutes);
  app.use("/api/logs", logsRoutes);

  // Start the server
  return app.listen(port, () => {
    logger.info(`REST API server started on port ${port}`);
  });
}