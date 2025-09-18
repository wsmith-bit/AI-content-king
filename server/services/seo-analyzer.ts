import * as cheerio from 'cheerio';

export interface AnalysisResult {
  content: {
    title: string;
    headings: HeadingStructure[];
    paragraphs: string[];
    wordCount: number;
    characterCount: number;
    readingTime: number;
    keywordDensity: KeywordAnalysis[];
  };
  structure: {
    hasH1: boolean;
    headingHierarchy: boolean;
    hasTableOfContents: boolean;
    hasFAQSection: boolean;
    hasHowToSteps: boolean;
    listCount: number;
    tableCount: number;
  };
  media: {
    images: ImageAnalysis[];
    videos: VideoAnalysis[];
    totalMediaCount: number;
    imagesWithAlt: number;
    altTextCoverage: number;
  };
  links: {
    internal: LinkAnalysis[];
    external: LinkAnalysis[];
    totalLinks: number;
    noFollowCount: number;
    anchorTextOptimization: number;
  };
  metadata: {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    robots?: string;
    openGraph: OpenGraphData;
    twitterCard: TwitterCardData;
  };
  technicalFactors: {
    hasLanguageDeclaration: boolean;
    hasViewportMeta: boolean;
    hasCharsetDeclaration: boolean;
    structuredDataBlocks: number;
    jsonLdBlocks: StructuredDataBlock[];
  };
  aiOptimization: {
    hasQAFormat: boolean;
    conversationalElements: number;
    voiceSearchOptimized: boolean;
    entityMentions: EntityMention[];
    answerableQuestions: string[];
  };
  readability: {
    fleschScore: number;
    averageWordsPerSentence: number;
    averageSyllablesPerWord: number;
    readingLevel: string;
    sentenceCount: number;
  };
}

export interface HeadingStructure {
  level: number;
  text: string;
  position: number;
}

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number;
  positions: number[];
}

export interface ImageAnalysis {
  src: string;
  alt: string;
  hasAlt: boolean;
  hasDimensions: boolean;
  isLazyLoaded: boolean;
  isProbablyHero: boolean;
}

export interface VideoAnalysis {
  src: string;
  hasTitle: boolean;
  hasDescription: boolean;
}

export interface LinkAnalysis {
  href: string;
  text: string;
  isInternal: boolean;
  hasNoFollow: boolean;
  hasTitle: boolean;
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  url?: string;
  complete: boolean;
}

export interface TwitterCardData {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  complete: boolean;
}

export interface StructuredDataBlock {
  type: string;
  context: string;
  data: any;
  valid: boolean;
}

export interface EntityMention {
  entity: string;
  context: string;
  count: number;
}

export class SEOAnalyzer {
  public analyzeContent(content: string, isHTML: boolean = false): AnalysisResult {
    const $ = isHTML ? cheerio.load(content) : this.createDOMFromMarkdown(content);
    
    return {
      content: this.analyzeContentStructure($),
      structure: this.analyzeDocumentStructure($),
      media: this.analyzeMedia($),
      links: this.analyzeLinks($),
      metadata: this.analyzeMetadata($),
      technicalFactors: this.analyzeTechnicalFactors($),
      aiOptimization: this.analyzeAIOptimization($),
      readability: this.analyzeReadability($)
    };
  }

