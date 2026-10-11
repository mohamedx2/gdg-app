---
name: GDG Bold Campus Hub
colors:
  surface: '#f9f9ff'
  surface-dim: '#d9d9e1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fa'
  surface-container: '#ededf5'
  surface-container-high: '#e8e7ef'
  surface-container-highest: '#e2e2e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#424654'
  inverse-surface: '#2e3036'
  inverse-on-surface: '#f0f0f7'
  outline: '#737785'
  outline-variant: '#c3c6d6'
  surface-tint: '#0457ce'
  primary: '#0047ae'
  on-primary: '#ffffff'
  primary-container: '#1a5fd6'
  on-primary-container: '#dde4ff'
  inverse-primary: '#b1c5ff'
  secondary: '#006d31'
  on-secondary: '#ffffff'
  secondary-container: '#95f4a6'
  on-secondary-container: '#017233'
  tertiary: '#654900'
  on-tertiary: '#ffffff'
  tertiary-container: '#836000'
  on-tertiary-container: '#ffe1a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419f'
  secondary-fixed: '#98f7a9'
  secondary-fixed-dim: '#7cda8f'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#fbbc05'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#f9f9ff'
  on-background: '#1a1b21'
  surface-variant: '#e2e2e9'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses the collegiate spirit, technical rigor, and creative momentum of the student developer community in Sousse, Tunisia. Blending Google’s energetic design heritage with an editorial, tactile foundation, the visual style combines warm paper-like surfaces with punchy, high-contrast typography and precise technical accents. 

The aesthetic marries **Modern Editorial** clarity with **Technical Precision**:
- **Warm Paper Base**: Replaces sterile digital white with a welcoming, tangible campus feel.
- **Editorial Typography**: Punchy headlines paired with monospaced data structures to celebrate student achievements, code milestones, and event schedules.
- **Google Signature Vibrancy**: Strategic, restrained bursts of primary pigments across actions, tags, and gamified XP elements that prevent interface fatigue while maintaining unmistakable brand identity.

## Colors

The palette balances clean accessibility with developer-focused vibrancy. Surfaces rely on organic warmth, while interactions invoke deliberate, saturated focal points.

### Palette Architecture
- **Surfaces & Grounds**:
  - Base Canvas: `#FAFAF7` (Warm Paper)
  - Card Containers: `#FFFFFF` (Pure Surface)
  - Hairline Borders: `#D9D8D0` (Structural Dividers)
  - Subtle Tint Borders: `#EBEAE5` (Card Outlines)
- **Content Hierarchy**:
  - High Emphasis: `#111318` (Near-Black Ink)
  - Medium Emphasis: `#4A4D57` (Secondary Slate)
  - Low Emphasis: `#7A7D87` (Captions, Placeholders)
- **Functional & Brand Accents**:
  - Primary Action: `#1A5FD6` (Google Blue)
  - Success / Growth: `#137A3A` (Google Green)
  - Warning / Spotlight Container: `#FFF1C2` (Warm Gold Container) with `#B06000` text
  - Critical / Error: `#C5221F` (Alert Red)
- **Google Signature 4-Color Accents**:
  - Red: `#EA4335`, Blue: `#4285F4`, Yellow: `#FBBC04`, Green: `#34A853` (reserved for dots, micro-badges, and live indicator states).
- **Surface Gradients**:
  - Hero Highlight: Linear 135deg from `#1A5FD6` to `#6C5CE7` with 20% opacity ambient radial glow.
  - XP / Level Aura: Radiant multi-stop linear gradient across `#1A5FD6`, `#8E44AD`, `#F39C12`, and `#27AE60` for milestone containers.

## Typography

Typography bridges editorial authority and terminal efficiency:

- **Headlines (`Plus Jakarta Sans`)**: Configured with bold weights and tight negative tracking (`-0.02em` to `-0.03em`) to create high-impact, geometric titles reminiscent of modern tech broadsheets.
- **Body Text (`Inter`)**: Serves as the functional reading engine, maximizing screen legibility across dense announcements, workshop descriptions, and forum feeds.
- **Technical Readouts (`JetBrains Mono`)**: Explicitly assigned to all numbers, dates, XP tallies, tags, badge indicators, and leaderboard ranks. Uppercase styling is standard for `label-code-sm` to enforce a clean, monospaced tag hierarchy.

## Layout & Spacing

The layout is built mobile-first, engineered around a reference **375pt viewport** before expanding into responsive fluid grids on wider viewports.

### Mobile Grid & Viewport Anchoring
- **Gutters & Canvas Margins**: Set to `16px` (`1rem`) on mobile to preserve readable horizontal space.
- **Rhythm & Bottom Clearance**: Generous vertical rhythm utilizing `space-lg` (`24px`) between distinct module cards. All mobile scroll containers must maintain an `88px` bottom padding buffer to prevent the floating navigation pill and quick-action bar from obscuring terminal content.

