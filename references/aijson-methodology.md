# AIJSON Methodology Reference

> Based on the AIJSON video workflow for teaching AI agents high-fidelity design systems

## Core Philosophy

The AIJSON methodology addresses a fundamental problem in AI-assisted design: **detail loss during style transfer**. When designers simply share screenshots with AI agents and ask for similar designs, they typically achieve only 60-70% fidelity. Fine-grained details get lost in translation.

The solution is to provide AI agents with **more than just screenshots** - give them the actual CSS, computed styles, design tokens, and co-create reference implementations that serve as the foundation for future work.

## The Three-Phase Process

### Phase 1: High-Fidelity Context Extraction

**Goal:** Gather complete design system data beyond what's visible in screenshots.

**Actions:**
1. **Navigate to the target website** in a browser
2. **Right-click → Inspect Element** to access DevTools
3. **Extract HTML structure** (copy outerHTML of key sections)
4. **Copy entire style blocks** from `<style>` tags and linked CSS files
5. **Capture screenshots** of the full page and key sections
6. **Inspect computed styles** for critical elements (colours, spacing, typography)

**What to Extract:**
- Complete CSS from `<style>` tags
- Linked external stylesheets
- CSS custom properties (CSS variables) - these often define the core design system
- Computed styles for precise measurements
- Google Fonts links
- Media queries for responsive behaviour

**Why This Matters:**
CSS contains design intent that screenshots can't convey:
- Exact hex codes (not approximations)
- Precise spacing values (not eyeballed)
- Typography hierarchy (actual font sizes, weights, line heights)
- Hover states and transitions
- Responsive breakpoints

### Phase 2: Co-Creation of Reference Implementation

**Goal:** Create a single reference page that captures 100% of the desired style.

