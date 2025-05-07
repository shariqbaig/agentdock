import winston from "winston";
import { getConfig } from "../config.js";

const config = getConfig();

// Configure logger
export const logger = winston.createLogger({
  level: config.server.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});

// Create directory for logs
try {
  const fs = require("fs");
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
} catch (err) {
  console.error("Error creating logs directory:", err);
}