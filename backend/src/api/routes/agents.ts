// backend/src/api/routes/agents.ts
import express, { Request, Response } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { getConfig } from "../../config.js";
import { logger } from "../../utils/logger.js";

const router = express.Router();
const config = getConfig();

// Agent validation schema
const AgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  config: z.record(z.any()).optional(),
  tools: z.array(z.string()).optional(),
  enabled: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

type Agent = z.infer<typeof AgentSchema>;

/**
 * Get all registered agents
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const agentsDir = path.resolve(process.cwd(), config.agents.registryPath);
    const files = fs.readdirSync(agentsDir);
    
    const agents = files
      .filter(file => file.endsWith(".json"))
      .map(file => {
        const filePath = path.join(agentsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent) as Agent;
      });
    
    res.status(200).json(agents);
  } catch (error: any) {
    logger.error(`Error getting agents: ${error.message}`);
    res.status(500).json({ error: "Failed to get agents", details: error.message });
  }
});

/**
 * Get a specific agent by name
 */
router.get("/:name", (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agentPath = path.join(process.cwd(), config.agents.registryPath, `${name}.json`);
    
    if (!fs.existsSync(agentPath)) {
      return res.status(404).json({ error: `Agent '${name}' not found` });
    }
    
    const fileContent = fs.readFileSync(agentPath, "utf-8");
    const agent = JSON.parse(fileContent) as Agent;
    
    res.status(200).json(agent);
  } catch (error: any) {
    logger.error(`Error getting agent: ${error.message}`);
    res.status(500).json({ error: "Failed to get agent", details: error.message });
  }
});

/**
 * Register a new agent
 */
router.post("/", (req: Request, res: Response) => {
  try {
    const agentData = AgentSchema.parse({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const agentsDir = path.resolve(process.cwd(), config.agents.registryPath);
    const agentPath = path.join(agentsDir, `${agentData.name}.json`);
    
    // Check if agent already exists
    if (fs.existsSync(agentPath)) {
      return res.status(409).json({ error: `Agent '${agentData.name}' already exists` });
    }
    
    // Save agent to file
    fs.writeFileSync(agentPath, JSON.stringify(agentData, null, 2));
    
    logger.info(`Agent '${agentData.name}' registered successfully`);
    res.status(201).json(agentData);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.error(`Validation error registering agent: ${error.message}`);
      return res.status(400).json({
        error: "Invalid agent data",
        details: error.errors
      });
    }
    
    logger.error(`Error registering agent: ${error.message}`);
    res.status(500).json({ error: "Failed to register agent", details: error.message });
  }
});

/**
 * Update an existing agent
 */
router.put("/:name", (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agentPath = path.join(process.cwd(), config.agents.registryPath, `${name}.json`);
    
    // Check if agent exists
    if (!fs.existsSync(agentPath)) {
      return res.status(404).json({ error: `Agent '${name}' not found` });
    }
    
    // Read existing agent data
    const existingData = JSON.parse(fs.readFileSync(agentPath, "utf-8")) as Agent;
    
    // Update agent data
    const agentData = AgentSchema.parse({
      ...existingData,
      ...req.body,
      name, // Ensure name doesn't change
      updatedAt: new Date().toISOString()
    });
    
    // Save updated agent to file
    fs.writeFileSync(agentPath, JSON.stringify(agentData, null, 2));
    
    logger.info(`Agent '${name}' updated successfully`);
    res.status(200).json(agentData);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.error(`Validation error updating agent: ${error.message}`);
      return res.status(400).json({
        error: "Invalid agent data",
        details: error.errors
      });
    }
    
    logger.error(`Error updating agent: ${error.message}`);
    res.status(500).json({ error: "Failed to update agent", details: error.message });
  }
});

/**
 * Delete an agent
 */
router.delete("/:name", (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agentPath = path.join(process.cwd(), config.agents.registryPath, `${name}.json`);
    
    // Check if agent exists
    if (!fs.existsSync(agentPath)) {
      return res.status(404).json({ error: `Agent '${name}' not found` });
    }
    
    // Delete agent file
    fs.unlinkSync(agentPath);
    
    logger.info(`Agent '${name}' deleted successfully`);
    res.status(204).send();
  } catch (error: any) {
    logger.error(`Error deleting agent: ${error.message}`);
    res.status(500).json({ error: "Failed to delete agent", details: error.message });
  }
});

export const agentRoutes = router;