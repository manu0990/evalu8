# @repo/ui

This package contains all the shadcn/ui components used throughout the evalu8 application.

## Available Components

### Form Components
- `Button` - Customizable button with multiple variants (default, destructive, outline, secondary, ghost, link)
- `Input` - Form input component

### Layout Components
- `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` - Card components for content containers
- `Separator` - Visual divider component

### Navigation Components
- `NavigationMenu` family - Navigation menu components
- `Sheet` family - Side drawer/sheet components for mobile menus

### Data Display Components
- `Badge` - Small status or label indicators
- `Accordion` family - Collapsible content sections

## Usage

```tsx
import { Button, Card, CardContent } from '@repo/ui';

function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Adding New Components

To add new shadcn components:

1. Navigate to `packages/ui`
2. Run `npx shadcn@latest add <component-name>`
3. Export the new component in `src/index.ts`
4. Update this README

## Landing Page Integration

The landing page components now use shadcn components for:

- **Header**: Uses `Button` for auth buttons and `Sheet` for mobile menu
- **Hero**: Uses `Button` for CTAs and `Badge` for feature highlights  
- **Features**: Uses `Card` and `CardContent` for feature cards
- **FAQ**: Uses `Accordion` components for collapsible questions
- **CTA**: Uses `Button` components for call-to-action buttons

This provides a consistent design system across the application with improved accessibility and user experience.