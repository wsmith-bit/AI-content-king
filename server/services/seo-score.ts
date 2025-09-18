import { AnalysisResult } from './seo-analyzer';

export interface SEOCheck {
  id: string;
  name: string;
  category: CheckCategory;
  weight: number;
  status: CheckStatus;
  score: number;
  maxScore: number;
  evidence: string[];
  recommendations: string[];
  impact: Impact;
  difficulty: Difficulty;
}

export interface SEOScoreResult {
  overallScore: number;
  categoryScores: CategoryScore[];
  checks: SEOCheck[];
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  pendingChecks: number;
  recommendations: PrioritizedRecommendation[];
}

export interface CategoryScore {
  category: CheckCategory;
  score: number;
  maxScore: number;
  percentage: number;
  checkCount: number;
  passedCount: number;
}

export interface PrioritizedRecommendation {
  title: string;
  description: string;
  category: CheckCategory;
  impact: Impact;
  difficulty: Difficulty;
  priority: number;
  actionItems: string[];
  codeSnippets?: string[];
}

export enum CheckCategory {
  METADATA = 'metadata',
  CONTENT = 'content',
  STRUCTURE = 'structure',
  LINKS_MEDIA = 'links_media',
  STRUCTURED_DATA = 'structured_data',
  TECHNICAL_SEO = 'technical_seo',
  AI_OPTIMIZATION = 'ai_optimization',
  CORE_WEB_VITALS = 'core_web_vitals',
  SOCIAL_MEDIA = 'social_media',
  ACCESSIBILITY = 'accessibility'
}

export enum CheckStatus {
  PASS = 'pass',
  PARTIAL = 'partial',
  FAIL = 'fail',
  PENDING = 'pending'
}

export enum Impact {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export class SEOScorer {
  private checks: SEOCheck[] = [];

  public scoreAnalysis(analysis: AnalysisResult): SEOScoreResult {
    this.checks = [];
    
    // Run all SEO checks
    this.runMetadataChecks(analysis);
    this.runContentChecks(analysis);
    this.runStructureChecks(analysis);
    this.runLinksMediaChecks(analysis);
    this.runStructuredDataChecks(analysis);
    this.runTechnicalSEOChecks(analysis);
    this.runAIOptimizationChecks(analysis);
    this.runCoreWebVitalsChecks(analysis);
    this.runSocialMediaChecks(analysis);
    this.runAccessibilityChecks(analysis);

    return this.calculateFinalScore();
  }

