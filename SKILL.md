---
name: extract-style
description: This skill should be used when extracting high-fidelity design systems from websites for AI-assisted design replication. Use when the user wants to copy website styling, extract styles, design system extraction, or wants to teach an agent about specific design styles. Automates WebFetch extraction, screenshot capture via API, and comprehensive style guide generation using lightweight subagents.
---

# Extract Style

## Overview

Extract comprehensive design systems from any website using advanced CSS parsing, component detection, and iterative refinement. This skill implements the AIJSON methodology for creating high-fidelity, reusable design systems through a three-phase extraction process.

**Key Features:**
- ✅ Advanced CSS parsing with regex pattern detection
- ✅ Component detection algorithms (buttons, cards, inputs, navigation, etc.)
- ✅ Screenshot API integration with fallback support
- ✅ Three-phase extraction: Raw Data → Analysis → Refinement
- ✅ Validation and gap reporting
- ✅ AIJSON Phase 2 iterative refinement loop
- ✅ Comprehensive file organization and documentation

## When to Use This Skill

Use this skill when:
- User wants to extract a design system from a website
- User mentions copying or replicating website styling
- User wants to teach an AI agent about a specific design style
- User needs high-fidelity design context (beyond screenshots)
- User mentions "AIJSON workflow" or "pixel-perfect design extraction"
- User wants CSS, typography, colours, spacing from a live website
- User needs component patterns and interaction states

## Workflow

This skill uses a **three-phase extraction approach** with actual parsing logic:

### Phase 1: Raw Extraction
- Extract HTML content from target URL
- Parse and collect all CSS (inline, style tags, external stylesheets)
- Capture screenshots using API services
- Parse design tokens using advanced CSS parsing algorithms
- Generate validation report for extraction quality

### Phase 2: Analysis & Component Detection
- Analyze extracted design tokens for patterns and systems
- Detect UI components using pattern recognition algorithms
- Identify color systems, typography scales, spacing systems
- Generate interactive HTML demo showing extracted design system
- Create structured analysis of design patterns

### Phase 3: Iterative Refinement (AIJSON Phase 2)
- Apply improvement strategies for identified gaps
- Infer missing colors, spacing systems, and component states
- Generate refined design system with higher accuracy
- Create comprehensive documentation and style guides
- Validate improvements and ensure convergence

## Implementation

The skill uses actual parsing code rather than delegating to subagents:

- **CSS Parser**: Extracts colors, fonts, spacing, shadows using regex patterns
- **Component Detector**: Identifies buttons, cards, inputs, navigation with state detection
- **Screenshot Service**: Integrates with ScreenshotOne and HTML/CSS to Image APIs
- **Validation Service**: Analyzes extraction quality and identifies gaps
- **Refinement Engine**: Implements AIJSON Phase 2 iterative improvement

## Usage

### Basic Extraction
The skill automatically executes the full three-phase workflow and generates:

- **Interactive HTML Demo** (`demo.html`) - Visual representation of the design system
- **Style Guide** (`style-guide.md`) - Comprehensive documentation
- **Design Tokens** (`design-tokens.css`) - CSS custom properties
- **Validation Report** - Quality assessment and gap analysis
- **Screenshot References** - Visual context (when APIs are configured)

### Advanced Features
- **Iterative Refinement**: Enable with `enableRefinement: true` for AIJSON Phase 2 improvements
- **Screenshot Integration**: Configure API keys for visual references
- **Custom Output Path**: Specify where to save extracted files
- **Interactive Mode**: Get refinement suggestions during the process

## API Configuration

### Screenshot Services
Configure API keys for screenshot capture:

**Environment Variables:**
```bash
export SCREENSHOTONE_API_KEY=your_key_here
export HCTI_API_KEY=your_key_here
```

**Or create config file:**
```json
{
  "screenshotone": "your_key_here",
  "hcti": "your_key_here"
}
```
Save as `config/api-keys.json`

## File Organization

The skill creates organized output directories:

