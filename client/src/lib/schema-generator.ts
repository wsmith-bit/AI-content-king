export interface SchemaOrganization {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: {
    "@type": "ImageObject";
    url: string;
    width: string;
    height: string;
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

export interface SchemaPerson {
  "@context": "https://schema.org";
  "@type": "Person";
  "@id": string;
  name: string;
  jobTitle: string;
  worksFor: {
    "@type": "Organization";
    "@id": string;
  };
  url: string;
  sameAs: string[];
}

export interface SchemaWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  publisher: {
    "@type": "Organization";
    "@id": string;
  };
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface SchemaArticle {
  "@context": "https://schema.org";
  "@type": "Article";
  "@id": string;
  headline: string;
  description: string;
  author: {
    "@type": "Person";
    "@id": string;
  };
  publisher: {
    "@type": "Organization";
    "@id": string;
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  image: {
    "@type": "ImageObject";
    url: string;
    width: string;
    height: string;
  };
  articleSection: string;
  keywords: string[];
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

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://aiseooptimizer.pro' 
    : 'http://localhost:5000';
};

export function generateOrganizationSchema(): SchemaOrganization {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "AI SEO Optimizer",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      width: "300",
      height: "300"
    },
    sameAs: [
      "https://twitter.com/aiseooptimizer",
      "https://linkedin.com/company/aiseooptimizer"
    ]
  };
}

export function generatePersonSchema(): SchemaPerson {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#author`,
    name: "AI SEO Expert",
    jobTitle: "Lead SEO Specialist",
    worksFor: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    url: `${baseUrl}/author`,
    sameAs: [
      "https://twitter.com/aiseoexpert",
      "https://linkedin.com/in/aiseoexpert"
    ]
  };
}

export function generateWebSiteSchema(): SchemaWebSite {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "AI SEO Optimizer Pro",
    url: baseUrl,
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateArticleSchema(): SchemaArticle {
  const baseUrl = getBaseUrl();
  const currentDate = new Date().toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/#article`,
    headline: "AI SEO Optimizer Pro - Advanced Content Optimization for 2025+ AI Discovery",
    description: "Professional AI SEO optimization platform with 96+ point checklist, Schema.org automation, and voice search optimization for Google SGE, Perplexity, Bing Copilot, and more.",
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#author`
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    datePublished: "2025-01-01T00:00:00Z",
    dateModified: currentDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/#webpage`
    },
    image: {
      "@type": "ImageObject",
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630",
      width: "1200",
      height: "630"
    },
    articleSection: "SEO Technology",
    keywords: [
      "AI SEO",
      "Schema markup",
      "voice search optimization",
      "content optimization",
      "Google SGE",
      "Perplexity",
      "AI discovery",
      "structured data",
      "Core Web Vitals",
      "AI assistant optimization"
    ]
  };
}

export function generateWebPageSchema(): SchemaWebPage {
  const baseUrl = getBaseUrl();

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
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "AI SEO Optimizer",
      url: `${baseUrl}/`,
      logo: {
        "@type": "ImageObject",
        url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        width: "300",
        height: "300"
      },
      sameAs: [
        "https://twitter.com/aiseooptimizer",
        "https://linkedin.com/company/aiseooptimizer"
      ]
    }
  };
}

// Legacy function name for backward compatibility
export function generateWebsiteSchema(): SchemaWebPage {
  return generateWebPageSchema();
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