  private createDOMFromMarkdown(markdown: string): cheerio.CheerioAPI {
    // Convert markdown to basic HTML structure for analysis
    let html = markdown
      // Convert headings
      .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
      // Convert paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Convert lists
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Convert bold/italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Convert links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Wrap in paragraph tags
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs and fix structure
    html = html
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>)/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<li>.*<\/li>)<\/p>/g, '<ul>$1</ul>')
      .replace(/<li><\/p>/g, '</li>')
      .replace(/<p><li>/g, '<li>');

    return cheerio.load(`<html><body>${html}</body></html>`);
  }

  private analyzeContentStructure($: cheerio.CheerioAPI): AnalysisResult['content'] {
    const text = $.text().trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const title = $('h1').first().text() || $('h2').first().text() || 'No Title Found';
    
    const headings: HeadingStructure[] = [];
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
      const $el = $(element);
      headings.push({
        level: parseInt($el.prop('tagName')?.charAt(1) || '1'),
        text: $el.text().trim(),
        position: index
      });
    });

    const paragraphs: string[] = [];
    $('p').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 20) {
        paragraphs.push(text);
      }
    });

    const keywordDensity = this.calculateKeywordDensity(text);

    return {
      title,
      headings,
      paragraphs,
      wordCount: words.length,
      characterCount: text.length,
      readingTime: Math.ceil(words.length / 200),
      keywordDensity
    };
  }

  private analyzeDocumentStructure($: cheerio.CheerioAPI): AnalysisResult['structure'] {
    const h1Count = $('h1').length;
    const headingHierarchy = this.checkHeadingHierarchy($);
    
    // Look for table of contents patterns
    const hasTOC = $('*').text().toLowerCase().includes('table of contents') ||
                  $('nav').length > 0 ||
                  $('ol, ul').text().toLowerCase().includes('overview');
    
    // Look for FAQ patterns
    const hasFAQ = $('*').text().toLowerCase().includes('frequently asked') ||
                  $('*').text().toLowerCase().includes('faq') ||
                  $('*:contains("Q:")').length > 0;
    
    // Look for how-to patterns
    const hasHowTo = $('*').text().toLowerCase().includes('step') ||
                    $('*').text().toLowerCase().includes('how to') ||
                    $('ol li').length > 2;

    return {
      hasH1: h1Count === 1, // Should have exactly one H1
      headingHierarchy,
      hasTableOfContents: hasTOC,
      hasFAQSection: hasFAQ,
      hasHowToSteps: hasHowTo,
      listCount: $('ul, ol').length,
      tableCount: $('table').length
    };
  }

  private analyzeMedia($: cheerio.CheerioAPI): AnalysisResult['media'] {
    const images: ImageAnalysis[] = [];
    let imagesWithAlt = 0;

    $('img').each((index, element) => {
      const $img = $(element);
      const src = $img.attr('src') || '';
      const alt = $img.attr('alt') || '';
      const hasAlt = alt.length > 0;
      const hasDimensions = $img.attr('width') && $img.attr('height');
      const isLazyLoaded = $img.attr('loading') === 'lazy';
      const isProbablyHero = index === 0 || $img.closest('header, .hero, .banner').length > 0;

      if (hasAlt) imagesWithAlt++;

      images.push({
        src,
        alt,
        hasAlt,
        hasDimensions: !!hasDimensions,
        isLazyLoaded,
        isProbablyHero
      });
    });

    const videos: VideoAnalysis[] = [];
    $('video').each((_, element) => {
      const $video = $(element);
      videos.push({
        src: $video.attr('src') || $video.find('source').attr('src') || '',
        hasTitle: !!$video.attr('title'),
        hasDescription: !!$video.attr('aria-describedby')
      });
    });

    return {
      images,
      videos,
      totalMediaCount: images.length + videos.length,
      imagesWithAlt,
      altTextCoverage: images.length > 0 ? (imagesWithAlt / images.length) * 100 : 100
    };
  }

  private analyzeLinks($: cheerio.CheerioAPI): AnalysisResult['links'] {
    const internal: LinkAnalysis[] = [];
    const external: LinkAnalysis[] = [];
    let noFollowCount = 0;

    $('a[href]').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href') || '';
      const text = $link.text().trim();
      const isInternal = this.isInternalLink(href);
      const hasNoFollow = $link.attr('rel')?.includes('nofollow') || false;
      const hasTitle = !!$link.attr('title');

      if (hasNoFollow) noFollowCount++;

      const linkData: LinkAnalysis = {
        href,
        text,
        isInternal,
        hasNoFollow,
        hasTitle
      };

      if (isInternal) {
        internal.push(linkData);
      } else {
        external.push(linkData);
      }
    });

    // Calculate anchor text optimization score
    const totalLinks = internal.length + external.length;
    const optimizedAnchors = [...internal, ...external].filter(
      link => link.text.length > 2 && !link.text.toLowerCase().includes('click here') && 
              !link.text.toLowerCase().includes('read more')
    ).length;
    
    const anchorTextOptimization = totalLinks > 0 ? (optimizedAnchors / totalLinks) * 100 : 100;

    return {
      internal,
      external,
      totalLinks,
      noFollowCount,
      anchorTextOptimization
    };
  }

  private analyzeMetadata($: cheerio.CheerioAPI): AnalysisResult['metadata'] {
    const title = $('meta[name="title"]').attr('content') || $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const keywords = $('meta[name="keywords"]').attr('content');
    const canonical = $('link[rel="canonical"]').attr('href');
    const robots = $('meta[name="robots"]').attr('content');

    // Analyze Open Graph data
    const openGraph: OpenGraphData = {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content'),
      complete: false
    };
    openGraph.complete = !!(openGraph.title && openGraph.description && openGraph.image);

    // Analyze Twitter Card data
    const twitterCard: TwitterCardData = {
      card: $('meta[name="twitter:card"]').attr('content'),
      title: $('meta[name="twitter:title"]').attr('content'),
      description: $('meta[name="twitter:description"]').attr('content'),
      image: $('meta[name="twitter:image"]').attr('content'),
      complete: false
    };
    twitterCard.complete = !!(twitterCard.card && twitterCard.title && twitterCard.description);

    return {
      title,
      description,
      keywords,
      canonical,
      robots,
      openGraph,
      twitterCard
    };
  }

  private analyzeTechnicalFactors($: cheerio.CheerioAPI): AnalysisResult['technicalFactors'] {
    const hasLanguageDeclaration = $('html[lang]').length > 0;
    const hasViewportMeta = $('meta[name="viewport"]').length > 0;
    const hasCharsetDeclaration = $('meta[charset]').length > 0;

    const jsonLdBlocks: StructuredDataBlock[] = [];
    $('script[type="application/ld+json"]').each((_, element) => {
      const content = $(element).html();
      if (content) {
        try {
          const data = JSON.parse(content);
          jsonLdBlocks.push({
            type: data['@type'] || 'Unknown',
            context: data['@context'] || '',
            data,
            valid: true
          });
        } catch (error) {
          jsonLdBlocks.push({
            type: 'Invalid',
            context: '',
            data: content,
            valid: false
          });
        }
      }
    });

    return {
      hasLanguageDeclaration,
      hasViewportMeta,
      hasCharsetDeclaration,
      structuredDataBlocks: jsonLdBlocks.length,
      jsonLdBlocks
    };
  }

  private analyzeAIOptimization($: cheerio.CheerioAPI): AnalysisResult['aiOptimization'] {
    const text = $.text().toLowerCase();
    
    // Check for Q&A format
    const hasQAFormat = text.includes('q:') || text.includes('question:') || 
                       text.includes('frequently asked') || text.includes('faq');
    
    // Count conversational elements
    const conversationalMarkers = [
      'to illustrate', 'for example', 'in other words', 'that is to say',
      'additionally', 'furthermore', 'however', 'therefore', 'consequently'
    ];
    const conversationalElements = conversationalMarkers.reduce((count, marker) => {
      const regex = new RegExp(marker, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);

    // Check voice search optimization
    const voiceSearchPatterns = [
      'how to', 'what is', 'why does', 'when should', 'where can',
      'how do you', 'what are the', 'how much does'
    ];
    const voiceSearchOptimized = voiceSearchPatterns.some(pattern => text.includes(pattern));

    // Extract entity mentions
    const entityMentions = this.extractEntityMentions($.text());

    // Find answerable questions
    const answerableQuestions = this.extractAnswerableQuestions($.text());

    return {
      hasQAFormat,
      conversationalElements,
      voiceSearchOptimized,
      entityMentions,
      answerableQuestions
    };
  }

  private analyzeReadability($: cheerio.CheerioAPI): AnalysisResult['readability'] {
    const text = $.text();
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    const averageWordsPerSentence = words.length / sentences.length;
    const averageSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);

    let readingLevel = '';
    if (fleschScore >= 90) readingLevel = 'Very Easy';
    else if (fleschScore >= 80) readingLevel = 'Easy';
    else if (fleschScore >= 70) readingLevel = 'Fairly Easy';
    else if (fleschScore >= 60) readingLevel = 'Standard';
    else if (fleschScore >= 50) readingLevel = 'Fairly Difficult';
    else if (fleschScore >= 30) readingLevel = 'Difficult';
    else readingLevel = 'Very Difficult';

    return {
      fleschScore: Math.max(0, Math.min(100, fleschScore)),
      averageWordsPerSentence,
      averageSyllablesPerWord,
      readingLevel,
      sentenceCount: sentences.length
    };
  }

  // Helper methods

  private calculateKeywordDensity(text: string): KeywordAnalysis[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount: { [key: string]: { count: number; positions: number[] } } = {};
    
    words.forEach((word, index) => {
      if (!wordCount[word]) {
        wordCount[word] = { count: 0, positions: [] };
      }
      wordCount[word].count++;
      wordCount[word].positions.push(index);
    });

    const stopWords = new Set([
      'that', 'this', 'with', 'from', 'they', 'been', 'have', 'will', 'your',
      'what', 'when', 'where', 'their', 'would', 'there', 'here', 'also',
      'each', 'other', 'which', 'some', 'more', 'then', 'than', 'only',
      'very', 'into', 'over', 'after', 'most', 'such', 'time', 'many'
    ]);

    return Object.entries(wordCount)
      .filter(([word]) => !stopWords.has(word))
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        density: (data.count / words.length) * 100,
        positions: data.positions
      }));
  }

  private checkHeadingHierarchy($: cheerio.CheerioAPI): boolean {
    const headings = $('h1, h2, h3, h4, h5, h6').toArray().map(el => {
      return parseInt($(el).prop('tagName')?.charAt(1) || '1');
    });

    if (headings.length === 0) return false;
    
    // Check if headings follow proper hierarchy (no skipping levels)
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] - headings[i - 1] > 1) {
        return false; // Skipped a level
      }
    }
    
    return true;
  }

  private isInternalLink(href: string): boolean {
    if (!href) return false;
    
    // Relative URLs are internal
    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
      return true;
    }
    
    // Hash links are internal
    if (href.startsWith('#')) {
      return true;
    }
    
    // If it doesn't start with http, it's probably internal
    if (!href.startsWith('http')) {
      return true;
    }
    
    return false;
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;

    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      const vowelPattern = /[aeiouy]+/g;
      const matches = word.match(vowelPattern);
      let syllables = matches ? matches.length : 0;

      // Adjust for silent e
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }

      // Ensure at least 1 syllable per word
      totalSyllables += Math.max(1, syllables);
    });

    return totalSyllables;
  }

  private extractEntityMentions(text: string): EntityMention[] {
    const entities: { [key: string]: { count: number; contexts: string[] } } = {};
    
    // Common entity patterns
    const entityPatterns = [
      { pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g, type: 'Person/Organization' },
      { pattern: /\b\d{4}\b/g, type: 'Year' },
      { pattern: /\$[\d,]+\.?\d*/g, type: 'Money' },
      { pattern: /\b\d+%\b/g, type: 'Percentage' }
    ];

    entityPatterns.forEach(({ pattern }) => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const normalized = match.trim();
        if (!entities[normalized]) {
          entities[normalized] = { count: 0, contexts: [] };
        }
        entities[normalized].count++;
        
        // Extract context (surrounding words)
        const index = text.indexOf(match);
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + match.length + 30);
        const context = text.slice(start, end).trim();
        
        if (entities[normalized].contexts.length < 3) {
          entities[normalized].contexts.push(context);
        }
      });
    });

    return Object.entries(entities)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([entity, data]) => ({
        entity,
        context: data.contexts[0] || '',
        count: data.count
      }));
  }

  private extractAnswerableQuestions(text: string): string[] {
    const questionPatterns = [
      /(?:^|\n)(.{0,100}(?:how|what|why|when|where|which|who).{0,100}?\?)/gmi,
      /(?:^|\n)(Q:\s*.+?\?)/gmi,
      /(?:^|\n)(Question:\s*.+?\?)/gmi
    ];

    const questions = new Set<string>();
    
    questionPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = match.replace(/^\n/, '').trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          questions.add(cleaned);
        }
      });
    });

    return Array.from(questions).slice(0, 5);
  }
}