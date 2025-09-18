import { AnalysisResult } from './seo-analyzer';

export interface EnhancedMetadata {
  title: OptimizedMetaTag;
  description: OptimizedMetaTag;
  keywords: string[];
  canonical: string;
  robots: string;
  openGraph: OpenGraphMetadata;
  twitterCard: TwitterCardMetadata;
  additionalMeta: AdditionalMetaTags;
  recommendations: MetadataRecommendation[];
}

export interface OptimizedMetaTag {
  content: string;
  length: number;
  isOptimal: boolean;
  recommendations: string[];
  alternatives: string[];
}

export interface OpenGraphMetadata {
  title: string;
  description: string;
  image?: string;
  type: string;
  url?: string;
  siteName?: string;
  locale: string;
}

export interface TwitterCardMetadata {
  card: string;
  title: string;
  description: string;
  image?: string;
  creator?: string;
  site?: string;
}

export interface AdditionalMetaTags {
  author?: string;
  viewport: string;
  charset: string;
  themeColor?: string;
  appleTouchIcon?: string;
  manifest?: string;
  generator: string;
}

export interface MetadataRecommendation {
  type: 'title' | 'description' | 'keywords' | 'og' | 'twitter' | 'technical';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  solution: string;
  impact: string;
  codeSnippet?: string;
}

export class EnhancedMetadataGenerator {
  
  public generateOptimizedMetadata(
    analysis: AnalysisResult, 
    options: {
      siteName?: string;
      baseUrl?: string;
      defaultImage?: string;
      author?: string;
      twitterHandle?: string;
    } = {}
  ): EnhancedMetadata {
    
    const title = this.generateOptimizedTitle(analysis);
    const description = this.generateOptimizedDescription(analysis);
    const keywords = this.generateOptimizedKeywords(analysis);
    
    return {
      title,
      description,
      keywords,
      canonical: this.generateCanonicalUrl(options.baseUrl),
      robots: this.generateRobotsDirective(),
      openGraph: this.generateOpenGraph(analysis, title, description, options),
      twitterCard: this.generateTwitterCard(analysis, title, description, options),
      additionalMeta: this.generateAdditionalMeta(options),
      recommendations: this.generateMetadataRecommendations(analysis, title, description, options)
    };
  }

  private generateOptimizedTitle(analysis: AnalysisResult): OptimizedMetaTag {
    let baseTitle = analysis.content.title;
    
    // If no good title found, create from top keywords
    if (!baseTitle || baseTitle === 'No Title Found' || baseTitle.length < 10) {
      const topKeywords = analysis.content.keywordDensity.slice(0, 3);
      if (topKeywords.length > 0) {
        baseTitle = this.capitalizeWords(topKeywords.map(kw => kw.keyword).join(' '));
      } else {
        baseTitle = 'Comprehensive Guide';
      }
    }

    // Optimize the title
    const optimizedTitles = this.createTitleVariations(baseTitle, analysis);
    const bestTitle = this.selectBestTitle(optimizedTitles);
    
    const isOptimal = bestTitle.length >= 30 && bestTitle.length <= 60;
    const recommendations: string[] = [];
    const alternatives: string[] = optimizedTitles.filter(t => t !== bestTitle).slice(0, 3);

    if (bestTitle.length < 30) {
      recommendations.push('Title is too short. Consider adding descriptive words or your brand name.');
    } else if (bestTitle.length > 60) {
      recommendations.push('Title is too long. It may be truncated in search results.');
    }

    if (!this.containsFocusKeyword(bestTitle, analysis)) {
      recommendations.push('Consider including your main focus keyword in the title.');
    }

    return {
      content: bestTitle,
      length: bestTitle.length,
      isOptimal,
      recommendations,
      alternatives
    };
  }

  private generateOptimizedDescription(analysis: AnalysisResult): OptimizedMetaTag {
    const existingDescription = analysis.metadata.description;
    
    // If existing description is good, use it as base
    let baseDescription = '';
    if (existingDescription && existingDescription.length > 50) {
      baseDescription = existingDescription;
    } else {
      // Generate from content analysis
      baseDescription = this.createDescriptionFromContent(analysis);
    }

    // Optimize the description
    const optimizedDescriptions = this.createDescriptionVariations(baseDescription, analysis);
    const bestDescription = this.selectBestDescription(optimizedDescriptions);
    
    const isOptimal = bestDescription.length >= 120 && bestDescription.length <= 160;
    const recommendations: string[] = [];
    const alternatives: string[] = optimizedDescriptions.filter(d => d !== bestDescription).slice(0, 3);

    if (bestDescription.length < 120) {
      recommendations.push('Description is too short. Add more compelling details about your content.');
    } else if (bestDescription.length > 160) {
      recommendations.push('Description is too long. It may be truncated in search results.');
    }

    if (!this.containsCallToAction(bestDescription)) {
      recommendations.push('Consider adding a call-to-action to improve click-through rates.');
    }

    return {
      content: bestDescription,
      length: bestDescription.length,
      isOptimal,
      recommendations,
      alternatives
    };
  }