  private runMetadataChecks(analysis: AnalysisResult): void {
    // Title tag checks
    this.addCheck({
      id: 'title-exists',
      name: 'Title Tag Exists',
      category: CheckCategory.METADATA,
      weight: 10,
      status: analysis.metadata.title ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.metadata.title ? 10 : 0,
      maxScore: 10,
      evidence: analysis.metadata.title ? [`Title found: "${analysis.metadata.title}"`] : ['No title tag found'],
      recommendations: analysis.metadata.title ? [] : ['Add a descriptive title tag to your page'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Title length check
    const titleLength = analysis.metadata.title?.length || 0;
    const titleLengthOptimal = titleLength >= 30 && titleLength <= 60;
    this.addCheck({
      id: 'title-length',
      name: 'Title Length Optimization',
      category: CheckCategory.METADATA,
      weight: 8,
      status: titleLengthOptimal ? CheckStatus.PASS : titleLength > 0 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: titleLengthOptimal ? 8 : titleLength > 0 ? 4 : 0,
      maxScore: 8,
      evidence: [`Title length: ${titleLength} characters`],
      recommendations: titleLength === 0 ? ['Add a title tag'] : 
                      titleLength < 30 ? ['Expand your title to 30-60 characters'] :
                      titleLength > 60 ? ['Shorten your title to under 60 characters'] : [],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Meta description checks
    this.addCheck({
      id: 'meta-description-exists',
      name: 'Meta Description Exists',
      category: CheckCategory.METADATA,
      weight: 8,
      status: analysis.metadata.description ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.metadata.description ? 8 : 0,
      maxScore: 8,
      evidence: analysis.metadata.description ? [`Description found: "${analysis.metadata.description.slice(0, 100)}..."`] : ['No meta description found'],
      recommendations: analysis.metadata.description ? [] : ['Add a compelling meta description'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Meta description length
    const descLength = analysis.metadata.description?.length || 0;
    const descLengthOptimal = descLength >= 120 && descLength <= 160;
    this.addCheck({
      id: 'meta-description-length',
      name: 'Meta Description Length',
      category: CheckCategory.METADATA,
      weight: 6,
      status: descLengthOptimal ? CheckStatus.PASS : descLength > 0 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: descLengthOptimal ? 6 : descLength > 0 ? 3 : 0,
      maxScore: 6,
      evidence: [`Description length: ${descLength} characters`],
      recommendations: descLength === 0 ? ['Add a meta description'] : 
                      descLength < 120 ? ['Expand description to 120-160 characters'] :
                      descLength > 160 ? ['Shorten description to under 160 characters'] : [],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Canonical URL check
    this.addCheck({
      id: 'canonical-url',
      name: 'Canonical URL',
      category: CheckCategory.METADATA,
      weight: 5,
      status: analysis.metadata.canonical ? CheckStatus.PASS : CheckStatus.PENDING,
      score: analysis.metadata.canonical ? 5 : 0,
      maxScore: 5,
      evidence: analysis.metadata.canonical ? [`Canonical URL: ${analysis.metadata.canonical}`] : ['No canonical URL specified'],
      recommendations: analysis.metadata.canonical ? [] : ['Add canonical URL to prevent duplicate content'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Robots meta check
    this.addCheck({
      id: 'robots-meta',
      name: 'Robots Meta Tag',
      category: CheckCategory.METADATA,
      weight: 3,
      status: analysis.metadata.robots ? CheckStatus.PASS : CheckStatus.PENDING,
      score: analysis.metadata.robots ? 3 : 2, // Not critical, so partial credit
      maxScore: 3,
      evidence: analysis.metadata.robots ? [`Robots directive: ${analysis.metadata.robots}`] : ['No robots meta tag (defaults to index,follow)'],
      recommendations: analysis.metadata.robots ? [] : ['Consider adding robots meta tag for control over indexing'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });
  }

  private runContentChecks(analysis: AnalysisResult): void {
    // Word count check
    const wordCountOptimal = analysis.content.wordCount >= 300 && analysis.content.wordCount <= 2500;
    this.addCheck({
      id: 'content-length',
      name: 'Content Length',
      category: CheckCategory.CONTENT,
      weight: 8,
      status: wordCountOptimal ? CheckStatus.PASS : analysis.content.wordCount > 100 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: wordCountOptimal ? 8 : analysis.content.wordCount > 100 ? 4 : 0,
      maxScore: 8,
      evidence: [`Word count: ${analysis.content.wordCount} words`],
      recommendations: analysis.content.wordCount < 300 ? ['Expand content to at least 300 words'] :
                      analysis.content.wordCount > 2500 ? ['Consider breaking long content into multiple pages'] : [],
      impact: Impact.HIGH,
      difficulty: Difficulty.MEDIUM
    });

    // Keyword density check
    const topKeywords = analysis.content.keywordDensity.slice(0, 5);
    const hasBalancedDensity = topKeywords.every(kw => kw.density < 5); // No keyword stuffing
    this.addCheck({
      id: 'keyword-density',
      name: 'Keyword Density Balance',
      category: CheckCategory.CONTENT,
      weight: 6,
      status: hasBalancedDensity ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: hasBalancedDensity ? 6 : 3,
      maxScore: 6,
      evidence: topKeywords.map(kw => `"${kw.keyword}": ${kw.density.toFixed(2)}% (${kw.count} times)`),
      recommendations: hasBalancedDensity ? [] : ['Reduce keyword density to avoid over-optimization'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });

    // Reading time check
    const readingTimeOptimal = analysis.content.readingTime >= 2 && analysis.content.readingTime <= 15;
    this.addCheck({
      id: 'reading-time',
      name: 'Reading Time',
      category: CheckCategory.CONTENT,
      weight: 4,
      status: readingTimeOptimal ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: readingTimeOptimal ? 4 : 2,
      maxScore: 4,
      evidence: [`Estimated reading time: ${analysis.content.readingTime} minutes`],
      recommendations: analysis.content.readingTime < 2 ? ['Add more comprehensive content'] :
                      analysis.content.readingTime > 15 ? ['Consider breaking into multiple sections'] : [],
      impact: Impact.LOW,
      difficulty: Difficulty.MEDIUM
    });

    // Readability check
    const readabilityGood = analysis.readability.fleschScore >= 60;
    this.addCheck({
      id: 'content-readability',
      name: 'Content Readability',
      category: CheckCategory.CONTENT,
      weight: 7,
      status: readabilityGood ? CheckStatus.PASS : analysis.readability.fleschScore >= 30 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: readabilityGood ? 7 : analysis.readability.fleschScore >= 30 ? 4 : 0,
      maxScore: 7,
      evidence: [
        `Flesch Reading Ease: ${analysis.readability.fleschScore.toFixed(1)}`,
        `Reading Level: ${analysis.readability.readingLevel}`,
        `Average words per sentence: ${analysis.readability.averageWordsPerSentence.toFixed(1)}`
      ],
      recommendations: readabilityGood ? [] : ['Improve readability with shorter sentences and simpler words'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });
  }

  private runStructureChecks(analysis: AnalysisResult): void {
    // H1 tag check
    this.addCheck({
      id: 'h1-tag-single',
      name: 'Single H1 Tag',
      category: CheckCategory.STRUCTURE,
      weight: 10,
      status: analysis.structure.hasH1 ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.structure.hasH1 ? 10 : 0,
      maxScore: 10,
      evidence: analysis.structure.hasH1 ? ['Page has exactly one H1 tag'] : ['Page missing H1 tag or has multiple H1 tags'],
      recommendations: analysis.structure.hasH1 ? [] : ['Add exactly one H1 tag to your page'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Heading hierarchy check
    this.addCheck({
      id: 'heading-hierarchy',
      name: 'Proper Heading Hierarchy',
      category: CheckCategory.STRUCTURE,
      weight: 7,
      status: analysis.structure.headingHierarchy ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.structure.headingHierarchy ? 7 : 0,
      maxScore: 7,
      evidence: [analysis.structure.headingHierarchy ? 'Headings follow proper hierarchy' : 'Heading levels are skipped or out of order'],
      recommendations: analysis.structure.headingHierarchy ? [] : ['Fix heading hierarchy (H1→H2→H3, don\'t skip levels)'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Table of contents check
    this.addCheck({
      id: 'table-of-contents',
      name: 'Table of Contents',
      category: CheckCategory.STRUCTURE,
      weight: 4,
      status: analysis.structure.hasTableOfContents ? CheckStatus.PASS : CheckStatus.PENDING,
      score: analysis.structure.hasTableOfContents ? 4 : 2, // Partial credit as not always needed
      maxScore: 4,
      evidence: [analysis.structure.hasTableOfContents ? 'Table of contents detected' : 'No table of contents found'],
      recommendations: analysis.structure.hasTableOfContents ? [] : ['Consider adding a table of contents for long content'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });

    // FAQ section check
    this.addCheck({
      id: 'faq-section',
      name: 'FAQ Section',
      category: CheckCategory.STRUCTURE,
      weight: 5,
      status: analysis.structure.hasFAQSection ? CheckStatus.PASS : CheckStatus.PENDING,
      score: analysis.structure.hasFAQSection ? 5 : 2, // Partial credit as not always applicable
      maxScore: 5,
      evidence: [analysis.structure.hasFAQSection ? 'FAQ section detected' : 'No FAQ section found'],
      recommendations: analysis.structure.hasFAQSection ? [] : ['Consider adding FAQ section for common questions'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // How-to structure check
    this.addCheck({
      id: 'howto-structure',
      name: 'How-To Structure',
      category: CheckCategory.STRUCTURE,
      weight: 4,
      status: analysis.structure.hasHowToSteps ? CheckStatus.PASS : CheckStatus.PENDING,
      score: analysis.structure.hasHowToSteps ? 4 : 2, // Partial credit as not always applicable
      maxScore: 4,
      evidence: [analysis.structure.hasHowToSteps ? 'Step-by-step structure detected' : 'No step-by-step structure found'],
      recommendations: analysis.structure.hasHowToSteps ? [] : ['Consider organizing instructional content in steps'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });

    // Lists usage check
    const hasLists = analysis.structure.listCount > 0;
    this.addCheck({
      id: 'content-lists',
      name: 'Use of Lists',
      category: CheckCategory.STRUCTURE,
      weight: 3,
      status: hasLists ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: hasLists ? 3 : 1,
      maxScore: 3,
      evidence: [`Found ${analysis.structure.listCount} lists`],
      recommendations: hasLists ? [] : ['Use bullet points or numbered lists to improve readability'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });
  }

  private runLinksMediaChecks(analysis: AnalysisResult): void {
    // Image alt text check
    const altTextGood = analysis.media.altTextCoverage >= 90;
    this.addCheck({
      id: 'image-alt-text',
      name: 'Image Alt Text',
      category: CheckCategory.LINKS_MEDIA,
      weight: 8,
      status: altTextGood ? CheckStatus.PASS : analysis.media.altTextCoverage >= 50 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: altTextGood ? 8 : analysis.media.altTextCoverage >= 50 ? 4 : 0,
      maxScore: 8,
      evidence: [
        `${analysis.media.imagesWithAlt}/${analysis.media.images.length} images have alt text`,
        `Alt text coverage: ${analysis.media.altTextCoverage.toFixed(1)}%`
      ],
      recommendations: altTextGood ? [] : ['Add descriptive alt text to all images'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Image lazy loading check
    const imagesWithLazyLoading = analysis.media.images.filter(img => img.isLazyLoaded).length;
    const lazyLoadingGood = analysis.media.images.length === 0 || imagesWithLazyLoading / analysis.media.images.length >= 0.7;
    this.addCheck({
      id: 'image-lazy-loading',
      name: 'Image Lazy Loading',
      category: CheckCategory.LINKS_MEDIA,
      weight: 5,
      status: lazyLoadingGood ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: lazyLoadingGood ? 5 : 2,
      maxScore: 5,
      evidence: [`${imagesWithLazyLoading}/${analysis.media.images.length} images have lazy loading`],
      recommendations: lazyLoadingGood ? [] : ['Add loading="lazy" to images below the fold'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Image dimensions check
    const imagesWithDimensions = analysis.media.images.filter(img => img.hasDimensions).length;
    const dimensionsGood = analysis.media.images.length === 0 || imagesWithDimensions / analysis.media.images.length >= 0.8;
    this.addCheck({
      id: 'image-dimensions',
      name: 'Image Dimensions',
      category: CheckCategory.LINKS_MEDIA,
      weight: 4,
      status: dimensionsGood ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: dimensionsGood ? 4 : 2,
      maxScore: 4,
      evidence: [`${imagesWithDimensions}/${analysis.media.images.length} images have width/height attributes`],
      recommendations: dimensionsGood ? [] : ['Add width and height attributes to prevent layout shift'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Internal linking check
    const hasInternalLinks = analysis.links.internal.length > 0;
    this.addCheck({
      id: 'internal-linking',
      name: 'Internal Linking',
      category: CheckCategory.LINKS_MEDIA,
      weight: 6,
      status: hasInternalLinks ? CheckStatus.PASS : CheckStatus.FAIL,
      score: hasInternalLinks ? 6 : 0,
      maxScore: 6,
      evidence: [`${analysis.links.internal.length} internal links found`],
      recommendations: hasInternalLinks ? [] : ['Add internal links to related content'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });

    // Anchor text optimization check
    const anchorTextGood = analysis.links.anchorTextOptimization >= 80;
    this.addCheck({
      id: 'anchor-text-optimization',
      name: 'Anchor Text Optimization',
      category: CheckCategory.LINKS_MEDIA,
      weight: 5,
      status: anchorTextGood ? CheckStatus.PASS : analysis.links.anchorTextOptimization >= 50 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: anchorTextGood ? 5 : analysis.links.anchorTextOptimization >= 50 ? 3 : 0,
      maxScore: 5,
      evidence: [`${analysis.links.anchorTextOptimization.toFixed(1)}% of links have descriptive anchor text`],
      recommendations: anchorTextGood ? [] : ['Use descriptive anchor text instead of "click here" or "read more"'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // External links check
    const hasExternalLinks = analysis.links.external.length > 0;
    this.addCheck({
      id: 'external-links',
      name: 'External Links',
      category: CheckCategory.LINKS_MEDIA,
      weight: 3,
      status: hasExternalLinks ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: hasExternalLinks ? 3 : 1,
      maxScore: 3,
      evidence: [`${analysis.links.external.length} external links found`],
      recommendations: hasExternalLinks ? [] : ['Consider linking to relevant external resources'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });
  }

  private runStructuredDataChecks(analysis: AnalysisResult): void {
    // Schema.org implementation check
    const hasStructuredData = analysis.technicalFactors.structuredDataBlocks > 0;
    this.addCheck({
      id: 'structured-data-implementation',
      name: 'Structured Data Implementation',
      category: CheckCategory.STRUCTURED_DATA,
      weight: 10,
      status: hasStructuredData ? CheckStatus.PASS : CheckStatus.FAIL,
      score: hasStructuredData ? 10 : 0,
      maxScore: 10,
      evidence: [`${analysis.technicalFactors.structuredDataBlocks} structured data blocks found`],
      recommendations: hasStructuredData ? [] : ['Add Schema.org structured data markup'],
      impact: Impact.HIGH,
      difficulty: Difficulty.MEDIUM
    });

    // JSON-LD validation check
    const validJsonLd = analysis.technicalFactors.jsonLdBlocks.filter(block => block.valid).length;
    const totalJsonLd = analysis.technicalFactors.jsonLdBlocks.length;
    const jsonLdValid = totalJsonLd === 0 || validJsonLd === totalJsonLd;
    this.addCheck({
      id: 'jsonld-validation',
      name: 'JSON-LD Validation',
      category: CheckCategory.STRUCTURED_DATA,
      weight: 6,
      status: jsonLdValid ? CheckStatus.PASS : validJsonLd > 0 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: jsonLdValid ? 6 : validJsonLd > 0 ? 3 : 0,
      maxScore: 6,
      evidence: [`${validJsonLd}/${totalJsonLd} JSON-LD blocks are valid`],
      recommendations: jsonLdValid ? [] : ['Fix JSON-LD validation errors'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });

    // Schema diversity check
    const schemaTypes = new Set(analysis.technicalFactors.jsonLdBlocks.map(block => block.type));
    const hasMultipleSchemas = schemaTypes.size >= 2;
    this.addCheck({
      id: 'schema-diversity',
      name: 'Schema Type Diversity',
      category: CheckCategory.STRUCTURED_DATA,
      weight: 5,
      status: hasMultipleSchemas ? CheckStatus.PASS : schemaTypes.size > 0 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: hasMultipleSchemas ? 5 : schemaTypes.size > 0 ? 2 : 0,
      maxScore: 5,
      evidence: [`${schemaTypes.size} different schema types: ${Array.from(schemaTypes).join(', ')}`],
      recommendations: hasMultipleSchemas ? [] : ['Add multiple relevant schema types (Article, FAQ, Organization, etc.)'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });
  }

  private runTechnicalSEOChecks(analysis: AnalysisResult): void {
    // Language declaration check
    this.addCheck({
      id: 'language-declaration',
      name: 'Language Declaration',
      category: CheckCategory.TECHNICAL_SEO,
      weight: 4,
      status: analysis.technicalFactors.hasLanguageDeclaration ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.technicalFactors.hasLanguageDeclaration ? 4 : 0,
      maxScore: 4,
      evidence: [analysis.technicalFactors.hasLanguageDeclaration ? 'HTML lang attribute found' : 'Missing HTML lang attribute'],
      recommendations: analysis.technicalFactors.hasLanguageDeclaration ? [] : ['Add lang attribute to HTML tag'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });

    // Viewport meta check
    this.addCheck({
      id: 'viewport-meta',
      name: 'Viewport Meta Tag',
      category: CheckCategory.TECHNICAL_SEO,
      weight: 6,
      status: analysis.technicalFactors.hasViewportMeta ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.technicalFactors.hasViewportMeta ? 6 : 0,
      maxScore: 6,
      evidence: [analysis.technicalFactors.hasViewportMeta ? 'Viewport meta tag found' : 'Missing viewport meta tag'],
      recommendations: analysis.technicalFactors.hasViewportMeta ? [] : ['Add viewport meta tag for mobile responsiveness'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Character encoding check
    this.addCheck({
      id: 'charset-declaration',
      name: 'Character Encoding',
      category: CheckCategory.TECHNICAL_SEO,
      weight: 3,
      status: analysis.technicalFactors.hasCharsetDeclaration ? CheckStatus.PASS : CheckStatus.FAIL,
      score: analysis.technicalFactors.hasCharsetDeclaration ? 3 : 0,
      maxScore: 3,
      evidence: [analysis.technicalFactors.hasCharsetDeclaration ? 'Charset declaration found' : 'Missing charset declaration'],
      recommendations: analysis.technicalFactors.hasCharsetDeclaration ? [] : ['Add <meta charset="utf-8"> to document head'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });
  }

  private runAIOptimizationChecks(analysis: AnalysisResult): void {
    // Q&A format check
    this.addCheck({
      id: 'qa-format',
      name: 'Q&A Format for AI',
      category: CheckCategory.AI_OPTIMIZATION,
      weight: 8,
      status: analysis.aiOptimization.hasQAFormat ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: analysis.aiOptimization.hasQAFormat ? 8 : 3,
      maxScore: 8,
      evidence: [analysis.aiOptimization.hasQAFormat ? 'Q&A format detected' : 'No Q&A format found'],
      recommendations: analysis.aiOptimization.hasQAFormat ? [] : ['Structure content with questions and answers for AI assistants'],
      impact: Impact.HIGH,
      difficulty: Difficulty.MEDIUM
    });

    // Voice search optimization check
    this.addCheck({
      id: 'voice-search-optimization',
      name: 'Voice Search Optimization',
      category: CheckCategory.AI_OPTIMIZATION,
      weight: 7,
      status: analysis.aiOptimization.voiceSearchOptimized ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: analysis.aiOptimization.voiceSearchOptimized ? 7 : 2,
      maxScore: 7,
      evidence: [analysis.aiOptimization.voiceSearchOptimized ? 'Voice search patterns detected' : 'Limited voice search optimization'],
      recommendations: analysis.aiOptimization.voiceSearchOptimized ? [] : ['Add natural language patterns and question-based content'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });

    // Conversational elements check
    const hasConversationalElements = analysis.aiOptimization.conversationalElements > 0;
    this.addCheck({
      id: 'conversational-elements',
      name: 'Conversational Elements',
      category: CheckCategory.AI_OPTIMIZATION,
      weight: 5,
      status: hasConversationalElements ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: hasConversationalElements ? 5 : 2,
      maxScore: 5,
      evidence: [`${analysis.aiOptimization.conversationalElements} conversational markers found`],
      recommendations: hasConversationalElements ? [] : ['Add conversational connectors like "additionally", "for example", "therefore"'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Entity mentions check
    const hasEntityMentions = analysis.aiOptimization.entityMentions.length > 0;
    this.addCheck({
      id: 'entity-mentions',
      name: 'Entity Recognition',
      category: CheckCategory.AI_OPTIMIZATION,
      weight: 4,
      status: hasEntityMentions ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: hasEntityMentions ? 4 : 1,
      maxScore: 4,
      evidence: [`${analysis.aiOptimization.entityMentions.length} entities detected`],
      recommendations: hasEntityMentions ? [] : ['Include more specific entities, names, dates, and locations'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });

    // Answerable questions check
    const hasAnswerableQuestions = analysis.aiOptimization.answerableQuestions.length > 0;
    this.addCheck({
      id: 'answerable-questions',
      name: 'Answerable Questions',
      category: CheckCategory.AI_OPTIMIZATION,
      weight: 6,
      status: hasAnswerableQuestions ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: hasAnswerableQuestions ? 6 : 2,
      maxScore: 6,
      evidence: [`${analysis.aiOptimization.answerableQuestions.length} answerable questions found`],
      recommendations: hasAnswerableQuestions ? [] : ['Add clear questions that can be answered by AI assistants'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.MEDIUM
    });
  }

  private runCoreWebVitalsChecks(analysis: AnalysisResult): void {
    // These are heuristic checks based on content analysis
    // In a real implementation, you'd integrate with actual Core Web Vitals APIs

    // Image optimization for CLS
    const imagesOptimized = analysis.media.images.length === 0 || 
                           analysis.media.images.filter(img => img.hasDimensions).length / analysis.media.images.length >= 0.8;
    this.addCheck({
      id: 'cls-optimization',
      name: 'Layout Shift Prevention',
      category: CheckCategory.CORE_WEB_VITALS,
      weight: 7,
      status: imagesOptimized ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: imagesOptimized ? 7 : 3,
      maxScore: 7,
      evidence: [imagesOptimized ? 'Images have dimensions to prevent layout shift' : 'Some images lack dimensions'],
      recommendations: imagesOptimized ? [] : ['Add width/height to images to prevent Cumulative Layout Shift'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // LCP optimization heuristics
    const hasHeroImage = analysis.media.images.some(img => img.isProbablyHero);
    this.addCheck({
      id: 'lcp-optimization',
      name: 'Largest Contentful Paint Optimization',
      category: CheckCategory.CORE_WEB_VITALS,
      weight: 6,
      status: CheckStatus.PENDING, // Would need real measurement
      score: 3, // Neutral score
      maxScore: 6,
      evidence: [hasHeroImage ? 'Hero image detected' : 'No obvious hero image found'],
      recommendations: ['Optimize largest contentful paint with image preloading and efficient loading'],
      impact: Impact.HIGH,
      difficulty: Difficulty.MEDIUM
    });

    // Performance optimization hints
    this.addCheck({
      id: 'performance-optimization',
      name: 'Performance Best Practices',
      category: CheckCategory.CORE_WEB_VITALS,
      weight: 5,
      status: CheckStatus.PENDING,
      score: 3, // Neutral score without real measurement
      maxScore: 5,
      evidence: ['Performance optimization requires runtime measurement'],
      recommendations: [
        'Minimize HTTP requests',
        'Optimize images and use modern formats',
        'Enable compression and caching',
        'Use a Content Delivery Network (CDN)'
      ],
      impact: Impact.HIGH,
      difficulty: Difficulty.HARD
    });
  }

  private runSocialMediaChecks(analysis: AnalysisResult): void {
    // Open Graph implementation
    this.addCheck({
      id: 'open-graph-complete',
      name: 'Complete Open Graph Implementation',
      category: CheckCategory.SOCIAL_MEDIA,
      weight: 8,
      status: analysis.metadata.openGraph.complete ? CheckStatus.PASS : 
              (analysis.metadata.openGraph.title || analysis.metadata.openGraph.description) ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: analysis.metadata.openGraph.complete ? 8 : 
             (analysis.metadata.openGraph.title || analysis.metadata.openGraph.description) ? 4 : 0,
      maxScore: 8,
      evidence: [
        analysis.metadata.openGraph.title ? `OG Title: ${analysis.metadata.openGraph.title}` : 'Missing OG title',
        analysis.metadata.openGraph.description ? `OG Description: ${analysis.metadata.openGraph.description.slice(0, 50)}...` : 'Missing OG description',
        analysis.metadata.openGraph.image ? `OG Image: ${analysis.metadata.openGraph.image}` : 'Missing OG image'
      ],
      recommendations: analysis.metadata.openGraph.complete ? [] : ['Add complete Open Graph meta tags (title, description, image)'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Twitter Card implementation
    this.addCheck({
      id: 'twitter-card-complete',
      name: 'Complete Twitter Card Implementation',
      category: CheckCategory.SOCIAL_MEDIA,
      weight: 5,
      status: analysis.metadata.twitterCard.complete ? CheckStatus.PASS : 
              analysis.metadata.twitterCard.card ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: analysis.metadata.twitterCard.complete ? 5 : analysis.metadata.twitterCard.card ? 2 : 0,
      maxScore: 5,
      evidence: [
        analysis.metadata.twitterCard.card ? `Twitter Card: ${analysis.metadata.twitterCard.card}` : 'Missing Twitter Card',
        analysis.metadata.twitterCard.title ? 'Twitter title set' : 'Missing Twitter title'
      ],
      recommendations: analysis.metadata.twitterCard.complete ? [] : ['Add complete Twitter Card meta tags'],
      impact: Impact.LOW,
      difficulty: Difficulty.EASY
    });
  }

  private runAccessibilityChecks(analysis: AnalysisResult): void {
    // Alt text coverage (already covered in media, but important for accessibility)
    const altTextExcellent = analysis.media.altTextCoverage === 100;
    this.addCheck({
      id: 'accessibility-alt-text',
      name: 'Accessibility - Image Alt Text',
      category: CheckCategory.ACCESSIBILITY,
      weight: 8,
      status: altTextExcellent ? CheckStatus.PASS : analysis.media.altTextCoverage >= 80 ? CheckStatus.PARTIAL : CheckStatus.FAIL,
      score: altTextExcellent ? 8 : analysis.media.altTextCoverage >= 80 ? 5 : 0,
      maxScore: 8,
      evidence: [`${analysis.media.altTextCoverage.toFixed(1)}% of images have alt text`],
      recommendations: altTextExcellent ? [] : ['Add alt text to all images for screen readers'],
      impact: Impact.HIGH,
      difficulty: Difficulty.EASY
    });

    // Heading structure for accessibility
    this.addCheck({
      id: 'accessibility-heading-structure',
      name: 'Accessibility - Heading Structure',
      category: CheckCategory.ACCESSIBILITY,
      weight: 6,
      status: analysis.structure.headingHierarchy && analysis.structure.hasH1 ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: analysis.structure.headingHierarchy && analysis.structure.hasH1 ? 6 : 3,
      maxScore: 6,
      evidence: [
        analysis.structure.hasH1 ? 'Has H1 tag' : 'Missing H1 tag',
        analysis.structure.headingHierarchy ? 'Proper heading hierarchy' : 'Broken heading hierarchy'
      ],
      recommendations: analysis.structure.headingHierarchy && analysis.structure.hasH1 ? [] : 
                      ['Fix heading structure for screen readers (H1→H2→H3)'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });

    // Link accessibility
    const linksWithTitle = analysis.links.internal.filter(link => link.hasTitle).length + 
                          analysis.links.external.filter(link => link.hasTitle).length;
    const totalLinks = analysis.links.totalLinks;
    const linkAccessibilityGood = totalLinks === 0 || linksWithTitle / totalLinks >= 0.5;
    this.addCheck({
      id: 'accessibility-link-context',
      name: 'Accessibility - Link Context',
      category: CheckCategory.ACCESSIBILITY,
      weight: 4,
      status: linkAccessibilityGood ? CheckStatus.PASS : CheckStatus.PARTIAL,
      score: linkAccessibilityGood ? 4 : 2,
      maxScore: 4,
      evidence: [`${linksWithTitle}/${totalLinks} links have title attributes or descriptive text`],
      recommendations: linkAccessibilityGood ? [] : ['Add title attributes or ensure descriptive link text'],
      impact: Impact.MEDIUM,
      difficulty: Difficulty.EASY
    });
  }

  private addCheck(check: SEOCheck): void {
    this.checks.push(check);
  }

  private calculateFinalScore(): SEOScoreResult {
    const categoryScores: { [key in CheckCategory]: CategoryScore } = {} as any;
    
    // Initialize category scores
    Object.values(CheckCategory).forEach(category => {
      categoryScores[category] = {
        category,
        score: 0,
        maxScore: 0,
        percentage: 0,
        checkCount: 0,
        passedCount: 0
      };
    });

    // Calculate category scores
    this.checks.forEach(check => {
      const categoryScore = categoryScores[check.category];
      categoryScore.score += check.score;
      categoryScore.maxScore += check.maxScore;
      categoryScore.checkCount++;
      if (check.status === CheckStatus.PASS) {
        categoryScore.passedCount++;
      }
    });

    // Calculate percentages
    Object.values(categoryScores).forEach(category => {
      category.percentage = category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;
    });

    // Calculate overall score
    const totalScore = this.checks.reduce((sum, check) => sum + check.score, 0);
    const totalMaxScore = this.checks.reduce((sum, check) => sum + check.maxScore, 0);
    const overallScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    // Count check statuses
    const passedChecks = this.checks.filter(check => check.status === CheckStatus.PASS).length;
    const failedChecks = this.checks.filter(check => check.status === CheckStatus.FAIL).length;
    const pendingChecks = this.checks.filter(check => check.status === CheckStatus.PENDING).length;

    // Generate prioritized recommendations
    const recommendations = this.generatePrioritizedRecommendations();

    return {
      overallScore: Math.round(overallScore),
      categoryScores: Object.values(categoryScores),
      checks: this.checks,
      totalChecks: this.checks.length,
      passedChecks,
      failedChecks,
      pendingChecks,
      recommendations
    };
  }

  private generatePrioritizedRecommendations(): PrioritizedRecommendation[] {
    const failedChecks = this.checks.filter(check => check.status === CheckStatus.FAIL);
    const partialChecks = this.checks.filter(check => check.status === CheckStatus.PARTIAL);
    
    const recommendations: PrioritizedRecommendation[] = [];
    
    // Process failed checks first (highest priority)
    failedChecks.forEach(check => {
      if (check.recommendations.length > 0) {
        const priority = this.calculatePriority(check.impact, check.difficulty, check.weight);
        recommendations.push({
          title: `Fix: ${check.name}`,
          description: check.recommendations[0],
          category: check.category,
          impact: check.impact,
          difficulty: check.difficulty,
          priority,
          actionItems: check.recommendations,
          codeSnippets: this.generateCodeSnippets(check.id)
        });
      }
    });

    // Process partial checks (medium priority)
    partialChecks.forEach(check => {
      if (check.recommendations.length > 0) {
        const priority = this.calculatePriority(check.impact, check.difficulty, check.weight) * 0.7; // Lower priority
        recommendations.push({
          title: `Improve: ${check.name}`,
          description: check.recommendations[0],
          category: check.category,
          impact: check.impact,
          difficulty: check.difficulty,
          priority,
          actionItems: check.recommendations,
          codeSnippets: this.generateCodeSnippets(check.id)
        });
      }
    });

    // Sort by priority (highest first)
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10); // Return top 10 recommendations
  }

  private calculatePriority(impact: Impact, difficulty: Difficulty, weight: number): number {
    const impactScore = impact === Impact.HIGH ? 3 : impact === Impact.MEDIUM ? 2 : 1;
    const difficultyScore = difficulty === Difficulty.EASY ? 3 : difficulty === Difficulty.MEDIUM ? 2 : 1;
    
    return (impactScore * 0.4 + difficultyScore * 0.3 + (weight / 10) * 0.3) * 10;
  }

  private generateCodeSnippets(checkId: string): string[] {
    const snippets: { [key: string]: string[] } = {
      'title-exists': ['<title>Your Page Title Here (50-60 chars)</title>'],
      'meta-description-exists': ['<meta name="description" content="Your compelling description here (120-160 chars)">'],
      'canonical-url': ['<link rel="canonical" href="https://yoursite.com/current-page">'],
      'robots-meta': ['<meta name="robots" content="index, follow">'],
      'h1-tag-single': ['<h1>Your Main Page Heading</h1>'],
      'viewport-meta': ['<meta name="viewport" content="width=device-width, initial-scale=1.0">'],
      'charset-declaration': ['<meta charset="utf-8">'],
      'language-declaration': ['<html lang="en">'],
      'open-graph-complete': [
        '<meta property="og:title" content="Your Page Title">',
        '<meta property="og:description" content="Your page description">',
        '<meta property="og:image" content="https://yoursite.com/image.jpg">',
        '<meta property="og:url" content="https://yoursite.com/current-page">'
      ],
      'twitter-card-complete': [
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="Your Page Title">',
        '<meta name="twitter:description" content="Your page description">',
        '<meta name="twitter:image" content="https://yoursite.com/image.jpg">'
      ],
      'structured-data-implementation': [
        '<script type="application/ld+json">',
        '{',
        '  "@context": "https://schema.org",',
        '  "@type": "Article",',
        '  "headline": "Your Article Title",',
        '  "author": "Your Name"',
        '}',
        '</script>'
      ]
    };

    return snippets[checkId] || [];
  }
}