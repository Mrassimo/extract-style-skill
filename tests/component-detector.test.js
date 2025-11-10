/**
 * Test Suite for Component Detector
 * Tests component identification and pattern matching
 */

const ComponentDetector = require('../scripts/component-detector');

describe('Component Detector', () => {
  let detector;

  beforeEach(() => {
    detector = new ComponentDetector();
  });

  describe('Button Detection', () => {
    test('identifies primary buttons', () => {
      const styles = {
        'background': '#007bff',
        'color': '#ffffff',
        'border-radius': '4px',
        'padding': '8px 16px',
        'cursor': 'pointer'
      };

      const component = detector.detectComponent('button-primary', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('button');
      expect(component.variant).toBe('primary');
      expect(component.confidence).toBeGreaterThan(0.8);
    });

    test('identifies secondary buttons', () => {
      const styles = {
        'background': 'transparent',
        'color': '#007bff',
        'border': '1px solid #007bff',
        'padding': '8px 16px'
      };

      const component = detector.detectComponent('btn-secondary', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('button');
      expect(component.variant).toBe('secondary');
    });

    test('detects button states', () => {
      const hoverStyles = {
        'background': '#0056b3',
        'transform': 'translateY(-1px)'
      };

      const component = detector.detectComponent('button:hover', hoverStyles);
      expect(component.states).toContain('hover');
    });
  });

  describe('Card Detection', () => {
    test('identifies card components', () => {
      const styles = {
        'background': '#ffffff',
        'border-radius': '8px',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
        'padding': '16px',
        'border': '1px solid #e9ecef'
      };

      const component = detector.detectComponent('card', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('card');
      expect(component.confidence).toBeGreaterThan(0.7);
    });

    test('identifies card variants', () => {
      const elevatedStyles = {
        'background': '#ffffff',
        'box-shadow': '0 8px 16px rgba(0,0,0,0.15)',
        'border-radius': '12px'
      };

      const component = detector.detectComponent('card-elevated', elevatedStyles);
      expect(component).toBeDefined();
      expect(component.type).toBe('card');
      expect(component.variant).toBe('elevated');
    });
  });

  describe('Input Detection', () => {
    test('identifies text inputs', () => {
      const styles = {
        'border': '1px solid #ced4da',
        'border-radius': '4px',
        'padding': '8px 12px',
        'font-size': '14px',
        'background': '#ffffff'
      };

      const component = detector.detectComponent('form-input', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('input');
      expect(component.inputType).toBe('text');
    });

    test('identifies input states', () => {
      const focusStyles = {
        'border-color': '#007bff',
        'box-shadow': '0 0 0 2px rgba(0,123,255,0.25)',
        'outline': 'none'
      };

      const component = detector.detectComponent('input:focus', focusStyles);
      expect(component).toBeDefined();
      expect(component.type).toBe('input');
      expect(component.states).toContain('focus');
    });
  });

  describe('Navigation Detection', () => {
    test('identifies navigation bars', () => {
      const styles = {
        'display': 'flex',
        'justify-content': 'space-between',
        'align-items': 'center',
        'padding': '1rem',
        'background': '#ffffff'
      };

      const component = detector.detectComponent('navbar', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('navigation');
      expect(component.variant).toBe('navbar');
    });

    test('identifies navigation links', () => {
      const styles = {
        'color': '#007bff',
        'text-decoration': 'none',
        'padding': '8px 16px',
        'border-radius': '4px'
      };

      const component = detector.detectComponent('nav-link', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('navigation');
      expect(component.variant).toBe('link');
    });
  });

  describe('Modal Detection', () => {
    test('identifies modal overlays', () => {
      const styles = {
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'width': '100%',
        'height': '100%',
        'background': 'rgba(0,0,0,0.5)',
        'z-index': '1000'
      };

      const component = detector.detectComponent('modal-overlay', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('modal');
      expect(component.variant).toBe('overlay');
    });

    test('identifies modal content', () => {
      const styles = {
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'background': '#ffffff',
        'border-radius': '8px',
        'z-index': '1001'
      };

      const component = detector.detectComponent('modal-content', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('modal');
      expect(component.variant).toBe('content');
    });
  });

  describe('Alert/Notification Detection', () => {
    test('identifies success alerts', () => {
      const styles = {
        'background': '#d4edda',
        'color': '#155724',
        'border': '1px solid #c3e6cb',
        'border-radius': '4px',
        'padding': '12px 16px'
      };

      const component = detector.detectComponent('alert-success', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('alert');
      expect(component.variant).toBe('success');
    });

    test('identifies error alerts', () => {
      const styles = {
        'background': '#f8d7da',
        'color': '#721c24',
        'border': '1px solid #f5c6cb'
      };

      const component = detector.detectComponent('alert-error', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('alert');
      expect(component.variant).toBe('error');
    });
  });

  describe('Badge Detection', () => {
    test('identifies badge components', () => {
      const styles = {
        'display': 'inline-block',
        'padding': '2px 6px',
        'font-size': '12px',
        'font-weight': 'bold',
        'border-radius': '10px',
        'background': '#007bff',
        'color': '#ffffff'
      };

      const component = detector.detectComponent('badge', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('badge');
      expect(component.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Table Detection', () => {
    test('identifies table components', () => {
      const styles = {
        'width': '100%',
        'border-collapse': 'collapse',
        'background': '#ffffff'
      };

      const component = detector.detectComponent('table', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('table');
    });

    test('identifies table headers', () => {
      const styles = {
        'background': '#f8f9fa',
        'font-weight': 'bold',
        'padding': '12px',
        'text-align': 'left',
        'border-bottom': '2px solid #dee2e6'
      };

      const component = detector.detectComponent('table-header', styles);
      expect(component).toBeDefined();
      expect(component.type).toBe('table');
      expect(component.variant).toBe('header');
    });
  });

  describe('Pattern Matching', () => {
    test('uses class name patterns for detection', () => {
      expect(detector.getComponentTypeFromClassName('btn-primary')).toBe('button');
      expect(detector.getComponentTypeFromClassName('card-body')).toBe('card');
      expect(detector.getComponentTypeFromClassName('form-control')).toBe('input');
      expect(detector.getComponentTypeFromClassName('nav-link')).toBe('navigation');
      expect(detector.getComponentTypeFromClassName('modal-header')).toBe('modal');
    });

    test('extracts variants from class names', () => {
      expect(detector.getVariantFromClassName('btn-outline-secondary')).toBe('outline-secondary');
      expect(detector.getVariantFromClassName('card-elevated')).toBe('elevated');
      expect(detector.getVariantFromClassName('alert-danger')).toBe('danger');
    });
  });

  describe('State Detection', () => {
    test('detects hover states', () => {
      const component = detector.detectComponent('button:hover', {});
      expect(component.states).toContain('hover');
    });

    test('detects focus states', () => {
      const component = detector.detectComponent('input:focus', {});
      expect(component.states).toContain('focus');
    });

    test('detects active states', () => {
      const component = detector.detectComponent('nav-link:active', {});
      expect(component.states).toContain('active');
    });

    test('detects disabled states', () => {
      const component = detector.detectComponent('button:disabled', {});
      expect(component.states).toContain('disabled');
    });
  });

  describe('Component Analysis', () => {
    test('analyzes component properties correctly', () => {
      const styles = {
        'background': '#007bff',
        'padding': '8px 16px',
        'border-radius': '4px',
        'font-size': '14px',
        'cursor': 'pointer'
      };

      const analysis = detector.analyzeComponentProperties(styles);

      expect(analysis.hasBackground).toBe(true);
      expect(analysis.hasBorder).toBe(false);
      expect(analysis.hasRoundedCorners).toBe(true);
      expect(analysis.isInteractive).toBe(true);
      expect(analysis.padding).toBe('8px 16px');
    });
  });

  describe('Error Handling', () => {
    test('handles empty styles gracefully', () => {
      const component = detector.detectComponent('test', {});
      expect(component).toBeDefined();
      expect(component.type).toBe('unknown');
    });

    test('handles null/undefined inputs', () => {
      expect(() => {
        detector.detectComponent('test', null);
      }).not.toThrow();

      expect(() => {
        detector.detectComponent('test', undefined);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('processes multiple components efficiently', () => {
      const components = [];
      for (let i = 0; i < 100; i++) {
        components.push({
          className: `component-${i}`,
          styles: {
            'background': `#ff${i.toString(16)}`,
            'padding': '8px 16px'
          }
        });
      }

      const startTime = Date.now();
      const results = components.map(comp =>
        detector.detectComponent(comp.className, comp.styles)
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 0.5 seconds
      expect(results.length).toBe(100);
    });
  });
});

// Export for use in other test files
module.exports = { ComponentDetector };