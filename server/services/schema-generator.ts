/**
 * Server-side Schema.org markup generator for content optimization
 */

export interface SchemaMarkup {
  organizationSchema: any;
  webSiteSchema: any;
  articleSchema: any;
  faqSchema: any;
}

export async function generateSchemaMarkup(content: string): Promise<SchemaMarkup> {
  const baseUrl = process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'https://ai-seo-optimizer.com';

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "AI SEO Optimizer Pro",
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

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "AI SEO Optimizer Pro",
    url: baseUrl,
    description: "AI-first SEO optimization platform for maximum visibility across all AI search engines",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: extractTitleFromContent(content),
    description: extractDescriptionFromContent(content),
    author: {
      "@type": "Person",
      name: "AI SEO Optimizer",
      url: baseUrl
    },
    publisher: organizationSchema,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": baseUrl
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does AI SEO optimization work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI SEO optimization analyzes your content and applies 111+ optimization techniques to ensure maximum visibility across AI search engines like Google SGE, Perplexity, and Bing Copilot."
        }
      },
      {
        "@type": "Question",
        name: "What makes content AI-ready?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI-ready content includes conversational markers, structured data, voice search optimization, and semantic markup that AI engines can easily understand and reference."
        }
      }
    ]
  };

  return {
    organizationSchema,
    webSiteSchema,
    articleSchema,
    faqSchema
  };
}

function extractTitleFromContent(content: string): string {
  // Extract first line or first 60 characters as title
  const firstLine = content.split('\n')[0];
  return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
}

function extractDescriptionFromContent(content: string): string {
  // Extract first 160 characters for description
  const cleanContent = content.replace(/\n/g, ' ').trim();
  return cleanContent.length > 160 ? cleanContent.substring(0, 160) + '...' : cleanContent;
}