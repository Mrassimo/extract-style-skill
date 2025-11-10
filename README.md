# Extract Style - Claude Code Skill

**Version 2.0.0 - Complete Restructure with Actual Implementation**

Extract comprehensive design systems from websites using advanced CSS parsing, component detection, and AIJSON methodology. This skill transforms from a template-based system to a fully functional design system extraction tool.

## 🚀 What's New in Version 2.0

- **✅ Actual CSS Parsing Logic**: No more magic - real regex-based token extraction
- **✅ Component Detection Algorithms**: Identify buttons, cards, inputs with state detection
- **✅ Screenshot API Integration**: Concrete implementation with fallback support
- **✅ Three-Phase Workflow**: Extraction → Analysis → Refinement
- **✅ Validation & Gap Reporting**: Quality assessment and issue identification
- **✅ AIJSON Phase 2 Implementation**: Iterative refinement loop
- **✅ Comprehensive File Organization**: Structured output with versioning

## 🏗️ Architecture

### Core Modules

- **[`css-parser.js`](scripts/css-parser.js)** - Extracts design tokens using regex patterns
- **[`component-detector.js`](scripts/component-detector.js)** - Identifies UI components and states
- **[`screenshot-service.js`](scripts/screenshot-service.js)** - Handles screenshot API integration
- **[`validation-service.js`](scripts/validation-service.js)** - Quality assessment and gap analysis
- **[`phase-1-extraction.js`](scripts/phase-1-extraction.js)** - Raw data collection
- **[`phase-2-analysis.js`](scripts/phase-2-analysis.js)** - Pattern analysis and component detection
- **[`phase-3-refinement.js`](scripts/phase-3-refinement.js)** - AIJSON iterative refinement
- **[`extract-style-orchestrator.js`](scripts/extract-style-orchestrator.js)** - Main coordinator

## 🎯 Features

### Advanced Design Token Extraction
- **Colors**: Hex, RGB, HSL with usage categorization
- **Typography**: Font families, sizes, weights with scale identification
- **Spacing**: Systematic spacing scale detection
- **Shadows**: Elevation system classification
- **CSS Variables**: Custom property extraction and categorization

### Component Detection
- **Buttons**: Primary, secondary, ghost variants with hover/focus states
- **Cards**: Shadow and spacing patterns
- **Inputs**: Form field styling with validation states
- **Navigation**: Menu patterns and active states
- **Modals/Dropdowns**: Overlay patterns with animations

### AIJSON Methodology Implementation
- **Phase 1**: Raw data extraction with comprehensive collection
- **Phase 2**: Pattern analysis and component identification
- **Phase 3**: Iterative refinement with accuracy targeting

### Quality Assurance
- **Validation Scoring**: A-F grading system with detailed metrics
- **Gap Reporting**: Identifies missing elements and limitations
- **Convergence Detection**: Automatic stopping when quality targets met
- **Error Recovery**: Graceful handling of API failures and network issues

## 📦 Installation & Setup

### Prerequisites
- Node.js 14+ (for local testing)
- Claude Code with skill support

### API Configuration (Optional)
For screenshot functionality, configure API keys:

**Option 1: Environment Variables**
```bash
export SCREENSHOTONE_API_KEY=your_key_here
export HCTI_API_KEY=your_key_here
```

**Option 2: Configuration File**
```bash
cp config/api-keys.json.example config/api-keys.json
# Edit config/api-keys.json with your API keys
```

### Supported Screenshot Services
- **ScreenshotOne**: 100 free screenshots/month
- **HTML/CSS to Image**: 100 free images/month

## 🚀 Usage

### Basic Usage
The skill automatically triggers when you request design system extraction:

```
Extract the design system from https://example.com
```

### Advanced Options
```
Extract the design system from https://stripe.com with refinement enabled and save to ./outputs
```

### Output Structure
```
./style/[site-name]-[YYYY-MM-DD]/
├── demo.html                    # Interactive design system demo
├── style-guide.md              # Comprehensive documentation
├── design-tokens.css           # CSS custom properties
├── validation-report.json      # Quality assessment
├── complete-extraction-results.json # Full extraction data
├── file-manifest.json          # File inventory
├── phase-1-raw-data.json       # Raw extraction data
├── phase-2-analysis.json       # Analysis results
├── phase-3-refinement.json     # Refinement results (if enabled)
├── screenshots/                # Visual references
└── css/                        # Individual CSS files
```

