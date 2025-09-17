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

  // Register optimization API routes (keep them public for demo)
  registerOptimizeRoutes(app);
  
  // Register content optimization routes (protected)
  registerContentRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
