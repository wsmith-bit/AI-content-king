import { Button } from "@/components/ui/button";
import { resolveApiUrl } from "@/lib/api";
import { Zap, Target, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Zap,
      title: "AI Optimization Engine",
      description: "Automatically optimize your content for Google SGE, Perplexity, Bing Copilot, and other AI search engines."
    },
    {
      icon: Target,
      title: "111-Point Checklist",
      description: "Comprehensive optimization checklist covering meta tags, Schema.org, voice search, and Core Web Vitals."
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your AI optimization score and performance metrics with detailed insights and recommendations."
    },
    {
      icon: Shield,
      title: "Schema.org Generation",
      description: "Automated structured data markup generation for maximum AI discovery and enhanced search visibility."
    }
  ];

  const handleLogin = () => {
    window.location.href = resolveApiUrl("/api/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold" data-testid="logo-text">AI SEO Optimizer Pro</span>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="hero-title">
            Optimize Your Content for{" "}
            <span className="text-primary">AI Search Engines</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-testid="hero-description">
            Get discovered by Google SGE, Perplexity, Bing Copilot, and other AI platforms. 
            Our 111-point optimization checklist ensures maximum visibility in the AI-first future of search.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="features-title">
              Everything You Need for AI Optimization
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="features-description">
              Professional-grade tools to ensure your content ranks high in AI search results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-background p-6 rounded-xl border border-border text-center"
                  data-testid={`feature-card-${index}`}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" data-testid={`feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground" data-testid={`feature-description-${index}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="cta-title">
            Ready to Dominate AI Search Results?
          </h2>
          <p className="text-lg text-muted-foreground mb-8" data-testid="cta-description">
            Join thousands of content creators who are already optimizing for the AI-first future of search.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
            data-testid="button-start-optimizing"
          >
            Start Optimizing Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground" data-testid="footer-text">
            © 2025 AI SEO Optimizer Pro. Built for the future of AI-powered search.
          </p>
        </div>
      </footer>
    </div>
  );
}