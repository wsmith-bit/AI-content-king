import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerOptimizeRoutes } from "./routes/api/optimize";
import { registerContentRoutes } from "./routes/api/content";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth API routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register content optimization routes (protected) - Enhanced with visual elements
  registerContentRoutes(app);
  
  // Legacy optimize routes (now safe - conflicting endpoint removed)
  registerOptimizeRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
