import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mic, Zap, BarChart3 } from "lucide-react";

const metrics = [
  {
    label: "Schema Coverage",
    value: "94%",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: CheckCircle
  },
  {
    label: "Voice Ready",
    value: "Yes",
    color: "text-accent",
    bgColor: "bg-accent/10",
    icon: Mic
  },
  {
    label: "Core Web Vitals",
    value: "Good",
    color: "text-accent",
    bgColor: "bg-green-500/10",
    icon: BarChart3
  },
  {
    label: "AI Engines",
    value: "6/6",
    color: "text-primary",
    bgColor: "bg-purple-500/10",
    icon: Zap
  }
];

export default function DashboardDemo() {
  const [activeTab, setActiveTab] = useState("optimization");

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="dashboard-title">
            See Your Content Transform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="dashboard-description">
            Watch as our AI optimization engine analyzes and enhances your content for maximum visibility across all AI platforms.
          </p>
        </div>

        <div className="bg-background rounded-2xl border border-border shadow-xl p-6 md:p-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
            <Button 
              variant={activeTab === "optimization" ? "default" : "ghost"} 
              className={activeTab === "optimization" ? "border-b-2 border-primary" : ""}
              onClick={() => setActiveTab("optimization")}
              data-testid="tab-optimization"
            >
              Optimization Score
            </Button>
            <Button 
              variant={activeTab === "schema" ? "default" : "ghost"}
              className={activeTab === "schema" ? "border-b-2 border-primary" : ""}
              onClick={() => setActiveTab("schema")}
              data-testid="tab-schema"
            >
              Schema Markup
            </Button>
            <Button 
              variant={activeTab === "checklist" ? "default" : "ghost"}
              className={activeTab === "checklist" ? "border-b-2 border-primary" : ""}
              onClick={() => setActiveTab("checklist")}
              data-testid="tab-checklist"
            >
              AI Checklist
            </Button>
            <Button 
              variant={activeTab === "performance" ? "default" : "ghost"}
              className={activeTab === "performance" ? "border-b-2 border-primary" : ""}
              onClick={() => setActiveTab("performance")}
              data-testid="tab-performance"
            >
              Performance
            </Button>
          </div>

          {/* Dashboard Content - Changes based on active tab */}
          {activeTab === "optimization" && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="text-center" data-testid="overall-score">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path 
                      className="text-muted stroke-current" 
                      strokeDasharray="100, 100" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      strokeWidth="2"
                    />
                    <path 
                      className="text-accent stroke-current" 
                      strokeDasharray="87, 100" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-accent" data-testid="score-value">87</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">AI Optimization Score</h3>
                <p className="text-sm text-muted-foreground">Excellent - Ready for AI discovery</p>
              </div>

              {/* Metrics Grid */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={index} className="bg-muted/30 p-4 rounded-lg" data-testid={`metric-${index}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground" data-testid={`metric-label-${index}`}>
                            {metric.label}
                          </p>
                          <p className={`text-2xl font-bold ${metric.color}`} data-testid={`metric-value-${index}`}>
                            {metric.value}
                          </p>
                        </div>
                        <div className={`w-8 h-8 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 ${metric.color}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold" data-testid="schema-title">Generated Schema.org JSON-LD</h3>
              <div className="bg-muted/30 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm" data-testid="schema-code">
{`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI SEO Optimizer Pro",
  "url": "https://ai-seo-optimizer.com",
  "description": "AI-first SEO optimization platform...",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ai-seo-optimizer.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}`}
                </pre>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Schema Types Generated:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">Organization</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">WebSite</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">Article</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">FAQPage</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold" data-testid="checklist-title">AI Optimization Checklist (111 Points)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-2">✅ Passed (89 items)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Meta title optimized for AI</li>
                    <li>• Open Graph tags complete</li>
                    <li>• Schema.org markup present</li>
                    <li>• Voice search optimized</li>
                    <li>• Core Web Vitals good</li>
                  </ul>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-600 mb-2">⚠️ Needs Attention (22 items)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Image alt text optimization</li>
                    <li>• FAQ structured data</li>
                    <li>• Mobile viewport optimization</li>
                    <li>• Social media optimization</li>
                  </ul>
                </div>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm"><strong>AI Readiness Score:</strong> 80% - Good for most AI engines</p>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold" data-testid="performance-title">Core Web Vitals & Performance</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">1.2s</div>
                  <p className="text-sm font-semibold">Largest Contentful Paint</p>
                  <p className="text-xs text-muted-foreground">Good (&lt; 2.5s)</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">0.08</div>
                  <p className="text-sm font-semibold">Cumulative Layout Shift</p>
                  <p className="text-xs text-muted-foreground">Good (&lt; 0.1)</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">89ms</div>
                  <p className="text-sm font-semibold">First Input Delay</p>
                  <p className="text-xs text-muted-foreground">Good (&lt; 100ms)</p>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Optimization Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ Critical CSS inlined</li>
                  <li>✅ Images optimized and compressed</li>
                  <li>✅ JavaScript minified</li>
                  <li>⚠️ Consider lazy loading for below-fold images</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
