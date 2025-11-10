/**
 * Validation and Gap Reporting Service
 * Analyzes extraction results and reports quality, completeness, and limitations
 */

class ValidationService {
  constructor() {
    this.qualityThresholds = {
      minimumColors: 5,
      minimumSpacing: 5,
      minimumComponents: 3,
      minimumTypographyWeights: 3,
      minimumFontSizes: 4
    };

    this.criticalIssues = [
      'no_color_system',
      'no_spacing_system',
      'no_typography_scale',
      'no_components_found',
      'css_extraction_failed',
      'screenshot_failed'
    ];
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport(phase1Result, phase2Result = null) {
    const report = {
      url: phase1Result.url,
      timestamp: new Date().toISOString(),
      overall: {
        score: 0,
        grade: 'F',
        status: 'unknown'
      },
      extraction: this.validateExtraction(phase1Result),
      designSystem: this.validateDesignSystem(phase2Result),
      completeness: this.assessCompleteness(phase1Result, phase2Result),
      quality: this.assessQuality(phase1Result, phase2Result),
      limitations: this.identifyLimitations(phase1Result, phase2Result),
      recommendations: this.generateRecommendations(phase1Result, phase2Result),
      gaps: this.identifyGaps(phase1Result, phase2Result)
    };

    // Calculate overall score and grade
    this.calculateOverallScore(report);

    return report;
  }

  /**
   * Validate extraction phase
   */
  validateExtraction(phase1Result) {
    const validation = {
      status: 'success',
      issues: [],
      successes: []
    };

    // Check HTML extraction
    if (phase1Result.data.html && phase1Result.data.html.length > 0) {
      validation.successes.push('HTML extracted successfully');
    } else {
      validation.issues.push({
        type: 'html_extraction_failed',
        severity: 'critical',
        message: 'Failed to extract HTML content'
      });
      validation.status = 'failed';
    }

    // Check CSS extraction
    const cssData = phase1Result.data.css;
    if (cssData) {
      const totalCSS = this.countTotalCSS(cssData);
      if (totalCSS > 0) {
        validation.successes.push(`Extracted ${totalCSS} CSS rules`);
      } else {
        validation.issues.push({
          type: 'css_extraction_failed',
          severity: 'critical',
          message: 'No CSS content extracted'
        });
        validation.status = 'warning';
      }

      // Check external stylesheet fetching
      const externalSheets = Object.keys(cssData.external || {}).length;
      const failedSheets = Object.entries(cssData.external || {})
        .filter(([url, content]) => typeof content === 'object' && content.error)
        .length;

      if (externalSheets > 0) {
        if (failedSheets === 0) {
          validation.successes.push(`All ${externalSheets} external stylesheets fetched successfully`);
        } else {
          validation.issues.push({
            type: 'external_stylesheets_failed',
            severity: 'warning',
            message: `${failedSheets} of ${externalSheets} external stylesheets failed to load`,
            details: {
              total: externalSheets,
              failed: failedSheets
            }
          });
        }
      }
    }

    // Check screenshot capture
    if (phase1Result.data.screenshots) {
      if (phase1Result.data.screenshots.error) {
        validation.issues.push({
          type: 'screenshot_failed',
          severity: 'info',
          message: `Screenshot capture failed: ${phase1Result.data.screenshots.error}`
        });
      } else {
        validation.successes.push('Screenshot captured successfully');
      }
    }

    // Check design token extraction
    if (phase1Result.data.designTokens) {
      const tokens = phase1Result.data.designTokens;
      const tokenCounts = {
        colors: Object.keys(tokens.colors || {}).length,
        fonts: Object.keys(tokens.fonts || {}).length,
        spacing: Object.keys(tokens.spacing || {}).length,
        shadows: Object.keys(tokens.shadows || {}).length,
        components: Object.keys(tokens.components || {}).length
      };

      validation.designTokenCounts = tokenCounts;
      validation.successes.push(`Extracted ${Object.values(tokenCounts).reduce((a, b) => a + b, 0)} design tokens`);
    }

    return validation;
  }

  /**
   * Validate design system analysis
   */
  validateDesignSystem(phase2Result) {
    if (!phase2Result) {
      return {
        status: 'not_analyzed',
        issues: [{
          type: 'no_analysis_phase',
          severity: 'info',
          message: 'Phase 2 analysis was not performed'
        }]
      };
    }

    const validation = {
      status: 'success',
      issues: [],
      successes: [],
      systems: {}
    };

    const analysis = phase2Result.data.designTokenAnalysis;

    // Validate color system
    const colorValidation = this.validateColorSystem(analysis.colors);
    validation.systems.colors = colorValidation;
    if (colorValidation.hasSystem) {
      validation.successes.push('Consistent color system detected');
    } else {
      validation.issues.push({
        type: 'no_color_system',
        severity: 'warning',
        message: 'No systematic color palette identified'
      });
    }

    // Validate spacing system
    const spacingValidation = this.validateSpacingSystem(analysis.spacing);
    validation.systems.spacing = spacingValidation;
    if (spacingValidation.hasSystem) {
      validation.successes.push('Consistent spacing system detected');
    } else {
      validation.issues.push({
        type: 'no_spacing_system',
        severity: 'warning',
        message: 'No systematic spacing scale identified'
      });
    }

    // Validate typography system
    const typographyValidation = this.validateTypographySystem(analysis.fonts);
    validation.systems.typography = typographyValidation;
    if (typographyValidation.hasSystem) {
      validation.successes.push('Systematic typography detected');
    } else {
      validation.issues.push({
        type: 'no_typography_scale',
        severity: 'warning',
        message: 'No systematic typography scale identified'
      });
    }

    // Validate components
    const componentValidation = this.validateComponents(phase2Result.data.components);
    validation.systems.components = componentValidation;
    if (componentValidation.hasSystem) {
      validation.successes.push(`${componentValidation.totalFound} component types detected`);
    } else {
      validation.issues.push({
        type: 'no_components_found',
        severity: 'warning',
        message: 'No reusable components identified'
      });
    }

    // Check for overall design system
    if (analysis.summary.hasDesignSystem) {
      validation.successes.push('Comprehensive design system identified');
      validation.status = 'success';
    } else {
      validation.status = 'partial';
    }

    return validation;
  }

  /**
   * Validate color system
   */
  validateColorSystem(colorAnalysis) {
    const hasSystem = (
      colorAnalysis.total >= this.qualityThresholds.minimumColors &&
      colorAnalysis.categories.primary.length > 0 &&
      colorAnalysis.categories.neutral.length > 0
    );

    return {
      hasSystem,
      totalColors: colorAnalysis.total,
      primaryColors: colorAnalysis.categories.primary.length,
      neutralColors: colorAnalysis.categories.neutral.length,
      semanticColors: colorAnalysis.categories.semantic.length,
      formats: colorAnalysis.formats,
      score: this.calculateColorSystemScore(colorAnalysis)
    };
  }

  /**
   * Validate spacing system
   */
  validateSpacingSystem(spacingAnalysis) {
    const hasSystem = (
      spacingAnalysis.hasSystem &&
      spacingAnalysis.total >= this.qualityThresholds.minimumSpacing
    );

    return {
      hasSystem,
      totalValues: spacingAnalysis.total,
      baseUnit: spacingAnalysis.baseUnit,
      isConsistent: spacingAnalysis.hasSystem,
      score: hasSystem ? 80 : 40
    };
  }

  /**
   * Validate typography system
   */
  validateTypographySystem(fontAnalysis) {
    const hasSystem = (
      fontAnalysis.hasTypographyScale &&
      fontAnalysis.fontSizes.size >= this.qualityThresholds.minimumFontSizes &&
      fontAnalysis.fontWeights.size >= this.qualityThresholds.minimumTypographyWeights
    );

    return {
      hasSystem,
      hasScale: fontAnalysis.hasTypographyScale,
      fontFamilies: fontAnalysis.families.length,
      fontSizes: fontAnalysis.fontSizes.size,
      fontWeights: fontAnalysis.fontWeights.size,
      score: this.calculateTypographyScore(fontAnalysis)
    };
  }

  /**
   * Validate components
   */
  validateComponents(components) {
    const totalFound = components.summary.total;
    const hasSystem = totalFound >= this.qualityThresholds.minimumComponents;

    return {
      hasSystem,
      totalFound,
      buttons: components.summary.buttons,
      cards: components.summary.cards,
      inputs: components.summary.inputs,
      navigation: components.summary.navigation,
      modals: components.summary.modals,
      dropdowns: components.summary.dropdowns,
      score: Math.min(100, totalFound * 20)
    };
  }

  /**
   * Assess completeness of extraction
   */
  assessCompleteness(phase1Result, phase2Result) {
    const completeness = {
      overall: 0,
      categories: {},
      missing: []
    };

    // HTML completeness
    completeness.categories.html = phase1Result.data.html ? 100 : 0;
    if (completeness.categories.html === 0) {
      completeness.missing.push('HTML content');
    }

    // CSS completeness
    const cssData = phase1Result.data.css;
    if (cssData) {
      const totalCSS = this.countTotalCSS(cssData);
      completeness.categories.css = totalCSS > 0 ? 100 : 0;
      if (totalCSS === 0) {
        completeness.missing.push('CSS styles');
      }
    } else {
      completeness.categories.css = 0;
      completeness.missing.push('CSS styles');
    }

    // Visual references
    completeness.categories.visual = phase1Result.data.screenshots && !phase1Result.data.screenshots.error ? 100 : 50;
    if (completeness.categories.visual === 50) {
      completeness.missing.push('Screenshots (optional)');
    }

    // Design system analysis
    if (phase2Result) {
      completeness.categories.analysis = 100;
      completeness.categories.designSystem = phase2Result.data.designTokenAnalysis.summary.hasDesignSystem ? 100 : 60;
    } else {
      completeness.categories.analysis = 0;
      completeness.categories.designSystem = 0;
      completeness.missing.push('Design system analysis');
    }

    // Calculate overall completeness
    const scores = Object.values(completeness.categories);
    completeness.overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return completeness;
  }

  /**
   * Assess quality of extracted data
   */
  assessQuality(phase1Result, phase2Result) {
    const quality = {
      overall: 0,
      categories: {}
    };

    // CSS quality (based on structure and organization)
    quality.categories.css = this.assessCSSQuality(phase1Result.data.css);

    // Design token quality
    if (phase2Result) {
      quality.categories.designTokens = this.assessDesignTokenQuality(phase2Result.data.designTokenAnalysis);
      quality.categories.components = this.assessComponentQuality(phase2Result.data.components);
    } else {
      quality.categories.designTokens = 0;
      quality.categories.components = 0;
    }

    // Calculate overall quality
    const scores = Object.values(quality.categories);
    quality.overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return quality;
  }

  /**
   * Assess CSS quality
   */
  assessCSSQuality(cssData) {
    if (!cssData) return 0;

    let score = 0;
    const maxScore = 100;

    // Has CSS content (30 points)
    const totalCSS = this.countTotalCSS(cssData);
    if (totalCSS > 0) {
      score += 30;
    }

    // Has external stylesheets (20 points)
    if (cssData.external && Object.keys(cssData.external).length > 0) {
      score += 20;
    }

    // Has style tags (20 points)
    if (cssData.styleTags && cssData.styleTags.length > 0) {
      score += 20;
    }

    // Has inline styles (10 points)
    if (cssData.inline && cssData.inline.length > 0) {
      score += 10;
    }

    // CSS volume (20 points)
    if (totalCSS > 1000) {
      score += 20;
    } else if (totalCSS > 500) {
      score += 15;
    } else if (totalCSS > 100) {
      score += 10;
    }

    return Math.min(score, maxScore);
  }

  /**
   * Assess design token quality
   */
  assessDesignTokenQuality(analysis) {
    if (!analysis) return 0;

    let score = 0;

    // Color system quality
    score += analysis.colors.total > 0 ? Math.min(analysis.colors.total * 5, 30) : 0;

    // Spacing system quality
    score += analysis.spacing.hasSystem ? 25 : 5;

    // Typography system quality
    score += analysis.fonts.hasTypographyScale ? 25 : 5;

    // CSS variables (indicates good organization)
    score += analysis.cssVariables.total > 0 ? 20 : 0;

    return Math.min(score, 100);
  }

  /**
   * Assess component quality
   */
  assessComponentQuality(components) {
    if (!components) return 0;

    const totalComponents = components.summary.total;
    let score = 0;

    // Number of components (40 points)
    score += Math.min(totalComponents * 10, 40);

    // Variety of component types (30 points)
    const componentTypes = Object.entries(components.summary)
      .filter(([key, value]) => key !== 'total' && value > 0)
      .length;
    score += componentTypes * 7.5;

    // Component states (30 points)
    let componentsWithStates = 0;
    components.all.forEach(component => {
      if (Object.keys(component.states).length > 0) {
        componentsWithStates++;
      }
    });

    if (totalComponents > 0) {
      score += (componentsWithStates / totalComponents) * 30;
    }

    return Math.min(score, 100);
  }

  /**
   * Identify limitations of the extraction
   */
  identifyLimitations(phase1Result, phase2Result) {
    const limitations = [
      {
        type: 'javascript_rendered',
        severity: 'high',
        description: 'Cannot extract styles applied via JavaScript frameworks (React, Vue, etc.)',
        impact: 'Missing dynamically generated styles and component states'
      },
      {
        type: 'computed_styles',
        severity: 'high',
        description: 'Cannot access computed CSS values from browser rendering',
        impact: 'Missing final rendered styles, inherited values, and browser defaults'
      },
      {
        type: 'cors_restrictions',
        severity: 'medium',
        description: 'External stylesheets may be blocked by CORS policies',
        impact: 'Incomplete CSS extraction from external domains'
      },
      {
        type: 'media_queries',
        severity: 'medium',
        description: 'Media query context is lost during extraction',
        impact: 'Missing responsive design patterns and breakpoint-specific styles'
      },
      {
        type: 'pseudo_elements',
        severity: 'low',
        description: 'Cannot extract pseudo-element styles (::before, ::after)',
        impact: 'Missing decorative elements and content generated via CSS'
      },
      {
        type: 'custom_properties_js',
        severity: 'medium',
        description: 'Cannot detect CSS custom properties set via JavaScript',
        impact: 'Missing dynamic theme variables and runtime style changes'
      }
    ];

    // Add specific limitations based on extraction results
    if (phase1Result.data.css) {
      const failedExternal = Object.entries(phase1Result.data.css.external || {})
        .filter(([url, content]) => typeof content === 'object' && content.error)
        .length;

      if (failedExternal > 0) {
        limitations.push({
          type: 'external_stylesheets_failed',
          severity: 'medium',
          description: `${failedExternal} external stylesheets failed to load`,
          impact: 'Missing styles from external domains, incomplete design system'
        });
      }
    }

    return limitations;
  }

  /**
   * Generate recommendations for improvement
   */
  generateRecommendations(phase1Result, phase2Result) {
    const recommendations = [];

    // Basic recommendations
    if (!phase1Result.data.html) {
      recommendations.push({
        priority: 'critical',
        action: 'verify_url_accessibility',
        description: 'Verify the target URL is accessible and not blocking crawlers',
        details: 'Some websites may block automated access. Try adding user-agent headers or checking robots.txt.'
      });
    }

    if (!phase1Result.data.screenshots || phase1Result.data.screenshots.error) {
      recommendations.push({
        priority: 'medium',
        action: 'configure_screenshot_api',
        description: 'Configure screenshot API for visual reference',
        details: 'Set up SCREENSHOTONE_API_KEY or HCTI_API_KEY environment variables for better visual documentation.'
      });
    }

    if (phase2Result) {
      const analysis = phase2Result.data.designTokenAnalysis;

      if (!analysis.summary.hasDesignSystem) {
        recommendations.push({
          priority: 'high',
          action: 'manual_enhancement',
          description: 'This site may need manual enhancement for accurate extraction',
          details: 'Consider using browser developer tools to inspect computed styles and manually supplement the extraction.'
        });
      }

      if (analysis.colors.total < this.qualityThresholds.minimumColors) {
        recommendations.push({
          priority: 'medium',
          action: 'check_color_extraction',
          description: 'Limited color palette detected - verify extraction completeness',
          details: 'Colors might be defined via JavaScript or in inaccessible stylesheets.'
        });
      }

      if (!analysis.spacing.hasSystem) {
        recommendations.push({
          priority: 'medium',
          action: 'manual_spacing_analysis',
          description: 'No systematic spacing found - manually analyze spacing patterns',
          details: 'Spacing might be applied through utility classes or JavaScript.'
        });
      }
    } else {
      recommendations.push({
        priority: 'high',
        action: 'run_phase_2_analysis',
        description: 'Run Phase 2 analysis for design system identification',
        details: 'Phase 2 provides component detection and design system analysis.'
      });
    }

    return recommendations;
  }

  /**
   * Identify gaps in the extraction
   */
  identifyGaps(phase1Result, phase2Result) {
    const gaps = {
      missing: [],
      incomplete: [],
      potentiallyMissing: []
    };

    // Check for missing expected elements
    if (!phase1Result.data.css || this.countTotalCSS(phase1Result.data.css) === 0) {
      gaps.missing.push('css_styles');
    }

    if (!phase1Result.data.screenshots || phase1Result.data.screenshots.error) {
      gaps.missing.push('visual_reference');
    }

    // Check for incomplete data
    if (phase1Result.data.css) {
      const failedExternal = Object.entries(phase1Result.data.css.external || {})
        .filter(([url, content]) => typeof content === 'object' && content.error)
        .length;

      if (failedExternal > 0) {
        gaps.incomplete.push('external_stylesheets');
      }
    }

    // Potentially missing items (hard to detect)
    gaps.potentiallyMissing = [
      'javascript_applied_styles',
      'computed_styles',
      'media_query_context',
      'pseudo_element_styles',
      'dynamic_theme_variables'
    ];

    return gaps;
  }

  /**
   * Calculate color system score
   */
  calculateColorSystemScore(colorAnalysis) {
    let score = 0;

    // Base score for having colors
    score += Math.min(colorAnalysis.total * 5, 40);

    // Bonus for primary colors
    score += colorAnalysis.categories.primary.length * 10;

    // Bonus for semantic colors
    score += colorAnalysis.categories.semantic.length * 5;

    // Bonus for multiple formats (indicates comprehensive extraction)
    const formatCount = Object.values(colorAnalysis.formats).filter(count => count > 0).length;
    score += formatCount * 5;

    return Math.min(score, 100);
  }

  /**
   * Calculate typography score
   */
  calculateTypographyScore(fontAnalysis) {
    let score = 0;

    // Base score for having fonts
    score += fontAnalysis.families.length * 10;

    // Bonus for typography scale
    if (fontAnalysis.hasTypographyScale) {
      score += 30;
      score += Math.min(fontAnalysis.fontSizes.size * 5, 20);
      score += Math.min(fontAnalysis.fontWeights.size * 5, 20);
    }

    return Math.min(score, 100);
  }

  /**
   * Count total CSS rules
   */
  countTotalCSS(cssData) {
    if (!cssData) return 0;

    let count = 0;

    if (cssData.inline) count += cssData.inline.length;
    if (cssData.styleTags) count += cssData.styleTags.length;

    if (cssData.external) {
      Object.values(cssData.external).forEach(content => {
        if (typeof content === 'string') {
          // Rough estimate of CSS rules
          const rules = content.split('}').length - 1;
          count += rules;
        }
      });
    }

    return count;
  }

  /**
   * Calculate overall score and grade
   */
  calculateOverallScore(report) {
    // Weight the different aspects
    const weights = {
      extraction: 0.3,
      completeness: 0.25,
      quality: 0.25,
      designSystem: 0.2
    };

    let overallScore = 0;

    // Extraction score
    if (report.extraction.status === 'success') {
      overallScore += weights.extraction * 100;
    } else if (report.extraction.status === 'warning') {
      overallScore += weights.extraction * 70;
    } else {
      overallScore += weights.extraction * 30;
    }

    // Completeness score
    overallScore += weights.completeness * report.completeness.overall;

    // Quality score
    overallScore += weights.quality * report.quality.overall;

    // Design system score
    if (report.designSystem.status === 'success') {
      overallScore += weights.designSystem * 100;
    } else if (report.designSystem.status === 'partial') {
      overallScore += weights.designSystem * 70;
    } else {
      overallScore += weights.designSystem * 40;
    }

    report.overall.score = Math.round(overallScore);
    report.overall.grade = this.scoreToGrade(report.overall.score);
    report.overall.status = this.scoreToStatus(report.overall.score);
  }

  /**
   * Convert numeric score to letter grade
   */
  scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Convert numeric score to status
   */
  scoreToStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Generate human-readable validation summary
   */
  generateValidationSummary(validationReport) {
    const summary = {
      grade: validationReport.overall.grade,
      score: validationReport.overall.score,
      status: validationReport.overall.status,
      highlights: [],
      issues: [],
      recommendations: []
    };

    // Add highlights
    if (validationReport.extraction.successes.length > 0) {
      summary.highlights.push(...validationReport.extraction.successes);
    }

    if (validationReport.designSystem.successes.length > 0) {
      summary.highlights.push(...validationReport.designSystem.successes);
    }

    // Add critical issues
    summary.issues = validationReport.extraction.issues
      .concat(validationReport.designSystem.issues)
      .filter(issue => issue.severity === 'critical' || issue.severity === 'warning');

    // Add top recommendations
    summary.recommendations = validationReport.recommendations
      .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
      .slice(0, 3);

    return summary;
  }
}

module.exports = ValidationService;