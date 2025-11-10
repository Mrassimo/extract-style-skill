#!/usr/bin/env node

/**
 * Extract design system from local HTML file
 */

const fs = require('fs').promises;
const path = require('path');
const CSSParser = require('./scripts/css-parser');
const ComponentDetector = require('./scripts/component-detector');

async function main() {
  console.log('🎨 Extracting design system from Stripe-inspired demo...\n');

  try {
    // Read the HTML file
    const htmlPath = path.join(__dirname, 'stripe-inspired-demo.html');
    const html = await fs.readFile(htmlPath, 'utf-8');
    console.log('✅ Loaded HTML file');

    // Extract CSS from style tags
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (!styleMatch) {
      throw new Error('No style tags found in HTML');
    }
    const css = styleMatch[1];
    console.log('✅ Extracted CSS from style tags');

    // Parse CSS with the skill's parser
    const cssParser = new CSSParser();
    const designTokens = cssParser.parseCSS(css);
    const validationReport = cssParser.generateValidationReport();
    console.log('✅ Parsed design tokens');

    // Detect components
    const componentDetector = new ComponentDetector();
    const components = componentDetector.detectComponents(html, css);
    console.log('✅ Detected components');

    // Generate summary
    console.log('\n📊 Extraction Summary:');
    console.log('  Colors:', Object.keys(designTokens.colors || {}).length);
    console.log('  Font Families:', Object.keys(designTokens.fonts || {}).length);
    console.log('  Spacing Values:', Object.keys(designTokens.spacing || {}).length);
    console.log('  Shadows:', Object.keys(designTokens.shadows || {}).length);
    console.log('  Components Detected:', components.summary.total);

    // Save the extracted data
    const outputDir = path.join(__dirname, 'style', 'stripe-inspired');
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(
      path.join(outputDir, 'design-tokens.json'),
      JSON.stringify(designTokens, null, 2)
    );

    await fs.writeFile(
      path.join(outputDir, 'components.json'),
      JSON.stringify(components, null, 2)
    );

    await fs.writeFile(
      path.join(outputDir, 'validation-report.json'),
      JSON.stringify(validationReport, null, 2)
    );

    console.log('\n📁 Files saved to:', outputDir);
    console.log('  - design-tokens.json');
    console.log('  - components.json');
    console.log('  - validation-report.json');

    console.log('\n🎉 Extraction complete!');

    return {
      designTokens,
      components,
      validationReport,
      outputDir
    };

  } catch (error) {
    console.error('\n❌ Extraction failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
