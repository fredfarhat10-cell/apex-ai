# Apex AI - Design System Documentation

## Overview
This document defines the visual language, interaction patterns, and design principles for the Apex AI Hierarchical Life Companion application.

---

## Design Principles

### 1. Clarity Over Cleverness
- Every UI element has a clear purpose
- Information hierarchy is immediately obvious
- Actions are explicit, never hidden

### 2. Efficiency Through Intelligence
- Reduce cognitive load with smart defaults
- Anticipate user needs proactively
- Minimize steps to complete tasks

### 3. Empowerment Through Transparency
- Show the "why" behind AI recommendations
- Give users control over automation
- Make data and insights accessible

### 4. Consistency Breeds Confidence
- Predictable patterns across all features
- Unified visual language
- Coherent voice and tone

---

## Color System

### Primary Palette (Neon Cyan Theme)
- **Apex Dark**: `#001F3F` - Primary background
- **Apex Primary**: `#00FFFF` - Primary actions, highlights
- **Apex Secondary**: `#00CCFF` - Secondary elements
- **Apex Accent**: `#0099FF` - Tertiary accents
- **Apex Purple**: `#9966FF` - Special highlights
- **Apex Gray**: `#66D9EF` - Muted text

### Semantic Colors
- **Success**: `#22C55E` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Info**: `#3B82F6` (Blue)

### Usage Guidelines
- Use Apex Primary for primary CTAs and key information
- Use Apex Secondary for secondary actions and supporting elements
- Use Apex Accent sparingly for special highlights
- Maintain 4.5:1 contrast ratio for text (WCAG AA)
- Use semantic colors consistently for status indicators

---

## Typography

### Font Families
- **Headings**: Orbitron (700 weight, 0.05em letter-spacing)
- **Body**: System UI stack (Inter, SF Pro, Segoe UI)
- **Monospace**: JetBrains Mono (for code, data)

### Type Scale
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Subsection headers
- **H4**: 1.25rem (20px) - Card titles
- **Body**: 1rem (16px) - Default text
- **Small**: 0.875rem (14px) - Supporting text
- **Tiny**: 0.75rem (12px) - Captions, labels

### Line Height
- **Headings**: 1.2
- **Body**: 1.6 (leading-relaxed)
- **Compact**: 1.4 (for dense data)

---

## Spacing System

### Base Unit: 4px
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

### Component Spacing
- **Card padding**: 1.5rem (24px)
- **Section gap**: 2rem (32px)
- **Element gap**: 1rem (16px)
- **Button padding**: 0.75rem 1.5rem (12px 24px)

---

## Component Patterns

### Cards
\`\`\`tsx
<Card className="glass-effect hover-lift-card transition-apex">
  <CardHeader>
    <CardTitle className="neon-text">Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
\`\`\`

**Variants:**
- **Default**: Glass effect with subtle border
- **Highlighted**: Neon border with glow
- **Interactive**: Hover lift with glow effect

### Buttons
\`\`\`tsx
<Button className="btn-apex neon-edge ripple-effect">
  Action
</Button>
\`\`\`

**Variants:**
- **Primary**: Neon cyan background, dark text
- **Secondary**: Transparent with neon border
- **Ghost**: No background, hover glow
- **Destructive**: Red accent for dangerous actions

### Inputs
\`\`\`tsx
<Input className="glass-effect focus-ring neon-border" />
\`\`\`

**States:**
- **Default**: Glass effect with subtle border
- **Focus**: Neon glow ring animation
- **Error**: Red border with shake animation
- **Success**: Green border with pulse

### Badges
\`\`\`tsx
<Badge className="neon-edge">Status</Badge>
\`\`\`

**Variants:**
- **Default**: Subtle background
- **Success**: Green with glow
- **Warning**: Amber with glow
- **Error**: Red with glow
- **Info**: Blue with glow

---

## Animation Guidelines

### Timing Functions
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` - Most transitions
- **Apex Ease**: `cubic-bezier(0.2, 0.9, 0.2, 1)` - Smooth, natural
- **Bounce**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Playful

### Duration
- **Instant**: 100ms - Hover states
- **Fast**: 200ms - Simple transitions
- **Standard**: 300ms - Most animations
- **Slow**: 600ms - Complex animations
- **Very Slow**: 1000ms+ - Ambient effects

### Animation Principles
1. **Purpose**: Every animation serves a function
2. **Subtlety**: Animations enhance, never distract
3. **Performance**: Use transform and opacity for 60fps
4. **Accessibility**: Respect prefers-reduced-motion

