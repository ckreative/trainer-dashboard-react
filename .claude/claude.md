# Claude Code Instructions for UI Development

## ⚠️ CRITICAL RULE - ALWAYS VERIFY YOUR WORK

**NEVER RETURN TO THE USER WITHOUT VERIFYING YOUR CHANGES WORK**

You have Chrome DevTools MCP access. Use it EVERY TIME you make frontend changes:
- Check console logs for errors
- Verify UI renders correctly
- Test functionality works as expected
- Check network requests succeed

**DO NOT ask the user to check things you can verify yourself!**

## E2E Testing Requirements

**Before confirming ANY issue is resolved, you MUST perform E2E testing using Chrome DevTools MCP:**

1. **Navigate to the affected page** - Use `mcp__chrome-devtools__navigate_page` to load the page
2. **Take a snapshot** - Use `mcp__chrome-devtools__take_snapshot` to verify page structure
3. **Take a screenshot** - Use `mcp__chrome-devtools__take_screenshot` to verify visual appearance
4. **Test the functionality** - Use click, fill, and other actions to test the feature works
5. **Check for errors** - Use `mcp__chrome-devtools__list_console_messages` to verify no errors
6. **Verify network requests** - Use `mcp__chrome-devtools__list_network_requests` if API calls are involved

**An issue is NOT resolved until you have:**
- Visually confirmed the fix via screenshot
- Tested the user flow works end-to-end
- Verified no console errors exist
- Confirmed network requests succeed (if applicable)

## UI Verification Workflow

When working on UI changes, layout fixes, or visual improvements, follow this strict verification workflow:

### 1. Make Code Changes
- Implement the requested changes to components, styles, or layouts
- Ensure all syntax is correct and follows project conventions

### 2. Start Development Server
- If not already running, start the dev server: `npm run dev`
- Wait for the server to be ready and note the URL
- **IMPORTANT**: Use the `dev-server-manager` skill to detect the correct port (check vite.config.ts for configured port, don't assume 5173)

### 3. Verify Changes Using Browser Automation
**IMPORTANT:** Before marking any UI task as complete, you MUST verify the changes visually using the Chrome/Browser MCP server.

#### Use Chrome MCP to:
- Navigate to the affected page(s)
- Take screenshots of the UI
- Check for visual issues:
  - Horizontal scrolling
  - Content appearing off-screen
  - Overlapping elements (buttons, arrows, cards, etc.)
  - Responsive layout issues
  - Alignment problems
  - Spacing/padding issues
  - Dark mode rendering (if applicable)

### 4. Identify Issues
If ANY issues are found during verification:
- Document the specific problem
- Identify the root cause in the code
- Plan the fix

### 5. Iterate Until Complete
**DO NOT mark the task as complete** until:
- All UI issues are fixed
- Visual verification confirms the UI is correct
- No horizontal scrolling (unless intentional)
- No overlapping elements
- Responsive behavior works as expected
- All requested changes are implemented correctly

### 6. Test Multiple Viewports
For layout changes, verify on:
- Mobile viewport (375px, 425px)
- Tablet viewport (768px, 1024px)
- Desktop viewport (1280px, 1536px, 1920px)

### 7. Final Confirmation
Only after ALL of the above steps are complete and verified, you may mark the task as done.

## Example Workflow

```
User Request: "Fix horizontal scrolling on product page"

1. ✅ Identify issue in code (e.g., missing overflow-x-hidden)
2. ✅ Make fix to AppLayout.tsx
3. ✅ Dev server is running
4. ✅ Use Chrome MCP to navigate to http://localhost:5173/add-product
5. ❌ Screenshot shows right arrow still overlaying cards
6. ✅ Make additional fix (increase padding)
7. ✅ Use Chrome MCP to verify again
8. ✅ Screenshot confirms no overlap, no horizontal scroll
9. ✅ Test on mobile, tablet, desktop viewports
10. ✅ All viewports work correctly
11. ✅ NOW mark as complete
```

## Commands for Chrome DevTools MCP

When Chrome DevTools MCP is available, use these tools:
- `mcp__chrome-devtools__navigate_page` - Navigate to a URL or reload
- `mcp__chrome-devtools__take_screenshot` - Take a screenshot of the page
- `mcp__chrome-devtools__take_snapshot` - Get page structure/accessibility tree
- `mcp__chrome-devtools__click` - Click elements by uid
- `mcp__chrome-devtools__fill` - Fill input fields
- `mcp__chrome-devtools__fill_form` - Fill multiple form fields at once
- `mcp__chrome-devtools__hover` - Hover over elements
- `mcp__chrome-devtools__press_key` - Press keyboard keys
- `mcp__chrome-devtools__list_console_messages` - Check for console errors
- `mcp__chrome-devtools__list_network_requests` - Verify API calls
- `mcp__chrome-devtools__resize_page` - Test different viewport sizes
- `mcp__chrome-devtools__wait_for` - Wait for text to appear on page

## Never Skip Verification

**CRITICAL RULE:** Never say "the task is complete" or "the issue is fixed" without actually verifying through the browser. User trust depends on delivering working UI, not just code that compiles.

## Iteration is Expected

It's normal and expected to iterate multiple times on UI fixes. The goal is correctness, not speed.

## When Chrome MCP is Not Available

If Chrome MCP tools are not configured or available:
1. Make the code changes based on analysis
2. Clearly state that visual verification was not performed
3. Provide instructions for the user to test manually
4. Do NOT claim the task is "complete" - say "code changes implemented, awaiting visual verification"
