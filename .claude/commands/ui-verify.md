---
description: Verify UI changes visually using browser automation
---

# UI Verification Command

Comprehensive UI verification workflow using Chrome DevTools MCP to ensure visual correctness of changes.

This command provides an explicit, invocable version of the UI verification workflow defined in `.claude/CLAUDE.md`.

## When to Use This Command

Use this command when:
- Making UI changes, layout fixes, or visual improvements
- Implementing new components
- Modifying existing component styling
- Fixing responsive issues
- Adding new routes or pages
- After any CSS/Tailwind changes
- When user reports visual bugs

## Verification Workflow

### Step 1: Detect Port and Ensure Dev Server is Running

**IMPORTANT**: Use the `dev-server-manager` skill to automatically detect the correct port configuration.

Detect the configured port:

```bash
# Check vite.config.ts for port configuration
PORT=$(grep -A 5 "server:" vite.config.ts | grep "port:" | sed 's/[^0-9]//g')

# If not in config, check package.json
if [ -z "$PORT" ]; then
  PORT=$(grep '"dev"' package.json | grep -o -- '--port [0-9]*' | awk '{print $2}')
fi

# If still not found, check running processes
if [ -z "$PORT" ]; then
  for p in 3000 5173 8080; do
    if lsof -ti:$p > /dev/null 2>&1; then
      PORT=$p
      break
    fi
  done
fi

# Fallback to Vite default
PORT=${PORT:-5173}
```

Check if the development server is active:

```bash
lsof -ti:$PORT
```

If not running, start it:

```bash
npm run dev
```

Wait for the server to be ready and parse the output to confirm the actual port (the configured port may differ from what you detected).

### Step 2: Navigate to the Affected Page

Use Chrome DevTools MCP to navigate. **Use the PORT detected in Step 1** (not hardcoded 5173).

**For main pages:**
- Dashboard: `http://localhost:$PORT/`
- Templates: `http://localhost:$PORT/?view=templates`
- Posts: `http://localhost:$PORT/?view=posts`
- Schedule: `http://localhost:$PORT/?view=schedule`

**For auth pages:**
- Login: `http://localhost:$PORT/?auth=login`
- Forgot Password: `http://localhost:$PORT/?auth=forgot-password`
- Reset Password: `http://localhost:$PORT/?token=test-token`

