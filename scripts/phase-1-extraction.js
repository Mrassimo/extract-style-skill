/**
 * Phase 1: Raw Extraction
 * Handles the initial data collection phase
 */

const CSSParser = require('./css-parser');
const ScreenshotService = require('./screenshot-service');

class Phase1Extraction {
  constructor() {
    this.cssParser = new CSSParser();
    this.screenshotService = new ScreenshotService();
  }

  /**
   * Execute Phase 1: Raw Data Extraction
   */
  async execute(url, options = {}) {
    console.log(`🔍 Starting Phase 1: Raw extraction for ${url}`);

    const result = {
      url: url,
      timestamp: new Date().toISOString(),
      phase: 'raw-extraction',
      data: {},
      metadata: {
        extractionTime: Date.now(),
        options: options
      }
    };

    try {
      // Step 1: Extract HTML and CSS
      console.log('📄 Extracting HTML and CSS...');
      result.data.html = await this.extractHTML(url);
      result.data.css = await this.extractCSS(result.data.html);

      // Step 2: Capture screenshots (optional)
      if (options.includeScreenshots !== false) {
        console.log('📸 Capturing screenshots...');
        try {
          result.data.screenshots = await this.captureScreenshots(url, options.screenshotOptions);
        } catch (error) {
          console.warn('⚠️  Screenshot capture failed:', error.message);
          result.data.screenshots = { error: error.message };
        }
      }

      // Step 3: Parse and extract design tokens
      console.log('🎨 Parsing design tokens...');
      const allCSS = Object.values(result.data.css).join('\n');
      result.data.designTokens = this.cssParser.parseCSS(allCSS);

      // Step 4: Generate validation report
      result.data.validationReport = this.cssParser.generateValidationReport();

      // Step 5: Save extracted data
      if (options.saveData !== false) {
        await this.saveExtractionData(result, options.outputPath);
      }

      result.success = true;
      console.log('✅ Phase 1 extraction completed successfully');

      return result;

    } catch (error) {
      result.success = false;
      result.error = {
        message: error.message,
        stack: error.stack
      };
      console.error('❌ Phase 1 extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract HTML content from URL
   */
  async extractHTML(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch HTML from ${url}: ${error.message}`);
    }
  }

  /**
   * Extract all CSS from HTML
   */
  async extractCSS(htmlText) {
    const cssCollection = {};

    // Extract inline styles
    cssCollection.inline = this.extractInlineStyles(htmlText);

    // Extract style tag content
    cssCollection.styleTags = this.extractStyleTags(htmlText);

    // Extract external stylesheets
    const externalStylesheetUrls = this.extractStylesheetUrls(htmlText);
    cssCollection.external = await this.fetchExternalStylesheets(externalStylesheetUrls);

    return cssCollection;
  }

  /**
   * Extract inline styles from HTML
   */
  extractInlineStyles(htmlText) {
    const inlineStyles = [];
    const styleRegex = /style="([^"]+)"/g;
    let match;

    while ((match = styleRegex.exec(htmlText)) !== null) {
      inlineStyles.push(match[1]);
    }

    return inlineStyles;
  }

  /**
   * Extract content from <style> tags
   */
  extractStyleTags(htmlText) {
    const styleTags = [];
    const styleRegex = /<style[^>]*>([^<]*)<\/style>/gi;
    let match;

    while ((match = styleRegex.exec(htmlText)) !== null) {
      if (match[1].trim()) {
        styleTags.push(match[1].trim());
      }
    }

    return styleTags;
  }

  /**
   * Extract external stylesheet URLs
   */
  extractStylesheetUrls(htmlText) {
    const urls = [];
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(htmlText)) !== null) {
      let url = match[1];

      // Convert relative URLs to absolute
      if (url.startsWith('/')) {
        const baseUrl = this.extractBaseUrl(htmlText);
        url = baseUrl + url;
      } else if (url.startsWith('//')) {
        url = 'https:' + url;
      } else if (!url.startsWith('http')) {
        const baseUrl = this.extractBaseUrl(htmlText);
        url = baseUrl + '/' + url;
      }

      urls.push(url);
    }

    return [...new Set(urls)]; // Remove duplicates
  }

  /**
   * Extract base URL from HTML
   */
  extractBaseUrl(htmlText) {
    const baseMatch = htmlText.match(/<base[^>]*href=["']([^"']+)["']/i);
    if (baseMatch) {
      return baseMatch[1];
    }

    // Try to extract from the first link or script tag
    const linkMatch = htmlText.match(/<(?:link|script)[^>]*(?:href|src)=["']([^"']+)["']/i);
    if (linkMatch) {
      const url = linkMatch[1];
      const match = url.match(/^(https?:\/\/[^\/]+)/);
      return match ? match[1] : '';
    }

    return '';
  }

  /**
   * Fetch external stylesheets
   */
  async fetchExternalStylesheets(urls) {
    const stylesheets = {};

    for (const url of urls) {
      try {
        console.log(`📥 Fetching stylesheet: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          const css = await response.text();
          stylesheets[url] = css;
        } else {
          console.warn(`⚠️  Failed to fetch stylesheet: ${url} (${response.status})`);
          stylesheets[url] = { error: `HTTP ${response.status}` };
        }
      } catch (error) {
        console.warn(`⚠️  Error fetching stylesheet ${url}:`, error.message);
        stylesheets[url] = { error: error.message };
      }
    }

    return stylesheets;
  }

