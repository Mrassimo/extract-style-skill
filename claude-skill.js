/**
 * Claude Code Skill Integration Entry Point
 *
 * This file provides the main interface for the Extract Style skill when used
 * within Claude Code's agent framework. It wraps the orchestrator with
 * Claude Code-specific error handling and logging.
 */

const ExtractStyleOrchestrator = require('./scripts/extract-style-orchestrator');
const path = require('path');

/**
 * Main skill function for Claude Code integration
 * @param {string} url - The website URL to extract design system from
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Extraction results with file paths and metadata
 */
module.exports = async function extractStyleSkill(url, options = {}) {
  // Validate input
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }

  // Default options optimized for Claude Code usage
  const defaultOptions = {
    saveData: true,
    outputPath: './style',
    includeScreenshots: false, // Disabled by default for Claude Code
    enableRefinement: true, // Enable AIJSON Phase 2 by default
    interactiveMode: false, // Non-interactive for Claude Code
    claudeCodeMode: true // Flag for Claude Code specific behavior
  };

  const config = { ...defaultOptions, ...options };

  // Log Claude Code specific start message
  console.log(`🎨 Extract Style Skill: Starting design system extraction for ${url}`);

  if (config.claudeCodeMode) {
    console.log('🤖 Running in Claude Code integration mode');
  }

  try {
    // Initialize orchestrator
    const orchestrator = new ExtractStyleOrchestrator();

    // Execute extraction
    const result = await orchestrator.extractDesignSystem(url, config);

    // Return Claude Code-friendly result format
    return {
      success: true,
      url: url,
      outputPath: result.finalOutputPath,
      quality: {
        score: result.validation.overall.score,
        grade: result.validation.overall.grade,
        status: result.validation.overall.status
      },
      files: {
        demo: path.join(result.finalOutputPath, result.outputs.demo?.filename || 'demo.html'),
        styleGuide: path.join(result.finalOutputPath, 'style-guide.md'),
        designTokens: path.join(result.finalOutputPath, result.outputs.designTokens?.filename || 'design-tokens.css'),
        validation: path.join(result.finalOutputPath, 'validation-report.json'),
        complete: path.join(result.finalOutputPath, 'complete-extraction-results.json')
      },
      summary: {
        totalTime: result.metadata.totalTime,
        colorsExtracted: Object.keys(result.phases.phase1.data.designTokens.colors || {}).length,
        componentsDetected: result.phases.phase2.success ? result.phases.phase2.data.components.summary.total : 0,
        phasesCompleted: Object.keys(result.phases).length,
        recommendations: result.validation.recommendations.slice(0, 3) // Top 3 recommendations
      },
      metadata: {
        version: result.metadata.version,
        timestamp: result.timestamp,
        extractionType: config.enableRefinement ? 'aijson-refined' : 'basic'
      }
    };

  } catch (error) {
    // Enhanced error reporting for Claude Code
    const errorInfo = getErrorSuggestions(error);
    const enhancedError = new Error(`Extract Style Skill failed: ${error.message}`);

    enhancedError.originalError = error;
    enhancedError.url = url;
    enhancedError.errorInfo = errorInfo;
    enhancedError.suggestions = errorInfo.suggestions;
    enhancedError.troubleshooting = errorInfo.troubleshooting;
    enhancedError.workaround = errorInfo.workaround;
    enhancedError.severity = errorInfo.severity;
    enhancedError.errorType = errorInfo.type;

    console.error('❌ Extract Style Skill Error:', enhancedError.message);
    console.error(`🔍 Error Type: ${errorInfo.type} (${errorInfo.severity} severity)`);

    if (errorInfo.suggestions.length > 0) {
      console.error('\n💡 Suggestions:');
      errorInfo.suggestions.forEach((suggestion, index) => {
        console.error(`  ${index + 1}. ${suggestion}`);
      });
    }

    if (errorInfo.workaround) {
      console.error(`\n🔄 Workaround: ${errorInfo.workaround}`);
    }

    throw enhancedError;
  }
};