### Tablet and Desktop Scaling
- **Tablet (600px - 1023px)**: 8-column layout with `24px` gutters and `32px` margins.
- **Desktop (1024px+)**: 12-column fixed-max layout (`1200px` max content container) centered within generous canvas margins (`48px`).

## Elevation & Depth

Visual hierarchy combines warm tonal separation with crisp outlines and diffused ambient light:

- **Surface Container (Base Level)**: Flat `#FFFFFF` rested over `#FAFAF7`, reinforced with a structural `1px solid #EBEAE5` border. No shadow is applied at rest, grounding components into the paper background.
- **Raised Elements (Cards, Modules)**:
  - Border: `1px solid #EBEAE5`
  - Shadow: `0px 2px 4px rgba(17, 19, 24, 0.02), 0px 8px 16px rgba(17, 19, 24, 0.04)`
- **Floating Overlays (Command Pill, Space Switcher, Menus)**:
  - Surface: Translucent `#FFFFFF` (92% opacity) with `backdrop-filter: blur(16px)`
  - Border: `1px solid rgba(217, 216, 208, 0.7)`
  - Shadow: `0px 12px 32px -4px rgba(17, 19, 24, 0.12), 0px 4px 8px -2px rgba(17, 19, 24, 0.04)`
- **Atmospheric Glows**: XP and Level badges utilize a soft rear ambient halo (`box-shadow: 0px 0px 24px rgba(108, 92, 231, 0.25)`).

## Shapes

The geometric taxonomy balances soft interaction surfaces with architectural cards:

- **Cards & Modules**: 14px to 16px corner radius (`rounded-lg`), establishing clear structural grouping without appearing overly playful.
- **Buttons, Form Inputs, & Segment Controls**: 8px to 10px corner radius (`rounded-md`), providing a calibrated, firm touch target.
- **Pills, Badges, & Floating Bars**: Fully rounded `9999px` geometry (`rounded-full`) for all transient controls, status indicators, XP counters, and the bottom space switcher.

## Components

### Buttons
- **Primary Action**: Height 44px (mobile touch baseline). Background `#1A5FD6`, text `#FFFFFF`, border-radius 10px. Font `Plus Jakarta Sans` semi-bold 14px. On press: `#154cb0`.
- **Secondary / Ghost**: Height 44px. Background transparent, border `1px solid #D9D8D0`, text `#111318`. Hover background `#F0EFEA`.
- **XP / Action Trigger**: Height 36px. Border-radius 9999px. Monospace text (`JetBrains Mono`, 12px), padded horizontally by 14px.

### Chips & Badges
- **Status Pills**: Fully rounded (`9999px`). Padded 4px vertical, 10px horizontal. Uses `JetBrains Mono` 10px / 12px uppercase.
  - Active: Background `rgba(19, 122, 58, 0.1)`, text `#137A3A`, left dot `#34A853`.
  - Gold Spotlight: Background `#FFF1C2`, text `#8A4B00`.
- **Category Filter Chips**: Height 32px, `rounded-full`, border `1px solid #D9D8D0`, background `#FFFFFF`. Active state uses `#111318` background with `#FFFFFF` text.

### Cards
- **Standard Community Card**: Background `#FFFFFF`, radius 16px, border `1px solid #EBEAE5`, padding `16px`. Elevation uses raised ambient shadow.
- **XP / Gamified Hero Card**: Background `#111318` overlaid with the multi-hue aurora gradient (`#1A5FD6`, `#8E44AD`, `#F39C12`, `#27AE60`) at 85% opacity, text `#FFFFFF`, radius 16px.

### Form Inputs & Checkboxes
- **Input Fields**: Height 44px, radius 8px, background `#FFFFFF`, border `1px solid #D9D8D0`. Typography `Inter` 14px text, `#4A4D57` placeholder. Focus ring: `2px solid #1A5FD6` with zero offset.
- **Checkboxes & Radio Controls**: 18px box with 4px corner radius (checkbox) or circular (radio). Unchecked: `1.5px solid #D9D8D0`. Checked: `#1A5FD6` fill with white glyph check.

### Specialized Navigation: Floating Space Switcher & Command Pill
- **Dock Container**: Floating segmented bar centered at the viewport base. Height 52px, radius 9999px, frosted background (`rgba(255, 255, 255, 0.94)` with `16px` backdrop-blur), border `1px solid #D9D8D0`.
- **Segments**: Four items (`TODAY`, `EXPLORE`, `ARENA`, `VOICE`). Monospaced label (`JetBrains Mono` 11px semi-bold). Active segment highlighted with an internal pill indicator (`#111318` background, `#FFFFFF` text, radius 9999px).