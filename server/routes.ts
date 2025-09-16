import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerOptimizeRoutes } from "./routes/api/optimize";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register optimization API routes
  registerOptimizeRoutes(app);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
