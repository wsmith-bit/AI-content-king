import config from "../config";

/**
 * Server-side Schema.org markup generator for content optimization
 */

export interface SchemaMarkup {
  organizationSchema: any;
  webSiteSchema: any;
  articleSchema: any;
  faqSchema: any;
}

export async function generateSchemaMarkup(content: string, schemaData?: any): Promise<SchemaMarkup> {
  const defaultDomain = config.REPLIT_DOMAINS.split(",")[0];
  const baseUrl = defaultDomain
    ? `https://${defaultDomain}`
    : "https://ai-seo-optimizer.com";
    
  // Sanitize content to remove HTML and platform banners for clean analysis
  const cleanContent = sanitizeCanonicalContent(content);
  
  // Analyze content to determine relevant schemas
  const contentAnalysis = analyzeContentType(cleanContent);
  const extractedFAQs = extractFAQsFromContent(cleanContent);
  const contentTitle = extractTitleFromContent(cleanContent);
  const contentDescription = extractDescriptionFromContent(cleanContent);

  // Generate organization schema based on user data or content context
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: schemaData?.organizationName || contentAnalysis.organizationName || extractOrganizationFromContent(content) || "Content Publisher",
    url: schemaData?.organizationUrl || baseUrl,
    description: schemaData?.organizationDescription || `Publisher of: ${contentTitle}`,
    ...(schemaData?.organizationLogo && { logo: schemaData.organizationLogo }),
    ...(schemaData?.organizationEmail && { email: schemaData.organizationEmail }),
    ...(schemaData?.organizationAddress && { address: schemaData.organizationAddress })
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: contentTitle,
    url: schemaData?.contentUrl || baseUrl,
    description: contentDescription,
    mainEntity: {
      "@type": contentAnalysis.schemaType,
      name: contentTitle
    }
  };

  // Create publisher schema with user data or organization fallback
  const publisherSchema = schemaData?.publisherName ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: schemaData.publisherName,
    url: schemaData.publisherUrl || baseUrl,
    ...(schemaData.publisherLogo && { logo: schemaData.publisherLogo })
  } : organizationSchema;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": contentAnalysis.schemaType,
    headline: contentTitle,
    description: contentDescription,
    author: {
      "@type": "Person",
      name: schemaData?.authorName || contentAnalysis.authorName || "Content Author",
      ...(schemaData?.authorUrl && { url: schemaData.authorUrl }),
      ...(schemaData?.authorImage && { image: schemaData.authorImage }),
      ...(schemaData?.authorJobTitle && { jobTitle: schemaData.authorJobTitle }),
      ...(schemaData?.authorSameAs && { sameAs: schemaData.authorSameAs })
    },
    publisher: publisherSchema,
    datePublished: schemaData?.datePublished ? new Date(schemaData.datePublished).toISOString() : new Date().toISOString(),
    dateModified: schemaData?.dateModified ? new Date(schemaData.dateModified).toISOString() : new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": schemaData?.contentUrl || baseUrl
    },
    keywords: contentAnalysis.keywords.join(', '),
    about: contentAnalysis.topics.map(topic => ({
      "@type": "Thing",
      name: topic
    }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: extractedFAQs.length > 0 ? extractedFAQs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    })) : [{
      "@type": "Question",
      name: `What is ${contentTitle} about?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: contentDescription
      }
    }]
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

function analyzeContentType(content: string) {
  const lowerContent = content.toLowerCase();
  
  // Determine schema type based on content analysis
  let schemaType = 'Article';
  if (lowerContent.includes('recipe') || lowerContent.includes('ingredients')) {
    schemaType = 'Recipe';
  } else if (lowerContent.includes('product') || lowerContent.includes('price') || lowerContent.includes('buy')) {
    schemaType = 'Product';
  } else if (lowerContent.includes('course') || lowerContent.includes('lesson') || lowerContent.includes('learn')) {
    schemaType = 'Course';
  } else if (lowerContent.includes('how to') || lowerContent.includes('step')) {
    schemaType = 'HowTo';
  } else if (lowerContent.includes('review') || lowerContent.includes('rating')) {
    schemaType = 'Review';
  }
  
  // Extract keywords from content
  const keywords = extractKeywords(content);
  const topics = extractTopics(content);
  const authorName = extractAuthorName(content);
  
  return {
    schemaType,
    keywords,
    topics,
    authorName,
    organizationName: extractOrganizationFromContent(content)
  };
}

function extractFAQsFromContent(content: string) {
  const faqs: Array<{question: string, answer: string}> = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('?')) {
      const question = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      let answer = '';
      
      // Look for answer in next few lines
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith('#') && !nextLine.includes('?')) {
          answer = nextLine.slice(0, 200);
          break;
        }
      }
      
      if (answer) {
        faqs.push({ question, answer });
      }
    }
  }
  
  return faqs;
}

function extractKeywords(content: string): string[] {
  // Extract important keywords from content
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const wordFreq: {[key: string]: number} = {};
  
  words.forEach(word => {
    if (!commonWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractTopics(content: string): string[] {
  const topics: string[] = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('#')) {
      const topic = line.replace(/^#+\s*/, '').trim();
      if (topic) topics.push(topic);
    }
  });
  
  return topics.slice(0, 5);
}

function extractAuthorName(content: string): string | null {
  const authorPatterns = [
    /by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /author[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /written by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i
  ];
  
  for (const pattern of authorPatterns) {
    const match = content.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractOrganizationFromContent(content: string): string | null {
  const orgPatterns = [
    /([A-Z][a-z]+\s+(?:Inc|LLC|Corp|Company|Ltd))/g,
    /([A-Z][a-z]+\s+[A-Z][a-z]+\s+(?:Inc|LLC|Corp|Company|Ltd))/g
  ];
  
  for (const pattern of orgPatterns) {
    const match = content.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function sanitizeCanonicalContent(content: string): string {
  let sanitized = content;
  
  // Handle HTML content - extract title and clean text
  if (content.includes('<!DOCTYPE') || content.includes('<html')) {
    // Extract title from HTML
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1] : '';
    
    // Extract meta description
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const descText = descMatch ? descMatch[1] : '';
    
    // Strip HTML tags and get clean text
    sanitized = content.replace(/<[^>]*>/g, ' ')
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ')
      .trim();
    
    // Combine title and description with body content
    if (titleText || descText) {
      sanitized = `${titleText}\n\n${descText}\n\n${sanitized}`;
    }
  }
  
  // Remove platform-specific banners and generated content markers
  const bannersToRemove = [
    /🏷️\s*SEO Meta Tags Preview[^]*?(?=\n\n|\n#|$)/g,
    /📋\s*Table of Contents[^]*?(?=\n\n|\n#|$)/g,
    /❓\s*Frequently Asked Questions[^]*?(?=\n\n|\n#|$)/g,
    /📝\s*Step-by-Step Guide[^]*?(?=\n\n|\n#|$)/g,
    /🔍\s*Key Insights for AI Discovery[^]*?(?=\n\n|\n#|$)/g,
    /📊\s*Content Summary[^]*?(?=\n\n|\n#|$)/g,
    /AI SEO Optimizer Pro/g,
    /AI-first SEO optimization platform/g,
    /Optimization Complete/g,
    /Enhanced with.*-->/g,
    /<!--.*?-->/g
  ];
  
  bannersToRemove.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Clean up extra whitespace
  sanitized = sanitized.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  return sanitized;
}