export interface SchemaOrganization {
  "@type": "Organization";
  "@id": string;
  name: string;
  logo: {
    "@type": "ImageObject";
    url: string;
  };
  sameAs: string[];
}

export interface SchemaBreadcrumb {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

export interface SchemaWebPage {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  isPartOf: {
    "@type": "WebSite";
    "@id": string;
  };
  breadcrumb: SchemaBreadcrumb;
  mainEntity: {
    "@type": "SoftwareApplication";
    name: string;
    applicationCategory: string;
    operatingSystem: string;
    offers: {
      "@type": "Offer";
      price: string;
      priceCurrency: string;
    };
  };
  publisher: SchemaOrganization;
}

export interface SchemaFAQ {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
}

export function generateWebsiteSchema(): SchemaWebPage {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://aiseooptimizer.pro' 
    : 'http://localhost:5000';

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI SEO Optimizer Pro",
    description: "Professional AI SEO optimization platform with automated Schema.org markup and voice search optimization",
    url: `${baseUrl}/`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${baseUrl}/`
        }
      ]
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "AI SEO Optimizer Pro",
      applicationCategory: "SEO Software",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "49",
        priceCurrency: "USD"
      }
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "AI SEO Optimizer",
      logo: {
        "@type": "ImageObject",
        url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
      },
      sameAs: [
        "https://twitter.com/aiseooptimizer",
        "https://linkedin.com/company/aiseooptimizer"
      ]
    }
  };
}

export function generateFAQSchema(): SchemaFAQ {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does AI SEO optimization work in 2025?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI SEO optimization in 2025 focuses on structured data, conversational content, and entity recognition to help AI engines like Google SGE, Perplexity, and Bing Copilot understand and surface your content effectively."
        }
      },
      {
        "@type": "Question", 
        name: "What Schema.org markup is required for AI discovery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Essential Schema.org types include BlogPosting/Article, BreadcrumbList, Organization, Person, FAQPage, and WebPage. Recommended additions are HowTo, VideoObject, and QAPage for enhanced AI visibility."
        }
      },
      {
        "@type": "Question", 
        name: "How do I optimize content for voice search?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Voice search optimization requires natural language patterns, Q&A formatting, and conversational markers. Structure content with clear questions and concise answers, use semantic keyword clusters, and include local SEO elements."
        }
      },
      {
        "@type": "Question", 
        name: "Which AI engines does your optimization support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our optimization covers Google SGE, Perplexity, Bing Copilot, ChatGPT, Claude, and Meta AI. Each engine has specific requirements for content discovery, which we address through comprehensive structured data, entity recognition, and content formatting strategies."
        }
      },
      {
        "@type": "Question", 
        name: "What are Core Web Vitals and why do they matter for AI SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Core Web Vitals measure page loading performance (LCP), visual stability (CLS), and interactivity (FID). AI engines prioritize fast, stable pages for better user experience. Our platform includes critical CSS inlining, image optimization, and performance monitoring to achieve optimal scores."
        }
      }
    ]
  };
}
