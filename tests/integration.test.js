/**
 * Integration Test for Extract Style Skill
 * Tests the actual API that's implemented (not the expected API from unit tests)
 */

const CSSParser = require('../scripts/css-parser');
const ComponentDetector = require('../scripts/component-detector');
const ValidationService = require('../scripts/validation-service');

describe('Integration Tests - Actual Implementation', () => {
  describe('CSS Parser - parseCSS()', () => {
    test('successfully parses CSS and returns tokens', () => {
      const parser = new CSSParser();
      const css = `
        :root {
          --color-primary: #007bff;
          --color-secondary: #6c757d;
          --spacing-sm: 8px;
          --spacing-md: 16px;
        }
        .button {
          background: #007bff;
          color: white;
          padding: 12px 24px;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `;

      const tokens = parser.parseCSS(css);

      expect(tokens).toBeDefined();
      expect(tokens.colors).toBeDefined();
      expect(tokens.fonts).toBeDefined();
      expect(tokens.spacing).toBeDefined();
      expect(tokens.shadows).toBeDefined();
      expect(tokens.cssVariables).toBeDefined();
    });

    test('returns empty tokens for invalid input', () => {
      const parser = new CSSParser();
      const tokens = parser.parseCSS('');

      expect(tokens).toBeDefined();
      expect(tokens.colors).toBeDefined();
      expect(tokens.fonts).toBeDefined();
    });
  });

  describe('Component Detector - detectComponents()', () => {
    test('successfully detects components from CSS', () => {
      const detector = new ComponentDetector();
      const css = `
        .btn-primary {
          background: #007bff;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 16px;
        }
      `;

      const html = `
        <button class="btn-primary">Click me</button>
        <div class="card">Card content</div>
      `;

      const components = detector.detectComponents(css, html);

      expect(components).toBeDefined();
      expect(components.buttons).toBeDefined();
      expect(components.cards).toBeDefined();
    });
  });

  describe('Validation Service - generateValidationReport()', () => {
    test('generates validation report from phase results', () => {
      const validator = new ValidationService();

      const phase1Result = {
        success: true,
        phase: 'phase1',
        data: {
          html: '<html><body><h1>Test</h1></body></html>',
          css: {
            inline: [],
            styleTags: ['.test { color: red; }'],
            external: {}
          },
          designTokens: {
            colors: { '#ff0000': { usage: ['test'], frequency: 1 } },
            fonts: { 'Arial': { family: 'Arial', fallbacks: ['sans-serif'] } },
            spacing: { '10px': { frequency: 1, property: 'padding' } },
            shadows: {},
            cssVariables: {}
          },
          screenshots: null
        }
      };

      const report = validator.generateValidationReport(phase1Result);

      expect(report).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(report.overall.score).toBeGreaterThanOrEqual(0);
      expect(report.overall.score).toBeLessThanOrEqual(100);
      expect(report.overall.grade).toBeDefined();
      expect(report.extraction).toBeDefined();
      expect(report.completeness).toBeDefined();
    });
  });

  describe('End-to-End Workflow Validation', () => {
    test('complete extraction workflow with minimal data', () => {
      const parser = new CSSParser();
      const detector = new ComponentDetector();
      const validator = new ValidationService();

      // Simulate Phase 1: Parse CSS
      const css = `
        .button {
          background: #007bff;
          color: white;
          padding: 10px 20px;
        }
      `;

      const tokens = parser.parseCSS(css);

      // Create Phase 1 result structure
      const phase1Result = {
        success: true,
        phase: 'phase1',
        data: {
          html: '<button class="button">Test</button>',
          css: {
            inline: [],
            styleTags: [css],
            external: {}
          },
          designTokens: tokens,
          screenshots: null
        }
      };

      // Simulate Phase 2: Detect components
      const components = detector.detectComponents(css, phase1Result.data.html);

      // Validate Phase 1 only (Phase 2 validation structure is complex)
      const report = validator.generateValidationReport(phase1Result, null);

      expect(report).toBeDefined();
      expect(report.overall.score).toBeGreaterThan(0);
      expect(phase1Result.success).toBe(true);
      expect(components).toBeDefined();
      expect(tokens).toBeDefined();
      expect(tokens.colors).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('CSS Parser handles malformed CSS gracefully', () => {
      const parser = new CSSParser();

      expect(() => {
        parser.parseCSS('{ invalid css }}}');
      }).not.toThrow();
    });

    test('Component Detector handles empty input gracefully', () => {
      const detector = new ComponentDetector();

      expect(() => {
        detector.detectComponents('', '');
      }).not.toThrow();
    });

    test('Validation Service handles missing data gracefully', () => {
      const validator = new ValidationService();

      const minimalPhase1 = {
        success: false,
        phase: 'phase1',
        data: {
          html: null,
          css: null,
          designTokens: { colors: {}, fonts: {}, spacing: {}, shadows: {}, cssVariables: {} }
        }
      };

      expect(() => {
        validator.generateValidationReport(minimalPhase1);
      }).not.toThrow();
    });
  });
});
