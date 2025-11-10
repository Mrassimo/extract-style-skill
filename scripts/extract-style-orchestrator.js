/**
 * Extract Style Orchestrator
 * Main entry point that coordinates all extraction phases
 */

const Phase1Extraction = require('./phase-1-extraction');
const Phase2Analysis = require('./phase-2-analysis');
const Phase3Refinement = require('./phase-3-refinement');
const ValidationService = require('./validation-service');

class ExtractStyleOrchestrator {
  constructor() {
    this.phase1 = new Phase1Extraction();
    this.phase2 = new Phase2Analysis();
    this.phase3 = new Phase3Refinement();
    this.validator = new ValidationService();
  }

  /**
   * Execute complete extraction workflow
   */
  async extractDesignSystem(url, options = {}) {
    const startTime = Date.now();
    console.log(`🚀 Starting complete design system extraction for: ${url}`);

    const result = {
      url: url,
      timestamp: new Date().toISOString(),
      phases: {},
      validation: {},
      outputs: {},
      metadata: {
        totalTime: 0,
        options: options,
        version: '2.0.0'
      }
    };

    try {
      // Phase 1: Raw Extraction
      console.log('\n=== PHASE 1: RAW EXTRACTION ===');
      const phase1Options = {
        includeScreenshots: options.includeScreenshots !== false,
        screenshotOptions: options.screenshotOptions,
        saveData: options.saveData !== false,
        outputPath: options.outputPath
      };

      result.phases.phase1 = await this.phase1.execute(url, phase1Options);

      if (!result.phases.phase1.success) {
        throw new Error(`Phase 1 extraction failed: ${result.phases.phase1.error.message}`);
      }

      // Phase 2: Analysis
      console.log('\n=== PHASE 2: ANALYSIS ===');
      const phase2Options = {
        saveData: options.saveData !== false,
        outputPath: options.outputPath
      };

      result.phases.phase2 = await this.phase2.execute(result.phases.phase1, phase2Options);

      if (!result.phases.phase2.success) {
        console.warn('⚠️ Phase 2 analysis failed, continuing with basic results');
      }

      // Phase 3: Refinement (optional, based on options)
      if (options.enableRefinement && result.phases.phase2.success) {
        console.log('\n=== PHASE 3: REFINEMENT ===');
        const phase3Options = {
          interactiveMode: options.interactiveMode || false,
          saveData: options.saveData !== false,
          outputPath: options.outputPath
        };

        result.phases.phase3 = await this.phase3.execute(
          result.phases.phase2,
          options.userFeedback,
          phase3Options
        );

        if (!result.phases.phase3.success) {
          console.warn('⚠️ Phase 3 refinement failed, using Phase 2 results');
        }
      }

      // Generate comprehensive validation report
      console.log('\n=== VALIDATION & REPORTING ===');
      result.validation = this.validator.generateValidationReport(
        result.phases.phase1,
        result.phases.phase3 || result.phases.phase2
      );

      // Generate final outputs
      console.log('\n=== GENERATING OUTPUTS ===');
      result.outputs = this.generateFinalOutputs(result, options);

      // Calculate total time
      result.metadata.totalTime = Date.now() - startTime;

      // Save final results
      if (options.saveData !== false) {
        await this.saveFinalResults(result, options.outputPath);
      }

      console.log(`\n✅ Extraction completed in ${(result.metadata.totalTime / 1000).toFixed(2)}s`);
      console.log(`📊 Overall quality: ${result.validation.overall.grade} (${result.validation.overall.score}%)`);

      return result;

    } catch (error) {
      result.error = {
        message: error.message,
        stack: error.stack
      };
      result.metadata.totalTime = Date.now() - startTime;

      console.error(`❌ Extraction failed after ${(result.metadata.totalTime / 1000).toFixed(2)}s:`, error.message);
      throw error;
    }
  }

  /**
   * Execute individual phases for testing/debugging
   */
  async executePhase(phase, url, input = null, options = {}) {
    switch (phase.toLowerCase()) {
      case '1':
      case 'extraction':
        return await this.phase1.execute(url, options);

      case '2':
      case 'analysis':
        if (!input) throw new Error('Phase 2 requires Phase 1 results as input');
        return await this.phase2.execute(input, options);

      case '3':
      case 'refinement':
        if (!input) throw new Error('Phase 3 requires Phase 2 results as input');
        return await this.phase3.execute(input, options.userFeedback, options);

      default:
        throw new Error(`Unknown phase: ${phase}. Use 1, 2, 3, extraction, analysis, or refinement.`);
    }
  }

