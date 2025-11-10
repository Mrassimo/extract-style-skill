/**
 * CSS Parser for Design Token Extraction
 * Extracts design tokens from raw CSS text using regex patterns and AST analysis
 */

class CSSParser {
  constructor() {
    this.colors = new Map();
    this.fonts = new Map();
    this.spacing = new Map();
    this.shadows = new Map();
    this.borderRadius = new Map();
    this.borders = new Map();
    this.fontSizes = new Map();
    this.fontWeights = new Map();
    this.components = new Map();
    this.cssVariables = new Map();
    this.useASTFallback = false;
    this.parseErrors = [];

    // Try to load CSS Tree for AST parsing
    try {
      this.cssTree = require('css-tree');
      console.log('🌳 CSS Tree available for AST parsing');
    } catch (error) {
      console.log('⚠️ CSS Tree not available, using regex-only parsing');
      this.cssTree = null;
    }
  }

  /**
   * Parse raw CSS text and extract all design tokens
   */
  parseCSS(cssText) {
    if (!cssText || typeof cssText !== 'string') {
      return this.getTokens();
    }

    // Clean CSS text
    const cleanCSS = this.cleanCSS(cssText);

    // Try AST parsing first if available, fallback to regex
    if (this.cssTree) {
      try {
        return this.parseWithAST(cleanCSS);
      } catch (astError) {
        console.warn('⚠️ AST parsing failed, falling back to regex parsing:', astError.message);
        this.parseErrors.push({
          type: 'ast_parse_error',
          message: astError.message,
          fallback: 'regex'
        });
        this.useASTFallback = true;
      }
    }

    // Fallback to regex parsing
    return this.parseWithRegex(cleanCSS);
  }

