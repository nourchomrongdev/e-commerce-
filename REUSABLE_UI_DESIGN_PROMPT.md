# Reusable UI Design Prompt

Copy and adapt the prompt below for another project.

```text
Design and implement a polished, production-ready interface for [PRODUCT NAME], a [PRODUCT TYPE] used by [TARGET USERS]. Build the actual working experience first, not a marketing landing page.

## Visual Direction

Create a bright, trustworthy, modern product UI with a warm orange action color and cool navy text. The overall feeling should be organized, premium, practical, and easy to scan. Use a pale lavender-white page background, white content surfaces, restrained borders, soft shadows, and compact rounded controls. Avoid generic purple gradients, excessive glassmorphism, oversized hero sections, and decorative clutter.

Use this color system as a starting point and adjust only when the product domain requires it:

- Page background: #F8F8FF
- Primary action: #F57E1F
- Primary hover: #E57218
- Secondary orange: #FF9248
- Light orange surface: #FFF0E4
- Soft orange border/surface: #FFD7B5
- Heading/ink: #101A3C
- Strong body text: #172141
- Body text: #283554
- Muted text: #66718E
- Faint text: #8993AA
- Border: #E8EAF2
- Divider: #EDF0F5
- Muted surface: #FCFCFE
- Success: #059669 with #ECFDF5 surface
- Warning: #D97706 with #FFFBEB surface
- Danger: #DC2626 with #FEF2F2 surface
- Informational blue: #2563EB with #EFF6FF surface

Define these as design tokens or CSS variables. Do not scatter raw colors throughout the code.

## Typography

Use a clean, readable sans-serif with distinct weights for hierarchy. Use:

- Page titles: bold, compact, high contrast
- Section headings: semibold or bold
- Body copy: comfortable line height and medium contrast
- Metadata, labels, and table headers: small, muted, and clearly secondary
- Buttons: medium or semibold with concise labels

Keep letter spacing at normal values. Do not use tiny text for essential content. Make the typography hierarchy obvious without relying on huge text.

## Layout

- Use a responsive max-width content container with comfortable horizontal padding.
- Keep the primary navigation fixed or sticky when useful, with a subtle bottom border and backdrop blur.
- Desktop navigation should expose the main destinations, search, important actions, and account controls.
- On smaller screens, replace the full navigation with a compact header, menu drawer, and mobile-friendly search.
- Use CSS grid for dashboards, product lists, summaries, and two-column detail pages.
- Collapse columns progressively at tablet and mobile breakpoints.
- Keep tables horizontally scrollable on small screens instead of shrinking content until it becomes unreadable.
- Use consistent spacing based on a small scale such as 4, 8, 12, 16, 20, and 24 pixels.
- Keep controls and cards at stable dimensions so loading states, long labels, and hover states do not shift the layout.

## Surfaces and Components

Use white surfaces for focused content areas. Cards are for repeated items, summaries, dialogs, and genuinely framed tools; do not put cards inside cards without a clear reason.

Create consistent styles for:

- Primary, secondary, ghost, danger, and icon-only buttons
- Text inputs, selects, search fields, textareas, and validation states
- Status badges for neutral, primary, success, warning, and danger states
- Product or content cards with image/preview, title, category, rating, price, and actions
- Data tables with clear headers, row hover states, pagination, and empty states
- Dashboard summary cards with an icon, label, value, and supporting trend/detail
- Tabs and segmented controls for switching views
- Dropdown menus, account menus, filter panels, dialogs, and toast notifications
- Loading, empty, error, disabled, and success states for every important workflow

Use familiar icons from the project's installed icon library. Icon-only buttons must have accessible labels and tooltips when the meaning is not obvious. Use text plus an icon for clear commands such as Add, Download, Edit, Save, and Filter.

## Interaction and Motion

- Add subtle transitions for color, border, shadow, opacity, and small positional changes.
- Use a restrained page-load or staggered reveal animation for major sections.
- Animate menus, drawers, dialogs, loading indicators, and route changes so state changes are easy to follow.
- Respect prefers-reduced-motion.
- Provide visible keyboard focus states and close overlays with Escape.
- Close menus when appropriate after navigation or outside interaction.
- Never make motion necessary to understand content or complete a task.

## Accessibility and UX

- Use semantic HTML and a logical heading hierarchy.
- Every form control needs a visible label or an accessible name.
- Maintain sufficient color contrast for text, borders, focus rings, and status states.
- Do not use color alone to communicate status.
- Make touch targets at least 40px where practical.
- Support keyboard navigation through menus, dialogs, tabs, forms, and tables.
- Provide useful empty, loading, error, and confirmation feedback.
- Keep important actions visually clear without making every element compete for attention.

## Content and Data

Use realistic domain-specific sample data for [PRODUCT DOMAIN]. Avoid lorem ipsum and repetitive placeholder labels. Include enough variation to demonstrate long titles, missing images, different statuses, empty results, validation errors, and mobile layouts.

## Implementation Rules

- Preserve the existing framework, routing, component conventions, and design system when working in an existing codebase.
- Prefer reusable components and shared tokens over duplicated styles.
- Keep business logic separate from presentation where appropriate.
- Do not add dependencies unless they provide clear value and are compatible with the project.
- Use real images or relevant generated bitmap assets when the interface needs visual media; do not use decorative SVG artwork as a substitute for meaningful product imagery.
- Keep page sections full-width or unframed when they are structural. Use framed cards only for focused content or repeated items.
- Make the interface usable at 320px mobile width, tablet width, and wide desktop width.

## Required Delivery

Implement the main screen and its core workflow. Include responsive desktop and mobile states, realistic data, working interactions, loading and empty states, accessible labels, and visible feedback for user actions. Before finishing, verify the interface with a production build or typecheck/lint command and test the main workflow at mobile and desktop widths.

Before coding, briefly state:
1. The chosen visual direction and why it fits [TARGET USERS].
2. The page structure and responsive breakpoints.
3. The component and token plan.

Then implement the experience rather than stopping at a design description.
```

## Quick Customization

Replace these placeholders before using the prompt:

- `[PRODUCT NAME]` with the app or website name
- `[PRODUCT TYPE]` with the kind of product, such as CRM, marketplace, or education platform
- `[TARGET USERS]` with the primary audience
- `[PRODUCT DOMAIN]` with the subject matter used for realistic sample data

For a different brand, keep the structure and replace the color tokens, typography direction, and visual mood while preserving the accessibility and responsive requirements.