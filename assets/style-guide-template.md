# [Site Name] Design System

> Extracted on [DATE] from [URL]

## Overview

[2-3 sentences describing the overall aesthetic, design philosophy, and key characteristics of this design system. What makes this design unique?]

---

## Colour Palette

### Primary Colours

| Colour Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Primary | #000000 | rgb(0, 0, 0) | Main brand colour, primary buttons, links |
| Secondary | #000000 | rgb(0, 0, 0) | Secondary actions, accents |
| Accent | #000000 | rgb(0, 0, 0) | Highlights, hover states |

### Text Colours

| Colour Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Heading | #000000 | rgb(0, 0, 0) | Main headings |
| Body | #000000 | rgb(0, 0, 0) | Body text, paragraphs |
| Muted | #000000 | rgb(0, 0, 0) | Secondary text, captions |

### Background Colours

| Colour Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Background | #ffffff | rgb(255, 255, 255) | Page background |
| Surface | #f8f8f8 | rgb(248, 248, 248) | Cards, elevated surfaces |
| Border | #e0e0e0 | rgb(224, 224, 224) | Dividers, borders |

### Semantic Colours

| Colour Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Success | #00ff00 | rgb(0, 255, 0) | Success messages, confirmations |
| Error | #ff0000 | rgb(255, 0, 0) | Error messages, warnings |
| Warning | #ffaa00 | rgb(255, 170, 0) | Warning messages |
| Info | #0099ff | rgb(0, 153, 255) | Informational messages |

---

## Typography

### Font Families

**Primary Font:** [Font Name]
- Source: [Google Fonts / System / Custom]
- Link: `[Google Fonts URL if applicable]`
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Secondary Font:** [Font Name]
- Source: [Google Fonts / System / Custom]
- Link: `[Google Fonts URL if applicable]`
- Fallback: `Georgia, Times, serif`

**Monospace Font:** [Font Name]
- Used for: Code snippets, technical content
- Fallback: `"Courier New", monospace`

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Example CSS |
|---------|------|--------|-------------|----------------|-------------|
| H1 | 48px / 3rem | 700 | 1.2 | -0.02em | `font: 700 3rem/1.2 [Font]` |
| H2 | 36px / 2.25rem | 700 | 1.3 | -0.01em | `font: 700 2.25rem/1.3 [Font]` |
| H3 | 24px / 1.5rem | 600 | 1.4 | 0 | `font: 600 1.5rem/1.4 [Font]` |
| H4 | 20px / 1.25rem | 600 | 1.4 | 0 | `font: 600 1.25rem/1.4 [Font]` |
| Body Large | 18px / 1.125rem | 400 | 1.6 | 0 | `font: 400 1.125rem/1.6 [Font]` |
| Body | 16px / 1rem | 400 | 1.6 | 0 | `font: 400 1rem/1.6 [Font]` |
| Body Small | 14px / 0.875rem | 400 | 1.5 | 0 | `font: 400 0.875rem/1.5 [Font]` |
| Caption | 12px / 0.75rem | 400 | 1.4 | 0.01em | `font: 400 0.75rem/1.4 [Font]` |

### Text Styling

**Link Styles:**
```css
a {
  color: #[primary];
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

a:hover {
  color: #[primary-hover];
  text-decoration-thickness: 2px;
}
```

**Text Transforms:**
- Buttons: `text-transform: uppercase` (if applicable)
- Headings: `text-transform: [none/uppercase/capitalize]`

---

## Spacing System

### Base Scale

The design uses a [4px / 8px] base spacing unit with consistent multipliers:

| Token | Value | Common Uses |
|-------|-------|-------------|
| xs | 4px | Icon spacing, tight gaps |
| sm | 8px | Small component padding |
| md | 16px | Default spacing between elements |
| lg | 24px | Section spacing |
| xl | 32px | Large section spacing |
| 2xl | 48px | Hero section padding |
| 3xl | 64px | Major section breaks |

### Component Spacing

**Cards:**
- Internal padding: `[value]`
- Gap between cards: `[value]`

**Buttons:**
- Padding: `[vertical] [horizontal]`
- Gap between button group: `[value]`

**Navigation:**
- Menu item spacing: `[value]`
- Nav padding: `[value]`

---

## Layout Patterns

### Container Widths

