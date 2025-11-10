#!/usr/bin/env node

/**
 * Runner script to extract Stripe.com design system
 */

const extractStyleSkill = require('./claude-skill.js');

async function main() {
  console.log('🎨 Starting Stripe.com design system extraction...\n');

  try {
    const result = await extractStyleSkill('https://stripe.com', {
      saveData: true,
      outputPath: './style',
      includeScreenshots: false, // Disabled to avoid API key requirements
      enableRefinement: true, // Enable AIJSON Phase 2 for better quality
      interactiveMode: false,
      claudeCodeMode: true
    });

    console.log('\n✅ Extraction completed successfully!\n');
    console.log('📊 Quality Score:', result.quality.score, `(${result.quality.grade})`);
    console.log('📁 Output Directory:', result.outputPath);
    console.log('\n📄 Generated Files:');
    console.log('  - Demo:', result.files.demo);
    console.log('  - Style Guide:', result.files.styleGuide);
    console.log('  - Design Tokens:', result.files.designTokens);
    console.log('  - Validation Report:', result.files.validation);

    console.log('\n📈 Summary:');
    console.log('  - Colors Extracted:', result.summary.colorsExtracted);
    console.log('  - Components Detected:', result.summary.componentsDetected);
    console.log('  - Phases Completed:', result.summary.phasesCompleted);
    console.log('  - Total Time:', result.summary.totalTime, 'ms');

    if (result.summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.summary.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    console.log('\n🎉 Now you can:');
    console.log('  - Open demo.html in a browser to see the design system');
    console.log('  - Read style-guide.md for comprehensive documentation');
    console.log('  - Use design-tokens.css in your projects');

  } catch (error) {
    console.error('\n❌ Extraction failed:', error.message);

    if (error.suggestions) {
      console.error('\n💡 Suggestions:');
      error.suggestions.forEach((suggestion, i) => {
        console.error(`  ${i + 1}. ${suggestion}`);
      });
    }

    if (error.workaround) {
      console.error(`\n🔄 Workaround: ${error.workaround}`);
    }

    process.exit(1);
  }
}

main();
