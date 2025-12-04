# E2E Login

Log into the dashboard using test credentials via Chrome DevTools MCP.

## Test Credentials
- Email: `test@example.com`
- Password: `password`
- Base URL: `http://localhost:3000`

## Instructions

Execute these steps using Chrome DevTools MCP:

1. **Navigate to login page**
   - Use `mcp__chrome-devtools__navigate_page` to go to `http://localhost:3000/login`

2. **Take a snapshot to get element UIDs**
   - Use `mcp__chrome-devtools__take_snapshot` to identify form elements

3. **Fill login form**
   - Use `mcp__chrome-devtools__fill_form` with:
     - Email field: `test@example.com`
     - Password field: `password`

4. **Click Sign In button**
   - Use `mcp__chrome-devtools__click` on the Sign In button

5. **Wait for login to complete**
   - Use `mcp__chrome-devtools__wait_for` with text "Event Types" or "Availability" (timeout: 10000ms)

6. **Verify successful login**
   - Take a screenshot to confirm dashboard loaded
   - Check console for any errors

## Expected Result
- User is logged in and redirected to the dashboard
- Sidebar shows navigation links (Event Types, Bookings, Availability)
- No console errors

## Report
After completing, report:
- ✅ Login successful OR ❌ Login failed
- Screenshot of current page state
- Any console errors found