  /**
   * Capture screenshots using screenshot service
   */
  async captureScreenshots(url, options = {}) {
    const screenshotOptions = {
      viewport_width: 1920,
      viewport_height: 1080,
      full_page: true,
      delay: 2000,
      ...options
    };

    const result = await this.screenshotService.captureScreenshot(url, screenshotOptions);

    // Download screenshot to local file if specified
    if (options.downloadPath) {
      const filename = `${this.generateFilename(url)}.png`;
      const filePath = `${options.downloadPath}/${filename}`;

      try {
        await this.screenshotService.downloadScreenshot(result.url, filePath);
        result.localPath = filePath;
      } catch (error) {
        console.warn(`⚠️  Failed to download screenshot:`, error.message);
      }
    }

    return result;
  }

  /**
   * Generate filename from URL
   */
  generateFilename(url) {
    const urlObj = new URL(url);
    let filename = urlObj.hostname.replace(/\./g, '-');

    if (urlObj.pathname !== '/') {
      const pathPart = urlObj.pathname
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (pathPart) {
        filename += `-${pathPart}`;
      }
    }

    return filename;
  }

  /**
   * Save extraction data to file
   */
  async saveExtractionData(result, outputPath = './style') {
    const fs = require('fs').promises;
    const path = require('path');

    const siteName = this.generateFilename(result.url);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dir = path.join(process.cwd(), outputPath, `${siteName}-${timestamp}`);

    // Create directory
    await fs.mkdir(dir, { recursive: true });

    // Save raw data
    const dataFile = path.join(dir, 'phase-1-raw-data.json');
    await fs.writeFile(dataFile, JSON.stringify(result, null, 2));

    // Save individual CSS files
    if (result.data.css) {
      const cssDir = path.join(dir, 'css');
      await fs.mkdir(cssDir, { recursive: true });

      // Save inline styles
      if (result.data.css.inline.length > 0) {
        await fs.writeFile(
          path.join(cssDir, 'inline-styles.css'),
          result.data.css.inline.join('\n')
        );
      }

      // Save style tags
      if (result.data.css.styleTags.length > 0) {
        await fs.writeFile(
          path.join(cssDir, 'style-tags.css'),
          result.data.css.styleTags.join('\n\n')
        );
      }

      // Save external stylesheets
      for (const [url, content] of Object.entries(result.data.css.external)) {
        if (typeof content === 'string') {
          const filename = this.sanitizeFilename(url) + '.css';
          await fs.writeFile(path.join(cssDir, filename), content);
        }
      }
    }

    // Save design tokens
    const tokensFile = path.join(dir, 'design-tokens-raw.json');
    await fs.writeFile(
      tokensFile,
      JSON.stringify(result.data.designTokens, null, 2)
    );

    // Save validation report
    const reportFile = path.join(dir, 'validation-report.json');
    await fs.writeFile(
      reportFile,
      JSON.stringify(result.data.validationReport, null, 2)
    );

    result.savedPaths = {
      directory: dir,
      dataFile: dataFile,
      cssDirectory: path.join(dir, 'css'),
      designTokensFile: tokensFile,
      validationReportFile: reportFile
    };

    console.log(`💾 Phase 1 data saved to: ${dir}`);
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(url) {
    return url
      .replace(/https?:\/\//, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = Phase1Extraction;