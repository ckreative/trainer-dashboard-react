---
description: Ensure components meet WCAG 2.1 AA accessibility standards
---

# Accessibility Checker Subagent

Audit and improve accessibility (a11y) to ensure WCAG 2.1 AA compliance.

## Gap Addressed

- No current accessibility testing
- Forms need proper ARIA labels
- Tables need keyboard navigation
- Color contrast needs verification
- Screen reader compatibility unknown

**Impact**: 2-3 hours/week saved, production-ready accessibility

## When to Use

- After creating new UI components
- Before production deployment
- During code reviews
- When user reports a11y issues
- Regularly as part of QA

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements focusable with Tab
- [ ] Focus visible with clear outline
- [ ] Tab order is logical
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys work in lists/menus
- [ ] Enter/Space activates buttons/links

### Screen Readers
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] ARIA labels for icon buttons
- [ ] ARIA roles for custom components
- [ ] ARIA live regions for dynamic content
- [ ] Semantic HTML (nav, main, article, etc.)

### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Large text contrast ratio ≥ 3:1
- [ ] Focus indicators have ≥ 3:1 contrast
- [ ] Don't rely on color alone
- [ ] Dark mode maintains contrast

### Forms
- [ ] Labels associated with inputs
- [ ] Error messages announced
- [ ] Required fields marked
- [ ] Instructions clear
- [ ] Autocomplete attributes set

## shadcn/ui Accessibility Features

shadcn/ui components are built on Radix UI (excellent a11y):

```typescript
// Good - shadcn components have built-in a11y
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    {/* Auto-handles focus trap, Escape key, etc. */}
  </DialogContent>
</Dialog>

// Dropdowns handle keyboard nav automatically
<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* Arrow keys work automatically */}
  </DropdownMenuContent>
</DropdownMenu>
```

## Common Fixes

### 1. Add Alt Text
```typescript
// Before
<img src={url} />

// After
<img src={url} alt="User profile picture" />
<img src={decorative} alt="" /> // Empty alt for decorative
```

### 2. Label Form Fields
```typescript
// Before
<Input placeholder="Email" />

// After
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### 3. Icon Buttons Need Labels
```typescript
// Before
<Button><Trash /></Button>

// After
<Button aria-label="Delete post">
  <Trash />
</Button>
```

### 4. Focus Visible
```css
/* Ensure focus is visible */
.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 5. Skip to Main Content
```typescript
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border"
>
  Skip to main content
</a>
<main id="main">{/* Content */}</main>
```

## Testing Tools

### Browser DevTools
- Chrome: Lighthouse Accessibility audit
- Firefox: Accessibility Inspector
- Edge: Similar to Chrome

### Browser Extensions
- axe DevTools
- WAVE
- Accessibility Insights

### Command Line
```bash
npm install -D @axe-core/cli
npx axe http://localhost:5173
```

### Integration with ui-verify
```
"Use ui-verify with accessibility checks on the Posts page"
```

## Integration with Existing Skills

### With generate-component
```
"Generate UserCard component with full accessibility support"
```

### With ui-verify
```
"Verify dashboard accessibility with keyboard navigation"
```

## Success Metrics

- [ ] All Lighthouse a11y scores > 90
- [ ] Zero critical axe violations
- [ ] Keyboard navigation works everywhere
- [ ] Screen reader testing passes
- [ ] WCAG 2.1 AA compliant
