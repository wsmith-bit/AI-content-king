import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Globe, Zap, CheckCircle, Activity, Download, Code2, Copy, Star, DollarSign, TrendingUp, Award, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Enhanced data extraction functions
function extractProductData(content: string) {
  const products = [];
  const lines = content.split('\n');
  
  console.log('📊 [Chart Debug] Analyzing content for products...', content.substring(0, 200));
  
  // Look for price and rating patterns separately, then match them
  const priceMatches = [];
  const ratingMatches = [];
  const productNames = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Find price lines
    const priceMatch = line.match(/Current Price: \$?([\d,]+\.?\d*)/);
    if (priceMatch) {
      priceMatches.push({ line: i, price: parseFloat(priceMatch[1].replace(/,/g, '')) });
    }
    
    // Find rating lines
    const ratingMatch = line.match(/Rating: ([\d.]+)/);
    if (ratingMatch) {
      ratingMatches.push({ line: i, rating: parseFloat(ratingMatch[1]) });
    }
    
    // Find product name lines (TV models)
    if (line.includes('Samsung') && line.includes('TV') || 
        line.includes('LG') && line.includes('TV') ||
        line.includes('Series') && line.includes('TV') ||
        line.includes('QLED') || line.includes('OLED')) {
      productNames.push({ line: i, name: line.replace(/^#+\s*/, '').substring(0, 60) });
    }
  }
  
  console.log('📊 [Chart Debug] Found:', { 
    prices: priceMatches.length, 
    ratings: ratingMatches.length, 
    names: productNames.length 
  });
  
  // Match prices with ratings and names within reasonable proximity
  for (const price of priceMatches) {
    // Look for rating within 10 lines of price
    const nearbyRating = ratingMatches.find(r => Math.abs(r.line - price.line) <= 10);
    
    if (nearbyRating) {
      // Look for product name within 15 lines of price
      const nearbyName = productNames.find(n => Math.abs(n.line - price.line) <= 15);
      
      if (nearbyName) {
        products.push({
          name: nearbyName.name,
          price: price.price,
          rating: nearbyRating.rating,
          maxRating: 5
        });
      } else {
        // Fallback: use a generic name based on price
        products.push({
          name: `TV Model ($${price.price.toLocaleString()})`,
          price: price.price,
          rating: nearbyRating.rating,
          maxRating: 5
        });
      }
    }
  }
  
  console.log('📊 [Chart Debug] Extracted products:', products);
  return products;
}

interface ComparisonData {
  name: string;
  Price: number;
  Rating: number;
  Features: number;
}

function extractComparisonData(content: string): ComparisonData[] {
  const data: ComparisonData[] = [];
  
  const products = extractProductData(content);
  products.forEach(product => {
    data.push({
      name: product.name.split(' ').slice(0, 3).join(' '),
      Price: product.price / 1000, // Convert to thousands for better chart display
      Rating: product.rating,
      Features: Math.random() * 10 + 5 // Mock feature score
    });
  });
  
  return data;
}

// Enhanced content parsing and formatting
function parseContentElements(content: string) {
  const elements = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and technical markers
    if (!line || line.startsWith('<!--') || line.includes('Character Encoding') || line.includes('Mobile-Responsive') || line.includes('Language:')) {
      continue;
    }
    
    // Main heading
    if (line.startsWith('# ')) {
      elements.push({
        type: 'hero',
        content: line.replace(/^# /, '')
      });
    }
    // Section headers
    else if (line.startsWith('## ')) {
      elements.push({
        type: 'section-header',
        content: line.replace(/^## /, '')
      });
    }
    // Sub headers
    else if (line.startsWith('### ')) {
      elements.push({
        type: 'sub-header',
        content: line.replace(/^### /, '')
      });
    }
    // Product titles
    else if (line.includes('Samsung') && line.includes('TV') || line.includes('LG') && line.includes('TV')) {
      elements.push({
        type: 'product-title',
        content: line
      });
    }
    // Prices
    else if (line.includes('Current Price:')) {
      const match = line.match(/Current Price: \$?([\d,]+\.?\d*)/);
      if (match) {
        elements.push({
          type: 'price',
          amount: match[1]
        });
      }
    }
    // Ratings
    else if (line.includes('Rating:')) {
      const match = line.match(/Rating: ([\d.]+)/);
      if (match) {
        elements.push({
          type: 'rating',
          score: parseFloat(match[1])
        });
      }
    }
    // Top Picks
    else if (line.includes('Top Picks')) {
      elements.push({
        type: 'top-picks-header'
      });
    }
    // Best category items
    else if (line.match(/(Best Overall|Best Value|Best for Gaming):/)) {
      const match = line.match(/(Best Overall|Best Value|Best for Gaming): (.*?) – \$?([\d,]+\.?\d*)/);
      if (match) {
        elements.push({
          type: 'best-pick',
          category: match[1],
          product: match[2],
          price: match[3]
        });
      }
    }
    // Q&A
    else if (line.startsWith('Q: ')) {
      elements.push({
        type: 'question',
        content: line.replace(/^Q: /, '')
      });
    }
    else if (line.startsWith('A: ')) {
      elements.push({
        type: 'answer',
        content: line.replace(/^A: /, '')
      });
    }
    // Table of Contents
    else if (line.includes('📋 Table of Contents')) {
      elements.push({
        type: 'table-of-contents'
      });
    }
    // Bullet points
    else if (line.match(/^[•\-\*] /)) {
      elements.push({
        type: 'bullet',
        content: line.replace(/^[•\-\*] /, '')
      });
    }
    // Regular paragraphs
    else if (line.length > 0) {
      elements.push({
        type: 'paragraph',
        content: line
      });
    }
  }
  
  return elements;
}

// React component to render formatted content
function FormattedContent({ content }: { content: string }) {
  const elements = parseContentElements(content);
  
  return (
    <div className="space-y-4">
      {elements.map((element, index) => {
        switch (element.type) {
          case 'hero':
            return (
              <div key={index} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-8">
                <h1 className="text-3xl font-bold mb-4">{element.content}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <Zap className="w-5 h-5" />
                  <span>AI-Optimized Content for Maximum Engagement</span>
                </div>
              </div>
            );
            
          case 'section-header':
            return (
              <div key={index} className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 my-6 rounded-r-lg">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {element.content}
                </h2>
              </div>
            );
            
          case 'sub-header':
            return (
              <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {element.content}
              </h3>
            );
            
          case 'product-title':
            return (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{element.content}</h4>
                </div>
              </div>
            );
            
          case 'price':
            return (
              <div key={index} className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg mb-4">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-bold text-green-800 dark:text-green-200 text-lg">${element.amount}</span>
                <span className="text-green-600 dark:text-green-400 text-sm">Current Price</span>
              </div>
            );
            
          case 'rating':
            return (
              <div key={index} className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(element.score || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{element.score}/5</span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Customer Rating</span>
              </div>
            );
            
          case 'top-picks-header':
            return (
              <div key={index} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-6 rounded-xl mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">🏆 Top Picks</h2>
                </div>
              </div>
            );
            
          case 'best-pick':
            return (
              <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {element.category}
                    </Badge>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{element.product}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">${element.price}</div>
                  </div>
                </div>
              </div>
            );
            
          case 'question':
            return (
              <div key={index} className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">Q</div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200">{element.content}</div>
                </div>
              </div>
            );
            
          case 'answer':
            return (
              <div key={index} className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 ml-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">A</div>
                  <div className="text-green-800 dark:text-green-200">{element.content}</div>
                </div>
              </div>
            );
            
          case 'table-of-contents':
            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">📋 Table of Contents</h3>
                </div>
              </div>
            );
            
          case 'bullet':
            return (
              <div key={index} className="flex items-start gap-3 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700 dark:text-gray-300">{element.content}</span>
              </div>
            );
            
          case 'paragraph':
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {element.content}
              </p>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
}

interface SchemaData {
  // Organization Schema
  organizationName?: string;
  organizationUrl?: string;
  organizationLogo?: string;
  organizationDescription?: string;
  organizationAddress?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  
  // Person Schema  
  authorName?: string;
  authorJobTitle?: string;
  authorUrl?: string;
  authorImage?: string;
  authorSameAs?: string[]; // Social profiles
  
  // Content Details
  contentUrl?: string;
  datePublished?: string;
  dateModified?: string;
  
  // Publisher Info
  publisherName?: string;
  publisherUrl?: string;
  publisherLogo?: string;
}

interface OptimizationResults {
  originalContent: string;
  optimizedContent: string;
  seoMetadata: any;
  schemaMarkup: any;
  checklistResults: any;
  suggestions: string[];
  htmlContent?: string;
}

export default function ContentOptimizer() {
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [generateHtml, setGenerateHtml] = useState(true);
  const [results, setResults] = useState<OptimizationResults | null>(null);
  const [showSchemaForm, setShowSchemaForm] = useState(false);
  const [schemaData, setSchemaData] = useState<SchemaData>({});
  const [optimizationProgress, setOptimizationProgress] = useState<{
    isOptimizing: boolean;
    currentStep: string;
    progress: number;
    total: number;
    category: string;
  }>({
    isOptimizing: false,
    currentStep: '',
    progress: 0,
    total: 0,
    category: ''
  });
  const { toast } = useToast();

  // Handle fixing individual checklist items
  const handleFixItem = async (itemId: string, category: string) => {
    try {
      toast({
        title: "Applying Fix",
        description: `Fixing ${itemId} in ${category} category...`,
      });
      
      // Re-optimize with focus on this specific item
      const data = inputType === "text" ? { content } : { url };
      const response = await apiRequest('POST', '/api/optimize/content', { ...data, focusFix: itemId });
      const results = await response.json();
      
      setResults(results);
      
      toast({
        title: "Fix Applied",
        description: "Optimization item has been fixed and content updated.",
      });
    } catch (error) {
      toast({
        title: "Fix Failed", 
        description: "Failed to apply the fix. Please try again.",
        variant: "destructive",
      });
    }
  };

  const optimizeMutation = useMutation({
    mutationFn: async (data: { content?: string; url?: string; generateHtml?: boolean }) => {
      // Start optimization progress
      setOptimizationProgress({
        isOptimizing: true,
        currentStep: 'Initializing optimization...',
        progress: 0,
        total: 12,
        category: 'Setup'
      });
      
      // Simulate progress updates (in real implementation, this would come from WebSocket)
      const progressSteps = [
        { step: 'Content Structure Analysis', category: 'Analysis', progress: 1 },
        { step: 'Meta Tags Generation', category: 'Meta Tags', progress: 2 },
        { step: 'Open Graph Optimization', category: 'Social Media', progress: 3 },
        { step: 'Schema Markup Integration', category: 'Structured Data', progress: 4 },
        { step: 'AI Assistant Optimization', category: 'AI Compatibility', progress: 5 },
        { step: 'Voice Search Enhancement', category: 'Voice Search', progress: 6 },
        { step: 'Conversational Markers', category: 'AI Discovery', progress: 7 },
        { step: 'Entity Recognition', category: 'Semantic SEO', progress: 8 },
        { step: 'Content Segmentation', category: 'Structure', progress: 9 },
        { step: 'Q&A Format Conversion', category: 'AI Understanding', progress: 10 },
        { step: 'Technical SEO Application', category: 'Technical', progress: 11 },
        { step: 'Performance Optimization', category: 'Core Web Vitals', progress: 12 }
      ];
      
      // Update progress incrementally
      const progressPromise = new Promise<void>((resolve) => {
        let currentIndex = 0;
        const interval = setInterval(() => {
          if (currentIndex < progressSteps.length) {
            const currentStep = progressSteps[currentIndex];
            setOptimizationProgress({
              isOptimizing: true,
              currentStep: currentStep.step,
              progress: currentStep.progress,
              total: 12,
              category: currentStep.category
            });
            currentIndex++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, 200); // Update every 200ms for smooth progress
      });
      
      const response = await apiRequest('POST', '/api/optimize/content', data);
      await progressPromise; // Wait for progress simulation
      
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationProgress({
        isOptimizing: false,
        currentStep: 'Optimization Complete!',
        progress: 12,
        total: 12,
        category: 'Complete'
      });
      setResults(data);
      toast({
        title: "Content Optimized!",
        description: `Your content has been successfully optimized for AI search engines. Score: ${data.checklistResults?.score || 0}%`,
      });
    },
    onError: (error) => {
      setOptimizationProgress({
        isOptimizing: false,
        currentStep: '',
        progress: 0,
        total: 0,
        category: ''
      });
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOptimize = () => {
    if (inputType === "text" && !content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content to optimize.",
        variant: "destructive",
      });
      return;
    }

    if (inputType === "url" && !url.trim()) {
      toast({
        title: "URL Required", 
        description: "Please enter a URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    optimizeMutation.mutate(
      inputType === "text" ? { content, generateHtml } : { url, generateHtml }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Content Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="optimizer-title">
            <Zap className="h-5 w-5 text-primary" />
            Content Optimizer
          </CardTitle>
          <CardDescription>
            Input your content below or provide a URL to analyze and optimize for AI search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={inputType} onValueChange={(value: any) => setInputType(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2" data-testid="tab-text">
                <FileText className="h-4 w-4" />
                Text Content
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2" data-testid="tab-url">
                <Globe className="h-4 w-4" />
                Website URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="content">Content to Optimize</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your blog post, article, webpage content, or any text you want to optimize for AI search engines..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] mt-2"
                  data-testid="input-content"
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/your-page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-2"
                  data-testid="input-url"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
            <input
              type="checkbox"
              id="generate-html"
              checked={generateHtml}
              onChange={(e) => setGenerateHtml(e.target.checked)}
              className="h-4 w-4 text-primary"
              data-testid="checkbox-html"
            />
            <Label htmlFor="generate-html" className="flex items-center gap-2 cursor-pointer">
              <Code2 className="h-4 w-4" />
              Generate beautifully styled HTML with charts (ready to publish)
            </Label>
          </div>

          <Button 
            onClick={handleOptimize}
            disabled={optimizeMutation.isPending}
            className="w-full"
            size="lg"
            data-testid="button-optimize"
          >
            {optimizeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing Content...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Optimize for AI Search
              </>
            )}
          </Button>
          
          {/* Progress Indicator */}
          {optimizationProgress.isOptimizing && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium">{optimizationProgress.currentStep}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {optimizationProgress.progress}/{optimizationProgress.total}
                    </span>
                  </div>
                  <Progress 
                    value={(optimizationProgress.progress / optimizationProgress.total) * 100} 
                    className="w-full" 
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Category: {optimizationProgress.category}</span>
                    <span>{Math.round((optimizationProgress.progress / optimizationProgress.total) * 100)}% Complete</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Schema Data Collection Form */}
      {showSchemaForm && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Code2 className="h-5 w-5" />
              Complete Your Schema Information
            </CardTitle>
            <CardDescription>
              Provide real information to generate accurate structured data markup for your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    data-testid="input-org-name"
                    placeholder="e.g. Your Company Name"
                    value={schemaData.organizationName || ''}
                    onChange={(e) => setSchemaData({...schemaData, organizationName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="org-url">Organization Website</Label>
                  <Input
                    id="org-url"
                    data-testid="input-org-url"
                    placeholder="https://yourcompany.com"
                    value={schemaData.organizationUrl || ''}
                    onChange={(e) => setSchemaData({...schemaData, organizationUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="org-logo">Organization Logo URL</Label>
                  <Input
                    id="org-logo"
                    data-testid="input-org-logo"
                    placeholder="https://yourcompany.com/logo.png"
                    value={schemaData.organizationLogo || ''}
                    onChange={(e) => setSchemaData({...schemaData, organizationLogo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="org-email">Organization Email</Label>
                  <Input
                    id="org-email"
                    data-testid="input-org-email"
                    placeholder="info@yourcompany.com"
                    value={schemaData.organizationEmail || ''}
                    onChange={(e) => setSchemaData({...schemaData, organizationEmail: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="org-description">Organization Description</Label>
                  <Textarea
                    id="org-description"
                    data-testid="input-org-description"
                    placeholder="Brief description of your organization..."
                    value={schemaData.organizationDescription || ''}
                    onChange={(e) => setSchemaData({...schemaData, organizationDescription: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Author/Person Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Author Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author-name">Author Name</Label>
                  <Input
                    id="author-name"
                    data-testid="input-author-name"
                    placeholder="e.g. John Smith"
                    value={schemaData.authorName || ''}
                    onChange={(e) => setSchemaData({...schemaData, authorName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="author-title">Job Title</Label>
                  <Input
                    id="author-title"
                    data-testid="input-author-title"
                    placeholder="e.g. Content Marketing Manager"
                    value={schemaData.authorJobTitle || ''}
                    onChange={(e) => setSchemaData({...schemaData, authorJobTitle: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="author-url">Author Profile URL</Label>
                  <Input
                    id="author-url"
                    data-testid="input-author-url"
                    placeholder="https://yourcompany.com/team/john-smith"
                    value={schemaData.authorUrl || ''}
                    onChange={(e) => setSchemaData({...schemaData, authorUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="author-image">Author Photo URL</Label>
                  <Input
                    id="author-image"
                    data-testid="input-author-image"
                    placeholder="https://yourcompany.com/images/john-smith.jpg"
                    value={schemaData.authorImage || ''}
                    onChange={(e) => setSchemaData({...schemaData, authorImage: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Content Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content-url">Content URL (Canonical)</Label>
                  <Input
                    id="content-url"
                    data-testid="input-content-url"
                    placeholder="https://yoursite.com/this-article"
                    value={schemaData.contentUrl || ''}
                    onChange={(e) => setSchemaData({...schemaData, contentUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date-published">Date Published</Label>
                  <Input
                    id="date-published"
                    data-testid="input-date-published"
                    type="date"
                    value={schemaData.datePublished || ''}
                    onChange={(e) => setSchemaData({...schemaData, datePublished: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Publisher Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Publisher Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publisher-name">Publisher Name</Label>
                  <Input
                    id="publisher-name"
                    data-testid="input-publisher-name"
                    placeholder="e.g. Your Publication Name"
                    value={schemaData.publisherName || ''}
                    onChange={(e) => setSchemaData({...schemaData, publisherName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="publisher-url">Publisher Website</Label>
                  <Input
                    id="publisher-url"
                    data-testid="input-publisher-url"
                    placeholder="https://yourpublication.com"
                    value={schemaData.publisherUrl || ''}
                    onChange={(e) => setSchemaData({...schemaData, publisherUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="publisher-logo">Publisher Logo URL</Label>
                  <Input
                    id="publisher-logo"
                    data-testid="input-publisher-logo"
                    placeholder="https://yourpublication.com/logo.png"
                    value={schemaData.publisherLogo || ''}
                    onChange={(e) => setSchemaData({...schemaData, publisherLogo: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSchemaForm(false)}
                data-testid="button-cancel-schema"
              >
                Skip for Now
              </Button>
              <Button
                onClick={async () => {
                  // Re-optimize with schema data
                  setShowSchemaForm(false);
                  const data = inputType === "text" ? { content, schemaData } : { url, schemaData };
                  try {
                    const result = await optimizeMutation.mutateAsync({ ...data, generateHtml });
                    setResults(result);
                    toast({
                      title: "Schema Enhanced!",
                      description: "Your content has been re-optimized with your schema information.",
                    });
                  } catch (error) {
                    toast({
                      title: "Optimization Failed",
                      description: "Failed to enhance with schema data. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-save-schema"
              >
                Apply Schema Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Optimization Complete
              </CardTitle>
              <CardDescription>
                Your content has been optimized for maximum AI search engine visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="optimized" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="optimized">Optimized Content</TabsTrigger>
                  <TabsTrigger value="html">HTML Export</TabsTrigger>
                  <TabsTrigger value="seo">SEO Metadata</TabsTrigger>
                  <TabsTrigger value="schema">Schema Markup</TabsTrigger>
                  <TabsTrigger value="checklist">AI Checklist</TabsTrigger>
                </TabsList>

                <TabsContent value="optimized" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      AI-Optimized Content
                    </h3>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enhanced for AI Search Engines
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(results.optimizedContent || '');
                              toast({ title: "Copied to clipboard!" });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-6 max-h-[600px] overflow-y-auto">
                        <FormattedContent content={results.optimizedContent || ''} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Data Visualizations */}
                  {(() => {
                    const products = extractProductData(results.optimizedContent || '');
                    const comparisonData = extractComparisonData(results.optimizedContent || '');
                    
                    if (products.length > 0) {
                      return (
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Product Comparison Charts
                          </h3>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Price Comparison Chart */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                  <DollarSign className="h-5 w-5" />
                                  Price Comparison
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <BarChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="name" 
                                      fontSize={12}
                                      angle={-45}
                                      textAnchor="end"
                                      height={60}
                                    />
                                    <YAxis label={{ value: 'Price ($1000s)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip 
                                      formatter={(value) => [`$${(value as number * 1000).toLocaleString()}`, 'Price']}
                                    />
                                    <Bar dataKey="Price" fill="#10b981" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                            
                            {/* Rating Comparison Chart */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-600">
                                  <Star className="h-5 w-5" />
                                  Customer Ratings
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <BarChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="name" 
                                      fontSize={12}
                                      angle={-45}
                                      textAnchor="end"
                                      height={60}
                                    />
                                    <YAxis domain={[0, 5]} label={{ value: 'Rating (1-5)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip 
                                      formatter={(value) => [`${value}/5 Stars`, 'Rating']}
                                    />
                                    <Bar dataKey="Rating" fill="#f59e0b" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {/* Product Summary Cards */}
                          <div className="space-y-4">
                            <h4 className="text-md font-semibold flex items-center gap-2">
                              <Award className="h-4 w-4 text-purple-600" />
                              Product Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {products.slice(0, 6).map((product, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                                        {product.name}
                                      </h5>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                          {[...Array(5)].map((_, i) => (
                                            <Star 
                                              key={i}
                                              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                            />
                                          ))}
                                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                            {product.rating}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                            ${product.price.toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          <ShoppingCart className="h-3 w-3 mr-1" />
                                          Compare
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {results.suggestions && results.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Optimization Insights
                      </h3>
                      <div className="grid gap-3">
                        {results.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="h-2 w-2 bg-green-500 rounded-full mt-3 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                                {suggestion}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {results.htmlContent && (
                  <TabsContent value="html" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Styled HTML Output</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([results.htmlContent!], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'optimized-content.html';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download HTML
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={results.htmlContent}
                        className="w-full h-[600px] bg-white"
                        title="HTML Preview"
                        sandbox=""
                      />
                    </div>
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium">View HTML Source</summary>
                      <div className="mt-2 bg-muted/30 p-4 rounded-lg">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {results.htmlContent}
                        </pre>
                      </div>
                    </details>
                  </TabsContent>
                )}

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      SEO Metadata
                    </h3>
                    <div className="grid gap-4">
                      {results.seoMetadata && Object.entries(results.seoMetadata).map(([key, value]) => (
                        <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(typeof value === 'string' ? value : JSON.stringify(value));
                                toast({ title: "Copied to clipboard!" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schema" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-purple-600" />
                      Schema Markup
                    </h3>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            JSON-LD Structured Data
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSchemaForm(true)}
                              data-testid="button-enhance-schema"
                            >
                              <Code2 className="h-4 w-4 mr-1" />
                              Enhance with Real Data
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(results.schemaMarkup, null, 2));
                                toast({ title: "Schema markup copied to clipboard!" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 max-h-[400px] overflow-y-auto">
                        <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed overflow-x-auto">
                          {JSON.stringify(results.schemaMarkup, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="checklist" className="space-y-4">
                  <div className="space-y-6">
                    {/* Checklist Score */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                              {results.checklistResults?.score || 0}%
                            </h3>
                            <p className="text-sm text-green-600 dark:text-green-500">
                              AI Optimization Score
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{results.checklistResults?.passedItems || 0} / {results.checklistResults?.totalItems || 0} checks passed</div>
                            <div>{results.checklistResults?.failedItems || 0} failed, {results.checklistResults?.pendingItems || 0} pending</div>
                          </div>
                        </div>
                        <Progress 
                          value={results.checklistResults?.score || 0} 
                          className="mt-4" 
                        />
                      </CardContent>
                    </Card>
                    
                    {/* Checklist Categories */}
                    {results.checklistResults?.categories && Object.entries(results.checklistResults.categories).map(([category, items]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(items as any[]).map((item: any) => (
                              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className={`h-2 w-2 rounded-full mt-2 ${
                                  item.status === 'passed' ? 'bg-green-500' :
                                  item.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{item.item}</h4>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full ${
                                      item.status === 'passed' ? 'bg-green-100 text-green-800' :
                                      item.status === 'failed' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }">
                                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    {item.points && (
                                      <span className="text-xs text-muted-foreground">Worth {item.points} points</span>
                                    )}
                                    {(item.status === 'pending' || item.status === 'failed') && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs"
                                        data-testid={`button-fix-${item.id}`}
                                        onClick={() => handleFixItem(item.id, item.category)}
                                      >
                                        🔧 Fix
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}