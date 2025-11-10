/**
 * Component Detection Algorithms
 * Identifies and extracts UI components from CSS and HTML
 */

class ComponentDetector {
  constructor() {
    this.componentPatterns = {
      button: {
        selectors: [
          'button',
          '.btn*',
          '[class*="button"]',
          '[class*="Button"]',
          'input[type="submit"]',
          'input[type="button"]',
          '.btn-primary',
          '.btn-secondary',
          '.btn-outline',
          '[role="button"]',
          'a[href*="javascript:void"]'
        ],
        properties: [
          'background', 'background-color', 'bgcolor',
          'color', 'border', 'border-radius', 'padding',
          'font-weight', 'text-transform', 'cursor'
        ],
        states: ['hover', 'focus', 'active', 'disabled']
      },
      card: {
        selectors: [
          '.card*',
          '[class*="Card"]',
          '.shadow*',
          '.panel*',
          '[class*="tile"]',
          '[class*="box"]',
          '[class*="container"]'
        ],
        properties: [
          'background', 'background-color',
          'border', 'border-radius', 'box-shadow',
          'padding', 'margin', 'overflow'
        ],
        states: ['hover', 'focus-within']
      },
      input: {
        selectors: [
          'input[type="text"]',
          'input[type="email"]',
          'input[type="password"]',
          'input[type="search"]',
          'textarea',
          'select',
          '.form-control',
          '[class*="input"]',
          '[class*="Input"]'
        ],
        properties: [
          'border', 'border-radius', 'padding',
          'font-size', 'background', 'color',
          'outline', 'box-shadow', 'transition'
        ],
        states: ['hover', 'focus', 'disabled', 'invalid']
      },
      navigation: {
        selectors: [
          'nav',
          '.nav*',
          '[class*="menu"]',
          '[class*="navbar"]',
          '[class*="navigation"]',
          '.header',
          '[role="navigation"]'
        ],
        properties: [
          'display', 'justify-content', 'align-items',
          'background', 'padding', 'height',
          'border-bottom', 'position'
        ],
        states: ['hover', 'active']
      },
      modal: {
        selectors: [
          '.modal*',
          '[class*="Modal"]',
          '.dialog*',
          '.overlay*',
          '.popup*',
          '[role="dialog"]'
        ],
        properties: [
          'position', 'z-index', 'background',
          'border-radius', 'box-shadow', 'padding',
          'max-width', 'max-height'
        ],
        states: ['open', 'closed']
      },
      dropdown: {
        selectors: [
          '.dropdown*',
          '[class*="Dropdown"]',
          '.select*',
          '[class*="menu"]',
          '[aria-expanded]'
        ],
        properties: [
          'position', 'z-index', 'background',
          'border', 'border-radius', 'box-shadow',
          'min-width', 'overflow'
        ],
        states: ['open', 'closed', 'hover']
      }
    };
  }

  /**
   * Detect components from CSS text
   */
  detectComponents(cssText, htmlText = '') {
    const components = {
      buttons: this.detectButtons(cssText, htmlText),
      cards: this.detectCards(cssText, htmlText),
      inputs: this.detectInputs(cssText, htmlText),
      navigation: this.detectNavigation(cssText, htmlText),
      modals: this.detectModals(cssText, htmlText),
      dropdowns: this.detectDropdowns(cssText, htmlText)
    };

    return {
      ...components,
      all: this.mergeComponents(components),
      summary: this.generateComponentSummary(components)
    };
  }

  /**
   * Detect button components
   */
  detectButtons(cssText, htmlText) {
    const buttons = [];
    const patterns = this.componentPatterns.button;

    // Find button selectors in CSS
    for (const selectorPattern of patterns.selectors) {
      const regex = this.createSelectorRegex(selectorPattern);
      let match;

      while ((match = regex.exec(cssText)) !== null) {
        const selector = match[0].split('{')[0].trim();
        const styles = this.extractStyles(match[0]);

        // Skip if doesn't look like a button
        if (!this.looksLikeButton(styles)) continue;

        const button = {
          selector: selector,
          styles: styles,
          states: this.extractStates(cssText, selector, patterns.states),
          variants: this.classifyButtonVariant(styles),
          htmlExamples: this.extractHTMLElements(htmlText, selectorPattern)
        };

        buttons.push(button);
      }
    }

    return this.deduplicateComponents(buttons, 'selector');
  }

  /**
   * Detect card components
   */
  detectCards(cssText, htmlText) {
    const cards = [];
    const patterns = this.componentPatterns.card;

    for (const selectorPattern of patterns.selectors) {
      const regex = this.createSelectorRegex(selectorPattern);
      let match;

      while ((match = regex.exec(cssText)) !== null) {
        const selector = match[0].split('{')[0].trim();
        const styles = this.extractStyles(match[0]);

        if (!this.looksLikeCard(styles)) continue;

        const card = {
          selector: selector,
          styles: styles,
          states: this.extractStates(cssText, selector, patterns.states),
          htmlExamples: this.extractHTMLElements(htmlText, selectorPattern)
        };

        cards.push(card);
      }
    }

    return this.deduplicateComponents(cards, 'selector');
  }

