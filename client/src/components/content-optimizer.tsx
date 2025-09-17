import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Globe, Zap, CheckCircle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OptimizationResults {
  originalContent: string;
  optimizedContent: string;
  seoMetadata: any;
  schemaMarkup: any;
  checklistResults: any;
  suggestions: string[];
}

export default function ContentOptimizer() {
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<OptimizationResults | null>(null);
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
    mutationFn: async (data: { content?: string; url?: string }) => {
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
      inputType === "text" ? { content } : { url }
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="optimized">Optimized Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO Metadata</TabsTrigger>
                  <TabsTrigger value="schema">Schema Markup</TabsTrigger>
                  <TabsTrigger value="checklist">AI Checklist</TabsTrigger>
                </TabsList>

                <TabsContent value="optimized" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI-Optimized Content</h3>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{results.optimizedContent}</p>
                    </div>
                  </div>
                  {results.suggestions && results.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Optimization Suggestions</h3>
                      <ul className="space-y-2">
                        {results.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(results.seoMetadata, null, 2)}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="schema" className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(results.schemaMarkup, null, 2)}
                    </pre>
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