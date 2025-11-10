/**
 * Configuration Manager
 * Handles loading, validating, and managing configuration settings
 */

const fs = require('fs').promises;
const path = require('path');

class ConfigManager {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(__dirname, '../config/extraction-config.json');
    this.config = null;
    this.defaultConfig = this.getDefaultConfig();
    this.loadConfig();
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      version: "2.1.0",
      extraction: {
        timeout: 30000,
        maxRetries: 3,
        retryDelay: 1000
      },
      refinement: {
        maxIterations: 3,
        accuracyThreshold: 0.85,
        improvementThreshold: 0.05,
        enableByDefault: true
      },
      screenshot: {
        timeout: 30000,
        delay: 2000,
        width: 1200,
        height: 800,
        deviceScaleFactor: 2,
        format: "png",
        quality: 90
      },
      validation: {
        colorSystem: {
          minimumColors: 3,
          maximumColors: 20,
          requiresPrimary: true,
          requiresSecondary: true,
          requiresNeutral: true
        },
        typography: {
          minimumFonts: 1,
          minimumFontSizes: 3,
          minimumFontWeights: 2,
          requiresSystemFonts: true
        },
        spacing: {
          minimumValues: 3,
          consistencyThreshold: 0.7,
          prefersBase8: true,
          allowsRem: true,
          allowsEm: true
        },
        components: {
          minimumConfidence: 0.6,
          requiresStates: false,
          minimumTypes: 2
        }
      },
      parsing: {
        css: {
          useASTFallback: true,
          enableVariableResolution: true,
          handleNestedCSS: false,
          maxFileSize: 1048576,
          enableSourceMaps: false
        },
        html: {
          maxDepth: 50,
          ignoreComments: true,
          preserveWhitespace: false,
          minifyOutput: true
        }
      },
      output: {
        defaultPath: "./style",
        filenameTemplate: "{site}-{date}",
        dateFormat: "YYYY-MM-DD",
        compression: {
          enabled: false,
          level: 6
        },
        formats: {
          html: true,
          css: true,
          markdown: true,
          json: true
        }
      },
      performance: {
        maxConcurrentRequests: 5,
        requestTimeout: 15000,
        enableCaching: true,
        cacheExpiry: 3600000,
        maxMemoryUsage: 512
      },
      security: {
        allowExternalResources: true,
        validateURLs: true,
        allowedProtocols: ["http", "https"],
        blockedDomains: [],
        userAgent: "Extract-Style-Skill/2.1.0"
      },
      api: {
        rateLimit: {
          enabled: true,
          maxRequestsPerMinute: 60,
          maxBurst: 10
        },
        keys: {
          screenshotone: {
            required: false,
            envVar: "SCREENSHOTONE_API_KEY"
          },
          hcti: {
            required: false,
            envVar: "HCTI_API_KEY"
          }
        }
      },
      logging: {
        level: "info",
        enableConsole: true,
        enableFile: false,
        logPath: "./logs",
        maxLogSize: 10485760,
        maxLogFiles: 5
      }
    };
  }

  /**
   * Load configuration from file
   */
  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const userConfig = JSON.parse(configData);

      // Merge with defaults, allowing user config to override
      this.config = this.mergeConfigs(this.defaultConfig, userConfig);

      console.log(`✅ Configuration loaded from ${this.configPath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️ Configuration file not found, using defaults');
        this.config = { ...this.defaultConfig };
      } else {
        console.error('❌ Error loading configuration:', error.message);
        this.config = { ...this.defaultConfig };
      }
    }
  }

  /**
   * Deep merge configurations
   */
  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };

    for (const key in userConfig) {
      if (userConfig.hasOwnProperty(key)) {
        if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key]) && userConfig[key] !== null) {
          merged[key] = this.mergeConfigs(defaultConfig[key] || {}, userConfig[key]);
        } else {
          merged[key] = userConfig[key];
        }
      }
    }

    return merged;
  }

  /**
   * Get a configuration value by path
   */
  get(path, defaultValue = null) {
    if (!this.config) {
      return defaultValue;
    }

    const keys = path.split('.');
    let current = this.config;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  }

  /**
   * Set a configuration value by path
   */
  set(path, value) {
    if (!this.config) {
      this.config = { ...this.defaultConfig };
    }

    const keys = path.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get refinement configuration
   */
  getRefinementConfig() {
    return this.get('refinement', {});
  }

  /**
   * Get screenshot configuration
   */
  getScreenshotConfig() {
    return this.get('screenshot', {});
  }

  /**
   * Get validation configuration
   */
  getValidationConfig() {
    return this.get('validation', {});
  }

  /**
   * Get parsing configuration
   */
  getParsingConfig() {
    return this.get('parsing', {});
  }

  /**
   * Get output configuration
   */
  getOutputConfig() {
    return this.get('output', {});
  }

  /**
   * Get performance configuration
   */
  getPerformanceConfig() {
    return this.get('performance', {});
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return this.get('security', {});
  }

  /**
   * Get API configuration
   */
  getAPIConfig() {
    return this.get('api', {});
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig() {
    return this.get('logging', {});
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featurePath) {
    return this.get(featurePath, false);
  }

  /**
   * Get API key from environment variables
   */
  getAPIKey(serviceName) {
    const apiConfig = this.getAPIConfig();
    const serviceConfig = apiConfig.keys[serviceName];

    if (!serviceConfig) {
      return null;
    }

    return process.env[serviceConfig.envVar] || null;
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // Validate required fields
    if (!this.config) {
      errors.push('Configuration is not loaded');
      return { valid: false, errors, warnings };
    }

    // Validate refinement settings
    const refinementConfig = this.getRefinementConfig();
    if (refinementConfig.maxIterations < 1 || refinementConfig.maxIterations > 10) {
      warnings.push('maxIterations should be between 1 and 10');
    }

    if (refinementConfig.accuracyThreshold < 0 || refinementConfig.accuracyThreshold > 1) {
      warnings.push('accuracyThreshold should be between 0 and 1');
    }

    // Validate screenshot settings
    const screenshotConfig = this.getScreenshotConfig();
    if (screenshotConfig.width < 100 || screenshotConfig.width > 4000) {
      warnings.push('Screenshot width should be between 100 and 4000 pixels');
    }

    if (screenshotConfig.height < 100 || screenshotConfig.height > 4000) {
      warnings.push('Screenshot height should be between 100 and 4000 pixels');
    }

    // Validate output settings
    const outputConfig = this.getOutputConfig();
    if (!outputConfig.filenameTemplate.includes('{site}') || !outputConfig.filenameTemplate.includes('{date}')) {
      warnings.push('filenameTemplate should include {site} and {date} placeholders');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Save current configuration to file
   */
  async saveConfig(filePath = null) {
    const targetPath = filePath || this.configPath;

    try {
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(targetPath, configData, 'utf8');
      console.log(`✅ Configuration saved to ${targetPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving configuration:', error.message);
      return false;
    }
  }

  /**
   * Get all configuration as object
   */
  getAllConfig() {
    return { ...this.config };
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults() {
    this.config = { ...this.defaultConfig };
    console.log('🔄 Configuration reset to defaults');
  }

  /**
   * Get configuration summary for logging
   */
  getConfigSummary() {
    return {
      version: this.get('version'),
      refinement: {
        enabled: this.get('refinement.enableByDefault'),
        maxIterations: this.get('refinement.maxIterations'),
        accuracyThreshold: this.get('refinement.accuracyThreshold')
      },
      screenshot: {
        enabled: this.getAPIKey('screenshotone') || this.getAPIKey('hcti'),
        width: this.get('screenshot.width'),
        height: this.get('screenshot.height')
      },
      parsing: {
        astFallback: this.get('parsing.css.useASTFallback'),
        variableResolution: this.get('parsing.css.enableVariableResolution')
      },
      output: {
        path: this.get('output.defaultPath'),
        formats: this.get('output.formats')
      }
    };
  }
}

module.exports = ConfigManager;