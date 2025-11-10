/**
 * Phase 3: Iterative Refinement (AIJSON Phase 2)
 * Implements the co-creation loop for design system refinement
 */

class Phase3Refinement {
  constructor() {
    this.refinementHistory = [];
    this.maxIterations = 3;
    this.accuracyThreshold = 0.85; // 85% accuracy target
  }

  /**
   * Execute Phase 3: Iterative Refinement
   */
  async execute(phase2Result, userFeedback = null, options = {}) {
    console.log(`🔄 Starting Phase 3: Iterative refinement for ${phase2Result.url}`);

    const result = {
      url: phase2Result.url,
      timestamp: new Date().toISOString(),
      phase: 'refinement',
      data: {},
      input: phase2Result,
      userFeedback: userFeedback,
      iterations: [],
      metadata: {
        refinementTime: Date.now(),
        options: options
      }
    };

    try {
      // Initialize refinement state
      let currentState = this.initializeRefinementState(phase2Result);
      let iteration = 0;
      let converged = false;

      // Iterative refinement loop
      while (iteration < this.maxIterations && !converged) {
        console.log(`🔄 Refinement iteration ${iteration + 1}/${this.maxIterations}`);

        const iterationResult = await this.performRefinementIteration(
          currentState,
          userFeedback,
          iteration,
          options
        );

        result.iterations.push(iterationResult);

        // Check convergence
        converged = this.checkConvergence(iterationResult, iteration);

        // Update state for next iteration
        if (!converged) {
          currentState = this.updateRefinementState(currentState, iterationResult);
        }

        iteration++;
      }

      // Generate final refined outputs
      console.log('📝 Generating final refined outputs...');
      result.data.refinedDesignSystem = this.generateRefinedDesignSystem(currentState);
      result.data.refinedDemo = this.generateRefinedDemo(currentState);
      result.data.styleGuide = this.generateRefinedStyleGuide(currentState);
      result.data.designTokens = this.generateRefinedDesignTokens(currentState);
      result.data.refinementReport = this.generateRefinementReport(result.iterations);

      // Save refined results
      if (options.saveData !== false) {
        await this.saveRefinementData(result, options.outputPath);
      }

      result.success = true;
      console.log('✅ Phase 3 refinement completed successfully');

      return result;

    } catch (error) {
      result.success = false;
      result.error = {
        message: error.message,
        stack: error.stack
      };
      console.error('❌ Phase 3 refinement failed:', error.message);
      throw error;
    }
  }

  /**
   * Initialize refinement state from Phase 2 results
   */
  initializeRefinementState(phase2Result) {
    return {
      originalAnalysis: phase2Result.data,
      currentDesignSystem: this.cloneDesignSystem(phase2Result.data),
      accuracy: 0.5, // Start with 50% estimated accuracy
      issues: this.identifyInitialIssues(phase2Result.data),
      improvements: [],
      userCorrections: []
    };
  }

  /**
   * Perform a single refinement iteration
   */
  async performRefinementIteration(state, userFeedback, iterationIndex, options) {
    const iteration = {
      number: iterationIndex + 1,
      timestamp: new Date().toISOString(),
      improvements: [],
      accuracyBefore: state.accuracy,
      accuracyAfter: 0,
      changes: []
    };

    try {
      // Step 1: Analyze current issues
      const currentIssues = this.analyzeCurrentIssues(state);
      iteration.issuesIdentified = currentIssues;

      // Step 2: Apply improvement strategies
      const improvements = await this.applyImprovementStrategies(state, currentIssues, userFeedback);
      iteration.improvements = improvements;

      // Step 3: Validate improvements
      const validationResult = await this.validateImprovements(state, improvements);
      iteration.validation = validationResult;

      // Step 4: Calculate new accuracy
      iteration.accuracyAfter = this.calculateAccuracy(state, improvements, validationResult);

      // Step 5: Generate refinement suggestions for user
      if (options.interactiveMode) {
        iteration.suggestions = this.generateRefinementSuggestions(state, improvements);
      }

      iteration.success = true;

    } catch (error) {
      iteration.success = false;
      iteration.error = error.message;
      console.error(`❌ Iteration ${iteration.number} failed:`, error.message);
    }

    return iteration;
  }

  /**
   * Identify initial issues in the extracted design system
   */
  identifyInitialIssues(analysisData) {
    const issues = [];

    // Check color system issues
    const colorIssues = this.identifyColorIssues(analysisData.designTokenAnalysis.colors);
    issues.push(...colorIssues);

    // Check spacing system issues
    const spacingIssues = this.identifySpacingIssues(analysisData.designTokenAnalysis.spacing);
    issues.push(...spacingIssues);

    // Check typography issues
    const typographyIssues = this.identifyTypographyIssues(analysisData.designTokenAnalysis.fonts);
    issues.push(...typographyIssues);

    // Check component issues
    const componentIssues = this.identifyComponentIssues(analysisData.components);
    issues.push(...componentIssues);

    return issues;
  }

