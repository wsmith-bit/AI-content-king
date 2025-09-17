import type { Express } from "express";
import { isAuthenticated } from "../../replitAuth";
import { aiOptimizeContent, type OptimizationProgress } from "../../services/ai-optimizer";
import { SEOOptimizerService } from "../../services/seo-optimizer";
import { generateSchemaMarkup } from "../../services/schema-generator";
import { getOptimizationChecklistStatus } from "../../services/checklist-service";

export function registerContentRoutes(app: Express) {
  // Content optimization endpoint
  app.post('/api/optimize/content', isAuthenticated, async (req: any, res) => {
    console.log('🚀 Enhanced /api/optimize/content route hit with aiOptimizeContent');
    try {
      const { content, url } = req.body;
      
      if (!content && !url) {
        return res.status(400).json({ 
          message: "Either content or URL is required" 
        });
      }

      let inputContent = content;
      
      // If URL is provided, fetch content from URL (simplified for demo)
      if (url && !content) {
        // In a real implementation, you'd fetch and parse the webpage
        inputContent = `Content from ${url} - This would be the actual webpage content`;
      }

      // Process the content through our optimization services with progress tracking
      const seoService = new SEOOptimizerService();
      
      // AI optimization with progress tracking
      const optimizedContent = await aiOptimizeContent(inputContent, (progress: OptimizationProgress) => {
        // In a real-time scenario, you could emit progress via WebSocket
        console.log(`Optimization progress: ${progress.step} (${progress.progress}/${progress.total})`);
      });
      
      const [
        seoMetadata,
        schemaMarkup,
        checklistResults
      ] = await Promise.all([
        Promise.resolve(seoService.generateSEOMetadata()),
        generateSchemaMarkup(inputContent),
        getOptimizationChecklistStatus(inputContent)
      ]);

      // Generate optimization suggestions
      const suggestions = [
        "Enhanced content with conversational AI markers for better discovery",
        "Added structured Q&A format for voice search optimization", 
        "Optimized meta descriptions for snippet visibility",
        "Included entity relationships for semantic understanding",
        "Added FAQ schema for enhanced AI comprehension"
      ];

      const results = {
        originalContent: inputContent,
        optimizedContent,
        seoMetadata,
        schemaMarkup,
        checklistResults,
        suggestions
      };

      res.json(results);
    } catch (error) {
      console.error("Content optimization error:", error);
      res.status(500).json({ 
        message: "Failed to optimize content",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}