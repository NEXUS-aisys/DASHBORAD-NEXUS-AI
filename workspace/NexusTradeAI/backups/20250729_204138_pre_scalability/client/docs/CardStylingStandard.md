# Card Styling Standard

This document outlines the standard styling for "cards" used throughout the Nexus AI Trading System frontend, primarily defined by the `.professional-card` class in `App.css`.

## Base Styles

The `.professional-card` class provides the foundational look for all cards:

-   **Background**: `var(--bg-secondary)` (A variable representing a secondary background color, likely a darker shade in dark mode and lighter in light mode).
-   **Padding**: Varies based on screen size:
    -   Default: `1.5rem` (from `Dashboard.jsx` and implied general usage)
    -   Smaller screens: `1rem`
    -   Medium screens: `2rem`
    -   Larger screens: `2.5rem`
-   **Border**: `1px solid #ccc;` (A light grey border). For high-DPI screens, this reduces to `0.5px`.
-   **Border Radius**: Implied `rounded-lg` from TailwindCSS classes used in `Dashboard.jsx`, typically `0.5rem` (8px).

## Shadows (Box-Shadow)

### Default (Light Mode)

The default `box-shadow` is not explicitly defined in the provided `App.css` snippets for the `.professional-card` itself, but it's implied to be subtle or non-existent, making the hover effect more prominent.

### Hover State

When a user hovers over a card, the `box-shadow` changes to:

-   `0 4px 16px rgba(0, 0, 0, 0.15);`

This creates a noticeable lift and depth effect, drawing attention to the interactive element.

### Dark Mode

For elements within `body.dark`, the `.professional-card` adopts a more pronounced shadow:

-   **Standard Dark Mode Shadow**: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);`
-   **Large Screens (min-width: 1920px) in Dark Mode**: The shadow becomes even more prominent:
    -   `0 8px 25px -5px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);`

## Animations

-   **Fade-in Effect**: Many cards utilize a `fade-in` class, often with an `animationDelay` based on their index. This suggests a subtle entrance animation upon component rendering. The CSS for `fade-in` was not provided in the `App.css` snippet, but its usage implies its presence.

## Usage in Components

Components should apply the `professional-card` class to their main container element when they are intended to function as distinct information blocks or interactive elements. Additional TailwindCSS classes can be used for responsive padding, flexbox/grid layouts within the card, and specific content styling (e.g., `text-heading`, `text-body`, `text-subheading`).

### Example from `Dashboard.jsx`:

```jsx
<div className="professional-card fade-in" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
  {/* Card content */}
</div>
```

This standard ensures a consistent look and feel for cards across the application, enhancing user experience and maintainability.