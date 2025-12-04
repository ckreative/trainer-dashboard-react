# E2E Test: Full Test Suite

Run all E2E tests for the dashboard via Chrome DevTools MCP.

## Prerequisites
- Dev server running on `http://localhost:3000`
- Chrome DevTools MCP connected

## Test Order

Execute tests in this sequence:

### 1. Login Test
Run the login flow first to establish authentication:

1. Navigate to `http://localhost:3000/login`
2. Take snapshot to get form element UIDs
3. Fill form with:
   - Email: `test@example.com`
   - Password: `password`
4. Click "Sign in" button
5. Wait for redirect (look for "Event Types" or "Availability" text)
6. Verify sidebar navigation is visible
7. Take screenshot of logged-in state

**Expected**: User logged in, redirected to dashboard

---

### 2. Event Types Page Test

1. Navigate to `http://localhost:3000/event-types`
2. Wait for "Event Types" text
3. Take snapshot
4. Verify elements:
   - Page title: "Event Types"
   - Subtitle: "Create events to share for people to book on your calendar."
   - "+ New" button
   - Event type cards with: name, slug, duration, location, toggle
5. Take screenshot

**Expected**: All elements visible, no console errors

---

### 3. Availability Page Test

1. Navigate to `http://localhost:3000/availability`
2. Wait for "Availability" text
3. Take snapshot
4. Verify elements:
   - Page title: "Availability"
   - Subtitle: "Configure times when you are available for bookings."
   - "+ New" button
   - Schedule cards with: name, "Default" badge, time summary, timezone
5. Take screenshot

**Expected**: All elements visible, no console errors

---

### 4. Bookings Page Test

1. Navigate to `http://localhost:3000/bookings`
2. Wait for "Bookings" text
3. Take snapshot
4. Verify elements:
   - Page title: "Bookings"
   - "Filters" button
   - Tab bar: Upcoming, Unconfirmed, Recurring, Past, Cancelled
   - Booking cards or empty state
5. Test tab switching (click "Past" tab)
6. Take screenshot

**Expected**: All elements visible, tabs functional, no console errors

---

### 5. Console Error Check

After all page tests, check for any console errors:
1. Use `mcp__chrome-devtools__list_console_messages`
2. Filter for type: "error"
3. Report any app-related errors

---

## Final Report

After completing all tests, provide a summary:

### Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Login | ✅/❌ | |
| Event Types | ✅/❌ | |
| Availability | ✅/❌ | |
| Bookings | ✅/❌ | |
| Console Errors | ✅/❌ | |

### Overall Result
```
PASS: All tests passed
- OR -
FAIL: [list failed tests]
```

### Screenshots
Attach screenshots for each page tested.

### Errors Found
List any console errors or issues discovered.

---

## Quick Commands Reference

```
Navigate: mcp__chrome-devtools__navigate_page
Wait: mcp__chrome-devtools__wait_for
Snapshot: mcp__chrome-devtools__take_snapshot
Screenshot: mcp__chrome-devtools__take_screenshot
Fill form: mcp__chrome-devtools__fill_form
Click: mcp__chrome-devtools__click
Console: mcp__chrome-devtools__list_console_messages
```
