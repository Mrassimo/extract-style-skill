/**
 * Test Suite for CSS Parser
 * Tests core parsing functionality with various CSS patterns
 */

const CSSParser = require('../scripts/css-parser');

describe('CSS Parser', () => {
  let parser;

  beforeEach(() => {
    parser = new CSSParser();
  });

  describe('Color Extraction', () => {
    test('extracts hex colors correctly', () => {
      const css = ':root { --color-primary: #ff0000; }';
      const tokens = parser.parseCSS(css);
      expect(tokens.colors['#ff0000']).toBeDefined();
      expect(tokens.colors['#ff0000'].usage).toContain('--color-primary');
    });

    test('extracts short hex colors', () => {
      const css = '.button { background: #fff; color: #000; }';
      const tokens = parser.parseCSS(css);
      expect(tokens.colors['#fff']).toBeDefined();
      expect(tokens.colors['#000']).toBeDefined();
    });

    test('extracts RGB colors', () => {
      const css = '.text { color: rgb(255, 0, 0); background: rgba(0, 255, 0, 0.5); }';
      const tokens = parser.parseCSS(css);
      expect(tokens.colors['rgb(255, 0, 0)']).toBeDefined();
      expect(tokens.colors['rgba(0, 255, 0, 0.5)']).toBeDefined();
    });

    test('extracts HSL colors', () => {
      const css = '.gradient { background: hsl(240, 100%, 50%); border: hsla(120, 100%, 50%, 0.8); }';
      const tokens = parser.parseCSS(css);
      expect(tokens.colors['hsl(240, 100%, 50%)']).toBeDefined();
      expect(tokens.colors['hsla(120, 100%, 50%, 0.8)']).toBeDefined();
    });

    test('extracts named colors', () => {
      const css = '.alert { background: red; color: white; border-color: darkgray; }';
      const tokens = parser.parseCSS(css);
      expect(tokens.colors['red']).toBeDefined();
      expect(tokens.colors['white']).toBeDefined();
      expect(tokens.colors['darkgray']).toBeDefined();
    });

    test('handles CSS variables with color references', () => {
      const css = `
        :root { --primary: #ff0000; }
        .button { background: var(--primary); }
      `;
      const tokens = parser.parseCSS(css);
      expect(tokens.colors['#ff0000']).toBeDefined();
      expect(tokens.cssVariables['--primary']).toBe('#ff0000');
    });
  });

  describe('Font Extraction', () => {
    test('extracts font families', () => {
      const css = `
        .heading { font-family: 'Inter', sans-serif; }
        .body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.fonts['Inter']).toBeDefined();
      expect(tokens.fonts['Inter'].family).toBe("'Inter'");
      expect(tokens.fonts['Inter'].fallbacks).toContain('sans-serif');

      expect(tokens.fonts['-apple-system']).toBeDefined();
      expect(tokens.fonts['-apple-system'].fallbacks).toContain('BlinkMacSystemFont');
    });

    test('extracts font sizes', () => {
      const css = `
        .small { font-size: 12px; }
        .large { font-size: 2rem; }
        .medium { font-size: 1.5em; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.fontSizes['12px']).toBeDefined();
      expect(tokens.fontSizes['2rem']).toBeDefined();
      expect(tokens.fontSizes['1.5em']).toBeDefined();
    });

    test('extracts font weights', () => {
      const css = `
        .light { font-weight: 300; }
        .bold { font-weight: bold; }
        .heavy { font-weight: 700; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.fontWeights['300']).toBeDefined();
      expect(tokens.fontWeights['bold']).toBeDefined();
      expect(tokens.fontWeights['700']).toBeDefined();
    });
  });

  describe('Spacing Extraction', () => {
    test('extracts margin values', () => {
      const css = `
        .element { margin: 10px; }
        .element { margin-top: 20px; margin-bottom: 1rem; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.spacing['10px']).toBeDefined();
      expect(tokens.spacing['20px']).toBeDefined();
      expect(tokens.spacing['1rem']).toBeDefined();
    });

    test('extracts padding values', () => {
      const css = `
        .card { padding: 16px; }
        .button { padding: 8px 16px; }
        .container { padding: 2rem; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.spacing['16px']).toBeDefined();
      expect(tokens.spacing['8px']).toBeDefined();
      expect(tokens.spacing['2rem']).toBeDefined();
    });

    test('handles shorthand spacing values', () => {
      const css = '.box { margin: 10px 20px 30px 40px; }';
      const tokens = parser.parseCSS(css);

      expect(tokens.spacing['10px']).toBeDefined();
      expect(tokens.spacing['20px']).toBeDefined();
      expect(tokens.spacing['30px']).toBeDefined();
      expect(tokens.spacing['40px']).toBeDefined();
    });
  });

  describe('Border Extraction', () => {
    test('extracts border widths', () => {
      const css = `
        .thin { border: 1px solid #ccc; }
        .thick { border: 3px dashed #000; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.borders['1px']).toBeDefined();
      expect(tokens.borders['3px']).toBeDefined();
    });

    test('extracts border radii', () => {
      const css = `
        .rounded { border-radius: 4px; }
        .circle { border-radius: 50%; }
        .pill { border-radius: 20px; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.borderRadius['4px']).toBeDefined();
      expect(tokens.borderRadius['50%']).toBeDefined();
      expect(tokens.borderRadius['20px']).toBeDefined();
    });
  });

  describe('Shadow Extraction', () => {
    test('extracts box shadows', () => {
      const css = `
        .card { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .floating { box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.shadows['0 2px 4px rgba(0,0,0,0.1)']).toBeDefined();
      expect(tokens.shadows['0 8px 16px rgba(0,0,0,0.2)']).toBeDefined();
    });

    test('extracts text shadows', () => {
      const css = `
        .title { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.shadows['1px 1px 2px rgba(0,0,0,0.5)']).toBeDefined();
    });
  });

  describe('CSS Variables Extraction', () => {
    test('extracts CSS custom properties', () => {
      const css = `
        :root {
          --primary-color: #007bff;
          --font-size-base: 16px;
          --spacing-unit: 8px;
          --border-radius-sm: 4px;
        }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.cssVariables['--primary-color']).toBe('#007bff');
      expect(tokens.cssVariables['--font-size-base']).toBe('16px');
      expect(tokens.cssVariables['--spacing-unit']).toBe('8px');
      expect(tokens.cssVariables['--border-radius-sm']).toBe('4px');
    });

    test('handles variable references', () => {
      const css = `
        :root { --color: #ff0000; }
        .button { background: var(--color); border: 1px solid var(--color); }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.cssVariables['--color']).toBe('#ff0000');
      expect(tokens.colors['#ff0000'].usage.length).toBeGreaterThan(0);
    });
  });

  describe('Complex CSS Patterns', () => {
    test('handles media queries', () => {
      const css = `
        @media (max-width: 768px) {
          .container { padding: 10px; }
          .heading { font-size: 18px; }
        }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.spacing['10px']).toBeDefined();
      expect(tokens.fontSizes['18px']).toBeDefined();
    });

    test('handles pseudo-classes', () => {
      const css = `
        .button:hover { background: #0056b3; }
        .button:active { transform: scale(0.95); }
        .input:focus { border-color: #007bff; }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.colors['#0056b3']).toBeDefined();
      expect(tokens.colors['#007bff']).toBeDefined();
    });

    test('handles CSS gradients', () => {
      const css = `
        .gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `;
      const tokens = parser.parseCSS(css);

      expect(tokens.colors['#667eea']).toBeDefined();
      expect(tokens.colors['#764ba2']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('handles malformed CSS gracefully', () => {
      const css = '.broken { color: ; background: #; font-family:; }';

      expect(() => {
        const tokens = parser.parseCSS(css);
        expect(tokens).toBeDefined();
      }).not.toThrow();
    });

    test('handles empty input', () => {
      const tokens = parser.parseCSS('');

      expect(tokens).toBeDefined();
      expect(tokens.colors).toEqual({});
      expect(tokens.fonts).toEqual({});
      expect(tokens.spacing).toEqual({});
    });

    test('handles null/undefined input', () => {
      expect(() => {
        parser.parseCSS(null);
      }).not.toThrow();

      expect(() => {
        parser.parseCSS(undefined);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('handles large CSS files efficiently', () => {
      // Generate a large CSS file
      let largeCSS = ':root {';
      for (let i = 0; i < 1000; i++) {
        largeCSS += ` --color-${i}: #${Math.floor(Math.random()*16777215).toString(16)};`;
      }
      largeCSS += '}';

      const startTime = Date.now();
      const tokens = parser.parseCSS(largeCSS);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(Object.keys(tokens.colors).length).toBeGreaterThan(0);
    });
  });
});

// Export for use in other test files
module.exports = { CSSParser };