---
name: Financial Habit & Wealth System
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006e24'
  primary: '#006e24'
  on-primary: '#ffffff'
  primary-container: '#00bc44'
  on-primary-container: '#004313'
  inverse-primary: '#31e45c'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6dff80'
  primary-fixed-dim: '#31e45c'
  on-primary-fixed: '#002106'
  on-primary-fixed-variant: '#005319'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  '0': 0px
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '8': 48px
  '10': 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is engineered for a premium fintech experience that balances high-stakes wealth management with the gentle encouragement of habit building. The brand personality is **Professional, Trustworthy, and Calm**, avoiding the aggressive "hacker" aesthetics of crypto or the sterile coldness of traditional banking.

The visual direction follows a **Corporate / Modern** style with a focus on high-end editorial clarity. It utilizes a warm neutral base to reduce eye strain and foster a sense of security. The aesthetic relies on precise execution of whitespace, subtle tonal shifts, and clear functional color coding to guide users toward positive financial behaviors without inducing anxiety.

## Colors

The color palette is grounded in a warm, off-white background to provide a more approachable "paper-like" feel than pure white. 

- **Primary (Growth):** A vibrant, high-fidelity Spring Green (`#2ee25b`) is used for wealth growth, success states, and primary actions. It symbolizes fresh financial energy and active prosperity.
- **Secondary (Accents):** Indigo/Blue (`#6366f1`) is reserved for data visualization, interactive secondary elements, and "Info" states to differentiate neutral data from directional growth.
- **Semantic Colors:** Coral/Red is strictly for expenses, deficits, or critical errors. Amber is used for reminders, pending tasks, or "behind schedule" habit states.
- **Typography:** Use Deep Navy/Slate for all primary text to ensure high contrast and a professional, authoritative tone.

## Typography

The system utilizes **Inter** across all levels to maintain a systematic and utilitarian feel. 

- **Headlines:** Use tight letter spacing (-0.01em to -0.02em) for larger sizes to create a modern, high-end look.
- **Numerical Data:** While using Inter, ensure `font-variant-numeric: tabular-nums` is applied to all balance displays and data tables to maintain vertical alignment in financial growth tracking.
- **Labels:** Use small, semi-bold, uppercase labels for categories and secondary metadata to create a clear visual distinction from body copy.

## Layout & Spacing

The layout is built on a consistent **8px scale**, ensuring mathematical harmony across all components.

- **Grid:** Use a 12-column fluid grid for desktop and a 4-column grid for mobile. 
- **Rhythm:** Utilize `spacing-4` (16px) for standard internal card padding and `spacing-6` (32px) for vertical section gaps.
- **Safe Areas:** On mobile, maintain a minimum `margin-mobile` (16px) from the screen edges. For wealth dashboards, use wider horizontal margins on desktop to prevent data lines from feeling over-extended.

## Elevation & Depth

This design system uses a **Tonal Layering** approach combined with soft, ambient shadows to establish hierarchy.

- **Surface Levels:** 
    - Level 0 (Background): Light warm neutral background.
    - Level 1 (Cards/Containers): `#FFFFFF`
- **Shadows:** Avoid harsh, black shadows. Use a "Soft Elevation" style: a multi-layered shadow with low opacity (4-6%) using the Text color as the base tint. 
- **Interactions:** Upon hover, elements should slightly increase their shadow spread rather than changing color significantly, mimicking a physical lift from the surface.
- **Borders:** Use subtle 1px borders for all cards to maintain definition on white backgrounds without relying solely on shadows.

## Shapes

The shape language is purposefully **Rounded**, evoking a sense of approachability and modern comfort.

- **Cards:** The primary container radius is `lg` (16px).
- **Secondary Elements:** Smaller components like input fields or nested buttons use `md` (8px).
- **Interactive Pill:** Use `full` for tags, chips, and specific "habit tracker" progress dots to emphasize their status as "objects" that can be completed.

## Components

### Buttons
- **Primary:** Background `#2ee25b`, Text dark neutral, Radius `md`. High-visibility for "Grow" or "Save" actions.
- **Secondary:** Background `#FFFFFF`, Border 1px, Text dark neutral.
- **Tertiary/Ghost:** No background, Text muted neutral. Used for less frequent actions like "Cancel" or "View Details".

### Cards & Habit Trackers
- **Standard Card:** White background, `lg` radius, 1px border, and a soft shadow.
- **Habit Progress:** Use a series of 8px circles. "Completed" habit dots use the Primary color; "Missed" dots use a subtle light fill.

### Input Fields
- **Default:** White background, `md` radius, 1px border. 
- **Focus State:** 2px border `#6366F1` with a 4px soft outer glow of the same color (20% opacity).

### Chips & Badges
- **Status Badges:** Low-saturation backgrounds with high-saturation text. This ensures accessibility while maintaining the palette.

### Data Visualization
- **Line Charts:** Use a 3px stroke width for the primary growth line. The area under the curve should have a subtle gradient from the Primary color (10% opacity) to transparent.