  /**
   * Detect input components
   */
  detectInputs(cssText, htmlText) {
    const inputs = [];
    const patterns = this.componentPatterns.input;

    for (const selectorPattern of patterns.selectors) {
      const regex = this.createSelectorRegex(selectorPattern);
      let match;

      while ((match = regex.exec(cssText)) !== null) {
        const selector = match[0].split('{')[0].trim();
        const styles = this.extractStyles(match[0]);

        if (!this.looksLikeInput(styles)) continue;

        const input = {
          selector: selector,
          styles: styles,
          states: this.extractStates(cssText, selector, patterns.states),
          htmlExamples: this.extractHTMLElements(htmlText, selectorPattern)
        };

        inputs.push(input);
      }
    }

    return this.deduplicateComponents(inputs, 'selector');
  }

  /**
   * Detect navigation components
   */
  detectNavigation(cssText, htmlText) {
    const navigation = [];
    const patterns = this.componentPatterns.navigation;

    for (const selectorPattern of patterns.selectors) {
      const regex = this.createSelectorRegex(selectorPattern);
      let match;

      while ((match = regex.exec(cssText)) !== null) {
        const selector = match[0].split('{')[0].trim();
        const styles = this.extractStyles(match[0]);

        const nav = {
          selector: selector,
          styles: styles,
          states: this.extractStates(cssText, selector, patterns.states),
          htmlExamples: this.extractHTMLElements(htmlText, selectorPattern)
        };

        navigation.push(nav);
      }
    }

    return this.deduplicateComponents(navigation, 'selector');
  }

  /**
   * Detect modal components
   */
  detectModals(cssText, htmlText) {
    const modals = [];
    const patterns = this.componentPatterns.modal;

    for (const selectorPattern of patterns.selectors) {
      const regex = this.createSelectorRegex(selectorPattern);
      let match;

      while ((match = regex.exec(cssText)) !== null) {
        const selector = match[0].split('{')[0].trim();
        const styles = this.extractStyles(match[0]);

        if (!this.looksLikeModal(styles)) continue;

        const modal = {
          selector: selector,
          styles: styles,
          states: this.extractStates(cssText, selector, patterns.states),
          htmlExamples: this.extractHTMLElements(htmlText, selectorPattern)
        };

        modals.push(modal);
      }
    }

    return this.deduplicateComponents(modals, 'selector');
  }

  /**
   * Detect dropdown components
   */
  detectDropdowns(cssText, htmlText) {
    const dropdowns = [];
    const patterns = this.componentPatterns.dropdown;

    for (const selectorPattern of patterns.selectors) {
      const regex = this.createSelectorRegex(selectorPattern);
      let match;

      while ((match = regex.exec(cssText)) !== null) {
        const selector = match[0].split('{')[0].trim();
        const styles = this.extractStyles(match[0]);

        if (!this.looksLikeDropdown(styles)) continue;

        const dropdown = {
          selector: selector,
          styles: styles,
          states: this.extractStates(cssText, selector, patterns.states),
          htmlExamples: this.extractHTMLElements(htmlText, selectorPattern)
        };

        dropdowns.push(dropdown);
      }
    }

    return this.deduplicateComponents(dropdowns, 'selector');
  }

  /**
   * Create regex pattern from selector
   */
  createSelectorRegex(selector) {
    // Convert CSS selector to regex pattern
    const pattern = selector
      .replace(/\*/g, '[^{]*')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');

    return new RegExp(pattern + '\\s*{([^}]+)}', 'gi');
  }

  /**
   * Extract styles from CSS rule
   */
  extractStyles(cssRule) {
    const stylesMatch = cssRule.match(/{([^}]+)}/);
    if (!stylesMatch) return {};

    const stylesText = stylesMatch[1];
    const styles = {};

