import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Hero Content */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6" data-testid="hero-title">
            <span className="gradient-text">
              AI-First SEO Optimization
            </span>
            <br />
            for 2025+ Discovery
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="hero-description">
            Professional content optimization platform with 96+ point AI checklist, automated Schema.org markup, 
            and voice search optimization for Google SGE, Perplexity, Bing Copilot, and emerging AI engines.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground px-8 py-4 hover:opacity-90"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              data-testid="button-start-optimizing"
            >
              Start Optimizing Content
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4"
              onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-demo"
            >
              View Live Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative" data-testid="hero-image-container">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
              alt="AI SEO Optimizer Dashboard Interface" 
              className="rounded-xl shadow-2xl mx-auto"
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