  /**
   * Identify color system issues
   */
  identifyColorIssues(colorAnalysis) {
    const issues = [];

    if (colorAnalysis.total < 5) {
      issues.push({
        type: 'insufficient_colors',
        severity: 'medium',
        description: 'Limited color palette detected',
        suggestion: 'May be missing colors from JavaScript-applied styles or external themes'
      });
    }

    if (colorAnalysis.categories.primary.length === 0) {
      issues.push({
        type: 'no_primary_color',
        severity: 'high',
        description: 'No primary brand color identified',
        suggestion: 'Primary colors might be applied through CSS variables or JavaScript'
      });
    }

    if (colorAnalysis.categories.neutral.length < 3) {
      issues.push({
        type: 'limited_neutral_colors',
        severity: 'medium',
        description: 'Limited neutral color palette',
        suggestion: 'Text and background colors may be defined in browser defaults or JavaScript'
      });
    }

    return issues;
  }

  /**
   * Identify spacing system issues
   */
  identifySpacingIssues(spacingAnalysis) {
    const issues = [];

    if (!spacingAnalysis.hasSystem) {
      issues.push({
        type: 'no_spacing_system',
        severity: 'high',
        description: 'No systematic spacing scale identified',
        suggestion: 'Spacing might be applied through utility classes or CSS-in-JS'
      });
    }

    if (spacingAnalysis.total < 5) {
      issues.push({
        type: 'limited_spacing_values',
        severity: 'medium',
        description: 'Limited spacing values detected',
        suggestion: 'Spacing may be applied through CSS custom properties or calculations'
      });
    }

    return issues;
  }

  /**
   * Identify typography issues
   */
  identifyTypographyIssues(fontAnalysis) {
    const issues = [];

    if (!fontAnalysis.hasTypographyScale) {
      issues.push({
        type: 'no_typography_scale',
        severity: 'high',
        description: 'No systematic typography scale identified',
        suggestion: 'Font sizes may be applied through CSS variables or JavaScript calculations'
      });
    }

    if (fontAnalysis.fontSizes.size < 4) {
      issues.push({
        type: 'limited_type_scale',
        severity: 'medium',
        description: 'Limited type scale variety',
        suggestion: 'Heading sizes might be defined in responsive breakpoints or CSS calculations'
      });
    }

    return issues;
  }

  /**
   * Identify component issues
   */
  identifyComponentIssues(components) {
    const issues = [];

    if (components.summary.total < 3) {
      issues.push({
        type: 'limited_components',
        severity: 'medium',
        description: 'Few reusable components identified',
        suggestion: 'Components might be defined through JavaScript frameworks or CSS-in-JS'
      });
    }

    // Check for components without states
    const componentsWithoutStates = components.all.filter(c =>
      Object.keys(c.states).length === 0
    ).length;

    if (componentsWithoutStates > components.summary.total * 0.5) {
      issues.push({
        type: 'missing_component_states',
        severity: 'medium',
        description: 'Many components lack hover/focus/disabled states',
        suggestion: 'States might be applied through JavaScript or CSS-in-JS libraries'
      });
    }

    return issues;
  }

  /**
   * Analyze current issues in refinement state
   */
  analyzeCurrentIssues(state) {
    const issues = [];

    // Re-analyze with current state
    const currentAnalysis = state.currentDesignSystem;

    // Check for remaining color issues
    if (currentAnalysis.colors.total < 5) {
      issues.push({
        type: 'still_insufficient_colors',
        priority: 'high',
        description: 'Color palette still needs enhancement'
      });
    }

    // Check for spacing system issues
    if (!currentAnalysis.spacing.hasSystem) {
      issues.push({
        type: 'spacing_system_still_missing',
        priority: 'high',
        description: 'Spacing system still not identified'
      });
    }

    // Check for component completeness
    if (currentAnalysis.components.summary.total < 5) {
      issues.push({
        type: 'need_more_components',
        priority: 'medium',
        description: 'More component types needed for comprehensive design system'
      });
    }

    return issues;
  }

  /**
   * Apply improvement strategies
   */
  async applyImprovementStrategies(state, issues, userFeedback) {
    const improvements = [];

    for (const issue of issues) {
      const strategy = this.selectImprovementStrategy(issue);
      if (strategy) {
        const improvement = await this.executeImprovementStrategy(state, strategy, userFeedback);
        improvements.push(improvement);
      }
    }

    return improvements;
  }