    stylesText.split(';').forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    });

    return styles;
  }

  /**
   * Extract state styles (hover, focus, etc.)
   */
  extractStates(cssText, baseSelector, states) {
    const stateStyles = {};

    for (const state of states) {
      const stateSelectors = [
        `${baseSelector}:${state}`,
        `${baseSelector}:hover`,
        `${baseSelector}:focus`,
        `${baseSelector}:active`,
        `${baseSelector}:disabled`
      ];

      for (const stateSelector of stateSelectors) {
        const regex = new RegExp(`${stateSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{([^}]+)}`, 'gi');
        const match = regex.exec(cssText);

        if (match) {
          stateStyles[state] = this.extractStyles(match[0]);
        }
      }
    }

    return stateStyles;
  }

  /**
   * Check if component looks like a button
   */
  looksLikeButton(styles) {
    const buttonIndicators = [
      'background', 'background-color', 'border-radius',
      'padding', 'cursor: pointer', 'font-weight',
      'text-transform: uppercase'
    ];

    return buttonIndicators.some(indicator => {
      if (indicator.includes(':')) {
        const [prop, value] = indicator.split(':').map(s => s.trim());
        return styles[prop] === value;
      }
      return styles[indicator] !== undefined;
    });
  }

  /**
   * Check if component looks like a card
   */
  looksLikeCard(styles) {
    const cardIndicators = [
      'background', 'box-shadow', 'border-radius',
      'padding', 'border'
    ];

    return cardIndicators.some(indicator => styles[indicator] !== undefined);
  }

  /**
   * Check if component looks like an input
   */
  looksLikeInput(styles) {
    const inputIndicators = [
      'border', 'border-radius', 'padding',
      'font-size', 'background', 'outline'
    ];

    return inputIndicators.some(indicator => styles[indicator] !== undefined);
  }

  /**
   * Check if component looks like a modal
   */
  looksLikeModal(styles) {
    const modalIndicators = [
      'position: fixed', 'position: absolute',
      'z-index', 'background', 'border-radius'
    ];

    return modalIndicators.some(indicator => {
      if (indicator.includes(':')) {
        const [prop, value] = indicator.split(':').map(s => s.trim());
        return styles[prop] === value;
      }
      return styles[indicator] !== undefined;
    });
  }

  /**
   * Check if component looks like a dropdown
   */
  looksLikeDropdown(styles) {
    const dropdownIndicators = [
      'position: absolute', 'position: relative',
      'z-index', 'background', 'border'
    ];

    return dropdownIndicators.some(indicator => {
      if (indicator.includes(':')) {
        const [prop, value] = indicator.split(':').map(s => s.trim());
        return styles[prop] === value;
      }
      return styles[indicator] !== undefined;
    });
  }

  /**
   * Classify button variant
   */
  classifyButtonVariant(styles) {
    if (styles.background && styles.background !== 'transparent' && styles.background !== 'none') {
      if (styles.border && styles.border !== 'none') {
        return 'solid-with-border';
      }
      return 'solid';
    }

    if (styles.border && styles.border !== 'none') {
      return 'outline';
    }

    if (styles.background === 'transparent' || styles.background === 'none') {
      return 'ghost';
    }

    return 'unknown';
  }

  /**
   * Extract HTML elements that match the selector
   */
  extractHTMLElements(htmlText, selectorPattern) {
    if (!htmlText) return [];

    const examples = [];
    const patterns = selectorPattern.replace(/\*/g, '[^"\\s]*');

    // Simple regex-based extraction (not perfect, but works for basic patterns)
    const regex = new RegExp(`<[^>]*class[^>]*${patterns}[^>]*>([^<]*)</[^>]+>`, 'gi');
    let match;

    while ((match = regex.exec(htmlText)) !== null) {
      examples.push({
        html: match[0],
        text: match[1].trim()
      });
    }

    return examples.slice(0, 3); // Limit to 3 examples
  }

  /**
   * Remove duplicate components
   */
  deduplicateComponents(components, key) {
    const seen = new Set();
    return components.filter(component => {
      const value = component[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * Merge all components into one array
   */
  mergeComponents(components) {
    const all = [];
    Object.entries(components).forEach(([type, items]) => {
      items.forEach(item => {
        all.push({
          ...item,
          type: type.slice(0, -1) // Remove 's' from plural (buttons -> button)
        });
      });
    });
    return all;
  }

  /**
   * Generate component summary
   */
  generateComponentSummary(components) {
    return {
      buttons: components.buttons.length,
      cards: components.cards.length,
      inputs: components.inputs.length,
      navigation: components.navigation.length,
      modals: components.modals.length,
      dropdowns: components.dropdowns.length,
      total: Object.values(components).reduce((sum, items) => sum + items.length, 0)
    };
  }

  /**
   * Generate CSS for detected components
   */
  generateComponentCSS(components) {
    let css = '';

    // Generate base component styles
    if (components.all && Array.isArray(components.all)) {
      components.all.forEach(component => {
        css += `/* ${component.type.charAt(0).toUpperCase() + component.type.slice(1)} Component */\n`;
        css += `${component.selector || '.component'} {\n`;

        if (component.styles) {
          Object.entries(component.styles).forEach(([property, value]) => {
            css += `  ${property}: ${value};\n`;
          });
        }

        css += '}\n\n';

        // Add state styles
        if (component.states) {
          Object.entries(component.states).forEach(([state, styles]) => {
            css += `${component.selector || '.component'}:${state} {\n`;
            Object.entries(styles).forEach(([property, value]) => {
              css += `  ${property}: ${value};\n`;
            });
            css += '}\n\n';
          });
        }
      });
    }

    return css;
  }
}

module.exports = ComponentDetector;