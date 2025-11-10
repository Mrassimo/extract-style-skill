/**
 * Test Suite for Validation Service
 * Tests quality assessment and scoring functionality
 */

const ValidationService = require('../scripts/validation-service');

describe('Validation Service', () => {
  let validator;

  beforeEach(() => {
    validator = new ValidationService();
  });

  describe('Scoring System', () => {
    test('calculates color extraction score', () => {
      const extractionData = {
        designTokens: {
          colors: {
            '#ff0000': { usage: ['primary', 'button'] },
            '#00ff00': { usage: ['success'] },
            '#0000ff': { usage: ['link', 'header'] }
          }
        }
      };

      const score = validator.calculateColorScore(extractionData);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('calculates component detection score', () => {
      const analysisData = {
        components: {
          buttons: [
            { className: 'btn-primary', confidence: 0.9 },
            { className: 'btn-secondary', confidence: 0.8 }
          ],
          cards: [
            { className: 'card', confidence: 0.85 }
          ],
          inputs: [
            { className: 'form-control', confidence: 0.95 }
          ]
        }
      };

      const score = validator.calculateComponentScore(analysisData);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('calculates typography score', () => {
      const extractionData = {
        designTokens: {
          fonts: {
            'Inter': { family: 'Inter', fallbacks: ['sans-serif'] },
            'Roboto': { family: 'Roboto', fallbacks: ['Arial'] }
          },
          fontSizes: {
            '14px': { usage: ['body', 'input'] },
            '16px': { usage: ['paragraph'] },
            '24px': { usage: ['heading'] }
          }
        }
      };

      const score = validator.calculateTypographyScore(extractionData);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('calculates spacing score', () => {
      const extractionData = {
        designTokens: {
          spacing: {
            '4px': { frequency: 5, property: 'margin' },
            '8px': { frequency: 10, property: 'padding' },
            '16px': { frequency: 8, property: 'padding' },
            '24px': { frequency: 3, property: 'margin' }
          }
        }
      };

      const score = validator.calculateSpacingScore(extractionData);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Quality Assessment', () => {
    test('assesses high-quality extraction', () => {
      const highQualityData = {
        html: '<html>...</html>',
        css: {
          inline: ['.style { color: red; }'],
          styleTags: ['* { margin: 0; }'],
          external: { 'style.css': 'body { font: Arial; }' }
        },
        designTokens: {
          colors: { '#ff0000': {}, '#00ff00': {}, '#0000ff': {} },
          fonts: { 'Arial': {}, 'Helvetica': {} },
          spacing: { '8px': {}, '16px': {}, '24px': {} },
          cssVariables: { '--primary': '#ff0000' }
        }
      };

      const assessment = validator.assessExtractionQuality(highQualityData);
      expect(assessment.score).toBeGreaterThan(80);
      expect(assessment.grade).toMatch(/^[AB]$/);
    });

    test('assesses low-quality extraction', () => {
      const lowQualityData = {
        html: null,
        css: { inline: [], styleTags: [], external: {} },
        designTokens: {
          colors: {},
          fonts: {},
          spacing: {},
          cssVariables: {}
        }
      };

      const assessment = validator.assessExtractionQuality(lowQualityData);
      expect(assessment.score).toBeLessThan(40);
      expect(assessment.grade).toMatch(/^[DF]$/);
    });

    test('identifies extraction strengths', () => {
      const data = {
        designTokens: {
          colors: { '#ff0000': {}, '#00ff00': {} },
          fonts: { 'Arial': {} }
        }
      };

      const strengths = validator.identifyStrengths(data);
      expect(strengths).toContain('Successfully extracted color tokens');
      expect(strengths).toContain('Font families identified');
    });

    test('identifies extraction issues', () => {
      const data = {
        html: null,
        css: { external: {} },
        designTokens: {
          colors: {},
          fonts: {},
          spacing: {}
        }
      };

      const issues = validator.identifyIssues(data);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(issue => issue.message.includes('colors'))).toBe(true);
    });
  });

  describe('Gap Analysis', () => {
    test('identifies missing color system', () => {
      const data = {
        designTokens: {
          colors: { '#ff0000': {} } // Only one color
        }
      };

      const gaps = validator.identifyColorGaps(data);
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.some(gap => gap.type === 'limited-color-palette')).toBe(true);
    });

    test('identifies missing typography scale', () => {
      const data = {
        designTokens: {
          fontSizes: { '16px': {} } // Only one font size
        }
      };

      const gaps = validator.identifyTypographyGaps(data);
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.some(gap => gap.type === 'limited-typography-scale')).toBe(true);
    });

    test('identifies missing spacing system', () => {
      const data = {
        designTokens: {
          spacing: { '10px': {}, '20px': {} } // Random spacing values
        }
      };

      const gaps = validator.identifySpacingGaps(data);
      expect(gaps.length).toBeGreaterThan(0);
    });

    test('identifies missing component states', () => {
      const data = {
        components: {
          buttons: [
            { className: 'btn', states: [] } // No states defined
          ]
        }
      };

      const gaps = validator.identifyComponentGaps(data);
      expect(gaps.some(gap => gap.type === 'missing-states')).toBe(true);
    });
  });

  describe('Recommendation Generation', () => {
    test('generates color system recommendations', () => {
      const data = {
        designTokens: {
          colors: { '#ff0000': {} }
        }
      };

      const recommendations = validator.generateColorRecommendations(data);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec =>
        rec.description.includes('color palette')
      )).toBe(true);
    });

    test('generates typography recommendations', () => {
      const data = {
        designTokens: {
          fonts: {},
          fontSizes: {}
        }
      };

      const recommendations = validator.generateTypographyRecommendations(data);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    test('generates spacing system recommendations', () => {
      const data = {
        designTokens: {
          spacing: { '7px': {}, '13px': {} } // Inconsistent spacing
        }
      };

      const recommendations = validator.generateSpacingRecommendations(data);
      expect(recommendations.some(rec =>
        rec.description.includes('systematic')
      )).toBe(true);
    });
  });

  describe('Report Generation', () => {
    test('generates comprehensive validation report', () => {
      const phase1Data = {
        success: true,
        data: {
          html: '<html>...</html>',
          css: {
            inline: ['.style { color: red; }'],
            styleTags: ['* { margin: 0; }']
          },
          designTokens: {
            colors: { '#ff0000': {}, '#00ff00': {} },
            fonts: { 'Arial': {} },
            spacing: { '8px': {}, '16px': {} }
          }
        }
      };

      const phase2Data = {
        success: true,
        data: {
          components: {
            buttons: [{ className: 'btn', confidence: 0.9 }],
            cards: [{ className: 'card', confidence: 0.8 }]
          }
        }
      };

      const report = validator.generateValidationReport(phase1Data, phase2Data);

      expect(report.overall).toBeDefined();
      expect(report.overall.score).toBeDefined();
      expect(report.overall.grade).toMatch(/^[ABCDF]$/);
      expect(report.extraction).toBeDefined();
      expect(report.extraction.successes.length).toBeGreaterThan(0);
      expect(report.extraction.issues).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.limitations).toBeDefined();
    });

    test('generates validation summary', () => {
      const validationReport = {
        overall: {
          score: 85,
          grade: 'B',
          status: 'good'
        },
        extraction: {
          successes: ['Colors extracted', 'Components detected'],
          issues: [
            { message: 'Limited spacing system', severity: 'medium' }
          ]
        },
        recommendations: [
          { description: 'Improve spacing system', priority: 'medium' }
        ]
      };

      const summary = validator.generateValidationSummary(validationReport);

      expect(summary).toContain('85%');
      expect(summary).toContain('Grade B');
      expect(summary).toContain('Colors extracted');
    });
  });

  describe('Grading System', () => {
    test('assigns correct grades for scores', () => {
      expect(validator.getGradeFromScore(95)).toBe('A');
      expect(validator.getGradeFromScore(85)).toBe('B');
      expect(validator.getGradeFromScore(75)).toBe('C');
      expect(validator.getGradeFromScore(65)).toBe('D');
      expect(validator.getGradeFromScore(45)).toBe('F');
    });

    test('determines status from grade', () => {
      expect(validator.getStatusFromGrade('A')).toBe('excellent');
      expect(validator.getStatusFromGrade('B')).toBe('good');
      expect(validator.getStatusFromGrade('C')).toBe('fair');
      expect(validator.getStatusFromGrade('D')).toBe('limited');
      expect(validator.getStatusFromGrade('F')).toBe('poor');
    });
  });

  describe('Component Validation', () => {
    test('validates button components', () => {
      const button = {
        className: 'btn-primary',
        styles: {
          'background': '#007bff',
          'color': '#ffffff',
          'padding': '8px 16px',
          'border-radius': '4px'
        },
        confidence: 0.9
      };

      const validation = validator.validateComponent(button, 'button');
      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(0.8);
    });

    test('validates card components', () => {
      const card = {
        className: 'card',
        styles: {
          'background': '#ffffff',
          'border-radius': '8px',
          'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
          'padding': '16px'
        },
        confidence: 0.85
      };

      const validation = validator.validateComponent(card, 'card');
      expect(validation.isValid).toBe(true);
      expect(validation.hasRequiredProperties).toBe(true);
    });
  });

  describe('Design System Validation', () => {
    test('validates color system completeness', () => {
      const colors = {
        '#ffffff': { usage: ['background'] },
        '#000000': { usage: ['text'] },
        '#007bff': { usage: ['primary', 'buttons'] },
        '#6c757d': { usage: ['secondary', 'muted'] },
        '#28a745': { usage: ['success', 'positive'] }
      };

      const validation = validator.validateColorSystem(colors);
      expect(validation.isComplete).toBe(true);
      expect(validation.score).toBeGreaterThan(0.8);
    });

    test('validates spacing system consistency', () => {
      const spacing = {
        '4px': { frequency: 5 },
        '8px': { frequency: 10 },
        '12px': { frequency: 8 },
        '16px': { frequency: 12 },
        '24px': { frequency: 6 }
      };

      const validation = validator.validateSpacingSystem(spacing);
      expect(validation.isSystematic).toBe(true);
      expect(validation.consistencyScore).toBeGreaterThan(0.7);
    });
  });

  describe('Error Handling', () => {
    test('handles missing data gracefully', () => {
      expect(() => {
        validator.generateValidationReport(null, null);
      }).not.toThrow();

      expect(() => {
        validator.assessExtractionQuality({});
      }).not.toThrow();
    });

    test('handles malformed data', () => {
      const malformedData = {
        designTokens: null,
        components: 'not-an-array'
      };

      expect(() => {
        validator.identifyStrengths(malformedData);
      }).not.toThrow();

      const assessment = validator.assessExtractionQuality(malformedData);
      expect(assessment).toBeDefined();
      expect(assessment.score).toBe(0);
    });
  });
});

// Export for use in other test files
module.exports = { ValidationService };