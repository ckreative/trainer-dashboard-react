# Authentication Setup

This application includes a complete authentication system integrated with a Laravel backend API.

## Features Implemented

### 🔐 Authentication Screens
1. **Login Screen** - Email/password authentication with "Remember me" option
2. **Forgot Password Screen** - Request password reset link via email
3. **Reset Password Screen** - Set new password with token validation and strength indicator
4. **Invalid Token Screen** - Error handling for expired/invalid reset links

### 🛡️ Security Features
- JWT token-based authentication
- Protected routes with automatic redirect to login
- Token storage in localStorage
- Automatic token validation on app load
- Password strength indicator
- Form validation with error feedback

### 📁 File Structure

```
src/
├── services/
│   └── auth.ts                 # API service layer for Laravel backend
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── components/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── InvalidTokenScreen.tsx
│   │   └── AuthContainer.tsx   # Auth flow coordinator
│   ├── ProtectedRoute.tsx      # Route protection wrapper
│   └── DashboardHeader.tsx     # Updated with logout functionality
└── App.tsx                      # Updated with auth routing
```

## Configuration

### Environment Variables
Update `.env` with your Laravel API URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Required Laravel API Endpoints

Your Laravel backend should implement these endpoints:

```php
POST   /api/auth/login              # Login user
POST   /api/auth/logout             # Logout user
POST   /api/auth/forgot-password    # Send password reset email
POST   /api/auth/reset-password     # Reset password with token
GET    /api/auth/verify-reset-token # Verify reset token validity
GET    /api/auth/me                 # Get current authenticated user
```

### Expected Request/Response Formats

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Login Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

**Forgot Password Request:**
```json
{
  "email": "user@example.com"
}
```

**Reset Password Request:**
```json
{
  "token": "reset-token-here",
  "password": "newpassword",
  "password_confirmation": "newpassword"
}
```

**Auth Headers:**
All authenticated requests include:
```
Authorization: Bearer {token}
```

## Usage

### Using Authentication in Components

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <p>Welcome {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute>
      <YourProtectedComponent />
    </ProtectedRoute>
  );
}
```

## Authentication Flow

1. **Initial Load:**
   - App checks for existing auth token
   - If token exists, validates it by calling `/api/auth/me`
   - If valid, user is logged in automatically
   - If invalid or missing, shows login screen

2. **Login:**
   - User enters credentials
   - Calls `/api/auth/login`
   - Stores token in localStorage
   - Redirects to dashboard

3. **Forgot Password:**
   - User enters email
   - Calls `/api/auth/forgot-password`
   - Laravel sends email with reset link
   - Link format: `http://yourapp.com?token=reset-token`

4. **Reset Password:**
   - User clicks email link
   - App extracts token from URL
   - Verifies token validity
   - Shows password form if valid
   - Calls `/api/auth/reset-password`
   - Redirects to login on success

5. **Logout:**
   - Calls `/api/auth/logout`
   - Clears token from localStorage
   - Redirects to login screen

## Error Handling

- API errors are displayed as toast notifications
- Form validation errors shown inline
- Invalid tokens show dedicated error screen
- Network errors handled gracefully

## Security Considerations

- Tokens stored in localStorage (consider httpOnly cookies for production)
- All API requests use HTTPS in production
- Password strength validation on client-side
- CSRF protection should be implemented on Laravel backend
- Rate limiting should be implemented for login/password reset

## Testing Without Backend

To test the UI without a working Laravel backend:
1. Comment out the API calls in `src/services/auth.ts`
2. Return mock data from the service methods
3. Or use a mock API service like json-server or MSW

## Next Steps

- [ ] Implement email verification
- [ ] Add social authentication (Google, GitHub, etc.)
- [ ] Implement "Remember Me" functionality
- [ ] Add 2FA support
- [ ] Session timeout handling
- [ ] Refresh token implementation
