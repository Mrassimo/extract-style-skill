#!/usr/bin/env node

/**
 * Runner script to extract Linear.app design system
 * Linear has one of the most beautiful, modern design systems
 */

const extractStyleSkill = require('./claude-skill.js');

async function main() {
  console.log('🎨 Starting Linear.app design system extraction...\n');

  try {
    const result = await extractStyleSkill('https://linear.app', {
      saveData: true,
      outputPath: './style',
      includeScreenshots: false,
      enableRefinement: true,
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

    console.log('\n📈 Summary:');
    console.log('  - Colors Extracted:', result.summary.colorsExtracted);
    console.log('  - Components Detected:', result.summary.componentsDetected);
    console.log('  - Total Time:', result.summary.totalTime, 'ms');

    console.log('\n🎉 Design system extraction complete!');

  } catch (error) {
    console.error('\n❌ Extraction failed:', error.message);
    process.exit(1);
  }
}

main();