/**
 * Get actionable error suggestions based on error type
 * @param {Error} error - The original error
 * @returns {Object} Enhanced error information with suggestions
 */
function getErrorSuggestions(error) {
  const message = error.message.toLowerCase();
  const errorInfo = {
    type: 'unknown',
    severity: 'medium',
    suggestions: [],
    troubleshooting: [],
    workaround: null
  };

  // Network/URL errors
  if (message.includes('enotfound') || message.includes('network') || message.includes('getaddrinfo')) {
    errorInfo.type = 'network_error';
    errorInfo.severity = 'high';
    errorInfo.suggestions = [
      '🔍 Verify the URL spelling and format (include https://)',
      '🌐 Check if the website is currently online',
      '🔧 Try accessing the URL in your browser first',
      '🚫 Ensure the website is not behind a firewall or VPN restriction'
    ];
    errorInfo.troubleshooting = [
      'Test with: curl -I https://example.com',
      'Check DNS resolution: nslookup example.com',
      'Try with www. prefix or without it',
      'Verify no typos in the domain name'
    ];
    errorInfo.workaround = 'Try a different URL from the same website or a similar public website';
  }

  // Timeout errors
  else if (message.includes('timeout') || message.includes('etimeout')) {
    errorInfo.type = 'timeout_error';
    errorInfo.severity = 'medium';
    errorInfo.suggestions = [
      '⏱️ The website is responding slowly - try again later',
      '🏃‍♂️ Consider extracting from a simpler/faster page',
      '🔧 Reduce timeout settings in configuration if needed',
      '📊 Try during off-peak hours for the target website'
    ];
    errorInfo.troubleshooting = [
      'Check site performance at tools.pingdom.com',
      'Try with a specific page instead of the homepage',
      'Disable screenshot capture to reduce processing time',
      'Use includeScreenshots: false in options'
    ];
    errorInfo.workaround = 'Extract from a cached version or simpler page on the same site';
  }

  // CORS/Blocked access errors
  else if (message.includes('cors') || message.includes('blocked') || message.includes('403')) {
    errorInfo.type = 'access_blocked';
    errorInfo.severity = 'medium';
    errorInfo.suggestions = [
      '🚫 Some sites block external stylesheet access - this is normal',
      '✅ Enable refinement mode to fill gaps: enableRefinement: true',
      '🔄 Try using a different website with similar styling',
      '🎨 Focus on inline styles and style tags which are usually accessible'
    ];
    errorInfo.troubleshooting = [
      'Check if site has a public CSS CDN alternative',
      'Try the mobile version of the site (m.example.com)',
      'Look for publicly available style guides or design systems',
      'Use browser developer tools to manually inspect styles'
    ];
    errorInfo.workaround = 'The extraction will still work with available CSS, but may be incomplete';
  }

  // API key errors
  else if (message.includes('api key') || message.includes('unauthorized')) {
    errorInfo.type = 'api_error';
    errorInfo.severity = 'low';
    errorInfo.suggestions = [
      '🔑 Configure screenshot API keys in config/api-keys.json',
      '📧 Obtain free API keys from screenshotone.com or htmlcsstoimage.com',
      '🚫 Or disable screenshots with includeScreenshots: false',
      '💡 Screenshots are optional - the extraction works without them'
    ];
    errorInfo.troubleshooting = [
      'Set environment variables: SCREENSHOTONE_API_KEY=your_key',
      'Create config/api-keys.json following the example file',
      'Test API key validity with service documentation',
      'Check for typos in the API key'
    ];
    errorInfo.workaround = 'Run without screenshots: includeScreenshots: false';
  }

  // CSS parsing errors
  else if (message.includes('css') || message.includes('parse')) {
    errorInfo.type = 'css_parsing_error';
    errorInfo.severity = 'low';
    errorInfo.suggestions = [
      '🔧 CSS parser fell back to regex mode - extraction continues',
      '🎯 Some complex CSS features may not be captured',
      '✅ Enable refinement mode to improve results',
      '📊 Check validation report for specific parsing issues'
    ];
    errorInfo.troubleshooting = [
      'This is often due to modern CSS features like nesting',
      'The skill will still extract basic design tokens',
      'Review the output files for what was successfully parsed',
      'Consider manually adding missing design tokens'
    ];
    errorInfo.workaround = 'Results will be available but may need manual enhancement';
  }

  // File system/permission errors
  else if (message.includes('eacces') || message.includes('permission') || message.includes('enoent')) {
    errorInfo.type = 'file_system_error';
    errorInfo.severity = 'high';
    errorInfo.suggestions = [
      '📁 Check write permissions in the output directory',
      '🔧 Ensure the output path exists and is accessible',
      '🏠 Try running from a different directory',
      '💾 Use absolute path for output directory'
    ];
    errorInfo.troubleshooting = [
      'Run: mkdir -p ./style to create output directory',
      'Check disk space availability',
      'Try with a different output path: outputPath: "./temp"',
      'Run as administrator if necessary (not recommended)'
    ];
    errorInfo.workaround = 'Use a different output directory like outputPath: "./extracted-styles"';
  }

  // Validation/quality errors
  else if (message.includes('validation') || message.includes('quality')) {
    errorInfo.type = 'quality_error';
    errorInfo.severity = 'low';
    errorInfo.suggestions = [
      '📊 Check the validation report for specific quality issues',
      '🔧 Enable refinement mode to improve extraction quality',
      '🎨 Review the generated files to see what was captured',
      '💡 Manual enhancement may be needed for complete coverage'
    ];
    errorInfo.troubleshooting = [
      'Open style-guide.md for quality assessment details',
      'Check demo.html to visualize extracted elements',
      'Review validation-report.json for specific gaps',
      'Try extracting from a simpler page on the same site'
    ];
    errorInfo.workaround = 'Partial extraction completed - review and enhance as needed';
  }

  // Default/unknown errors
  if (errorInfo.suggestions.length === 0) {
    errorInfo.type = 'unknown_error';
    errorInfo.suggestions = [
      '🔍 Check the URL format and try again',
      '🌐 Ensure the website is publicly accessible',
      '🔧 Try with a simpler, well-known website first',
      '📝 Review the exact error message for clues'
    ];
    errorInfo.troubleshooting = [
      'Test with: https://example.com (known working site)',
      'Check network connectivity',
      'Verify Node.js version compatibility',
      'Review skill installation and dependencies'
    ];
    errorInfo.workaround = 'Start with a basic extraction to isolate the issue';
  }

  return errorInfo;
}