```css
.container {
  max-width: [1200px];
  margin: 0 auto;
  padding: 0 [24px];
}

.container-narrow {
  max-width: [800px];
}

.container-wide {
  max-width: [1400px];
}
```

### Grid Layouts

**Common Grid Pattern:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax([300px], 1fr));
  gap: [24px];
}
```

### Flexbox Patterns

**Common Flex Pattern:**
```css
.flex-row {
  display: flex;
  justify-content: [space-between];
  align-items: [center];
  gap: [16px];
}
```

---

## Component Styles

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: #[primary];
  color: #[text-on-primary];
  padding: [12px 24px];
  border-radius: [8px];
  font-weight: [600];
  font-size: [16px];
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #[primary-hover];
  transform: translateY(-1px);
  box-shadow: [shadow value];
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: transparent;
  color: #[primary];
  padding: [12px 24px];
  border-radius: [8px];
  border: [2px] solid #[primary];
  /* ... */
}
```

**Ghost Button:**
```css
.btn-ghost {
  background: transparent;
  color: #[text];
  padding: [12px 24px];
  border: none;
  /* ... */
}
```

### Cards

```css
.card {
  background: #[surface];
  border-radius: [12px];
  padding: [24px];
  box-shadow: [shadow value];
  border: [1px solid #border / none];
}

.card:hover {
  box-shadow: [elevated shadow];
  transform: translateY(-2px);
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: [12px 16px];
  border: [2px] solid #[border];
  border-radius: [8px];
  font-size: [16px];
  background: #[input-bg];
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #[primary];
  box-shadow: 0 0 0 3px rgba([primary-rgb], 0.1);
}
```

### Navigation

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: [16px 24px];
  background: #[nav-bg];
  border-bottom: [1px solid #border];
}

.nav-link {
  padding: [8px 16px];
  color: #[nav-text];
  font-weight: [500];
  transition: color 0.2s;
}

.nav-link:hover {
  color: #[primary];
}

.nav-link.active {
  color: #[primary];
  border-bottom: 2px solid #[primary];
}
```

---

## Visual Effects

### Shadows

**Elevation System:**

```css
/* Small elevation - cards at rest */
--shadow-sm: [0 1px 3px rgba(0,0,0,0.1)];

/* Medium elevation - hover states */
--shadow-md: [0 4px 6px rgba(0,0,0,0.1)];

/* Large elevation - modals, dropdowns */
--shadow-lg: [0 10px 20px rgba(0,0,0,0.15)];

/* Extra large - prominent elements */
--shadow-xl: [0 20px 40px rgba(0,0,0,0.2)];
```

### Border Radius

```css
--radius-sm: [4px];    /* Small elements, chips */
--radius-md: [8px];    /* Buttons, inputs */
--radius-lg: [12px];   /* Cards */
--radius-xl: [16px];   /* Large containers */
--radius-full: [9999px]; /* Pills, avatars */
```

### Transitions

**Standard Timing:**
```css
--transition-fast: 0.1s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

**Common Transitions:**
```css
/* Hover effects */
transition: all 0.2s ease;

/* Transform effects */
transition: transform 0.2s ease, box-shadow 0.2s ease;

/* Colour changes */
transition: background-color 0.2s ease, colour 0.2s ease;
```

### Animations

[Document any keyframe animations, scroll effects, or micro-interactions observed]

---

## Responsive Behaviour

### Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
```

### Responsive Patterns

[Document how spacing, typography, and layout adapt across breakpoints]

---

## Usage Examples

### Creating a Hero Section

```html
<section class="hero">
  <div class="container">
    <h1>Heading Text</h1>
    <p class="lead">Subheading text</p>
    <button class="btn-primary">Call to Action</button>
  </div>
</section>
```

```css
.hero {
  padding: [80px 0];
  background: #[hero-bg];
  text-align: center;
}

.lead {
  font-size: [20px];
  colour: #[text-muted];
  margin: [16px 0 32px];
}
```

### Creating a Card Grid

```html
<div class="card-grid">
  <article class="card">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
    <a href="#" class="btn-secondary">Learn More</a>
  </article>
  <!-- More cards... -->
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: [24px];
  padding: [48px 0];
}
```

---

## Design Tokens Summary

All extracted design tokens are available in the accompanying `design-tokens.css` file for easy import into projects.

---

## Notes

[Any additional observations about the design system, unique patterns, or implementation details worth noting]