  private generateOptimizedKeywords(analysis: AnalysisResult): string[] {
    // Get top keywords from content analysis
    const topKeywords = analysis.content.keywordDensity
      .filter(kw => kw.density < 5) // Avoid over-optimized keywords
      .slice(0, 8)
      .map(kw => kw.keyword);

    // Add semantic variations and related terms
    const enhancedKeywords = new Set<string>(topKeywords);
    
    // Add entity mentions as potential keywords
    analysis.aiOptimization.entityMentions.forEach(entity => {
      if (entity.count >= 2 && entity.entity.length > 3) {
        enhancedKeywords.add(entity.entity.toLowerCase());
      }
    });

    // Add long-tail variations for top keywords
    topKeywords.slice(0, 3).forEach(keyword => {
      const variations = this.generateLongTailVariations(keyword, analysis);
      variations.forEach(variation => enhancedKeywords.add(variation));
    });

    return Array.from(enhancedKeywords).slice(0, 10);
  }

  private generateCanonicalUrl(baseUrl?: string): string {
    if (!baseUrl) return '';
    
    // In a real implementation, this would be the current page URL
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  private generateRobotsDirective(): string {
    // Default to index, follow for most content
    return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  }

  private generateOpenGraph(
    analysis: AnalysisResult, 
    title: OptimizedMetaTag, 
    description: OptimizedMetaTag,
    options: any
  ): OpenGraphMetadata {
    return {
      title: this.truncateForOG(title.content),
      description: this.truncateForOG(description.content, 300),
      image: options.defaultImage || '',
      type: this.determineOGType(analysis),
      url: options.baseUrl || '',
      siteName: options.siteName || '',
      locale: 'en_US'
    };
  }

  private generateTwitterCard(
    analysis: AnalysisResult, 
    title: OptimizedMetaTag, 
    description: OptimizedMetaTag,
    options: any
  ): TwitterCardMetadata {
    return {
      card: 'summary_large_image',
      title: this.truncateForTwitter(title.content),
      description: this.truncateForTwitter(description.content, 200),
      image: options.defaultImage || '',
      creator: options.twitterHandle || '',
      site: options.twitterHandle || ''
    };
  }

  private generateAdditionalMeta(options: any): AdditionalMetaTags {
    return {
      author: options.author || '',
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'utf-8',
      themeColor: '#ffffff',
      generator: 'AI SEO Optimizer Pro',
      manifest: '/manifest.json',
      appleTouchIcon: '/apple-touch-icon.png'
    };
  }

  private generateMetadataRecommendations(
    analysis: AnalysisResult,
    title: OptimizedMetaTag,
    description: OptimizedMetaTag,
    options: any
  ): MetadataRecommendation[] {
    const recommendations: MetadataRecommendation[] = [];

    // Title recommendations
    if (!title.isOptimal) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        issue: title.length < 30 ? 'Title too short' : 'Title too long',
        solution: title.length < 30 ? 
          'Expand title to 30-60 characters by adding descriptive words or brand name' :
          'Shorten title to under 60 characters while keeping key information',
        impact: 'Improves click-through rates and search visibility',
        codeSnippet: `<title>${title.alternatives[0] || title.content}</title>`
      });
    }

    // Description recommendations
    if (!description.isOptimal) {
      recommendations.push({
        type: 'description',
        priority: 'high',
        issue: description.length < 120 ? 'Description too short' : 'Description too long',
        solution: description.length < 120 ?
          'Expand to 120-160 characters with compelling details and benefits' :
          'Shorten to under 160 characters while maintaining key selling points',
        impact: 'Better search result snippets and higher click-through rates',
        codeSnippet: `<meta name="description" content="${description.alternatives[0] || description.content}">`
      });
    }

    // Open Graph recommendations
    if (!options.defaultImage) {
      recommendations.push({
        type: 'og',
        priority: 'medium',
        issue: 'Missing Open Graph image',
        solution: 'Add a compelling image (1200x630px recommended) for social sharing',
        impact: 'Improves social media engagement and click-through rates',
        codeSnippet: '<meta property="og:image" content="https://yoursite.com/og-image.jpg">'
      });
    }

    // Keywords recommendations
    const topKeyword = analysis.content.keywordDensity[0];
    if (topKeyword && topKeyword.density > 3) {
      recommendations.push({
        type: 'keywords',
        priority: 'medium',
        issue: `Keyword "${topKeyword.keyword}" density is ${topKeyword.density.toFixed(1)}%`,
        solution: 'Reduce keyword density to 1-3% to avoid over-optimization',
        impact: 'Prevents keyword stuffing penalties and improves natural readability'
      });
    }

    // Technical recommendations
    if (!analysis.technicalFactors.hasViewportMeta) {
      recommendations.push({
        type: 'technical',
        priority: 'high',
        issue: 'Missing viewport meta tag',
        solution: 'Add viewport meta tag for mobile responsiveness',
        impact: 'Essential for mobile SEO and user experience',
        codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods

  private createTitleVariations(baseTitle: string, analysis: AnalysisResult): string[] {
    const variations: string[] = [baseTitle];
    const topKeywords = analysis.content.keywordDensity.slice(0, 2);
    
    // Add keyword-focused variations
    if (topKeywords.length > 0) {
      const focusKeyword = this.capitalizeWords(topKeywords[0].keyword);
      
      if (!baseTitle.toLowerCase().includes(focusKeyword.toLowerCase())) {
        variations.push(`${focusKeyword}: ${baseTitle}`);
        variations.push(`${baseTitle} | ${focusKeyword} Guide`);
      }
    }

    // Add year for freshness
    const currentYear = new Date().getFullYear();
    if (!baseTitle.includes(currentYear.toString())) {
      variations.push(`${baseTitle} (${currentYear})`);
      variations.push(`${baseTitle} - ${currentYear} Guide`);
    }

    // Add action-oriented variations
    if (!baseTitle.toLowerCase().match(/\b(how to|guide|tips|complete|ultimate)\b/)) {
      variations.push(`Complete ${baseTitle} Guide`);
      variations.push(`How to: ${baseTitle}`);
      variations.push(`Ultimate ${baseTitle} Tips`);
    }

    return variations.filter(v => v.length <= 70); // Filter out overly long variations
  }

  private createDescriptionVariations(baseDescription: string, analysis: AnalysisResult): string[] {
    const variations: string[] = [baseDescription];
    const topKeywords = analysis.content.keywordDensity.slice(0, 3);

    // Create benefit-focused variation
    if (analysis.content.paragraphs.length > 0) {
      const firstParagraph = analysis.content.paragraphs[0];
      const benefit = this.extractBenefit(firstParagraph);
      if (benefit) {
        variations.push(benefit + ' ' + baseDescription.slice(0, 120) + '...');
      }
    }

    // Create keyword-rich variation
    if (topKeywords.length >= 2) {
      const keywordPhrase = topKeywords.slice(0, 2).map(kw => kw.keyword).join(' ');
      variations.push(`Learn about ${keywordPhrase}. ${baseDescription.slice(0, 120)}...`);
    }

    // Add call-to-action variation
    const ctaVariation = this.addCallToAction(baseDescription);
    if (ctaVariation !== baseDescription) {
      variations.push(ctaVariation);
    }

    return variations
      .filter(v => v.length >= 50 && v.length <= 170)
      .filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
  }

  private createDescriptionFromContent(analysis: AnalysisResult): string {
    // Start with first meaningful paragraph
    let description = '';
    
    if (analysis.content.paragraphs.length > 0) {
      const firstParagraph = analysis.content.paragraphs[0];
      description = firstParagraph.slice(0, 140);
      
      // Clean up and add compelling hook
      description = description.replace(/\s+/g, ' ').trim();
      
      // Add period if not ending with punctuation
      if (!description.match(/[.!?]$/)) {
        description += '.';
      }
    } else {
      // Fallback to keyword-based description
      const topKeywords = analysis.content.keywordDensity.slice(0, 3);
      if (topKeywords.length > 0) {
        description = `Discover everything you need to know about ${topKeywords.map(kw => kw.keyword).join(', ')}. Comprehensive guide with expert insights and practical tips.`;
      } else {
        description = 'Comprehensive guide with expert insights and practical information to help you make informed decisions.';
      }
    }

    return description;
  }

  private selectBestTitle(titles: string[]): string {
    // Scoring criteria: length (30-60 chars), keyword presence, uniqueness
    return titles.reduce((best, current) => {
      const bestScore = this.scoreTitleQuality(best);
      const currentScore = this.scoreTitleQuality(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private selectBestDescription(descriptions: string[]): string {
    return descriptions.reduce((best, current) => {
      const bestScore = this.scoreDescriptionQuality(best);
      const currentScore = this.scoreDescriptionQuality(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private scoreTitleQuality(title: string): number {
    let score = 0;
    
    // Length optimization (30-60 chars)
    if (title.length >= 30 && title.length <= 60) score += 10;
    else if (title.length >= 25 && title.length <= 70) score += 7;
    else score += 3;
    
    // Keyword presence (implied by character diversity)
    const uniqueChars = new Set(title.toLowerCase()).size;
    if (uniqueChars > 15) score += 5;
    
    // Action words bonus
    if (title.toLowerCase().match(/\b(ultimate|complete|guide|how to|tips|best)\b/)) score += 3;
    
    // Year presence for freshness
    if (title.includes(new Date().getFullYear().toString())) score += 2;
    
    return score;
  }

  private scoreDescriptionQuality(description: string): number {
    let score = 0;
    
    // Length optimization (120-160 chars)
    if (description.length >= 120 && description.length <= 160) score += 10;
    else if (description.length >= 100 && description.length <= 170) score += 7;
    else score += 3;
    
    // Call to action presence
    if (this.containsCallToAction(description)) score += 5;
    
    // Benefit language
    if (description.toLowerCase().match(/\b(discover|learn|improve|save|get|find)\b/)) score += 3;
    
    // Numbers/specificity
    if (description.match(/\d+/)) score += 2;
    
    return score;
  }

  private containsFocusKeyword(text: string, analysis: AnalysisResult): boolean {
    if (analysis.content.keywordDensity.length === 0) return true; // No penalty if no clear focus keyword
    
    const focusKeyword = analysis.content.keywordDensity[0].keyword;
    return text.toLowerCase().includes(focusKeyword);
  }

  private containsCallToAction(text: string): boolean {
    const ctaPatterns = [
      /\b(discover|learn|explore|find out|get|start|try|see|check out|read more)\b/i,
      /\b(today|now|here)\b/i
    ];
    
    return ctaPatterns.some(pattern => pattern.test(text));
  }

  private addCallToAction(description: string): string {
    if (this.containsCallToAction(description) || description.length > 140) {
      return description;
    }
    
    const ctas = [
      ' Start here!',
      ' Learn more.',
      ' Get started today.',
      ' Discover how.',
      ' Find out more.',
      ' Read the complete guide.'
    ];
    
    const availableSpace = 160 - description.length;
    const suitableCtas = ctas.filter(cta => cta.length <= availableSpace);
    
    if (suitableCtas.length > 0) {
      return description.trim() + suitableCtas[0];
    }
    
    return description;
  }

  private generateLongTailVariations(keyword: string, analysis: AnalysisResult): string[] {
    const variations: string[] = [];
    
    // Add question-based long-tail keywords
    variations.push(`how to ${keyword}`);
    variations.push(`what is ${keyword}`);
    variations.push(`best ${keyword}`);
    variations.push(`${keyword} guide`);
    variations.push(`${keyword} tips`);
    
    // Add location-based if relevant (heuristic)
    if (keyword.toLowerCase().match(/\b(service|business|store|repair|doctor|lawyer)\b/)) {
      variations.push(`${keyword} near me`);
    }
    
    // Add year for freshness
    variations.push(`${keyword} ${new Date().getFullYear()}`);
    
    return variations.filter(v => v.length <= 50);
  }

  private extractBenefit(paragraph: string): string | null {
    // Look for benefit-indicating patterns
    const benefitPatterns = [
      /\b(save|improve|increase|reduce|eliminate|boost|enhance|optimize)\b[^.!?]*[.!?]/i,
      /\b(helps? you|allows? you|enables? you|makes? it easier)\b[^.!?]*[.!?]/i
    ];
    
    for (const pattern of benefitPatterns) {
      const match = paragraph.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return null;
  }

  private determineOGType(analysis: AnalysisResult): string {
    // Determine appropriate Open Graph type based on content
    if (analysis.structure.hasHowToSteps) return 'article';
    if (analysis.structure.hasFAQSection) return 'article';
    if (analysis.content.wordCount > 500) return 'article';
    
    return 'website';
  }

  private truncateForOG(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3).trim() + '...';
  }

  private truncateForTwitter(text: string, maxLength: number = 70): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3).trim() + '...';
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}