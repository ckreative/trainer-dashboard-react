# E2E Test: Bookings Page

Test the Bookings page layout and functionality via Chrome DevTools MCP.

## Prerequisites
- Dev server running on `http://localhost:3000`
- Chrome DevTools MCP connected
- User logged in (run `/e2e-login` first if needed)

## Instructions

Execute these steps using Chrome DevTools MCP:

1. **Navigate to Bookings page**
   - Use `mcp__chrome-devtools__navigate_page` to go to `http://localhost:3000/bookings`
   - OR click the "Bookings" link in the sidebar

2. **Wait for page to load**
   - Use `mcp__chrome-devtools__wait_for` with text "Bookings" (timeout: 5000ms)

3. **Take a snapshot**
   - Use `mcp__chrome-devtools__take_snapshot` to capture page structure

4. **Verify page elements exist**
   Check that these elements are present in the snapshot:
   - [ ] Page title: "Bookings"
   - [ ] "Filters" button with icon
   - [ ] Tab bar with: Upcoming, Unconfirmed, Recurring, Past, Cancelled
   - [ ] "Upcoming" tab is active by default
   - [ ] Booking cards (if data exists) OR empty state message

5. **Test tab switching**
   - Click on "Past" tab
   - Wait for content to load
   - Verify tab is now active
   - Take snapshot to confirm tab state changed

6. **Take a screenshot**
   - Use `mcp__chrome-devtools__take_screenshot` for visual verification

7. **Check console for errors**
   - Use `mcp__chrome-devtools__list_console_messages`
   - Filter for errors: should be none related to the app

## Expected Elements

| Element | Expected Value |
|---------|---------------|
| Page title | "Bookings" |
| Button | "Filters" with SlidersHorizontal icon |
| Tabs | Upcoming, Unconfirmed, Recurring, Past, Cancelled |
| Default active tab | "Upcoming" |
| Booking card | Date/time, title, attendees, location icon |
| Empty state | "No [status] bookings" |

## Expected Booking Card Structure (when bookings exist)

Each booking card should show:
- Date (e.g., "3 Dec 2025")
- Time range (e.g., "10:00 am - 10:30 am")
- Booking title (event type name)
- Attendees (e.g., "You and John Doe")
- Location icon and label (Google Meet, Zoom, Phone, In Person)

## Report

After completing, report:

### Test Results
- [ ] ✅ Page loaded successfully
- [ ] ✅ Title visible
- [ ] ✅ Filters button visible
- [ ] ✅ All tabs rendered
- [ ] ✅ Tab switching works
- [ ] ✅ Booking cards rendered (or empty state if no data)
- [ ] ✅ No console errors

### Summary
```
PASS/FAIL: [result]
Screenshot: [attached]
Errors: [none or list]
```