Navigate using MCP (replace $PORT with the actual detected port):
```typescript
await mcp__chrome-devtools__navigate_page({ url: `http://localhost:${PORT}/` })
```

### Step 3: Take Initial Screenshot

Capture the current state:

```typescript
await mcp__chrome-devtools__take_screenshot({
  description: "Initial state - [describe what you're viewing]"
})
```

### Step 4: Visual Inspection Checklist

Check for these common issues:

#### Layout Issues
- [ ] No horizontal scrolling (unless intentional)
- [ ] Content stays within viewport bounds
- [ ] No elements appearing off-screen
- [ ] Proper spacing and margins
- [ ] Cards/containers properly aligned
- [ ] Grid/flex layouts render correctly

#### Component Rendering
- [ ] All buttons visible and clickable
- [ ] Icons render correctly
- [ ] Images load properly
- [ ] Text is readable (not cut off or overlapping)
- [ ] Dropdowns/modals appear in correct position
- [ ] Forms display all fields properly
- [ ] Tables/lists render without overflow

#### Interaction Issues
- [ ] Hover states work correctly
- [ ] Click targets are accessible
- [ ] Overlapping elements don't block interaction
- [ ] Scrollable areas scroll smoothly
- [ ] Dropdown menus don't clip
- [ ] Tooltips appear in correct position

#### Styling Issues
- [ ] Colors match design system
- [ ] Dark mode renders correctly (if applicable)
- [ ] Fonts render properly
- [ ] Borders/shadows appear as expected
- [ ] Animations/transitions work smoothly
- [ ] Consistent spacing throughout

### Step 5: Test Responsive Behavior

Test on multiple viewport sizes:

**Mobile (375px):**
```typescript
await mcp__chrome-devtools__resize_page({ width: 375, height: 667 })
await mcp__chrome-devtools__take_screenshot({
  description: "Mobile view (375px)"
})
```

**Mobile Large (425px):**
```typescript
await mcp__chrome-devtools__resize_page({ width: 425, height: 667 })
await mcp__chrome-devtools__take_screenshot({
  description: "Mobile large view (425px)"
})
```

**Tablet (768px):**
```typescript
await mcp__chrome-devtools__resize_page({ width: 768, height: 1024 })
await mcp__chrome-devtools__take_screenshot({
  description: "Tablet view (768px)"
})
```

**Tablet Large (1024px):**
```typescript
await mcp__chrome-devtools__resize_page({ width: 1024, height: 768 })
await mcp__chrome-devtools__take_screenshot({
  description: "Tablet large view (1024px)"
})
```

**Desktop (1280px):**
```typescript
await mcp__chrome-devtools__resize_page({ width: 1280, height: 720 })
await mcp__chrome-devtools__take_screenshot({
  description: "Desktop view (1280px)"
})
```

**Desktop Large (1920px):**
```typescript
await mcp__chrome-devtools__resize_page({ width: 1920, height: 1080 })
await mcp__chrome-devtools__take_screenshot({
  description: "Desktop large view (1920px)"
})
```

### Step 6: Test Interactions

For interactive components, test:

**Click Actions:**
```typescript
await mcp__chrome-devtools__click({
  selector: 'button[aria-label="Open menu"]'
})
await mcp__chrome-devtools__take_screenshot({
  description: "After clicking menu button"
})
```

**Form Interactions:**
```typescript
await mcp__chrome-devtools__fill({
  selector: 'input[name="email"]',
  value: 'test@example.com'
})
await mcp__chrome-devtools__take_screenshot({
  description: "Form filled state"
})
```

**Scroll Behavior:**
```typescript
await mcp__chrome-devtools__evaluate_script({
  script: 'window.scrollTo(0, document.body.scrollHeight)'
})
await mcp__chrome-devtools__take_screenshot({
  description: "Scrolled to bottom"
})
```

### Step 7: Check Console for Errors

```typescript
const consoleMessages = await mcp__chrome-devtools__list_console_messages()
```

Look for:
- JavaScript errors (red)
- Warning messages (yellow)
- Failed network requests
- React hydration warnings

### Step 8: Identify and Document Issues

If issues are found, document:
1. **What's wrong**: Specific description
2. **Where**: Component/page location
3. **Expected behavior**: What should happen
4. **Actual behavior**: What's happening
5. **Reproduction steps**: How to trigger the issue

### Step 9: Fix Issues

Make code changes to fix identified issues:
- Update component styling
- Adjust Tailwind classes
- Fix layout issues
- Correct responsive breakpoints
- Update CSS variables

### Step 10: Re-verify

After making fixes:
1. Refresh the page in browser
2. Take new screenshots
3. Compare with previous screenshots
4. Verify all issues are resolved
5. Repeat responsive testing

### Step 11: Mark Complete

Only mark the task as complete when:
- [ ] All visual issues are fixed
- [ ] No horizontal scrolling (unless intentional)
- [ ] No overlapping elements
- [ ] Responsive behavior works on all tested viewports
- [ ] No console errors related to the changes
- [ ] Screenshots confirm correct rendering

## Common Issues and Solutions

### Issue: Horizontal Scrolling

**Causes:**
- Container wider than viewport
- Fixed-width elements
- Negative margins
- Overflow not hidden

**Solutions:**
```typescript
// Add to parent container
className="overflow-x-hidden"

// Make content responsive
className="w-full max-w-full"

// Fix specific wide elements
className="w-full overflow-hidden"
```

### Issue: Overlapping Elements

**Causes:**
- z-index conflicts
- Absolute positioning
- Incorrect flex/grid layout

**Solutions:**
```typescript
// Adjust z-index
className="relative z-10"