  /**
   * Parse CSS using CSS Tree AST for better accuracy
   */
  parseWithAST(cssText) {
    try {
      const ast = this.cssTree.parse(cssText, {
        positions: true,
        parseAtrulePrelude: false,
        parseRulePrelude: false
      });

      // Clear previous tokens
      this.clearTokens();

      // Walk the AST and extract tokens
      this.cssTree.walk(ast, {
        enter: (node) => {
          this.extractFromASTNode(node);
        }
      });

      return this.getTokens();
    } catch (error) {
      throw new Error(`AST parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse CSS using regex patterns (original method)
   */
  parseWithRegex(cssText) {
    // Clear previous tokens
    this.clearTokens();

    // Extract different token types using regex
    this.extractColors(cssText);
    this.extractFonts(cssText);
    this.extractSpacing(cssText);
    this.extractShadows(cssText);
    this.extractBorderRadius(cssText);
    this.extractCSSVariables(cssText);
    this.extractComponents(cssText);

    return this.getTokens();
  }

  /**
   * Extract tokens from AST node
   */
  extractFromASTNode(node) {
    if (node.type === 'Declaration') {
      const property = node.property;
      const value = this.cssTree.generate(node.value);

      switch (property) {
        case 'color':
        case 'background-color':
        case 'border-color':
        case 'outline-color':
          this.extractColorsFromValue(value, property);
          break;

        case 'background':
          if (this.looksLikeColor(value)) {
            this.extractColorsFromValue(value, property);
          }
          break;

        case 'font-family':
          this.extractFontsFromValue(value);
          break;

        case 'font-size':
          this.addToken('fontSizes', value.trim());
          break;

        case 'font-weight':
          this.addToken('fontWeights', value.trim());
          break;

        case 'margin':
        case 'padding':
        case 'margin-top':
        case 'margin-right':
        case 'margin-bottom':
        case 'margin-left':
        case 'padding-top':
        case 'padding-right':
        case 'padding-bottom':
        case 'padding-left':
          this.extractSpacingFromValue(value, property);
          break;

        case 'box-shadow':
        case 'text-shadow':
          this.addToken('shadows', value.trim());
          break;

        case 'border-radius':
          this.extractBorderRadiusFromValue(value);
          break;

        case 'border-width':
          this.addToken('borders', value.trim());
          break;

        default:
          // Handle CSS custom properties
          if (property.startsWith('--')) {
            this.cssVariables.set(property, value.trim());
          }
      }
    }

    // Handle CSS custom property declarations
    if (node.type === 'Atrule' && node.name === 'custom-media') {
      // Extract custom media queries if needed
    }
  }

  /**
   * Extract colors from a CSS value
   */
  extractColorsFromValue(value, property) {
    const colorMatches = value.match(/(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)(?=\W|$)/g);

    if (colorMatches) {
      colorMatches.forEach(color => {
        const cleanColor = color.trim();
        if (this.isValidColor(cleanColor)) {
          const usage = this.getPropertyUsage(property);
          this.colors.set(cleanColor, {
            value: cleanColor,
            format: this.detectColorFormat(cleanColor),
            usage: usage
          });
        }
      });
    }
  }

  /**
   * Extract fonts from a CSS value
   */
  extractFontsFromValue(value) {
    const fonts = value.split(',').map(f => f.trim().replace(/['"]/g, ''));
    const primaryFont = fonts[0];

    if (primaryFont) {
      this.fonts.set(primaryFont, {
        family: primaryFont,
        fallbacks: fonts.slice(1),
        stack: value.trim()
      });
    }
  }

  /**
   * Extract spacing from a CSS value
   */
  extractSpacingFromValue(value, property) {
    // Handle shorthand values like "10px 20px" or individual values
    const spacingValues = value.split(/\s+/).filter(v => v.trim());

    spacingValues.forEach(spacingValue => {
      if (this.isValidSpacing(spacingValue)) {
        this.addToken('spacing', spacingValue.trim());
      }
    });
  }

  /**
   * Extract border radius from a CSS value
   */
  extractBorderRadiusFromValue(value) {
    const radiusValues = value.split(/\s+/).filter(v => v.trim());

    radiusValues.forEach(radiusValue => {
      if (this.isValidSpacing(radiusValue)) {
        this.addToken('borderRadius', radiusValue.trim());
      }
    });
  }

  /**
   * Add a token to the specified collection
   */
  addToken(collection, value) {
    const map = this[collection];
    if (map) {
      if (!map.has(value)) {
        map.set(value, {
          value: value,
          frequency: 0
        });
      }
      map.get(value).frequency++;
    }
  }

  /**
   * Check if a string looks like a color
   */
  looksLikeColor(str) {
    return /(#|rgb|hsl|[a-zA-Z]+)/.test(str) && !/(px|em|rem|%)/.test(str);
  }

  /**
   * Check if a string is a valid color
   */
  isValidColor(str) {
    const colorPattern = /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)$/;
    return colorPattern.test(str);
  }

  /**
   * Check if a string is valid spacing
   */
  isValidSpacing(str) {
    const spacingPattern = /^[0-9]+(\.[0-9]+)?(px|em|rem|%|vw|vh|vmin|vmax)$/;
    return spacingPattern.test(str);
  }

  /**
   * Detect color format
   */
  detectColorFormat(color) {
    if (color.startsWith('#')) return 'hex';
    if (color.startsWith('rgb')) return 'rgb';
    if (color.startsWith('hsl')) return 'hsl';
    return 'named';
  }

  /**
   * Get property usage context
   */
  getPropertyUsage(property) {
    const usageMap = {
      'color': ['text'],
      'background-color': ['background'],
      'background': ['background'],
      'border-color': ['border'],
      'outline-color': ['border']
    };
    return usageMap[property] || ['unknown'];
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    this.colors.clear();
    this.fonts.clear();
    this.spacing.clear();
    this.shadows.clear();
    this.borderRadius.clear();
    this.borders.clear();
    this.fontSizes.clear();
    this.fontWeights.clear();
    this.components.clear();
    this.cssVariables.clear();
    this.parseErrors = [];
  }

  /**
   * Clean CSS text for better parsing
   */
  cleanCSS(cssText) {
    return cssText
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract all color values from CSS
   */
  extractColors(cssText) {
    // Hex colors
    const hexPattern = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
    let match;
    while ((match = hexPattern.exec(cssText)) !== null) {
      this.colors.set(match[0], {
        value: match[0],
        format: 'hex',
        usage: this.detectColorUsage(cssText, match[0])
      });
    }

    // RGB colors
    const rgbPattern = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)/g;
    while ((match = rgbPattern.exec(cssText)) !== null) {
      this.colors.set(match[0], {
        value: match[0],
        format: 'rgb',
        usage: this.detectColorUsage(cssText, match[0])
      });
    }

    // HSL colors
    const hslPattern = /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+\s*)?\)/g;
    while ((match = hslPattern.exec(cssText)) !== null) {
      this.colors.set(match[0], {
        value: match[0],
        format: 'hsl',
        usage: this.detectColorUsage(cssText, match[0])
      });
    }
  }

  /**
   * Detect how colors are used in the CSS
   */
  detectColorUsage(cssText, color) {
    const context = cssText.substring(
      Math.max(0, cssText.indexOf(color) - 100),
      cssText.indexOf(color) + color.length + 100
    );

    const usage = [];
    if (context.includes('background') || context.includes('bg')) {
      usage.push('background');
    }
    if (context.includes('color') || context.includes('text')) {
      usage.push('text');
    }
    if (context.includes('border')) {
      usage.push('border');
    }
    if (context.includes('box-shadow') || context.includes('shadow')) {
      usage.push('shadow');
    }

    return usage.length > 0 ? usage : ['unknown'];
  }

  /**
   * Extract font families and typography
   */
  extractFonts(cssText) {
    const fontFamilyPattern = /font-family:\s*([^;]+)/g;
    let match;
    while ((match = fontFamilyPattern.exec(cssText)) !== null) {
      const fonts = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
      const primaryFont = fonts[0];

      this.fonts.set(primaryFont, {
        family: primaryFont,
        fallbacks: fonts.slice(1),
        stack: match[1]
      });
    }

    // Extract font sizes
    const fontSizePattern = /font-size:\s*([^;]+)/g;
    const fontSizes = new Set();
    while ((match = fontSizePattern.exec(cssText)) !== null) {
      fontSizes.add(match[1].trim());
    }

    // Extract font weights
    const fontWeightPattern = /font-weight:\s*([^;]+)/g;
    const fontWeights = new Set();
    while ((match = fontWeightPattern.exec(cssText)) !== null) {
      fontWeights.add(match[1].trim());
    }

    // Store typography data
    if (fontSizes.size > 0 || fontWeights.size > 0) {
      this.fonts.set('typography-scale', {
        sizes: Array.from(fontSizes),
        weights: Array.from(fontWeights)
      });
    }
  }

  /**
   * Extract spacing values
   */
  extractSpacing(cssText) {
    const spacingProperties = [
      'margin', 'padding', 'gap', 'top', 'bottom', 'left', 'right'
    ];

    spacingProperties.forEach(prop => {
      const pattern = new RegExp(`${prop}\\s*:\\s*([^;]+)`, 'g');
      let match;
      while ((match = pattern.exec(cssText)) !== null) {
        const values = match[1].split(/\s+/).map(v => v.trim());
        values.forEach(value => {
          if (this.isValidSpacingValue(value)) {
            this.spacing.set(value, {
              value: value,
              property: prop,
              frequency: (this.spacing.get(value)?.frequency || 0) + 1
            });
          }
        });
      }
    });
  }

  /**
   * Check if a value is a valid spacing value
   */
  isValidSpacingValue(value) {
    return /^\d+(px|em|rem|vh|vw|%)?$/.test(value) ||
           /^calc\(.+\)$/.test(value) ||
           value === '0' || value === 'auto';
  }

  /**
   * Extract box shadows
   */
  extractShadows(cssText) {
    const shadowPattern = /box-shadow:\s*([^;]+)/g;
    let match;
    while ((match = shadowPattern.exec(cssText)) !== null) {
      const shadow = match[1].trim();
      this.shadows.set(shadow, {
        value: shadow,
        type: this.classifyShadow(shadow)
      });
    }
  }

  /**
   * Classify shadow type
   */
  classifyShadow(shadow) {
    if (shadow.includes('inset')) return 'inset';
    if (shadow.includes('rgba')) return 'colored';
    if (parseFloat(shadow.split(' ')[1]) > 10) return 'large';
    if (parseFloat(shadow.split(' ')[1]) > 4) return 'medium';
    return 'small';
  }

  /**
   * Extract border radius values
   */
  extractBorderRadius(cssText) {
    const radiusPattern = /border-radius:\s*([^;]+)/g;
    let match;
    while ((match = radiusPattern.exec(cssText)) !== null) {
      const radius = match[1].trim();
      this.borderRadius.set(radius, {
        value: radius,
        frequency: (this.borderRadius.get(radius)?.frequency || 0) + 1
      });
    }
  }

  /**
   * Extract CSS custom properties (variables)
   */
  extractCSSVariables(cssText) {
    const variablePattern = /--([a-zA-Z0-9-_]+):\s*([^;]+)/g;
    let match;
    while ((match = variablePattern.exec(cssText)) !== null) {
      this.cssVariables.set(match[1], {
        name: match[1],
        value: match[2].trim(),
        category: this.categorizeVariable(match[1])
      });
    }
  }

  /**
   * Categorize CSS variables by naming convention
   */
  categorizeVariable(variableName) {
    if (variableName.includes('color')) return 'color';
    if (variableName.includes('font') || variableName.includes('text')) return 'typography';
    if (variableName.includes('spacing') || variableName.includes('space')) return 'spacing';
    if (variableName.includes('shadow') || variableName.includes('elevation')) return 'shadow';
    if (variableName.includes('radius') || variableName.includes('border')) return 'border';
    return 'other';
  }

  /**
   * Extract component patterns
   */
  extractComponents(cssText) {
    // Button patterns
    const buttonSelectors = [
      /\.btn[^{]*|button[^{]*|input\[type="submit"][^{]*/
    ];

    buttonSelectors.forEach(pattern => {
      const regex = new RegExp(pattern + '\\s*{([^}]+)}', 'g');
      let match;
      while ((match = regex.exec(cssText)) !== null) {
        this.components.set(`button-${this.components.size}`, {
          type: 'button',
          selector: match[0].split('{')[0].trim(),
          styles: match[1],
          variant: this.classifyButtonVariant(match[1])
        });
      }
    });

    // Card patterns
    const cardSelectors = [
      /\.card[^{]*|\.shadow[^{]*/
    ];

    cardSelectors.forEach(pattern => {
      const regex = new RegExp(pattern + '\\s*{([^}]+)}', 'g');
      let match;
      while ((match = regex.exec(cssText)) !== null) {
        this.components.set(`card-${this.components.size}`, {
          type: 'card',
          selector: match[0].split('{')[0].trim(),
          styles: match[1]
        });
      }
    });

    // Input patterns
    const inputSelectors = [
      /input[^{]*|textarea[^{]*|select[^{]*/
    ];

    inputSelectors.forEach(pattern => {
      const regex = new RegExp(pattern + '\\s*{([^}]+)}', 'g');
      let match;
      while ((match = regex.exec(cssText)) !== null) {
        this.components.set(`input-${this.components.size}`, {
          type: 'input',
          selector: match[0].split('{')[0].trim(),
          styles: match[1]
        });
      }
    });
  }

  /**
   * Classify button variant based on styles
   */
  classifyButtonVariant(styles) {
    if (styles.includes('background') || styles.includes('bgcolor')) {
      return 'solid';
    }
    if (styles.includes('border') && !styles.includes('background')) {
      return 'outline';
    }
    return 'ghost';
  }

  /**
   * Get all extracted tokens as a structured object
   */
  getTokens() {
    // Convert Maps to plain objects, handling both old and new data structures
    const mapToObject = (map) => {
      const obj = {};
      map.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    };

    return {
      colors: mapToObject(this.colors),
      fonts: mapToObject(this.fonts),
      spacing: mapToObject(this.spacing),
      shadows: mapToObject(this.shadows),
      borderRadius: mapToObject(this.borderRadius),
      borders: mapToObject(this.borders || new Map()),
      fontSizes: mapToObject(this.fontSizes || new Map()),
      fontWeights: mapToObject(this.fontWeights || new Map()),
      cssVariables: mapToObject(this.cssVariables),
      components: mapToObject(this.components),
      metadata: {
        parsingMethod: this.useASTFallback ? 'regex' : (this.cssTree ? 'ast' : 'regex'),
        parseErrors: this.parseErrors,
        hasASTSupport: !!this.cssTree
      }
    };
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    const tokens = this.getTokens();

    return {
      extracted: {
        colors: Object.keys(tokens.colors).length,
        fonts: Object.keys(tokens.fonts).length,
        spacing: Object.keys(tokens.spacing).length,
        shadows: Object.keys(tokens.shadows).length,
        components: Object.keys(tokens.components).length,
        cssVariables: Object.keys(tokens.cssVariables).length
      },
      quality: {
        hasColorVariables: Object.keys(tokens.cssVariables).some(v => v.includes('color')),
        hasSpacingSystem: Object.keys(tokens.spacing).length >= 5,
        hasTypographyScale: Object.keys(tokens.fonts).some(f => f === 'typography-scale'),
        hasComponentStyles: Object.keys(tokens.components).length > 0
      },
      limitations: [
        'Cannot extract computed styles applied via JavaScript',
        'Cannot access styles from CORS-blocked external stylesheets',
        'Cannot extract styles from pseudo-elements (::before, ::after)',
        'Cannot extract media query-specific styles without context'
      ]
    };
  }
}

module.exports = CSSParser;