## 🔧 Development

### Local Testing
```bash
cd scripts/
node extract-style-orchestrator.js
```

### Running Individual Phases
```javascript
const orchestrator = new ExtractStyleOrchestrator();

// Phase 1 only
const phase1 = await orchestrator.executePhase('1', 'https://example.com');

// Phase 2 with Phase 1 input
const phase2 = await orchestrator.executePhase('2', null, phase1);

// Phase 3 with Phase 2 input
const phase3 = await orchestrator.executePhase('3', null, phase2, {
  userFeedback: { corrections: [...] }
});
```

### System Health Check
```javascript
const health = await orchestrator.checkSystemHealth();
console.log(health);
```

## 📊 Quality Metrics

### Scoring System
- **A (90-100%)**: Excellent extraction with comprehensive design system
- **B (80-89%)**: Good extraction with most elements captured
- **C (70-79%)**: Fair extraction with some gaps identified
- **D (60-69%)**: Limited extraction, manual enhancement recommended
- **F (0-59%)**: Poor extraction, significant issues detected

### Validation Categories
- **Extraction Quality**: HTML and CSS collection success
- **Completeness**: Percentage of expected elements captured
- **Design System Quality**: Systematic patterns identified
- **Overall Assessment**: Weighted combination of all metrics

## 🚨 Limitations

### Technical Limitations
- **JavaScript Frameworks**: Cannot extract styles applied via React/Vue/Angular
- **Computed Styles**: Cannot access browser-rendered final values
- **CORS Restrictions**: External stylesheets may be blocked
- **Dynamic Content**: Cannot capture user interactions or state changes

### Known Issues
- Sites with heavy JavaScript styling may have limited extraction
- Responsive design requires manual testing of breakpoints
- CSS-in-JS solutions are not fully supported
- Web components and shadow DOM parsing is limited

## 🔍 Troubleshooting

### Common Issues

**Low Quality Score**
- Enable refinement mode with `enableRefinement: true`
- Check if site uses JavaScript-heavy styling
- Verify API keys are configured for screenshots

**Missing Screenshots**
- Configure API keys in environment or config file
- Check service availability and rate limits
- Try alternative screenshot service

**Incomplete CSS**
- Some sites block external stylesheet access
- CORS policies may prevent loading
- Check site's robots.txt and access policies

**No Components Detected**
- Site may use utility-first CSS approach
- Components might be generated via JavaScript
- Try manual inspection of component patterns

### Debug Options
```javascript
// Enable verbose logging
const result = await orchestrator.extractDesignSystem(url, {
  debug: true,
  saveData: true,
  outputPath: './debug-output'
});

// Check validation report
console.log(result.validation.issues);
console.log(result.validation.recommendations);

// Review phase-specific results
console.log(result.phases.phase1.validationReport);
console.log(result.phases.phase2.designTokenAnalysis);
```

## 🎯 Roadmap

### Version 2.1
- [ ] Browser MCP integration for JavaScript-heavy sites
- [ ] Enhanced WebKit detection for Safari-specific styles
- [ ] CSS-in-JS parsing improvements
- [ ] Component variant detection

### Version 2.2
- [ ] Real-time collaboration mode
- [ ] Design system comparison tools
- [ ] Automated accessibility testing
- [ ] Integration with design tools (Figma, Sketch)

### Version 3.0
- [ ] Full browser rendering pipeline
- [ ] Interactive state capture
- [ ] Animation and transition extraction
- [ ] Component library generation

## 🤝 Contributing

### Development Guidelines
1. **Test with real sites**: Validate against various design systems
2. **Maintain backward compatibility**: Don't break existing workflows
3. **Document limitations**: Be clear about what doesn't work
4. **Handle errors gracefully**: Provide useful error messages

### Adding New Features
1. Implement core logic in appropriate module
2. Add validation and error handling
3. Update documentation and examples
4. Test with diverse website types

## 📄 License

This skill is part of the Extract Style project and follows the same license terms.

## 🙏 Acknowledgments

- AIJSON methodology for systematic design extraction
- ScreenshotOne and HTML/CSS to Image for API services
- Claude Code team for the skill framework
- The web design community for inspiration and feedback

---

**Transform your design understanding with systematic extraction and intelligent analysis.** 🎨✨