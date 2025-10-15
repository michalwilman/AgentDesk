# AgentDesk Design Guide

## Color Palette

### Primary Colors (Soft Pink)
- **Primary 50**: `#FFF5F9` - Very light pink (backgrounds)
- **Primary 100**: `#FFE8F1` - Light pink
- **Primary 200**: `#FFD6E7` - Soft pink
- **Primary 400**: `#FFB6D9` - Main soft pink (DEFAULT)
- **Primary 600**: `#FF69B4` - Accent pink
- **Primary 700**: `#E6539E` - Darker pink

### Secondary Colors
- **Secondary**: `#FF69B4` - Hot pink (accent)
- **Secondary Light**: `#FF8DC7`
- **Secondary Dark**: `#E6539E`

### Neutral Colors
- **Gray-900**: `#111827` - For main text (Tailwind default)
- **Gray-50**: `#F9FAFB` - Very light gray backgrounds
- **White**: `#FFFFFF` - Clean backgrounds

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
- **Primary Button**: Gradient from primary-600 to secondary
- **Hover**: shadow-soft-lg effect
- **Example**:
```tsx
<Button className="bg-gradient-to-r from-primary-600 to-secondary rounded-full">
  Click Me
</Button>
```

### Cards
- **Corners**: rounded-3xl or rounded-2xl
- **Shadow**: shadow-soft for subtle depth
- **Border**: border-primary-100 for soft outline
- **Background**: bg-gradient-pink for light pink gradient

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

### Shadows
- `shadow-soft` - Subtle pink-tinted shadow
- `shadow-soft-lg` - Larger pink-tinted shadow for hover effects

### Gradients
- `bg-gradient-pink` - White to light pink (135deg)
- `bg-gradient-pink-reverse` - Light pink to white (135deg)

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
- White background with pink tinted border
- Rounded buttons with gradient

### Hero Section
- Large, bold typography (text-5xl to text-7xl)
- Gradient background (bg-gradient-pink)
- Floating decoration elements
- Two-column layout on desktop

### Feature Cards
- Rounded icons with gradient backgrounds
- Soft shadows and borders
- Hover lift effect
- Staggered animations

### Footer
- Minimal design with social icons
- Rounded icon containers with shadows
- Organized grid layout

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
- Gradient background matching primary colors
- Pulse animation for online indicator
- Soft shadow with hover scale effect

## Best Practices

1. **Always use rounded corners** - rounded-full for buttons, rounded-2xl/3xl for cards
2. **Apply smooth transitions** - Use transition-smooth class
3. **Add animations** - Use animate-fade-in for content reveals
4. **Use gradients** - Pink gradients for visual interest
5. **Generous spacing** - Don't be afraid of white space
6. **Soft shadows** - Use shadow-soft variants for depth
7. **Pink accents** - Use primary colors for interactive elements

## Responsive Design

- Mobile-first approach
- Grid columns adjust: `md:grid-cols-2`, `md:grid-cols-3`
- Flexible spacing: `py-12` on mobile, `py-24` on desktop
- Stack layouts vertically on mobile

## Examples

### Feature Card
```tsx
<div className="p-8 rounded-3xl bg-gradient-pink hover-lift border border-primary-100">
  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary text-white mb-6 shadow-soft">
    <Icon className="h-10 w-10" />
  </div>
  <h3 className="text-2xl font-semibold mb-3">Feature Title</h3>
  <p className="text-gray-600">Feature description</p>
</div>
```

### CTA Button
```tsx
<Button className="bg-gradient-to-r from-primary-600 to-secondary hover:shadow-soft-lg transition-smooth rounded-full px-8 py-6 text-white font-semibold group">
  Get Started
  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
</Button>
```

---

*This design system creates a clean, feminine, modern aesthetic inspired by professional personal branding websites while maintaining a unique identity for AgentDesk.*