### Common Animations
- **Fade In**: Opacity 0 → 1 (200ms)
- **Slide In**: TranslateY + Opacity (300ms)
- **Scale In**: Scale 0.95 → 1 + Opacity (300ms)
- **Glow Pulse**: Box-shadow animation (2s infinite)
- **Shimmer**: Background position animation (2s infinite)

---

## Interaction Patterns

### Hover States
- **Cards**: Lift 4px + glow increase
- **Buttons**: Glow increase + ripple effect
- **Links**: Underline + color shift
- **Icons**: Scale 1.1 + glow

### Active States
- **Buttons**: Scale 0.98 + glow decrease
- **Cards**: Lift 2px
- **Inputs**: Border glow increase

### Focus States
- **All interactive elements**: Neon ring animation
- **Keyboard navigation**: Clear focus indicators
- **Skip links**: Visible on focus

### Loading States
- **Skeleton**: Shimmer animation
- **Spinner**: Rotating neon ring
- **Progress**: Animated fill bar
- **Pulse**: Opacity animation

### Success States
- **Checkmark**: Stroke animation
- **Confetti**: Particle explosion
- **Glow**: Pulse animation
- **Toast**: Slide in notification

### Error States
- **Shake**: Horizontal shake animation
- **Red glow**: Error color pulse
- **Toast**: Slide in with error icon

---

## Layout Patterns

### Grid System
- **12-column grid** for complex layouts
- **Flexbox** for most component layouts
- **CSS Grid** for 2D layouts (dashboards, galleries)

### Responsive Breakpoints
- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablet
- **lg**: 1024px - Desktop
- **xl**: 1280px - Large desktop
- **2xl**: 1536px - Extra large

### Container Widths
- **Default**: max-w-7xl (1280px)
- **Narrow**: max-w-4xl (896px) - Reading content
- **Wide**: max-w-full - Dashboards
- **Sidebar**: 280px fixed

---

## Accessibility

### WCAG 2.1 AA Compliance
- **Color contrast**: Minimum 4.5:1 for text
- **Focus indicators**: Visible on all interactive elements
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Semantic HTML + ARIA labels
- **Motion**: Respect prefers-reduced-motion

### Best Practices
- Use semantic HTML elements
- Provide alt text for images
- Label all form inputs
- Use ARIA roles appropriately
- Test with screen readers
- Support keyboard-only navigation

---

## Voice & Tone

See `VOICE_PERSONALITY.md` for comprehensive voice guidelines.

### Core Traits
- **Intelligent**: Data-driven, precise
- **Empowering**: User-centric, enabling
- **Motivational**: Inspiring, action-oriented
- **Adaptive**: Context-aware, personalized

### Writing Guidelines
- Use active voice
- Be specific with numbers
- Keep sentences concise
- Focus on user benefits
- Avoid jargon

---

## Micro-Interactions

### Celebration
- **Trigger**: Goal completed, milestone reached
- **Effect**: Confetti + success pulse + toast
- **Duration**: 3 seconds

### Warning
- **Trigger**: Risk detected, action needed
- **Effect**: Shake + warning glow + toast
- **Duration**: Until dismissed

### Confirmation
- **Trigger**: Action completed
- **Effect**: Checkmark animation + success toast
- **Duration**: 2 seconds

### Loading
- **Trigger**: Async operation in progress
- **Effect**: Spinner or skeleton shimmer
- **Duration**: Until complete

---

## Implementation Checklist

### For Every New Component
- [ ] Uses design tokens from globals.css
- [ ] Follows spacing system (4px base)
- [ ] Includes hover/focus/active states
- [ ] Supports keyboard navigation
- [ ] Has proper ARIA labels
- [ ] Respects prefers-reduced-motion
- [ ] Uses semantic HTML
- [ ] Maintains 4.5:1 contrast ratio
- [ ] Includes loading/error states
- [ ] Follows voice personality guidelines

### For Every New Feature
- [ ] Consistent with existing patterns
- [ ] Includes micro-interactions
- [ ] Has proper error handling
- [ ] Provides user feedback
- [ ] Supports mobile/tablet/desktop
- [ ] Tested with keyboard only
- [ ] Tested with screen reader
- [ ] Follows animation guidelines
- [ ] Uses voice generator for messages
- [ ] Documented in design system

---

## Resources

- **Figma**: [Design System Library](#)
- **Storybook**: [Component Library](#)
- **Voice Guide**: `VOICE_PERSONALITY.md`
- **Edge Cases**: `EDGE_CASES.md`
- **Test Plan**: `TEST_PLAN.md`

---

## Changelog

### v1.0.0 - Initial Release
- Established core design principles
- Defined neon cyan color system
- Created typography scale
- Documented component patterns
- Added animation guidelines
- Defined interaction patterns
- Created accessibility standards