// Fix layout
className="flex items-center gap-2"

// Use proper positioning
className="absolute right-2 top-2"
```

### Issue: Content Cut Off

**Causes:**
- Missing overflow handling
- Fixed heights
- Text truncation

**Solutions:**
```typescript
// Allow scrolling
className="overflow-y-auto max-h-[500px]"

// Fix truncation
className="whitespace-normal break-words"

// Remove fixed height
className="h-auto min-h-[200px]"
```

### Issue: Dark Mode Problems

**Causes:**
- Missing dark: variants
- Hardcoded colors
- Not using CSS variables

**Solutions:**
```typescript
// Add dark mode classes
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-gray-100"

// Use CSS variables
className="bg-background text-foreground"

// Check theme colors
className="border-border"
```

### Issue: Mobile Layout Breaks

**Causes:**
- No responsive classes
- Fixed widths
- Incorrect breakpoints

**Solutions:**
```typescript
// Add responsive classes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Stack on mobile
className="flex flex-col md:flex-row"

// Hide on mobile
className="hidden md:block"
```

## Best Practices

### 1. Always Verify Visually
Never assume code changes are correct without visual verification.

### 2. Test Multiple Viewports
UI that works on desktop may break on mobile and vice versa.

### 3. Check Dark Mode
If your app supports dark mode, test both themes.

### 4. Test Interactions
Click buttons, open modals, fill forms - test the actual user experience.

### 5. Check Console
Console errors can indicate underlying problems even if UI looks correct.

### 6. Take Screenshots
Screenshots provide evidence of before/after state and help identify issues.

### 7. Iterate Until Perfect
Keep fixing and re-verifying until all issues are resolved.

### 8. Document Issues
Clear documentation helps track what needs fixing and what was fixed.

## Integration with Development Workflow

This command should be used:

**During Development:**
- After implementing new UI components
- After modifying existing components
- Before committing UI changes

**During Code Review:**
- To verify reported issues
- To confirm fixes work as expected
- To document visual changes

**During Bug Fixing:**
- To reproduce reported issues
- To verify fixes work correctly
- To prevent regressions

## Example Usage Scenarios

### Scenario 1: New Component

"I just created a new UserProfile component. Use the ui-verify command to check if it renders correctly on all screen sizes."

**Process:**
1. Navigate to page with UserProfile
2. Take screenshots on all viewports
3. Check for layout issues
4. Test dark mode
5. Verify interactions work
6. Fix any issues found
7. Re-verify

### Scenario 2: Layout Fix

"I fixed the horizontal scrolling issue on the Posts page. Verify the fix works."

**Process:**
1. Navigate to Posts page
2. Check for horizontal scrolling
3. Test on mobile, tablet, desktop
4. Verify no new issues introduced
5. Take screenshots as proof
6. Mark as complete

### Scenario 3: Responsive Issue

"The dashboard cards are overlapping on mobile. Use ui-verify to diagnose and fix."

**Process:**
1. Navigate to dashboard
2. Resize to mobile viewport (375px)
3. Take screenshot showing issue
4. Identify overlapping elements
5. Fix CSS/Tailwind classes
6. Re-verify on all mobile sizes
7. Confirm fix works

## Success Criteria

UI verification is complete when:

1. **Visual correctness**: All elements render as expected
2. **No overflow**: No horizontal scrolling or off-screen content
3. **Responsive**: Works on all tested viewport sizes
4. **Interactive**: All buttons, links, forms work correctly
5. **Accessible**: Content is readable and clickable
6. **No errors**: Console is clean of related errors
7. **Consistent**: Follows design system and project conventions
8. **Dark mode**: Renders correctly in both light and dark themes

## Notes

- This workflow is mandatory for UI changes per `.claude/CLAUDE.md`
- Screenshots should be saved/noted for documentation
- Issues should be fixed iteratively until all are resolved
- Never skip verification to save time - it leads to bugs
- User trust depends on delivering working, polished UI
