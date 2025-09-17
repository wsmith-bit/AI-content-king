import { 
  escapeHtml, 
  escapeHtmlAttribute, 
  escapeKeywords, 
  createSafeId,
  sanitizeUrl 
} from '../utils/html-escape';

export interface HtmlGeneratorOptions {
  content: string;
  seoMetadata: any;
  schemaMarkup: any;
  checklistResults: any;
}

export function generatePublishableHtml(options: HtmlGeneratorOptions): string {
  const { content, seoMetadata, schemaMarkup, checklistResults } = options;
  
  // Extract score data for SVG chart (these are numbers, safe to use directly)
  const score = Math.min(100, Math.max(0, parseInt(checklistResults?.score) || 0));
  const passedItems = Math.max(0, parseInt(checklistResults?.passedItems) || 0);
  const totalItems = Math.max(1, parseInt(checklistResults?.totalItems) || 1);
  const pendingItems = Math.max(0, parseInt(checklistResults?.pendingItems) || 0);
  const failedItems = Math.max(0, parseInt(checklistResults?.failedItems) || 0);
  
  // Generate SVG donut chart for SEO score (safe as we're using validated numbers)
  const generateScoreChart = (score: number) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = (score / 100) * circumference;
    const strokeDashoffset = circumference - strokeDasharray;
    
    return `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Background circle -->
        <circle cx="100" cy="100" r="${radius}" fill="none" stroke="#e5e5e5" stroke-width="20"/>
        <!-- Score circle -->
        <circle cx="100" cy="100" r="${radius}" fill="none" stroke="#22c55e" stroke-width="20"
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${strokeDashoffset}"
                transform="rotate(-90 100 100)"/>
        <!-- Score text -->
        <text x="100" y="100" text-anchor="middle" dy="8" font-size="36" font-weight="bold" fill="#16a34a">
          ${score}%
        </text>
        <text x="100" y="125" text-anchor="middle" font-size="14" fill="#6b7280">
          SEO Score
        </text>
      </svg>
    `;
  };
  
  // Generate bar chart for checklist items (safe as we're using validated numbers)
  const generateItemsChart = () => {
    const maxHeight = 120;
    const passedHeight = totalItems > 0 ? (passedItems / totalItems) * maxHeight : 0;
    const pendingHeight = totalItems > 0 ? (pendingItems / totalItems) * maxHeight : 0;
    const failedHeight = totalItems > 0 ? (failedItems / totalItems) * maxHeight : 0;
    
    return `
      <svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(40, 130)">
          <!-- Passed bar -->
          <rect x="0" y="${-passedHeight}" width="60" height="${passedHeight}" fill="#22c55e" rx="4"/>
          <text x="30" y="${-passedHeight - 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#22c55e">
            ${passedItems}
          </text>
          <text x="30" y="15" text-anchor="middle" font-size="12" fill="#6b7280">Passed</text>
          
          <!-- Pending bar -->
          <rect x="80" y="${-pendingHeight}" width="60" height="${pendingHeight}" fill="#f59e0b" rx="4"/>
          <text x="110" y="${-pendingHeight - 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#f59e0b">
            ${pendingItems}
          </text>
          <text x="110" y="15" text-anchor="middle" font-size="12" fill="#6b7280">Pending</text>
          
          <!-- Failed bar -->
          <rect x="160" y="${-failedHeight}" width="60" height="${failedHeight}" fill="#ef4444" rx="4"/>
          <text x="190" y="${-failedHeight - 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#ef4444">
            ${failedItems}
          </text>
          <text x="190" y="15" text-anchor="middle" font-size="12" fill="#6b7280">Failed</text>
        </g>
      </svg>
    `;
  };
  
  // Process content to extract headings and generate TOC with proper escaping
  const lines = content.split('\n');
  const tocItems: Array<{level: number, text: string, id: string}> = [];
  let processedContent = '';
  
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = parseInt(headingMatch[1].length.toString());
      const rawText = headingMatch[2];
      const escapedText = escapeHtml(rawText);
      const safeId = createSafeId(rawText, `heading-${index}`);
      
      tocItems.push({ level, text: escapedText, id: safeId });
      processedContent += `<h${level} id="${safeId}">${escapedText}</h${level}>\n`;
    } else if (line.trim()) {
      // Escape paragraph content
      processedContent += `<p>${escapeHtml(line)}</p>\n`;
    } else {
      processedContent += '<br>\n';
    }
  });
  
  // Generate collapsible TOC HTML with proper escaping and CSS-only hover effects
  const generateToc = () => {
    if (tocItems.length === 0) return '';
    
    let tocHtml = '';
    tocItems.forEach(item => {
      const indent = (item.level - 1) * 20;
      const arrow = item.level > 1 ? '→ ' : '';
      tocHtml += `
        <div style="margin-left: ${indent}px; margin-bottom: 8px;">
          <a href="#${escapeHtmlAttribute(item.id)}" class="toc-link">
            ${escapeHtml(arrow)}${item.text}
          </a>
        </div>
      `;
    });
    
    return `
      <details open style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; border: 1px solid #bae6fd;">
        <summary style="cursor: pointer; font-weight: bold; font-size: 18px; color: #0369a1; user-select: none;">
          📋 Table of Contents
        </summary>
        <div style="margin-top: 15px;">
          ${tocHtml}
        </div>
      </details>
    `;
  };
  
  // Safely handle schema markup JSON
  let schemaMarkupJson = '';
  if (schemaMarkup) {
    try {
      // Ensure the schema markup is properly stringified
      schemaMarkupJson = JSON.stringify(schemaMarkup);
    } catch (e) {
      console.error('Failed to stringify schema markup:', e);
      schemaMarkupJson = '';
    }
  }
  
  // Escape all metadata values
  const escapedTitle = escapeHtml(seoMetadata?.title || 'AI-Optimized Content');
  const escapedDescription = escapeHtmlAttribute(seoMetadata?.description || '');
  const escapedKeywords = seoMetadata?.keywords ? escapeKeywords(seoMetadata.keywords) : '';
  
  // Escape Open Graph metadata
  const ogTitle = escapeHtmlAttribute(seoMetadata?.openGraph?.title || '');
  const ogDescription = escapeHtmlAttribute(seoMetadata?.openGraph?.description || '');
  const ogType = escapeHtmlAttribute(seoMetadata?.openGraph?.type || 'article');
  const ogImage = sanitizeUrl(seoMetadata?.openGraph?.image);
  
  // Generate complete HTML document with all content properly escaped
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}">
    ${escapedKeywords ? `<meta name="keywords" content="${escapedKeywords}">` : ''}
    
    <!-- Open Graph Meta Tags -->
    ${seoMetadata?.openGraph ? `
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:type" content="${ogType}">
    ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
    ` : ''}
    
    <!-- Schema.org Structured Data -->
    ${schemaMarkupJson ? `<script type="application/ld+json">${schemaMarkupJson}</script>` : ''}
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 50px;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.95;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .metric-card {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }
        
        .metric-card h3 {
            margin-bottom: 20px;
            color: #4b5563;
            font-size: 1.3em;
        }
        
        .content-section {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            margin-bottom: 30px;
        }
        
        .content-section h1 {
            color: #1e40af;
            margin-bottom: 20px;
            font-size: 2.2em;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
        }
        
        .content-section h2 {
            color: #2563eb;
            margin: 30px 0 15px 0;
            font-size: 1.8em;
        }
        
        .content-section h3 {
            color: #3b82f6;
            margin: 25px 0 15px 0;
            font-size: 1.4em;
        }
        
        .content-section h4, .content-section h5, .content-section h6 {
            color: #64748b;
            margin: 20px 0 10px 0;
        }
        
        .content-section p {
            margin-bottom: 15px;
            line-height: 1.8;
            color: #4b5563;
        }
        
        .content-section a {
            color: #3b82f6;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s;
        }
        
        .content-section a:hover {
            border-bottom-color: #3b82f6;
        }
        
        /* CSS-only hover effect for TOC links */
        .toc-link {
            color: #4338ca;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s;
        }
        
        .toc-link:hover {
            color: #6366f1;
        }
        
        .footer {
            text-align: center;
            margin-top: 60px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 0.9em;
            margin: 0 5px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px 15px;
            }
            
            .header h1 {
                font-size: 1.8em;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapedTitle}</h1>
            <p>Optimized for AI Search Engines & Voice Assistants</p>
            <div style="margin-top: 20px;">
                <span class="badge">✅ ${score}% SEO Score</span>
                <span class="badge">📊 ${passedItems} Checks Passed</span>
                <span class="badge">🤖 AI-Ready</span>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>SEO Performance Score</h3>
                ${generateScoreChart(score)}
            </div>
            
            <div class="metric-card">
                <h3>Optimization Breakdown</h3>
                ${generateItemsChart()}
            </div>
        </div>
        
        <div class="content-section">
            ${generateToc()}
            
            <div class="content-body">
                ${processedContent}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Generated with AI SEO Optimizer Pro</strong></p>
            <p style="margin-top: 10px; font-size: 0.9em; opacity: 0.9;">
                This content has been optimized for ${new Date().getFullYear()} AI search engines including Google SGE, Perplexity, Bing Copilot, and ChatGPT.
            </p>
        </div>
    </div>
    
    <script>
        // Safe smooth scrolling for TOC links using event delegation
        document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('click', function(e) {
                // Check if clicked element is a link with hash
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    </script>
</body>
</html>`;
  
  return html;
}