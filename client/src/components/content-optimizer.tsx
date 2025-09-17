import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Globe, Zap, CheckCircle } from "lucide-react";
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
  const { toast } = useToast();

  const optimizeMutation = useMutation({
    mutationFn: async (data: { content?: string; url?: string }) => {
      const response = await apiRequest('POST', '/api/optimize/content', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Content Optimized!",
        description: "Your content has been successfully optimized for AI search engines.",
      });
    },
    onError: (error) => {
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
                    <h3 className="text-lg font-semibold mb-2">Original Content</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{results.originalContent}</p>
                    </div>
                  </div>
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
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(results.checklistResults, null, 2)}
                    </pre>
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