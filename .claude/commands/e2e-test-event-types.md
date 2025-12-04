# E2E Test: Event Types Page

Test the Event Types page layout and functionality via Chrome DevTools MCP.

## Prerequisites
- Dev server running on `http://localhost:3000`
- Chrome DevTools MCP connected
- User logged in (run `/e2e-login` first if needed)

## Instructions

Execute these steps using Chrome DevTools MCP:

1. **Navigate to Event Types page**
   - Use `mcp__chrome-devtools__navigate_page` to go to `http://localhost:3000/event-types`
   - OR click the "Event Types" link in the sidebar

2. **Wait for page to load**
   - Use `mcp__chrome-devtools__wait_for` with text "Event Types" (timeout: 5000ms)

3. **Take a snapshot**
   - Use `mcp__chrome-devtools__take_snapshot` to capture page structure

4. **Verify page elements exist**
   Check that these elements are present in the snapshot:
   - [ ] Page title: "Event Types"
   - [ ] Subtitle: "Create events to share for people to book on your calendar."
   - [ ] "+ New" button in header
   - [ ] Event type cards (if data exists)
   - [ ] Each card shows: name, slug, duration, location type, toggle switch

5. **Take a screenshot**
   - Use `mcp__chrome-devtools__take_screenshot` for visual verification

6. **Check console for errors**
   - Use `mcp__chrome-devtools__list_console_messages`
   - Filter for errors: should be none related to the app

## Expected Elements (when event types exist)

| Element | Expected Value |
|---------|---------------|
| Page title | "Event Types" |
| Subtitle | "Create events to share for people to book on your calendar." |
| Button | "+ New" |
| Card title | Event type name (e.g., "30 Minute Meeting") |
| Slug | e.g., "/30min" |
| Duration | e.g., "30 min" |
| Location | e.g., "google_meet" or "phone" |
| Toggle | Active/inactive switch |
| Menu button | Three-dot icon |

## Report

After completing, report:

### Test Results
- [ ] ✅ Page loaded successfully
- [ ] ✅ Title and subtitle visible
- [ ] ✅ New button visible
- [ ] ✅ Event type cards rendered (or empty state if no data)
- [ ] ✅ Toggle switches functional
- [ ] ✅ No console errors

### Summary
```
PASS/FAIL: [result]
Screenshot: [attached]
Errors: [none or list]
```
