/**
 * Phase 2: Analysis and Component Detection
 * Analyzes extracted data and identifies components
 */

const ComponentDetector = require('./component-detector');

class Phase2Analysis {
  constructor() {
    this.componentDetector = new ComponentDetector();
  }

  /**
   * Execute Phase 2: Analysis
   */
  async execute(phase1Result, options = {}) {
    console.log(`🧠 Starting Phase 2: Analysis for ${phase1Result.url}`);

    const result = {
      url: phase1Result.url,
      timestamp: new Date().toISOString(),
      phase: 'analysis',
      data: {},
      input: phase1Result,
      metadata: {
        analysisTime: Date.now(),
        options: options
      }
    };

    try {
      // Step 1: Analyze design tokens
      console.log('🎨 Analyzing design tokens...');
      result.data.designTokenAnalysis = this.analyzeDesignTokens(phase1Result.data.designTokens);

      // Step 2: Detect components
      console.log('🔧 Detecting components...');
      const allCSS = this.combineAllCSS(phase1Result.data.css);
      const htmlText = phase1Result.data.html;
      result.data.components = this.componentDetector.detectComponents(allCSS, htmlText);

      // Step 3: Identify color system
      console.log('🎨 Identifying color system...');
      result.data.colorSystem = this.identifyColorSystem(phase1Result.data.designTokens.colors);

      // Step 4: Identify typography system
      console.log('📝 Identifying typography system...');
      result.data.typographySystem = this.identifyTypographySystem(phase1Result.data.designTokens.fonts);

      // Step 5: Identify spacing system
      console.log('📏 Identifying spacing system...');
      result.data.spacingSystem = this.identifySpacingSystem(phase1Result.data.designTokens.spacing);

      // Step 6: Generate component patterns
      console.log('🧩 Generating component patterns...');
      result.data.componentPatterns = this.generateComponentPatterns(result.data.components);

      // Step 7: Create interactive HTML demo
      console.log('🎭 Creating interactive HTML demo...');
      result.data.htmlDemo = this.createInteractiveDemo(result.data);

      // Step 8: Save analysis results
      if (options.saveData !== false) {
        await this.saveAnalysisData(result, options.outputPath);
      }

      result.success = true;
      console.log('✅ Phase 2 analysis completed successfully');

      return result;

    } catch (error) {
      result.success = false;
      result.error = {
        message: error.message,
        stack: error.stack
      };
      console.error('❌ Phase 2 analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Combine all CSS into one string
   */
  combineAllCSS(cssData) {
    const cssParts = [];

    if (cssData.inline && cssData.inline.length > 0) {
      cssParts.push('/* Inline Styles */');
      cssParts.push(cssData.inline.map(style => `element { ${style} }`).join('\n'));
    }

    if (cssData.styleTags && cssData.styleTags.length > 0) {
      cssParts.push('/* Style Tags */');
      cssParts.push(cssData.styleTags.join('\n\n'));
    }

    if (cssData.external) {
      cssParts.push('/* External Stylesheets */');
      Object.entries(cssData.external).forEach(([url, content]) => {
        if (typeof content === 'string') {
          cssParts.push(`/* From: ${url} */`);
          cssParts.push(content);
        }
      });
    }

    return cssParts.join('\n\n');
  }

  /**
   * Analyze design tokens for patterns and insights
   */
  analyzeDesignTokens(tokens) {
    const analysis = {
      colors: this.analyzeColors(tokens.colors),
      fonts: this.analyzeFonts(tokens.fonts),
      spacing: this.analyzeSpacing(tokens.spacing),
      shadows: this.analyzeShadows(tokens.shadows),
      borderRadius: this.analyzeBorderRadius(tokens.borderRadius),
      cssVariables: this.analyzeCSSVariables(tokens.cssVariables)
    };

    analysis.summary = {
      totalColors: Object.keys(tokens.colors).length,
      totalFonts: Object.keys(tokens.fonts).length,
      totalSpacing: Object.keys(tokens.spacing).length,
      totalShadows: Object.keys(tokens.shadows).length,
      totalBorderRadius: Object.keys(tokens.borderRadius).length,
      totalCSSVariables: Object.keys(tokens.cssVariables).length,
      hasDesignSystem: this.hasDesignSystem(analysis)
    };

    return analysis;
  }

  /**
   * Analyze colors for patterns
   */
  analyzeColors(colors) {
    const colorAnalysis = {
      total: Object.keys(colors).length,
      categories: {
        primary: [],
        secondary: [],
        neutral: [],
        semantic: []
      },
      formats: {
        hex: 0,
        rgb: 0,
        hsl: 0
      },
      usage: {
        background: 0,
        text: 0,
        border: 0,
        shadow: 0,
        unknown: 0
      }
    };

    Object.entries(colors).forEach(([color, data]) => {
      // Count formats
      if (data.format && colorAnalysis.formats[data.format] !== undefined) {
        colorAnalysis.formats[data.format]++;
      }

      // Count usage - ensure usage is an array
      if (data.usage && Array.isArray(data.usage)) {
        data.usage.forEach(usage => {
          if (colorAnalysis.usage[usage] !== undefined) {
            colorAnalysis.usage[usage]++;
          }
        });
      }

      // Categorize colors
      const category = this.categorizeColor(color, data);
      if (colorAnalysis.categories[category]) {
        colorAnalysis.categories[category].push(color);
      }
    });

    return colorAnalysis;
  }

  /**
   * Categorize color
   */
  categorizeColor(color, data) {
    if (data.usage.includes('text')) return 'neutral';
    if (data.usage.includes('background')) return 'neutral';
    if (this.isPrimaryColor(color)) return 'primary';
    if (this.isSemanticColor(color)) return 'semantic';
    return 'secondary';
  }

  /**
   * Check if color is likely a primary color
   */
  isPrimaryColor(color) {
    // Simple heuristic: vibrant colors are often primary
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Check if it's not grayscale
      return !(Math.abs(r - g) < 30 && Math.abs(g - b) < 30);
    }
    return false;
  }

  /**
   * Check if color is semantic
   */
  isSemanticColor(color) {
    const semanticColors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'
    ];

    return semanticColors.some(semantic => this.colorsAreSimilar(color, semantic));
  }

  /**
   * Check if two colors are similar
   */
  colorsAreSimilar(color1, color2) {
    // Simple color similarity check
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    return distance < 50; // Threshold for similarity
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    if (!hex.startsWith('#')) return null;

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Analyze fonts
   */
  analyzeFonts(fonts) {
    const fontAnalysis = {
      total: Object.keys(fonts).length,
      families: [],
      hasTypographyScale: false,
      fontWeights: new Set(),
      fontSizes: new Set()
    };

    Object.entries(fonts).forEach(([key, font]) => {
      if (key === 'typography-scale') {
        fontAnalysis.hasTypographyScale = true;
        fontAnalysis.fontSizes = new Set(font.sizes);
        fontAnalysis.fontWeights = new Set(font.weights);
      } else if (font.family) {
        fontAnalysis.families.push({
          family: font.family,
          fallbacks: font.fallbacks
        });
      }
    });

    return fontAnalysis;
  }

  /**
   * Analyze spacing
   */
  analyzeSpacing(spacing) {
    const spacingAnalysis = {
      total: Object.keys(spacing).length,
      values: [],
      hasSystem: false,
      baseUnit: null
    };

    Object.entries(spacing).forEach(([value, data]) => {
      spacingAnalysis.values.push({
        value: value,
        frequency: data.frequency,
        property: data.property
      });
    });

    // Try to identify base unit
    const numericValues = spacingAnalysis.values
      .filter(v => v.value.includes('px'))
      .map(v => parseInt(v.value))
      .filter(v => v > 0);

    if (numericValues.length > 0) {
      // Find the most common divisor
      const gcd = this.findGCD(numericValues);
      spacingAnalysis.baseUnit = `${gcd}px`;
      spacingAnalysis.hasSystem = numericValues.every(v => v % gcd === 0);
    }

    return spacingAnalysis;
  }

  /**
   * Find greatest common divisor
   */
  findGCD(numbers) {
    return numbers.reduce((a, b) => this.gcd(a, b));
  }

  /**
   * Calculate GCD of two numbers
   */
  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * Analyze shadows
   */
  analyzeShadows(shadows) {
    return {
      total: Object.keys(shadows).length,
      types: Object.values(shadows).map(s => s.type),
      hasElevationSystem: Object.keys(shadows).length >= 3
    };
  }

  /**
   * Analyze border radius
   */
  analyzeBorderRadius(borderRadius) {
    return {
      total: Object.keys(borderRadius).length,
      values: Object.keys(borderRadius),
      hasSystem: Object.keys(borderRadius).length >= 3
    };
  }

  /**
   * Analyze CSS variables
   */
  analyzeCSSVariables(cssVariables) {
    const analysis = {
      total: Object.keys(cssVariables).length,
      categories: {}
    };

    Object.values(cssVariables).forEach(variable => {
      if (!analysis.categories[variable.category]) {
        analysis.categories[variable.category] = 0;
      }
      analysis.categories[variable.category]++;
    });

    return analysis;
  }

  /**
   * Check if design has a design system
   */
  hasDesignSystem(analysis) {
    return (
      analysis.colors.total >= 5 &&
      analysis.spacing.hasSystem &&
      analysis.fonts.hasTypographyScale &&
      (analysis.shadows.hasElevationSystem || analysis.borderRadius.hasSystem)
    );
  }

  /**
   * Identify color system
   */
  identifyColorSystem(colors) {
    const colorSystem = {
      primary: this.findPrimaryColor(colors),
      secondary: this.findSecondaryColor(colors),
      neutral: this.findNeutralColors(colors),
      semantic: this.findSemanticColors(colors)
    };

    return colorSystem;
  }

  /**
   * Find primary color
   */
  findPrimaryColor(colors) {
    // Find the most frequent non-grayscale color
    const nonGrayscale = Object.entries(colors)
      .filter(([color, data]) => this.isPrimaryColor(color))
      .sort((a, b) => b[1].usage.length - a[1].usage.length);

    return nonGrayscale[0] ? nonGrayscale[0][0] : null;
  }

  /**
   * Find secondary color
   */
  findSecondaryColor(colors) {
    const nonGrayscale = Object.entries(colors)
      .filter(([color, data]) => this.isPrimaryColor(color))
      .sort((a, b) => b[1].usage.length - a[1].usage.length);

    return nonGrayscale[1] ? nonGrayscale[1][0] : null;
  }

  /**
   * Find neutral colors
   */
  findNeutralColors(colors) {
    return Object.entries(colors)
      .filter(([color, data]) => !this.isPrimaryColor(color) && !this.isSemanticColor(color))
      .map(([color]) => color);
  }

  /**
   * Find semantic colors
   */
  findSemanticColors(colors) {
    return Object.entries(colors)
      .filter(([color, data]) => this.isSemanticColor(color))
      .map(([color]) => color);
  }

  /**
   * Identify typography system
   */
  identifyTypographySystem(fonts) {
    const typographyData = fonts['typography-scale'];
    if (!typographyData) {
      return { hasSystem: false };
    }

    return {
      hasSystem: true,
      fontFamilies: Object.values(fonts).filter(f => f.family).map(f => f.family),
      fontSizes: typographyData.sizes,
      fontWeights: typographyData.weights
    };
  }

  /**
   * Identify spacing system
   */
  identifySpacingSystem(spacing) {
    const analysis = this.analyzeSpacing(spacing);

    if (!analysis.hasSystem) {
      return { hasSystem: false };
    }

    return {
      hasSystem: true,
      baseUnit: analysis.baseUnit,
      scale: this.generateSpacingScale(analysis.values, analysis.baseUnit)
    };
  }

  /**
   * Generate spacing scale
   */
  generateSpacingScale(values, baseUnit) {
    const scale = {};
    const scaleNames = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    const multipliers = [1, 2, 4, 6, 8, 12, 16];

    // Try to match actual values to scale
    values.forEach(value => {
      const numValue = parseInt(value.value);
      if (numValue > 0) {
        const multiplier = Math.round(numValue / parseInt(baseUnit));
        const scaleIndex = multipliers.indexOf(multiplier);
        if (scaleIndex !== -1) {
          scale[scaleNames[scaleIndex]] = value.value;
        }
      }
    });

    return scale;
  }

  /**
   * Generate component patterns
   */
  generateComponentPatterns(components) {
    const patterns = {};

    Object.entries(components).forEach(([type, items]) => {
      if (type !== 'all' && type !== 'summary') {
        patterns[type] = items.map(component => ({
          selector: component.selector,
          variant: component.variant,
          hasStates: Object.keys(component.states).length > 0,
          exampleHTML: component.htmlExamples[0] || null
        }));
      }
    });

    return patterns;
  }

  /**
   * Create interactive HTML demo
   */
  createInteractiveDemo(analysisData) {
    const template = this.generateDemoTemplate(analysisData);
    return {
      html: template,
      filename: 'demo.html',
      description: 'Interactive design system demo page'
    };
  }

  /**
   * Generate demo HTML template
   */
  generateDemoTemplate(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design System Demo - ${data.designTokenAnalysis.summary.totalColors} colors, ${data.components.summary.total} components</title>
    <style>
        /* Extracted Design Tokens */
        ${this.generateCSSFromTokens(data.designTokenAnalysis)}

        /* Component Styles */
        ${this.componentDetector.generateComponentCSS(data.components.all)}

        /* Demo Layout */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8f9fa;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .section {
            margin-bottom: 60px;
        }

        h1, h2, h3 {
            color: #2c3e50;
            margin-bottom: 20px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .demo-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Design System Demo</h1>
        <p>Extracted from ${data.url}</p>

        <div class="section">
            <h2>Colors</h2>
            <div class="grid">
                ${this.generateColorSwatches(data.designTokenAnalysis.colors)}
            </div>
        </div>

        <div class="section">
            <h2>Typography</h2>
            ${this.generateTypographyDemo(data.typographySystem)}
        </div>

        <div class="section">
            <h2>Spacing</h2>
            ${this.generateSpacingDemo(data.spacingSystem)}
        </div>

        <div class="section">
            <h2>Components</h2>
            ${this.generateComponentDemo(data.components)}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate CSS from design tokens
   */
  generateCSSFromTokens(tokenAnalysis) {
    let css = ':root {\n';

    // Generate color variables
    Object.entries(tokenAnalysis.colors.categories).forEach(([category, colors]) => {
      colors.forEach((color, index) => {
        css += `  --color-${category}-${index + 1}: ${color};\n`;
      });
    });

    css += '\n/* Spacing */\n';
    if (tokenAnalysis.spacing.baseUnit) {
      css += `  --spacing-base: ${tokenAnalysis.spacing.baseUnit};\n`;
    }

    css += '}\n\n';
    return css;
  }

  /**
   * Generate color swatches HTML
   */
  generateColorSwatches(colorAnalysis) {
    let html = '';

    Object.entries(colorAnalysis.categories).forEach(([category, colors]) => {
      colors.forEach(color => {
        html += `
          <div class="demo-card">
            <div style="width: 100%; height: 60px; background: ${color}; border-radius: 4px; margin-bottom: 10px;"></div>
            <p><strong>${color}</strong><br>
            <small>Category: ${category}</small></p>
          </div>`;
      });
    });

    return html;
  }

  /**
   * Generate typography demo
   */
  generateTypographyDemo(typographySystem) {
    if (!typographySystem.hasSystem) {
      return '<p>No systematic typography found</p>';
    }

    let html = '<div class="demo-card">';

    typographySystem.fontSizes.forEach(size => {
      html += `<div style="font-size: ${size}; margin: 10px 0;">Sample text at ${size}</div>`;
    });

    html += '</div>';
    return html;
  }

  /**
   * Generate spacing demo
   */
  generateSpacingDemo(spacingSystem) {
    if (!spacingSystem.hasSystem) {
      return '<p>No systematic spacing found</p>';
    }

    let html = '<div class="demo-card">';

    Object.entries(spacingSystem.scale).forEach(([name, value]) => {
      html += `
        <div style="margin-bottom: ${value}; border: 1px dashed #ccc; padding: 10px;">
          ${name}: ${value}
        </div>`;
    });

    html += '</div>';
    return html;
  }

  /**
   * Generate component demo
   */
  generateComponentDemo(components) {
    let html = '';

    Object.entries(components.patterns).forEach(([type, patterns]) => {
      if (patterns.length > 0) {
        html += `<h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>`;

        patterns.forEach(pattern => {
          html += `<div class="demo-card">
            <p><strong>${pattern.selector}</strong></p>`;

          if (pattern.exampleHTML) {
            html += `<div>${pattern.exampleHTML.html}</div>`;
          } else {
            // Generate generic example
            html += this.generateGenericExample(type);
          }

          html += '</div>';
        });
      }
    });

    return html;
  }

  /**
   * Generate generic component example
   */
  generateGenericExample(type) {
    const examples = {
      button: '<button style="padding: 10px 20px; border: 1px solid #ccc; border-radius: 4px;">Button</button>',
      card: '<div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px;">Card Content</div>',
      input: '<input type="text" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 100%;">',
      navigation: '<nav style="display: flex; gap: 20px;"><a href="#">Link 1</a><a href="#">Link 2</a></nav>'
    };

    return examples[type] || `<div>${type} component</div>`;
  }

  /**
   * Save analysis data to file
   */
  async saveAnalysisData(result, outputPath = './style') {
    const fs = require('fs').promises;
    const path = require('path');

    const siteName = this.generateFilename(result.url);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dir = path.join(process.cwd(), outputPath, `${siteName}-${timestamp}`);

    // Create directory
    await fs.mkdir(dir, { recursive: true });

    // Save analysis data
    const analysisFile = path.join(dir, 'phase-2-analysis.json');
    await fs.writeFile(analysisFile, JSON.stringify(result, null, 2));

    // Save HTML demo
    const demoFile = path.join(dir, result.data.htmlDemo.filename);
    await fs.writeFile(demoFile, result.data.htmlDemo.html);

    result.savedPaths = {
      directory: dir,
      analysisFile: analysisFile,
      demoFile: demoFile
    };

    console.log(`💾 Phase 2 data saved to: ${dir}`);
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
}

module.exports = Phase2Analysis;