**Process:**
1. **Start with one page** - Don't try to build the full app yet
2. **Feed the AI** your extracted HTML + CSS + screenshots
3. **Prompt:** "Help me rebuild the exact same UI design in a single HTML file. Above is the extracted CSS. Replicate this design pixel-perfectly."
4. **The AI generates** an initial implementation (likely 70-80% accurate)
5. **Iterate and refine:**
   - Use tools like [Bug.app](https://bug.app) to inspect specific elements
   - Click elements to get exact computed styles (background colour, padding, etc.)
   - Feed corrections back to the AI: "The background colour should be #f8f9fa, not #f5f5f5"
   - Continue until the reference page is 100% accurate

**Why Co-Creation Works:**
- Establishes a **shared understanding** between you and the AI
- Creates a **reference artifact** the AI can analyse to extract patterns
- Catches edge cases and subtle details through iteration
- Results in a **single source of truth** for the design system

**Key Insight:**
The reference implementation doesn't need to be the final product - it's a **learning artifact**. Once you have a pixel-perfect example, the AI can analyse it to extract the complete design system.

### Phase 3: Style Guide Extraction and Reuse

**Goal:** Extract a detailed, reusable style guide from the reference implementation.

**Prompt Template:**
```
Great! Now help me generate a detailed style guide based on this reference implementation.

The style guide must include:
1. Overview - Design philosophy and aesthetic
2. Colour Palette - All colours with hex codes and usage context
3. Typography - Font families, sizes, weights, line heights
4. Spacing System - Margin, padding, gap patterns
5. Component Styles - Buttons, cards, inputs, navigation
6. Shadows & Effects - Box shadows, border radius, transitions
7. Layout Patterns - Flexbox/Grid configurations, container widths
8. Animation - Transitions, hover states, keyframes

For each section, provide:
- Exact values (not approximations)
- Usage context (when to use each variant)
- CSS code snippets
- Visual examples
```

**The AI generates** a comprehensive markdown style guide documenting every aspect of the design system.

**Why This Works:**
- The AI now has a **concrete example** to analyse (the reference page)
- It can extract patterns systematically
- The guide is based on actual implementation, not just visual analysis
- Results in a **portable, reusable** design system

## Using the Style Guide

Once you have the extracted style guide, you can:

### 1. Generate New Pages with Consistent Styling

**Prompt:**
```
Using the design system in [style-guide.md], create a user profile page
with the following features: [list features]
```

The AI will generate new interfaces that match the original design exactly because it has:
- Exact colour codes
- Precise spacing values
- Typography hierarchy
- Component patterns
- Layout conventions

### 2. Build Production Applications

**Prompt:**
```
Let's rebuild this interface in Next.js/React in the [project-folder] directory.
Make it pixel-perfect and break everything down into reusable components.
Use the style guide in [style-guide.md] for all design decisions.
```

The AI creates a proper application structure while maintaining design consistency.

### 3. Generate Other Design Artifacts

The style guide isn't just for web pages - use it for:

**Slide Decks:**
```
Create a pitch deck slide presentation using the design system
from [style-guide.md]. Make it match the brand aesthetic.
```

**Product Demos:**
```
Using Framer Motion and the real UI components, create a product
demo animation showing [interaction]. Follow the style guide for
colours, spacing, and transitions.
```

**Documentation:**
```
Generate component library documentation following the visual
style in [style-guide.md].
```

## Key Principles

### 1. High-Fidelity Context > Screenshots Alone

Screenshots capture pixels, but CSS captures intent. Always include:
- Actual CSS code
- Computed styles from DevTools
- Design tokens (CSS variables)
- Structural HTML

### 2. Co-Create, Don't Just Prompt

Don't expect perfection on the first try. Create a reference implementation together:
- Start with AI generation
- Inspect and correct
- Iterate until 100% accurate
- Use the result as a learning artifact

### 3. Extract Patterns, Not Just Styles

A good style guide documents:
- When to use each variant
- How components compose together
- Layout patterns and conventions
- Responsive behaviour

### 4. Make It Reusable

The style guide should be:
- **Portable** - Works across different projects and tools
- **Specific** - Exact values, not approximations
- **Documented** - Usage context for every element
- **Example-rich** - Code snippets and visual references

### 5. Design Tokens as Foundation

Extract design tokens (CSS custom properties) early:
```css
:root {
  --color-primary: #0066cc;
  --spacing-md: 16px;
  --font-heading: "Inter", sans-serif;
}
```

These become the foundation of the design system and make it easy to:
- Maintain consistency
- Update globally
- Import into any project

## Tools Mentioned in Original Methodology

### 1. Browser DevTools
- **Inspect Element** - Right-click any element to view HTML and CSS
- **Computed Styles** - See the final calculated styles
- **Copy styles** - Right-click style rules to copy

### 2. Bug.app (or similar)
- Click elements to see computed styles
- Extract exact colour values
- Get precise spacing measurements

### 3. Super Design Extension (mentioned in video)
- Chrome extension for design system extraction
- Automatically clones pages pixel-perfectly
- Generates style guides from live sites
- Exports production-ready React projects

## Common Pitfalls to Avoid

❌ **Relying only on screenshots** - Results in 60-70% fidelity
❌ **Skipping the reference implementation** - No shared understanding
❌ **Approximate values** - "About 20px padding" vs exact "18px"
❌ **Incomplete style guides** - Missing hover states, responsive behaviour
❌ **Not documenting usage context** - When to use primary vs secondary button?

✅ **Extract actual CSS** - Get design intent, not just pixels
✅ **Co-create reference page** - Iterate to 100% accuracy
✅ **Document precisely** - Exact values with usage context
✅ **Include all states** - Default, hover, active, focus, disabled
✅ **Make it reusable** - Portable across projects and tools

## Workflow Summary

```
1. Navigate to site → Inspect → Extract CSS + HTML + Screenshot
                          ↓
2. Feed to AI → Generate reference page → Iterate to 100% accuracy
                          ↓
3. Prompt: "Generate detailed style guide"
                          ↓
4. Use style guide for: New pages | Apps | Slides | Docs | Animations
```

The result: **Pixel-perfect, AI-guided design** that maintains 100% fidelity to the original.

## Integration with This Skill

This skill automates steps 1-3:
1. **Browser automation** replaces manual inspection
2. **CSS extraction** is handled programmatically
3. **Style guide generation** uses AI analysis of extracted data

The co-creation step (Phase 2) can still be done manually after extraction if needed, or the AI can generate the reference implementation automatically based on the extracted high-fidelity context.