```
./style/[site-name]-[date]/
├── demo.html                    # Interactive design system demo
├── refined-demo.html           # Refined demo (if refinement enabled)
├── style-guide.md              # Comprehensive documentation
├── refined-style-guide.md      # Enhanced documentation (if refinement enabled)
├── design-tokens.css           # CSS custom properties
├── refined-design-tokens.css   # Enhanced tokens (if refinement enabled)
├── validation-report.json      # Quality assessment
├── complete-extraction-results.json # Full extraction data
├── file-manifest.json          # File inventory
├── screenshots/                # Visual references
└── css/                        # Individual CSS files
    ├── inline-styles.css
    ├── style-tags.css
    ├── external-styles.css
    └── ...
```

## Error Handling & Limitations

**Known Limitations:**
- Cannot extract styles applied via JavaScript frameworks
- Cannot access computed styles from browser rendering
- External stylesheets may be blocked by CORS policies
- Dynamic content requires manual testing

**Quality Indicators:**
- **A (90-100%)**: Excellent extraction with comprehensive design system
- **B (80-89%)**: Good extraction with most elements captured
- **C (70-79%)**: Fair extraction with some gaps identified
- **D (60-69%)**: Limited extraction, manual enhancement recommended
- **F (0-59%)**: Poor extraction, significant issues detected

## Troubleshooting

**Common Issues:**
1. **Low Quality Score**: Try enabling refinement mode or check site complexity
2. **Missing Screenshots**: Configure API keys or check service availability
3. **Incomplete CSS**: Some sites block external stylesheet access
4. **No Components Detected**: Site may use JavaScript-based styling

**Debug Options:**
- Run individual phases for testing
- Check validation report for specific issues
- Review extraction logs for errors
- Verify API service health

## Implementation Details

### Using Screenshot APIs

**ScreenshotOne API:**
- WebFetch: `https://screenshotone.com/` to read documentation
- Typical API call pattern: `https://api.screenshotone.com/take?url=[URL]&...`
- Returns image URL or can save directly

**Alternative - htmlcsstoimage.com:**
- WebFetch: `https://htmlcsstoimage.com/` for docs
- Can generate screenshots from URLs
- Returns image URLs

### WebFetch for CSS Extraction

When extracting stylesheets:
```
1. WebFetch main page HTML
2. Parse for <link rel="stylesheet" href="...">
3. WebFetch each stylesheet URL
4. Combine all CSS into one collection
```

### Why This Approach Works

**Token Efficiency:**
- Simple sites: 2-5k tokens
- Medium complexity: 5-15k tokens
- Complex SPAs: 15-30k tokens
- CSS text: ~3-15k tokens (depending on framework)
- Screenshot URLs: minimal tokens
- With screenshots: +1-2k tokens per image URL
- Subagent does all heavy lifting separately

**Reliability:**
- No Browser MCP dependency
- WebFetch always available
- Screenshot APIs are robust HTTP services

**Quality:**
- HTML demo page shows actual rendered design system
- Can open demo.html in browser to visualize
- Screenshot provides visual reference
- All design tokens extracted programmatically

## Using the Generated Style Guide

**1. For AI-Assisted Design:**
```
Using the design system in ./style/snowflake/demo.html,
create a dashboard page with similar styling.
```

**2. Visual Reference:**
Open `./style/snowflake/demo.html` in your browser to see the design system rendered live.

**3. CSS Variables:**
Import design-tokens.css into your project:
```html

```

**4. Documentation:**
Share `style-guide.md` with team members.

## Error Handling

**If WebFetch fails:**
- Check URL format (include https://)
- Some sites may block scraping - note this to user
- Try with www. prefix or without

**If CSS extraction is incomplete:**
- Focus on inline `<style>` tags first
- CORS may block external stylesheets
- Document what was successfully extracted

**If screenshot API fails:**
- Screenshots are optional - continue without them
- Note in the style guide that visual reference unavailable
- User can manually screenshot if needed

## Resources

### assets/style-guide-template.md
Reference template for markdown style guide structure.

### assets/css-variables-template.css
Reference template for CSS custom properties organization.

### references/aijson-methodology.md
Detailed explanation of the AIJSON workflow philosophy.