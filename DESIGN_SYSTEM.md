# Apex AI Assistant - Design System

## Phase 2: Visual Design Enhancement

### Color Palette

#### Primary Neon Gradient
- **Deep Blue**: `#001F3F` - Base background color
- **Cyan**: `#00FFFF` - Primary accent and text color
- **Gradient Flow**: `#001F3F → #003D6B → #0099CC → #00CCFF → #00FFFF`

#### Secondary Colors
- **Accent Blue**: `#0099CC`
- **Light Cyan**: `#00CCFF`
- **Purple Accent**: `#9966FF`
- **Muted Cyan**: `#66D9EF`

#### Semantic Colors
- **Success**: `#00FF88`
- **Warning**: `#FFCC00`
- **Error**: `#FF0055`
- **Info**: `#00CCFF`

### Typography

#### Font Families
- **Headings**: Orbitron (weights: 400, 500, 600, 700, 800, 900)
  - Cyber-futuristic aesthetic
  - Letter spacing: 0.05em
- **Body**: System UI fallback
  - Clean, readable for content

#### Font Sizes
- **H1**: 2.5rem (40px) - Hero titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Subsections
- **H4**: 1.25rem (20px) - Card titles
- **Body**: 1rem (16px) - Standard text
- **Small**: 0.875rem (14px) - Captions

### Visual Effects

#### Glow Effects
\`\`\`css
.apex-glow - Standard neon glow (20px blur, 0.5 opacity)
.apex-glow-strong - Intense glow (30-120px blur, 0.7 opacity)
.apex-glow-subtle - Subtle glow (10px blur, 0.3 opacity)
\`\`\`

#### Holographic Effects
\`\`\`css
.holographic - Glass-like with animated shine
.neon-border - Glowing cyan border
.neon-text - Text with neon glow
.neon-text-strong - Intense text glow
\`\`\`

#### Background Patterns
\`\`\`css
.grid-pattern - Subtle cyan grid (50px spacing)
.grid-pattern-dense - Dense grid (20px spacing)
.circuit-pattern - Circuit board aesthetic
.scanlines - Retro CRT scanline effect
\`\`\`

#### Gradients
\`\`\`css
.neon-gradient - Linear gradient (deep blue to cyan)
.neon-gradient-radial - Radial gradient (cyan center)
.gradient-apex - Multi-stop gradient
.gradient-mesh - Mesh gradient with multiple radial gradients
\`\`\`

### Components

#### Holographic Orb
- Animated 3D-style orb with glow
- Customizable size, color, intensity
- Rotating particles
- Use for: Loading states, feature highlights, decorative elements

#### Glass Cards
\`\`\`css
.glass-effect - Semi-transparent with blur
.glass-effect-strong - More opaque with stronger blur
\`\`\`

### Animations

#### Standard Animations
- `animate-glow` - Pulsing glow effect (2s)
- `animate-float` - Floating motion (3s)
- `animate-pulse-ring` - Pulsing scale (2s)
- `animate-shimmer` - Shimmer effect (3s)

#### Custom Animations
- `holographic-shine` - Diagonal shine sweep (3s)
- `particle-float` - Particle floating motion (8s)
- `glow-pulse` - Complex glow pulse (3s)
- `tour-pulse` - Highlight pulse for tours (2s)

### Layout Principles

#### Spacing Scale
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

#### Border Radius
- **sm**: 0.5rem (8px)
- **md**: 0.75rem (12px)
- **lg**: 1rem (16px)
- **xl**: 1.5rem (24px)
- **full**: 9999px (circles)

### Accessibility

#### Contrast Ratios
- Primary text on background: 12:1 (AAA)
- Secondary text on background: 7:1 (AA)
- Interactive elements: Minimum 3:1

#### Focus States
- All interactive elements have visible focus rings
- Focus ring color: `#00FFFF` (cyan)
- Focus ring width: 2px

### Usage Guidelines

#### Do's
✓ Use neon cyan (#00FFFF) for primary actions and highlights
✓ Apply glow effects to important interactive elements
✓ Use Orbitron font for headings to maintain cyber aesthetic
✓ Combine glass effects with subtle borders for depth
✓ Use holographic orbs for loading states and feature highlights

#### Don'ts
✗ Don't overuse glow effects (causes visual fatigue)
✗ Don't use more than 3 different glow intensities on one screen
✗ Don't apply neon effects to body text (readability issues)
✗ Don't mix warm colors with the cyan theme
✗ Don't use Orbitron for body text (readability)

### Implementation Examples

#### Hero Section
\`\`\`tsx
<div className="neon-gradient p-8 rounded-lg apex-glow">
  <h1 className="neon-text-strong font-orbitron">Welcome to Apex AI</h1>
  <HolographicOrb size={120} intensity="high" />
</div>
\`\`\`

#### Card Component
\`\`\`tsx
<div className="glass-effect p-6 rounded-lg neon-border hover-glow transition-glow">
  <h3 className="neon-text">Feature Title</h3>
  <p className="text-apex-gray">Description text</p>
</div>
\`\`\`

#### Button Component
\`\`\`tsx
<button className="bg-apex-primary text-apex-dark px-6 py-3 rounded-lg apex-glow hover:apex-glow-strong transition-glow">
  Action Button
</button>
\`\`\`

### Performance Considerations

- Glow effects use CSS box-shadow (GPU accelerated)
- Animations use transform and opacity (GPU accelerated)
- Backdrop filters limited to glass effects only
- Particle animations use CSS transforms for 60fps
- Holographic effects use pseudo-elements to minimize DOM nodes

### Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Graceful degradation for older browsers (no glow effects)
- Fallback fonts for Orbitron (system-ui, sans-serif)