  /**
   * Select improvement strategy for an issue
   */
  selectImprovementStrategy(issue) {
    const strategies = {
      'still_insufficient_colors': {
        name: 'enhance_color_palette',
        action: 'infer_missing_colors',
        description: 'Infer missing colors from component patterns and semantic naming'
      },
      'spacing_system_still_missing': {
        name: 'create_spacing_system',
        action: 'derive_spacing_scale',
        description: 'Derive spacing scale from component margins and padding patterns'
      },
      'need_more_components': {
        name: 'enhance_component_detection',
        action: 'deep_pattern_analysis',
        description: 'Perform deeper pattern analysis to identify component variations'
      },
      'missing_component_states': {
        name: 'add_component_states',
        action: 'infer_interactive_states',
        description: 'Infer hover, focus, and active states from component patterns'
      }
    };

    return strategies[issue.type] || null;
  }

  /**
   * Execute improvement strategy
   */
  async executeImprovementStrategy(state, strategy, userFeedback) {
    const improvement = {
      strategy: strategy.name,
      action: strategy.action,
      description: strategy.description,
      changes: [],
      timestamp: new Date().toISOString()
    };

    switch (strategy.action) {
      case 'infer_missing_colors':
        improvement.changes = this.inferMissingColors(state);
        break;

      case 'derive_spacing_scale':
        improvement.changes = this.deriveSpacingScale(state);
        break;

      case 'deep_pattern_analysis':
        improvement.changes = this.performDeepPatternAnalysis(state);
        break;

      case 'infer_interactive_states':
        improvement.changes = this.inferInteractiveStates(state);
        break;

      default:
        improvement.changes = [];
    }

    // Apply user feedback if provided
    if (userFeedback && userFeedback.corrections) {
      improvement.userFeedback = this.applyUserFeedback(state, userFeedback);
    }

    return improvement;
  }

  /**
   * Infer missing colors from existing patterns
   */
  inferMissingColors(state) {
    const changes = [];
    const colors = state.currentDesignSystem.colors;

    // Infer hover states from primary colors
    Object.entries(colors).forEach(([color, data]) => {
      if (data.usage.includes('background') || data.usage.includes('text')) {
        const hoverColor = this.generateHoverVariant(color);
        if (hoverColor && !colors[hoverColor]) {
          changes.push({
            type: 'color_added',
            color: hoverColor,
            usage: ['hover'],
            source: 'inferred_from_' + color
          });
        }
      }
    });

    return changes;
  }