/**
 * Health check function for Claude Code to verify skill readiness
 * @returns {Promise<Object>} Health status and capabilities
 */
module.exports.healthCheck = async function() {
  try {
    const orchestrator = new ExtractStyleOrchestrator();
    const health = await orchestrator.checkSystemHealth();

    return {
      status: 'healthy',
      skill: 'extract-style',
      version: '2.1.0',
      capabilities: {
        extraction: true,
        analysis: true,
        refinement: true,
        screenshots: health.apis.screenshotone.available || health.apis.hcti.available,
        validation: true
      },
      apis: {
        available: Object.values(health.apis).filter(api => api.available).length,
        total: Object.keys(health.apis).length,
        details: health.apis
      },
      recommendations: health.apis.screenshotone.available || health.apis.hcti.available
        ? []
        : ['Configure screenshot API keys for visual references']
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      skill: 'extract-style',
      error: error.message,
      recommendations: ['Check skill installation and dependencies']
    };
  }
};

/**
 * Get example usage for documentation
 * @returns {Object} Usage examples
 */
module.exports.getUsageExamples = function() {
  return {
    basic: {
      description: 'Extract design system with default settings',
      code: 'const result = await extractStyle("https://example.com");'
    },
    advanced: {
      description: 'Extract with screenshots and custom output path',
      code: 'const result = await extractStyle("https://example.com", {\n  includeScreenshots: true,\n  outputPath: "./my-design-system",\n  enableRefinement: true\n});'
    },
    quick: {
      description: 'Quick extraction without refinement',
      code: 'const result = await extractStyle("https://example.com", {\n  enableRefinement: false,\n  includeScreenshots: false\n});'
    }
  };
};