# AgentDesk Design Guide - Cyber-AI Dark Theme

## Color Palette

### Primary Colors (Turquoise Glow)
- **Primary 50**: `#E6FFFC` - Very light turquoise
- **Primary 100**: `#CCFFF9` - Light turquoise
- **Primary 200**: `#99FFF3` - Soft turquoise
- **Primary 400**: `#33FFE7` - Glowing turquoise
- **Primary 500**: `#00E0C6` - Main turquoise (DEFAULT)
- **Primary 600**: `#00B39E` - Accent turquoise
- **Primary 700**: `#008677` - Darker turquoise

### Secondary Colors
- **Secondary**: `#00E0C6` - Turquoise (accent)
- **Secondary Light**: `#33FFE7` - Light turquoise glow
- **Secondary Dark**: `#00B39E` - Dark turquoise

### Dark Colors
- **Dark**: `#0D0D0D` - Main dark background
- **Dark-50**: `#1A1A1A` - Secondary dark background
- **Dark-100**: `#262626` - Tertiary dark background
- **Dark-800**: `#B0B0B0` - Secondary text (gray)
- **White**: `#FFFFFF` - Main text

## Typography

### Fonts
- **Headings**: Poppins (weights: 300, 400, 500, 600, 700)
- **Body**: Inter (weights: 300, 400, 500, 600, 700)

### Usage
```tsx
// Headings (h1-h6) automatically use Poppins - no need for extra classes
<h1>Heading Text</h1>
<h2>Subheading</h2>

// Body text uses Inter by default
<p>Body text content</p>

// For dark text color use text-gray-900
<p className="text-gray-900">Dark body text</p>
```

## Design Elements

### Buttons
- **Shape**: Rounded-full (pill shape)
- **Primary Button**: Gradient from turquoise with glow effect
- **Hover**: shadow-glow-lg effect
- **Example**:
```tsx
<Button className="bg-gradient-cyan hover:shadow-glow-lg rounded-full text-dark">
  Click Me
</Button>
```

### Cards
- **Corners**: rounded-3xl or rounded-2xl
- **Shadow**: shadow-glow for glowing effect
- **Border**: border-primary/20 for subtle turquoise outline
- **Background**: bg-dark-50 for dark card background

### Animations

#### Available Animations
- `animate-fade-in` - Fade in with slight upward movement (0.8s)
- `animate-slide-up` - Slide up with fade (0.8s)
- `animate-float` - Gentle floating effect (3s infinite)

#### Animation Delays
- `delay-100` - 100ms delay
- `delay-200` - 200ms delay
- `delay-300` - 300ms delay
- `delay-400` - 400ms delay

#### Usage Example
```tsx
<div className="animate-fade-in delay-200">
  Content appears with delay
</div>
```

### Shadows & Glow Effects
- `shadow-soft` - Subtle turquoise-tinted shadow
- `shadow-soft-lg` - Larger turquoise-tinted shadow
- `shadow-glow` - Turquoise glow effect for emphasis
- `shadow-glow-lg` - Larger turquoise glow for hover effects
- `text-glow` - Turquoise text glow for headlines

### Gradients
- `bg-gradient-dark` - Dark gradient (#0D0D0D to #1A1A1A)
- `bg-gradient-dark-reverse` - Reverse dark gradient
- `bg-gradient-cyan` - Turquoise gradient for buttons

### Hover Effects
```tsx
// Card with lift effect
<div className="hover-lift">
  Card content
</div>

// Button with smooth transition
<button className="transition-smooth hover:shadow-soft-lg">
  Hover Me
</button>
```

## Spacing & Layout

### Principles
- **Generous padding**: Use py-24 (96px) for sections
- **White space**: Plenty of breathing room between elements
- **Max width**: Use max-w-2xl, max-w-3xl for content containers
- **Grid gaps**: gap-8 or gap-12 for layouts

### Container Sizes
```tsx
<div className="container mx-auto px-6">
  // Main content area with consistent padding
</div>
```

## Component Guidelines

### Header
- Sticky positioning with backdrop blur
- Dark background with turquoise glow border
- Rounded buttons with turquoise gradient
- Turquoise text glow on logo

### Hero Section
- Large, bold typography (text-5xl to text-7xl)
- Dark gradient background (bg-gradient-dark)
- Floating turquoise glow decoration elements
- Two-column layout on desktop

### Feature Cards
- Rounded icons with turquoise gradient backgrounds
- Glow shadows and turquoise borders
- Hover lift effect with enhanced glow
- Staggered animations
- Dark card backgrounds

### Footer
- Dark design with turquoise social icons
- Rounded icon containers with glow shadows
- Organized grid layout
- Turquoise hover effects

## RTL Support

The design includes full Hebrew (RTL) support. To enable:
```tsx
<div dir="rtl">
  // Hebrew content
</div>
```

## Chat Widget

The floating chat widget:
- Fixed positioning (bottom-right)
- Turquoise gradient background with glow effect
- Pulse animation for online indicator
- Glow shadow with hover scale effect

## Best Practices

1. **Always use rounded corners** - rounded-full for buttons, rounded-2xl/3xl for cards
2. **Apply smooth transitions** - Use transition-smooth class
3. **Add animations** - Use animate-fade-in for content reveals
4. **Use glow effects** - Turquoise glow for emphasis and depth
5. **Generous spacing** - Don't be afraid of dark space
6. **Glow shadows** - Use shadow-glow variants for depth
7. **Turquoise accents** - Use primary colors for interactive elements
8. **High contrast** - White text on dark backgrounds
9. **Dark backgrounds** - Use bg-dark and bg-dark-50 for sections

## Responsive Design

- Mobile-first approach
- Grid columns adjust: `md:grid-cols-2`, `md:grid-cols-3`
- Flexible spacing: `py-12` on mobile, `py-24` on desktop
- Stack layouts vertically on mobile

## Examples

### Feature Card
```tsx
<div className="p-8 rounded-3xl bg-dark-50 hover-lift border border-primary/20 shadow-glow">
  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyan text-dark mb-6 shadow-glow">
    <Icon className="h-10 w-10" />
  </div>
  <h3 className="text-2xl font-semibold mb-3 text-white">Feature Title</h3>
  <p className="text-dark-800">Feature description</p>
</div>
```

### CTA Button
```tsx
<Button className="bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full px-8 py-6 text-dark font-semibold group">
  Get Started
  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
</Button>
```

### Glowing Heading
```tsx
<h1 className="text-5xl font-bold text-white">
  Your Headline
  <br />
  <span className="text-primary text-glow">
    With Glow Effect
  </span>
</h1>
```

---

*This design system creates a futuristic, high-tech Cyber-AI aesthetic with dark backgrounds, turquoise glow effects, and high contrast for a modern, professional look that stands out.*