  /**
   * Generate hover variant of a color
   */
  generateHoverVariant(baseColor) {
    if (baseColor.startsWith('#')) {
      const hex = baseColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Darken for hover
      const factor = 0.8;
      const newR = Math.round(r * factor);
      const newG = Math.round(g * factor);
      const newB = Math.round(b * factor);

      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    return null;
  }

  /**
   * Derive spacing scale from component patterns
   */
  deriveSpacingScale(state) {
    const changes = [];
    const components = state.currentDesignSystem.components;

    // Extract spacing values from component styles
    const spacingValues = new Set();

    components.all.forEach(component => {
      Object.entries(component.styles).forEach(([property, value]) => {
        if (property.includes('padding') || property.includes('margin')) {
          const values = value.split(/\s+/);
          values.forEach(v => {
            if (v.includes('px') && !isNaN(parseInt(v))) {
              spacingValues.add(v);
            }
          });
        }
      });
    });

    // Create systematic scale from found values
    const sortedValues = Array.from(spacingValues)
      .map(v => parseInt(v))
      .sort((a, b) => a - b);

    if (sortedValues.length > 0) {
      const baseUnit = this.findBaseUnit(sortedValues);
      const scale = this.createScaleFromValues(sortedValues, baseUnit);

      changes.push({
        type: 'spacing_system_created',
        baseUnit: `${baseUnit}px`,
        scale: scale,
        source: 'derived_from_components'
      });
    }

    return changes;
  }

  /**
   * Find base unit from spacing values
   */
  findBaseUnit(values) {
    if (values.length === 0) return 8;

    // Find the smallest value that divides other values
    const sorted = [...values].sort((a, b) => a - b);
    const smallest = sorted[0];

    // Check if it's a good base unit
    const divisible = sorted.filter(v => v % smallest === 0).length;
    if (divisible >= sorted.length * 0.7) {
      return smallest;
    }

    // Try common base units
    const commonBases = [4, 8, 12, 16];
    for (const base of commonBases) {
      const divisible = sorted.filter(v => v % base === 0).length;
      if (divisible >= sorted.length * 0.7) {
        return base;
      }
    }

    return smallest;
  }

  /**
   * Create spacing scale from values
   */
  createScaleFromValues(values, baseUnit) {
    const scale = {};
    const scaleNames = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
    const multipliers = [1, 2, 4, 6, 8, 12, 16];

    multipliers.forEach((multiplier, index) => {
      const targetValue = baseUnit * multiplier;
      const closestValue = values.find(v => Math.abs(v - targetValue) <= baseUnit / 2);

      if (closestValue || values.includes(targetValue)) {
        scale[scaleNames[index]] = `${closestValue || targetValue}px`;
      }
    });

    return scale;
  }

  /**
   * Perform deep pattern analysis for components
   */
  performDeepPatternAnalysis(state) {
    const changes = [];
    const components = state.currentDesignSystem.components;

    // Look for component variations
    components.all.forEach(component => {
      const variations = this.identifyComponentVariations(component);
      if (variations.length > 0) {
        changes.push({
          type: 'component_variations_found',
          component: component.selector,
          variations: variations,
          source: 'pattern_analysis'
        });
      }
    });

    return changes;
  }

  /**
   * Identify variations of a component
   */
  identifyComponentVariations(component) {
    const variations = [];
    const styles = component.styles;

    // Look for size variants
    if (styles.padding) {
      const paddingValue = styles.padding;
      if (paddingValue.includes('px')) {
        const size = this.classifyComponentSize(paddingValue);
        variations.push({ type: 'size', value: size });
      }
    }

    // Look for style variants
    if (styles.background && styles.background !== 'transparent') {
      variations.push({ type: 'style', value: 'solid' });
    } else if (styles.border && styles.border !== 'none') {
      variations.push({ type: 'style', value: 'outline' });
    } else {
      variations.push({ type: 'style', value: 'ghost' });
    }

    return variations;
  }

  /**
   * Classify component size from padding
   */
  classifyComponentSize(padding) {
    const value = parseInt(padding);
    if (value <= 8) return 'small';
    if (value <= 16) return 'medium';
    return 'large';
  }

  /**
   * Infer interactive states for components
   */
  inferInteractiveStates(state) {
    const changes = [];
    const components = state.currentDesignSystem.components;

    components.all.forEach(component => {
      if (Object.keys(component.states).length === 0) {
        const inferredStates = this.inferStatesForComponent(component);
        if (inferredStates.length > 0) {
          changes.push({
            type: 'component_states_added',
            component: component.selector,
            states: inferredStates,
            source: 'inferred'
          });
        }
      }
    });

    return changes;
  }

  /**
   * Infer states for a specific component
   */
  inferStatesForComponent(component) {
    const states = [];
    const styles = component.styles;

    // Infer hover state
    if (styles.background || styles.color || styles.border) {
      const hoverStyles = {};
      if (styles.background && styles.background !== 'transparent') {
        hoverStyles.background = this.generateHoverVariant(styles.background);
      }
      if (styles.color) {
        hoverStyles.color = this.generateHoverVariant(styles.color);
      }
      if (styles.border) {
        hoverStyles.border = styles.border;
        hoverStyles['box-shadow'] = '0 2px 4px rgba(0,0,0,0.1)';
      }

      if (Object.keys(hoverStyles).length > 0) {
        states.push({ name: 'hover', styles: hoverStyles });
      }
    }

    // Infer focus state
    if (styles.border) {
      states.push({
        name: 'focus',
        styles: {
          outline: 'none',
          'box-shadow': `0 0 0 2px ${styles.background || '#007bff'}40`
        }
      });
    }

    return states;
  }

  /**
   * Apply user feedback to improvements
   */
  applyUserFeedback(state, userFeedback) {
    const applied = [];

    if (userFeedback.corrections) {
      userFeedback.corrections.forEach(correction => {
        applied.push({
          type: 'user_correction',
          correction: correction,
          applied: true
        });
      });
    }

    return applied;
  }

  /**
   * Validate improvements
   */
  async validateImprovements(state, improvements) {
    const validation = {
      valid: true,
      issues: [],
      improvements: []
    };

    for (const improvement of improvements) {
      const improvementValidation = this.validateImprovement(improvement, state);
      validation.improvements.push(improvementValidation);

      if (!improvementValidation.valid) {
        validation.valid = false;
        validation.issues.push(...improvementValidation.issues);
      }
    }

    return validation;
  }

  /**
   * Validate a single improvement
   */
  validateImprovement(improvement, state) {
    const validation = {
      valid: true,
      issues: [],
      improvement: improvement.strategy
    };

    // Check if changes are consistent
    if (improvement.changes) {
      improvement.changes.forEach(change => {
        if (change.type === 'color_added') {
          if (!this.isValidColor(change.color)) {
            validation.valid = false;
            validation.issues.push(`Invalid color format: ${change.color}`);
          }
        }
      });
    }

    return validation;
  }

  /**
   * Check if color is valid
   */
  isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  /**
   * Calculate accuracy after improvements
   */
  calculateAccuracy(state, improvements, validation) {
    let accuracy = state.accuracy;

    // Add accuracy points for valid improvements
    improvements.forEach(improvement => {
      if (improvement.changes.length > 0) {
        accuracy += 0.1; // 10% improvement per successful change
      }
    });

    // Subtract accuracy for validation issues
    if (validation.issues.length > 0) {
      accuracy -= validation.issues.length * 0.05; // 5% penalty per issue
    }

    return Math.min(Math.max(accuracy, 0), 1); // Clamp between 0 and 1
  }

  /**
   * Check if refinement has converged
   */
  checkConvergence(iteration, iterationIndex) {
    // Converged if high accuracy achieved
    if (iteration.accuracyAfter >= this.accuracyThreshold) {
      console.log(`✅ Target accuracy (${this.accuracyThreshold * 100}%) achieved`);
      return true;
    }

    // Converged if minimal improvement in last iteration
    if (iterationIndex > 0) {
      const improvement = iteration.accuracyAfter - iteration.accuracyBefore;
      if (improvement < 0.02) { // Less than 2% improvement
        console.log(`✅ Converged - minimal improvement (${(improvement * 100).toFixed(1)}%)`);
        return true;
      }
    }

    // Converged if no issues to address
    if (iteration.improvements.length === 0) {
      console.log(`✅ Converged - no further improvements identified`);
      return true;
    }

    return false;
  }

  /**
   * Update refinement state after iteration
   */
  updateRefinementState(state, iteration) {
    const newState = this.cloneState(state);

    // Apply improvements to current design system
    iteration.improvements.forEach(improvement => {
      this.applyImprovementToState(newState, improvement);
    });

    // Update accuracy
    newState.accuracy = iteration.accuracyAfter;

    // Add to improvements history
    newState.improvements.push(...iteration.improvements);

    return newState;
  }

  /**
   * Apply improvement to state
   */
  applyImprovementToState(state, improvement) {
    improvement.changes.forEach(change => {
      switch (change.type) {
        case 'color_added':
          state.currentDesignSystem.colors[change.color] = {
            value: change.color,
            usage: change.usage,
            source: change.source
          };
          break;

        case 'spacing_system_created':
          state.currentDesignSystem.spacing = {
            ...state.currentDesignSystem.spacing,
            ...change.scale,
            hasSystem: true,
            baseUnit: change.baseUnit
          };
          break;

        case 'component_variations_found':
          // Add to component variations
          const component = state.currentDesignSystem.components.all.find(
            c => c.selector === change.component
          );
          if (component) {
            component.variations = change.variations;
          }
          break;

        case 'component_states_added':
          // Add states to component
          const targetComponent = state.currentDesignSystem.components.all.find(
            c => c.selector === change.component
          );
          if (targetComponent) {
            change.states.forEach(state => {
              targetComponent.states[state.name] = state.styles;
            });
          }
          break;
      }
    });
  }

  /**
   * Generate refined design system
   */
  generateRefinedDesignSystem(state) {
    return {
      ...state.currentDesignSystem,
      refinementHistory: state.improvements,
      finalAccuracy: state.accuracy,
      refinementMetadata: {
        iterations: state.improvements.length,
        originalIssues: state.issues.length,
        resolvedIssues: state.improvements.flatMap(i => i.changes).length
      }
    };
  }

  /**
   * Generate refined demo HTML
   */
  generateRefinedDemo(state) {
    const template = this.generateRefinedDemoTemplate(state.currentDesignSystem);
    return {
      html: template,
      filename: 'refined-demo.html',
      description: 'Refined interactive design system demo',
      accuracy: state.accuracy
    };
  }

  /**
   * Generate refined demo template
   */
  generateRefinedDemoTemplate(designSystem) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refined Design System Demo - ${(designSystem.accuracy * 100).toFixed(1)}% Accuracy</title>
    <style>
        /* Refined Design Tokens */
        ${this.generateCSSFromRefinedTokens(designSystem)}

        /* Refined Component Styles */
        ${this.generateRefinedComponentCSS(designSystem.components.all)}

        /* Demo Layout */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8f9fa;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .accuracy-banner {
            background: #28a745;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
            text-align: center;
        }

        .section {
            margin-bottom: 60px;
        }

        .refinement-badge {
            background: #007bff;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="accuracy-banner">
            <h1>✨ Refined Design System</h1>
            <p>Accuracy: ${(designSystem.accuracy * 100).toFixed(1)}% | ${designSystem.refinementMetadata?.iterations || 0} refinement iterations</p>
        </div>

        <div class="section">
            <h2>Refined Color Palette</h2>
            <div class="grid">
                ${this.generateRefinedColorSwatches(designSystem.colors)}
            </div>
        </div>

        <div class="section">
            <h2>Refined Typography <span class="refinement-badge">Enhanced</span></h2>
            ${this.generateRefinedTypographyDemo(designSystem.typographySystem)}
        </div>

        <div class="section">
            <h2>Systematic Spacing <span class="refinement-badge">Inferred</span></h2>
            ${this.generateRefinedSpacingDemo(designSystem.spacing)}
        </div>

        <div class="section">
            <h2>Enhanced Components <span class="refinement-badge">With States</span></h2>
            ${this.generateRefinedComponentDemo(designSystem.components.all)}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate refined style guide
   */
  generateRefinedStyleGuide(state) {
    const designSystem = state.currentDesignSystem;

    return `# Refined Design System

> Extracted and refined through AIJSON methodology
> Final accuracy: ${(state.accuracy * 100).toFixed(1)}%
> Refinement iterations: ${state.improvements.length}

## Overview

This design system has been extracted and refined through an iterative co-creation process, identifying patterns and inferring missing elements to create a comprehensive design system.

## Refined Color Palette

${this.generateRefinedColorSection(designSystem.colors)}

## Systematic Spacing

${this.generateRefinedSpacingSection(designSystem.spacing)}

## Enhanced Typography

${this.generateRefinedTypographySection(designSystem.typographySystem)}

## Component Library

${this.generateRefinedComponentSection(designSystem.components.all)}

## Refinement Notes

${this.generateRefinementNotes(state)}

## Usage Guidelines

${this.generateUsageGuidelines(designSystem)}
`;
  }

  /**
   * Generate refined design tokens CSS
   */
  generateRefinedDesignTokens(state) {
    const designSystem = state.currentDesignSystem;

    let css = `/* Refined Design Tokens */
/* Generated through AIJSON iterative refinement */
/* Accuracy: ${(state.accuracy * 100).toFixed(1)}% */

:root {\n`;

    // Add refined color variables
    css += `  /* Colors */\n`;
    Object.entries(designSystem.colors).forEach(([color, data], index) => {
      const name = this.generateVariableName(color, data.usage, index);
      css += `  --color-${name}: ${color};\n`;
    });

    // Add spacing system
    if (designSystem.spacing.hasSystem) {
      css += `\n  /* Spacing System */\n`;
      css += `  --spacing-base: ${designSystem.spacing.baseUnit || '8px'};\n`;

      Object.entries(designSystem.spacing).forEach(([name, value]) => {
        if (name !== 'hasSystem' && name !== 'baseUnit' && !name.includes('px')) {
          css += `  --spacing-${name}: ${value};\n`;
        }
      });
    }

    // Add typography system
    if (designSystem.typographySystem && designSystem.typographySystem.hasSystem) {
      css += `\n  /* Typography */\n`;
      css += `  --font-primary: "${designSystem.typographySystem.fontFamilies[0] || 'system-ui'}", sans-serif;\n`;

      designSystem.typographySystem.fontSizes.forEach(size => {
        const name = this.generateSizeVariableName(size);
        css += `  --font-size-${name}: ${size};\n`;
      });
    }

    css += '\n}\n\n';
    css += `/* Component Variables */\n`;
    css += this.generateComponentVariables(designSystem.components.all);

    return css;
  }

  /**
   * Generate variable name from color and usage
   */
  generateVariableName(color, usage, index) {
    if (usage.includes('primary')) return 'primary';
    if (usage.includes('secondary')) return 'secondary';
    if (usage.includes('text')) return `text-${index}`;
    if (usage.includes('background')) return `background-${index}`;
    if (usage.includes('border')) return `border-${index}`;
    return `color-${index}`;
  }

  /**
   * Generate size variable name
   */
  generateSizeVariableName(size) {
    if (size.includes('px')) {
      const value = parseInt(size);
      if (value <= 12) return 'xs';
      if (value <= 16) return 'sm';
      if (value <= 20) return 'md';
      if (value <= 24) return 'lg';
      if (value <= 32) return 'xl';
      return '2xl';
    }
    return 'custom';
  }

  /**
   * Generate component variables CSS
   */
  generateComponentVariables(components) {
    let css = '';

    components.forEach(component => {
      const className = component.selector.replace(/[.#]/g, '');
      css += `  /* ${className} component */\n`;

      Object.entries(component.styles).forEach(([property, value]) => {
        css += `  --${className}-${property}: ${value};\n`;
      });

      Object.entries(component.states).forEach(([state, styles]) => {
        Object.entries(styles).forEach(([property, value]) => {
          css += `  --${className}-${state}-${property}: ${value};\n`;
        });
      });

      css += '\n';
    });

    return css;
  }

  /**
   * Generate refinement report
   */
  generateRefinementReport(iterations) {
    return {
      summary: {
        totalIterations: iterations.length,
        finalAccuracy: iterations[iterations.length - 1]?.accuracyAfter || 0,
        totalImprovements: iterations.reduce((sum, iter) => sum + iter.improvements.length, 0),
        convergenceReason: this.getConvergenceReason(iterations)
      },
      iterations: iterations.map(iter => ({
        number: iter.number,
        accuracyBefore: iter.accuracyBefore,
        accuracyAfter: iter.accuracyAfter,
        improvements: iter.improvements.length,
        success: iter.success
      })),
      improvements: iterations.flatMap(iter => iter.improvements)
    };
  }

  /**
   * Get convergence reason
   */
  getConvergenceReason(iterations) {
    if (iterations.length === 0) return 'No iterations completed';

    const lastIteration = iterations[iterations.length - 1];
    if (lastIteration.accuracyAfter >= this.accuracyThreshold) {
      return 'Target accuracy achieved';
    }
    if (iterations.length >= this.maxIterations) {
      return 'Maximum iterations reached';
    }
    if (lastIteration.improvements.length === 0) {
      return 'No further improvements identified';
    }
    return 'Converged';
  }

  /**
   * Save refinement data to file
   */
  async saveRefinementData(result, outputPath = './style') {
    const fs = require('fs').promises;
    const path = require('path');

    const siteName = this.generateFilename(result.url);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dir = path.join(process.cwd(), outputPath, `${siteName}-${timestamp}`);

    // Create directory
    await fs.mkdir(dir, { recursive: true });

    // Save refinement data
    const refinementFile = path.join(dir, 'phase-3-refinement.json');
    await fs.writeFile(refinementFile, JSON.stringify(result, null, 2));

    // Save refined demo
    const refinedDemoFile = path.join(dir, result.data.refinedDemo.filename);
    await fs.writeFile(refinedDemoFile, result.data.refinedDemo.html);

    // Save refined style guide
    const styleGuideFile = path.join(dir, 'refined-style-guide.md');
    await fs.writeFile(styleGuideFile, result.data.styleGuide);

    // Save refined design tokens
    const tokensFile = path.join(dir, 'refined-design-tokens.css');
    await fs.writeFile(tokensFile, result.data.designTokens);

    result.savedPaths = {
      directory: dir,
      refinementFile: refinementFile,
      refinedDemoFile: refinedDemoFile,
      styleGuideFile: styleGuideFile,
      tokensFile: tokensFile
    };

    console.log(`💾 Phase 3 data saved to: ${dir}`);
  }

  /**
   * Helper methods for generating HTML sections
   */
  generateCSSFromRefinedTokens(designSystem) {
    let css = ':root {\n';

    // Add color variables
    Object.entries(designSystem.colors).forEach(([color, data], index) => {
      const name = this.generateVariableName(color, data.usage, index);
      css += `  --color-${name}: ${color};\n`;
    });

    css += '}\n\n';
    return css;
  }

  generateRefinedColorSwatches(colors) {
    let html = '';

    Object.entries(colors).forEach(([color, data]) => {
      html += `
        <div class="demo-card">
          <div style="width: 100%; height: 60px; background: ${color}; border-radius: 4px; margin-bottom: 10px;"></div>
          <p><strong>${color}</strong><br>
          <small>Usage: ${data.usage.join(', ')}</small></p>
        </div>`;
    });

    return html;
  }

  generateRefinedTypographyDemo(typographySystem) {
    if (!typographySystem || !typographySystem.hasSystem) {
      return '<p>No systematic typography found</p>';
    }

    let html = '<div class="demo-card">';

    typographySystem.fontSizes.forEach(size => {
      html += `<div style="font-size: ${size}; margin: 10px 0;">Sample text at ${size}</div>`;
    });

    html += '</div>';
    return html;
  }

  generateRefinedSpacingDemo(spacingSystem) {
    if (!spacingSystem || !spacingSystem.hasSystem) {
      return '<p>No systematic spacing found</p>';
    }

    let html = '<div class="demo-card">';

    Object.entries(spacingSystem).forEach(([name, value]) => {
      if (name !== 'hasSystem' && name !== 'baseUnit' && !name.includes('px')) {
        html += `
          <div style="margin-bottom: ${value}; border: 1px dashed #ccc; padding: 10px;">
            ${name}: ${value}
          </div>`;
      }
    });

    html += '</div>';
    return html;
  }

  generateRefinedComponentDemo(components) {
    let html = '';

    components.forEach(component => {
      html += `<div class="demo-card">
        <h4>${component.selector}</h4>`;

      // Generate component preview
      const preview = this.generateComponentPreview(component);
      html += preview;

      html += '</div>';
    });

    return html;
  }

  generateComponentPreview(component) {
    const type = this.getComponentType(component);

    const previews = {
      button: `<button style="${this.generateInlineStyles(component.styles)}">${type} Button</button>`,
      card: `<div style="${this.generateInlineStyles(component.styles)}">Card Content</div>`,
      input: `<input type="text" placeholder="${type} Input" style="${this.generateInlineStyles(component.styles)}">`,
      navigation: `<nav style="${this.generateInlineStyles(component.styles)}">
        <a href="#" style="margin-right: 20px;">Link 1</a>
        <a href="#">Link 2</a>
      </nav>`
    };

    return previews[type] || `<div style="${this.generateInlineStyles(component.styles)}">${type} Component</div>`;
  }

  getComponentType(component) {
    if (component.selector.includes('button') || component.selector.includes('btn')) return 'Button';
    if (component.selector.includes('card')) return 'Card';
    if (component.selector.includes('input')) return 'Input';
    if (component.selector.includes('nav')) return 'Navigation';
    return 'Component';
  }

  generateInlineStyles(styles) {
    return Object.entries(styles)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  }

  generateRefinedColorSection(colors) {
    let section = '### Color Palette\n\n';

    Object.entries(colors).forEach(([color, data]) => {
      section += `- **${color}** - Used for: ${data.usage.join(', ')}\n`;
    });

    return section;
  }

  generateRefinedSpacingSection(spacing) {
    if (!spacing.hasSystem) {
      return '### Spacing\n\nNo systematic spacing identified.\n';
    }

    let section = `### Spacing System\n\nBase unit: ${spacing.baseUnit}\n\n`;

    Object.entries(spacing).forEach(([name, value]) => {
      if (name !== 'hasSystem' && name !== 'baseUnit' && !name.includes('px')) {
        section += `- **${name}**: ${value}\n`;
      }
    });

    return section;
  }

  generateRefinedTypographySection(typographySystem) {
    if (!typographySystem || !typographySystem.hasSystem) {
      return '### Typography\n\nNo systematic typography identified.\n';
    }

    let section = '### Typography System\n\n';
    section += `**Font Family**: ${typographySystem.fontFamilies.join(', ')}\n\n`;

    section += '**Font Sizes**:\n';
    typographySystem.fontSizes.forEach(size => {
      section += `- ${size}\n`;
    });

    return section;
  }

  generateRefinedComponentSection(components) {
    let section = '### Component Library\n\n';

    components.forEach(component => {
      section += `#### ${component.selector}\n\n`;

      if (component.variations && component.variations.length > 0) {
        section += '**Variations**:\n';
        component.variations.forEach(variation => {
          section += `- ${variation.type}: ${variation.value}\n`;
        });
        section += '\n';
      }

      if (Object.keys(component.states).length > 0) {
        section += '**States**:\n';
        Object.keys(component.states).forEach(state => {
          section += `- ${state}\n`;
        });
        section += '\n';
      }
    });

    return section;
  }

  generateRefinementNotes(state) {
    let notes = '### Refinement Process\n\n';
    notes += `**Iterations**: ${state.improvements.length}\n`;
    notes += `**Final Accuracy**: ${(state.accuracy * 100).toFixed(1)}%\n\n`;

    if (state.improvements.length > 0) {
      notes += '**Improvements Applied**:\n';
      state.improvements.forEach((improvement, index) => {
        notes += `${index + 1}. ${improvement.description}\n`;
      });
    }

    return notes;
  }

  generateUsageGuidelines(designSystem) {
    return `### Usage Guidelines

1. **Import the CSS**: Include \`refined-design-tokens.css\` in your project
2. **Use CSS Variables**: Access design tokens using \`var(--color-primary)\` syntax
3. **Component Classes**: Use the identified selectors for consistent styling
4. **Responsive Design**: Test across different screen sizes
5. **Browser Compatibility**: Modern browsers support CSS custom properties

### Integration Tips

- Start with the color palette and spacing system
- Apply typography scale for consistent text hierarchy
- Use component variations for different use cases
- Test interactive states (hover, focus) for accessibility
`;
  }

  generateRefinedComponentCSS(components) {
    let css = '';

    components.forEach(component => {
      css += `${component.selector} {\n`;

      Object.entries(component.styles).forEach(([property, value]) => {
        css += `  ${property}: ${value};\n`;
      });

      css += '}\n\n';

      // Add state styles
      Object.entries(component.states).forEach(([state, styles]) => {
        css += `${component.selector}:${state} {\n`;
        Object.entries(styles).forEach(([property, value]) => {
          css += `  ${property}: ${value};\n`;
        });
        css += '}\n\n';
      });
    });

    return css;
  }

  /**
   * Clone design system for state management
   */
  cloneDesignSystem(data) {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Clone state for iteration management
   */
  cloneState(state) {
    return JSON.parse(JSON.stringify(state));
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

module.exports = Phase3Refinement;