  /**
   * Generate final consolidated outputs
   */
  generateFinalOutputs(result, options) {
    const outputs = {};

    // Determine which phase to use as primary source
    const primaryPhase = result.phases.phase3 && result.phases.phase3.success ?
      result.phases.phase3 : result.phases.phase2;

    // Generate HTML demo
    outputs.demo = primaryPhase && primaryPhase.data && primaryPhase.data.htmlDemo ?
      primaryPhase.data.htmlDemo :
      this.generateFallbackDemo(result.phases.phase1, result.validation);

    // Generate style guide
    outputs.styleGuide = this.generateStyleGuide(result, primaryPhase);

    // Generate design tokens
    outputs.designTokens = this.generateDesignTokens(result, primaryPhase);

    // Generate validation summary
    outputs.validationSummary = this.validator.generateValidationSummary(result.validation);

    // Generate file manifest
    outputs.fileManifest = this.generateFileManifest(result, options);

    return outputs;
  }

  /**
   * Generate fallback demo if Phase 2/3 failed
   */
  generateFallbackDemo(phase1Result, validation) {
    const tokens = phase1Result.data.designTokens;

    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fallback Design Demo - ${validation.overall.grade}</title>
    <style>
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

        .header {
            background: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
            text-align: center;
        }

        .section {
            margin-bottom: 40px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .demo-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .color-swatch {
            width: 100%;
            height: 60px;
            border-radius: 4px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
        }

        .alert {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Limited Extraction Results</h1>
            <p>Quality: ${validation.overall.grade} (${validation.overall.score}%)</p>
            <p>Some advanced features may be missing. See validation report for details.</p>
        </div>

        <div class="alert">
            <strong>Note:</strong> This is a fallback demo due to limited extraction success.
            Consider running with refinement enabled or checking API configurations.
        </div>

        <div class="section">
            <h2>Extracted Colors (${Object.keys(tokens.colors || {}).length})</h2>
            <div class="grid">
                ${this.generateBasicColorSwatches(tokens.colors || {})}
            </div>
        </div>

        <div class="section">
            <h2>Available Information</h2>
            <div class="demo-card">
                <ul>
                    <li>Colors extracted: ${Object.keys(tokens.colors || {}).length}</li>
                    <li>Fonts identified: ${Object.keys(tokens.fonts || {}).length}</li>
                    <li>Spacing values: ${Object.keys(tokens.spacing || {}).length}</li>
                    <li>CSS Variables: ${Object.keys(tokens.cssVariables || {}).length}</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`,
      filename: 'fallback-demo.html',
      description: 'Basic design demo (limited extraction)'
    };
  }

  /**
   * Generate basic color swatches for fallback demo
   */
  generateBasicColorSwatches(colors) {
    let html = '';

    Object.entries(colors).slice(0, 12).forEach(([color, data]) => {
      html += `
        <div class="demo-card">
          <div class="color-swatch" style="background: ${color};"></div>
          <p><strong>${color}</strong><br>
          <small>${data.usage ? data.usage.join(', ') : 'unknown'}</small></p>
        </div>`;
    });

    return html;
  }

  /**
   * Generate comprehensive style guide
   */
  generateStyleGuide(result, primaryPhase) {
    let styleGuide = `# ${this.extractSiteName(result.url)} Design System

> Extracted on ${new Date().toLocaleDateString()} from [${result.url}](${result.url})
> Extraction Quality: ${result.validation.overall.grade} (${result.validation.overall.score}%)
> Processing Time: ${(result.metadata.totalTime / 1000).toFixed(2)}s

## Overview

${this.generateOverviewSection(result, primaryPhase)}

---

## Extraction Summary

**Quality Metrics:**
- Overall Score: ${result.validation.overall.score}%
- Grade: ${result.validation.overall.grade}
- Status: ${result.validation.overall.status}

**Data Extracted:**
- HTML: ${result.phases.phase1.data.html ? '✅' : '❌'}
- CSS Rules: ${this.countTotalCSS(result.phases.phase1.data.css)}
- Colors: ${Object.keys(result.phases.phase1.data.designTokens.colors || {}).length}
- Components: ${result.phases.phase2.success ? result.phases.phase2.data.components.summary.total : 0}
- Screenshots: ${result.phases.phase1.data.screenshots && !result.phases.phase1.data.screenshots.error ? '✅' : '❌'}

`;

    // Add refined content if available
    if (primaryPhase && primaryPhase.success && primaryPhase.data && primaryPhase.data.styleGuide) {
      styleGuide += primaryPhase.data.styleGuide;
    } else {
      styleGuide += this.generateBasicStyleGuide(result);
    }

    // Add validation section
    styleGuide += `---

## Validation Report

**Strengths:**
${result.validation.extraction.successes.map(s => `- ${s}`).join('\n')}

**Issues Identified:**
${result.validation.extraction.issues.map(i => `- **${i.severity}**: ${i.message}`).join('\n')}

**Recommendations:**
${result.validation.recommendations.map(r => `- **${r.priority}**: ${r.description}`).join('\n')}

---

## Usage Instructions

**Basic Usage:**
1. Include the design tokens CSS in your project
2. Use the component classes for consistent styling
3. Follow the spacing system for layouts

**Advanced Usage:**
1. Customize CSS variables for your brand
2. Extend component patterns for new use cases
3. Use the validation report to identify gaps

---

## Limitations

${result.validation.limitations.map(l => `- **${l.severity}**: ${l.description}`).join('\n')}

---

*Generated by Extract Style Skill v${result.metadata.version}*`;

    return styleGuide;
  }

  /**
   * Generate overview section
   */
  generateOverviewSection(result, primaryPhase) {
    if (primaryPhase && primaryPhase.success && primaryPhase.data && primaryPhase.data.designTokenAnalysis) {
      const analysis = primaryPhase.data.designTokenAnalysis.summary;
      return `This design system has been extracted and refined through automated analysis.

**Key Characteristics:**
- ${analysis.totalColors} colors identified
- ${analysis.totalFonts} font families found
- ${analysis.totalSpacing} spacing values detected
- ${analysis.totalComponents} component types identified

**Design System Maturity:**
${analysis.hasDesignSystem ? '✅ Comprehensive design system detected with consistent patterns and systematic approach.' : '⚠️ Limited design system - may need manual enhancement for full coverage.'}`;
    }

    return `This design system has been partially extracted through automated analysis. Some elements may require manual enhancement for complete coverage.

**Extraction Quality:** ${result.validation.overall.grade} (${result.validation.overall.score}%)

The extraction identified core design elements but may have missed styles applied via JavaScript, CSS-in-JS solutions, or dynamic theming.`;
  }

  /**
   * Generate basic style guide for fallback scenarios
   */
  generateBasicStyleGuide(result) {
    const tokens = result.phases.phase1.data.designTokens;

    let guide = `## Colors

`;

    if (Object.keys(tokens.colors || {}).length > 0) {
      guide += '| Color | Usage |\n';
      guide += '|-------|--------|\n';
      Object.entries(tokens.colors).forEach(([color, data]) => {
        const usage = data.usage ? data.usage.join(', ') : 'unknown';
        guide += `| ${color} | ${usage} |\n`;
      });
    } else {
      guide += 'No colors were successfully extracted.\n';
    }

    guide += `\n## Typography

`;

    if (Object.keys(tokens.fonts || {}).length > 0) {
      Object.entries(tokens.fonts).forEach(([key, font]) => {
        if (font.family) {
          guide += `**${key}**: ${font.family}`;
          if (font.fallbacks && font.fallbacks.length > 0) {
            guide += ` (fallbacks: ${font.fallbacks.join(', ')})`;
          }
          guide += '\n';
        }
      });
    } else {
      guide += 'No font information was successfully extracted.\n';
    }

    guide += `\n## Spacing

`;

    if (Object.keys(tokens.spacing || {}).length > 0) {
      guide += '| Value | Frequency | Property |\n';
      guide += '|-------|-----------|----------|\n';
      Object.entries(tokens.spacing).forEach(([value, data]) => {
        guide += `| ${value} | ${data.frequency} | ${data.property} |\n`;
      });
    } else {
      guide += 'No spacing system was successfully extracted.\n';
    }

    return guide;
  }

  /**
   * Generate design tokens CSS
   */
  generateDesignTokens(result, primaryPhase) {
    if (primaryPhase && primaryPhase.success && primaryPhase.data && primaryPhase.data.designTokens) {
      return {
        css: primaryPhase.data.designTokens,
        filename: 'design-tokens.css',
        description: 'CSS custom properties and component styles'
      };
    }

    // Generate basic tokens from Phase 1
    const tokens = result.phases.phase1.data.designTokens;
    let css = `/* Basic Design Tokens */
/* Generated by Extract Style - Quality: ${result.validation.overall.grade} */

:root {\n`;

    // Add colors
    if (Object.keys(tokens.colors || {}).length > 0) {
      css += `  /* Colors */\n`;
      Object.entries(tokens.colors).forEach(([color, data], index) => {
        css += `  --color-${index + 1}: ${color};\n`;
      });
    }

    // Add spacing
    if (Object.keys(tokens.spacing || {}).length > 0) {
      css += `  \n  /* Spacing */\n`;
      Object.entries(tokens.spacing).forEach(([value, data]) => {
        const name = value.replace(/\D/g, ''); // Remove non-digits
        css += `  --spacing-${name}: ${value};\n`;
      });
    }

    css += '\n}\n';

    return {
      css: css,
      filename: 'basic-design-tokens.css',
      description: 'Basic CSS custom properties'
    };
  }

  /**
   * Generate file manifest
   */
  generateFileManifest(result, options) {
    const manifest = {
      generated: [],
      saved: [],
      structure: {
        main: 'demo.html',
        documentation: 'style-guide.md',
        tokens: 'design-tokens.css'
      }
    };

    // Add generated files
    if (result.outputs.demo) {
      manifest.generated.push({
        file: result.outputs.demo.filename,
        description: result.outputs.demo.description,
        type: 'html'
      });
    }

    if (result.outputs.styleGuide) {
      manifest.generated.push({
        file: 'style-guide.md',
        description: 'Comprehensive design system documentation',
        type: 'markdown'
      });
    }

    if (result.outputs.designTokens) {
      manifest.generated.push({
        file: result.outputs.designTokens.filename,
        description: result.outputs.designTokens.description,
        type: 'css'
      });
    }

    // Add saved files from phases
    Object.values(result.phases).forEach(phase => {
      if (phase.savedPaths) {
        Object.entries(phase.savedPaths).forEach(([key, path]) => {
          if (key !== 'directory') {
            manifest.saved.push({
              file: path,
              phase: phase.phase,
              type: key
            });
          }
        });
      }
    });

    return manifest;
  }

  /**
   * Save final consolidated results
   */
  async saveFinalResults(result, outputPath = './style') {
    const fs = require('fs').promises;
    const path = require('path');

    const siteName = this.extractSiteName(result.url);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dir = path.join(process.cwd(), outputPath, `${siteName}-${timestamp}`);

    // Create directory
    await fs.mkdir(dir, { recursive: true });

    // Save main demo HTML
    if (result.outputs.demo) {
      const demoPath = path.join(dir, result.outputs.demo.filename);
      await fs.writeFile(demoPath, result.outputs.demo.html);
    }

    // Save style guide
    if (result.outputs.styleGuide) {
      const guidePath = path.join(dir, 'style-guide.md');
      await fs.writeFile(guidePath, result.outputs.styleGuide);
    }

    // Save design tokens
    if (result.outputs.designTokens) {
      const tokensPath = path.join(dir, result.outputs.designTokens.filename);
      await fs.writeFile(tokensPath, result.outputs.designTokens.css);
    }

    // Save validation report
    const validationPath = path.join(dir, 'validation-report.json');
    await fs.writeFile(validationPath, JSON.stringify(result.validation, null, 2));

    // Save complete extraction results
    const resultsPath = path.join(dir, 'complete-extraction-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(result, null, 2));

    // Save file manifest
    const manifestPath = path.join(dir, 'file-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(result.outputs.fileManifest, null, 2));

    result.finalOutputPath = dir;
    console.log(`💾 Final results saved to: ${dir}`);

    return dir;
  }

  /**
   * Helper: Count total CSS rules
   */
  countTotalCSS(cssData) {
    if (!cssData) return 0;

    let count = 0;

    if (cssData.inline) count += cssData.inline.length;
    if (cssData.styleTags) count += cssData.styleTags.length;

    if (cssData.external) {
      Object.values(cssData.external).forEach(content => {
        if (typeof content === 'string') {
          count += content.split('}').length - 1;
        }
      });
    }

    return count;
  }

  /**
   * Helper: Extract site name from URL
   */
  extractSiteName(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname
        .replace(/^www\./, '')
        .split('.')[0]
        .charAt(0)
        .toUpperCase() +
        urlObj.hostname
        .replace(/^www\./, '')
        .split('.')[0]
        .slice(1);
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Get API documentation for external services
   */
  getAPIDocumentation() {
    const screenshotService = require('./screenshot-service');
    const service = new screenshotService();
    return service.generateAPIDocumentation();
  }

  /**
   * Check system health and API availability
   */
  async checkSystemHealth() {
    const screenshotService = require('./screenshot-service');
    const service = new screenshotService();

    return {
      timestamp: new Date().toISOString(),
      apis: await service.checkServiceHealth(),
      modules: {
        phase1: !!this.phase1,
        phase2: !!this.phase2,
        phase3: !!this.phase3,
        validator: !!this.validator
      }
    };
  }
}

module.exports = ExtractStyleOrchestrator;