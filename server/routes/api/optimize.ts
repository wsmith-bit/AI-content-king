import type { Express, Request, Response } from "express";
import { SEOOptimizerService } from "../../services/seo-optimizer";

export function registerOptimizeRoutes(app: Express) {
  const seoService = new SEOOptimizerService();

  // Get SEO metadata and Schema.org markup
  app.get("/api/optimize/seo-metadata", (req: Request, res: Response) => {
    try {
      const metadata = seoService.generateSEOMetadata();
      res.json(metadata);
    } catch (error) {
      console.error("Error generating SEO metadata:", error);
      res.status(500).json({ 
        error: "Failed to generate SEO metadata",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Optimize content for AI discovery
  app.post("/api/optimize/content", (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ 
          error: "Invalid content provided",
          message: "Content must be a non-empty string"
        });
      }

      const optimization = seoService.optimizeContent(content);
      res.json(optimization);
    } catch (error) {
      console.error("Error optimizing content:", error);
      res.status(500).json({ 
        error: "Failed to optimize content",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate AI-ready content
  app.post("/api/optimize/ai-ready", (req: Request, res: Response) => {
    try {
      const { rawContent } = req.body;
      
      if (!rawContent || typeof rawContent !== 'string') {
        return res.status(400).json({ 
          error: "Invalid content provided",
          message: "Raw content must be a non-empty string"
        });
      }

      const aiOptimized = seoService.generateAIReadyContent(rawContent);
      res.json(aiOptimized);
    } catch (error) {
      console.error("Error generating AI-ready content:", error);
      res.status(500).json({ 
        error: "Failed to generate AI-ready content",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get optimization checklist status
  app.get("/api/optimize/checklist", (req: Request, res: Response) => {
    try {
      const metadata = seoService.generateSEOMetadata();
      res.json({
        checklist: metadata.checklist,
        completionPercentage: calculateCompletionPercentage(metadata.checklist)
      });
    } catch (error) {
      console.error("Error getting checklist:", error);
      res.status(500).json({ 
        error: "Failed to get optimization checklist",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}

function calculateCompletionPercentage(checklist: any): number {
  let totalChecks = 0;
  let completedChecks = 0;

  Object.values(checklist).forEach((section: any) => {
    Object.values(section).forEach((check: any) => {
      totalChecks++;
      if (check === true) {
        completedChecks++;
      }
    });
  });

  return totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
}
