/**
 * Screenshot Service Integration
 * Handles screenshot capture from multiple API services with fallbacks
 */

class ScreenshotService {
  constructor() {
    this.services = {
      screenshotone: {
        name: 'ScreenshotOne',
        baseUrl: 'https://api.screenshotone.com/take',
        defaultParams: {
          format: 'png',
          viewport_width: 1920,
          viewport_height: 1080,
          device_scale: 2,
          full_page: true,
          delay: 2000,
          timeout: 30
        }
      },
      hcti: {
        name: 'HTML/CSS to Image',
        baseUrl: 'https://hcti.io/v1/image',
        defaultParams: {
          viewport_width: 1920,
          viewport_height: 1080,
          device_scale: 2,
          full_page: true,
          delay: 2000
        }
      }
    };

    this.apiKeys = this.loadApiKeys();
  }

  /**
   * Load API keys from environment or config
   */
  loadApiKeys() {
    // Try environment variables first
    const keys = {
      screenshotone: process.env.SCREENSHOTONE_API_KEY,
      hcti: process.env.HCTI_API_KEY
    };

    // Fallback to local config file
    if (!keys.screenshotone && !keys.hcti) {
      try {
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '../config/api-keys.json');

        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          return { ...keys, ...config };
        }
      } catch (error) {
        console.warn('Could not load API keys from config:', error.message);
      }
    }

    return keys;
  }

  /**
   * Capture screenshot using available API services
   */
  async captureScreenshot(url, options = {}) {
    const results = [];

    // Try each available service
    for (const [serviceKey, service] of Object.entries(this.services)) {
      if (!this.apiKeys[serviceKey]) {
        console.log(`Skipping ${service.name} - no API key available`);
        continue;
      }

      try {
        console.log(`Attempting screenshot with ${service.name}...`);
        const result = await this.captureWithService(serviceKey, url, options);
        results.push({
          service: service.name,
          ...result,
          success: true
        });

        // Return first successful result
        return results[0];
      } catch (error) {
        console.error(`${service.name} failed:`, error.message);
        results.push({
          service: service.name,
          error: error.message,
          success: false
        });
      }
    }

    // If all services failed, return error report
    throw new Error(`All screenshot services failed. Results: ${JSON.stringify(results, null, 2)}`);
  }

  /**
   * Capture screenshot with specific service
   */
  async captureWithService(serviceKey, url, options) {
    const service = this.services[serviceKey];
    const apiKey = this.apiKeys[serviceKey];

    switch (serviceKey) {
      case 'screenshotone':
        return await this.captureWithScreenshotOne(service, apiKey, url, options);
      case 'hcti':
        return await this.captureWithHCTI(service, apiKey, url, options);
      default:
        throw new Error(`Unknown service: ${serviceKey}`);
    }
  }

  /**
   * Capture with ScreenshotOne API
   */
  async captureWithScreenshotOne(service, apiKey, url, options) {
    const params = new URLSearchParams({
      ...service.defaultParams,
      ...options,
      access_key: apiKey,
      url: url
    });

    const requestUrl = `${service.baseUrl}?${params.toString()}`;

    // For ScreenshotOne, the response is the image directly
    const response = await this.makeRequest(requestUrl);

    if (!response.ok) {
      throw new Error(`ScreenshotOne API error: ${response.status} ${response.statusText}`);
    }

    // Get the image URL from the response
    const imageUrl = response.url;

    return {
      url: imageUrl,
      downloadUrl: imageUrl,
      service: 'screenshotone',
      metadata: {
        params: Object.fromEntries(params),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Capture with HTML/CSS to Image API
   */
  async captureWithHCTI(service, apiKey, url, options) {
    const params = {
      ...service.defaultParams,
      ...options,
      url: url
    };

    const response = await this.makeRequest(service.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HCTI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    return {
      url: result.url,
      downloadUrl: result.url,
      service: 'hcti',
      metadata: {
        id: result.id,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Make HTTP request with proper error handling
   */
  async makeRequest(url, options = {}) {
    const fetch = require('node-fetch');

    try {
      const response = await fetch(url, {
        timeout: 60000, // 60 second timeout
        ...options
      });
      return response;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        throw new Error(`Network error: Could not resolve hostname. Check your internet connection.`);
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error(`Request timeout: The server took too long to respond.`);
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  /**
   * Download screenshot image to local file
   */
  async downloadScreenshot(imageUrl, filePath) {
    const fs = require('fs');
    const path = require('path');
    const fetch = require('node-fetch');

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.buffer();
      fs.writeFileSync(filePath, buffer);

      return {
        success: true,
        filePath: filePath,
        size: buffer.length
      };
    } catch (error) {
      throw new Error(`Failed to download screenshot: ${error.message}`);
    }
  }

  /**
   * Generate API usage documentation
   */
  generateAPIDocumentation() {
    return {
      screenshotone: {
        name: 'ScreenshotOne API',
        website: 'https://screenshotone.com/',
        pricing: 'Free tier available (100 screenshots/month)',
        setup: `
1. Sign up at https://screenshotone.com/
2. Get your API key from dashboard
3. Set environment variable: export SCREENSHOTONE_API_KEY=your_key
4. Or create config file: config/api-keys.json with {"screenshotone": "your_key"}
        `,
        example: `
# Example API call
curl "https://api.screenshotone.com/take?url=https://example.com&access_key=your_key&full_page=true&format=png&viewport_width=1920&viewport_height=1080&delay=2000"
        `
      },
      hcti: {
        name: 'HTML/CSS to Image',
        website: 'https://htmlcsstoimage.com/',
        pricing: 'Free tier available (100 images/month)',
        setup: `
1. Sign up at https://htmlcsstoimage.com/
2. Get your API key from dashboard
3. Set environment variable: export HCTI_API_KEY=your_key
4. Or create config file: config/api-keys.json with {"hcti": "your_key"}
        `,
        example: `
# Example API call
curl -X POST https://hcti.io/v1/image \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_key" \\
  -d '{"url": "https://example.com", "viewport_width": 1920, "viewport_height": 1080}'
        `
      }
    };
  }

  /**
   * Check API service availability
   */
  async checkServiceHealth() {
    const healthStatus = {};

    for (const [serviceKey, service] of Object.entries(this.services)) {
      if (!this.apiKeys[serviceKey]) {
        healthStatus[serviceKey] = {
          status: 'no_key',
          message: 'API key not configured'
        };
        continue;
      }

      try {
        // Make a simple test request
        const testUrl = 'https://httpbin.org/get';
        await this.captureWithService(serviceKey, testUrl, {
          viewport_width: 400,
          viewport_height: 300
        });

        healthStatus[serviceKey] = {
          status: 'available',
          message: 'Service is working'
        };
      } catch (error) {
        healthStatus[serviceKey] = {
          status: 'error',
          message: error.message
        };
      }
    }

    return healthStatus;
  }
}

module.exports = ScreenshotService;