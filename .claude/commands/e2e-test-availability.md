# E2E Test: Availability Page

Test the Availability page layout and functionality via Chrome DevTools MCP.

## Prerequisites
- Dev server running on `http://localhost:3000`
- Chrome DevTools MCP connected
- User logged in (run `/e2e-login` first if needed)

## Instructions

Execute these steps using Chrome DevTools MCP:

1. **Navigate to Availability page**
   - Use `mcp__chrome-devtools__navigate_page` to go to `http://localhost:3000/availability`
   - OR click the "Availability" link in the sidebar

2. **Wait for page to load**
   - Use `mcp__chrome-devtools__wait_for` with text "Availability" (timeout: 5000ms)

3. **Take a snapshot**
   - Use `mcp__chrome-devtools__take_snapshot` to capture page structure

4. **Verify page elements exist**
   Check that these elements are present in the snapshot:
   - [ ] Page title: "Availability"
   - [ ] Subtitle: "Configure times when you are available for bookings."
   - [ ] "+ New" button in header
   - [ ] At least one schedule card (if data exists)
   - [ ] Schedule card shows: name, "Default" badge (if applicable), time summary, timezone

5. **Take a screenshot**
   - Use `mcp__chrome-devtools__take_screenshot` for visual verification

6. **Check console for errors**
   - Use `mcp__chrome-devtools__list_console_messages`
   - Filter for errors: should be none related to the app

## Expected Elements (when schedule exists)

| Element | Expected Value |
|---------|---------------|
| Page title | "Availability" |
| Subtitle | "Configure times when you are available for bookings." |
| Button | "+ New" |
| Card title | Schedule name (e.g., "Working Hours") |
| Badge | "Default" (on default schedule) |
| Time summary | e.g., "Mon, Tue, Wed, Thu, Fri, 09:00 - 17:00" |
| Timezone | e.g., "America/New_York" with globe icon |
| Menu button | Three-dot icon |

## Report

After completing, report:

### Test Results
- [ ] ✅ Page loaded successfully
- [ ] ✅ Title and subtitle visible
- [ ] ✅ New button visible
- [ ] ✅ Schedule cards rendered (or empty state if no data)
- [ ] ✅ No console errors

### Summary
```
PASS/FAIL: [result]
Screenshot: [attached]
Errors: [none or list]
```
