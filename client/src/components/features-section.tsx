import { CheckCircle, Code, Mic, Zap, BarChart3, Brain } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "96+ Point AI Checklist",
    description: "Comprehensive optimization checklist covering meta tags, structured data, voice search, and 2025+ AI enhancements.",
    items: [
      "Meta tags & HTML structure",
      "Open Graph & social media",
      "Core Web Vitals optimization"
    ]
  },
  {
    icon: Code,
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    title: "Automated Schema.org",
    description: "Auto-generate required and recommended Schema markup for maximum AI engine compatibility.",
    items: [
      "BlogPosting & Article schemas",
      "FAQ & HowTo optimization",
      "Entity recognition mapping"
    ]
  },
  {
    icon: Mic,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    title: "Voice Search Ready",
    description: "Natural language optimization with conversational markers and Q&A formatting for voice assistants.",
    items: [
      "Conversational content structure",
      "Snippet-optimized answers",
      "Local SEO integration"
    ]
  },
  {
    icon: Zap,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    title: "Multi-AI Engine Support",
    description: "Optimized for Google SGE, Perplexity, Bing Copilot, ChatGPT, Claude, and Meta AI discovery.",
    items: [
      "Real-time content refresh hooks",
      "Intent clarity markers",
      "AI reasoning cues"
    ]
  },
  {
    icon: BarChart3,
    iconColor: "text-green-500",
    bgColor: "bg-green-500/10",
    title: "Core Web Vitals",
    description: "Critical CSS inlining, image optimization, and performance tuning for maximum page speed scores.",
    items: [
      "LCP optimization",
      "CLS prevention",
      "FID enhancement"
    ]
  },
  {
    icon: Brain,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    title: "Content Intelligence",
    description: "AI-powered content analysis with semantic keyword clustering and entity mapping.",
    items: [
      "Topical authority mapping",
      "Content gap analysis",
      "Readability optimization"
    ]
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="features-title">
            Complete AI Optimization Suite
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="features-description">
            Every feature designed to maximize your content's visibility across all major AI search engines and voice assistants.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="bg-background p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid={`feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-4" data-testid={`feature-description-${index}`}>
                  {feature.description}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} data-testid={`feature-item-${index}-${itemIndex}`}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
