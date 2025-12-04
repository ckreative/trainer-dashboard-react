# Backend API Requirements for Authentication System

**Project**: Concrete Kreative Management Platform
**Frontend**: React + TypeScript
**Backend**: Laravel (PHP)
**Date**: January 2025
**Status**: Ready for Implementation

---

## 📋 Overview

This document specifies the exact API endpoints required for the authentication system. The frontend is already implemented and ready to integrate once these endpoints are available.

## 🔧 Base Configuration

### API Base URL
- **Development**: `http://localhost:8000`
- **Production**: TBD

### Headers Required
All requests include:
```
Content-Type: application/json
Accept: application/json
```

Authenticated requests also include:
```
Authorization: Bearer {jwt_token}
```

### CORS Configuration Required

The Laravel backend must allow cross-origin requests from:
- Development: `http://localhost:5173` (Vite dev server)
- Production: TBD

**Laravel CORS config** (`config/cors.php`):
```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'http://localhost:5173',
    // Add production domain when deployed
],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

---

## 📡 Required API Endpoints

### 1. Login

**Endpoint**: `POST /api/auth/login`

**Purpose**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (`200 OK`):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

**Error Responses**:

`401 Unauthorized` - Invalid credentials:
```json
{
  "message": "Invalid credentials"
}
```

`422 Unprocessable Entity` - Validation errors:
```json
{
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email field is required"],
    "password": ["The password field is required"]
  }
}
```

**Laravel Implementation Example**:
```php
// app/Http/Controllers/Auth/LoginController.php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]
    ]);
}
```

---

### 2. Logout

**Endpoint**: `POST /api/auth/logout`

**Purpose**: Invalidate current user token

**Headers**: Requires `Authorization: Bearer {token}`

**Request Body**: Empty

**Success Response** (`200 OK`):
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses**:

`401 Unauthorized` - Invalid or missing token:
```json
{
  "message": "Unauthenticated"
}
```

**Laravel Implementation Example**:
```php
// app/Http/Controllers/Auth/LogoutController.php
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
}
```

---

### 3. Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Purpose**: Send password reset email to user

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (`200 OK`):
```json
{
  "message": "Password reset link has been sent to your email"
}
```

**Error Responses**:

`422 Unprocessable Entity` - Validation error:
```json
{
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email field is required"]
  }
}
```

`404 Not Found` - Email not found (optional, or return success for security):
```json
{
  "message": "We can't find a user with that email address"
}
```

**Email Requirements**:
- Email must contain a reset link with format: `{FRONTEND_URL}?token={reset_token}`
- Example: `http://localhost:5173?token=abc123def456`
- Token should expire after 60 minutes
- Token should be single-use

**Laravel Implementation Example**:
```php
// app/Http/Controllers/Auth/ForgotPasswordController.php
use Illuminate\Support\Facades\Password;

public function forgotPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
    ]);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => 'Password reset link has been sent to your email'
        ]);
    }

    return response()->json([
        'message' => 'Unable to send reset link'
    ], 500);
}
```

**Email Template** should include:
```
Hello {name},

You are receiving this email because we received a password reset request for your account.

Click here to reset your password:
http://localhost:5173?token={token}

This password reset link will expire in 60 minutes.

If you did not request a password reset, no further action is required.
```

---

### 4. Verify Reset Token

**Endpoint**: `GET /api/auth/verify-reset-token?token={token}`

**Purpose**: Check if a reset token is valid before showing reset form

**Query Parameters**:
- `token` (string, required): The reset token from the email

**Success Response** (`200 OK`) - Valid token:
```json
{
  "valid": true
}
```

**Error Response** (`200 OK`) - Invalid/expired token:
```json
{
  "valid": false
}
```

**Laravel Implementation Example**:
```php
// app/Http/Controllers/Auth/ResetPasswordController.php
use Illuminate\Support\Facades\DB;

public function verifyResetToken(Request $request)
{
    $token = $request->query('token');

    if (!$token) {
        return response()->json(['valid' => false]);
    }

    // Check if token exists and is not expired
    $passwordReset = DB::table('password_reset_tokens')
        ->where('token', $token)
        ->where('created_at', '>=', now()->subHour())
        ->first();

    return response()->json([
        'valid' => $passwordReset !== null
    ]);
}
```

---

### 5. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Purpose**: Reset user password using token from email

**Request Body**:
```json
{
  "token": "abc123def456",
  "password": "newPassword123",
  "password_confirmation": "newPassword123"
}
```

**Success Response** (`200 OK`):
```json
{
  "message": "Your password has been reset successfully"
}
```

**Error Responses**:

`422 Unprocessable Entity` - Validation errors:
```json
{
  "message": "The given data was invalid",
  "errors": {
    "password": [
      "The password must be at least 8 characters",
      "The password confirmation does not match"
    ]
  }
}
```

`400 Bad Request` - Invalid or expired token:
```json
{
  "message": "This password reset token is invalid or has expired"
}
```

**Validation Rules**:
- Password: required, string, min:8, confirmed
- Token: required, string

**Laravel Implementation Example**:
```php
// app/Http/Controllers/Auth/ResetPasswordController.php
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;

public function resetPassword(Request $request)
{
    $request->validate([
        'token' => 'required',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('token', 'password', 'password_confirmation'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->save();
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json([
            'message' => 'Your password has been reset successfully'
        ]);
    }

    return response()->json([
        'message' => 'This password reset token is invalid or has expired'
    ], 400);
}
```

---

### 6. Get Current User

**Endpoint**: `GET /api/auth/me`

**Purpose**: Get currently authenticated user's information

**Headers**: Requires `Authorization: Bearer {token}`

**Request Body**: Empty

**Success Response** (`200 OK`):
```json
{
  "id": "1",
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Error Response**:

`401 Unauthorized` - Invalid or missing token:
```json
{
  "message": "Unauthenticated"
}
```

**Laravel Implementation Example**:
```php
// app/Http/Controllers/Auth/UserController.php
public function me(Request $request)
{
    $user = $request->user();

    return response()->json([
        'id' => (string) $user->id,
        'name' => $user->name,
        'email' => $user->email,
    ]);
}
```

---

## 🛡️ Security Requirements

### 1. JWT Token Configuration
- Use Laravel Sanctum or Laravel Passport
- Tokens should expire after 24 hours (configurable)
- Include token refresh mechanism (optional for v1)

### 2. Password Requirements
- Minimum 8 characters
- Should be hashed using bcrypt (Laravel default)
- Consider adding password strength requirements (uppercase, numbers, special chars)

### 3. Rate Limiting
Implement rate limiting for:
- **Login**: 5 attempts per minute per IP
- **Forgot Password**: 3 attempts per minute per IP
- **Reset Password**: 5 attempts per minute per IP

**Laravel Implementation**:
```php
// routes/api.php
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/login', [LoginController::class, 'login']);
});
```

### 4. CSRF Protection
- API routes should be exempt from CSRF (Laravel default for `/api/*` routes)
- Ensure `VerifyCsrfToken` middleware excludes API routes

---

## 🗄️ Database Requirements

### Users Table
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);
```

### Personal Access Tokens Table (Laravel Sanctum)
```sql
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

---

## 🧪 Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Forgot Password:**
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"user@example.com"}'
```

**Verify Reset Token:**
```bash
curl -X GET "http://localhost:8000/api/auth/verify-reset-token?token=YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Reset Password:**
```bash
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "token":"YOUR_TOKEN",
    "password":"newPassword123",
    "password_confirmation":"newPassword123"
  }'
```

---

## 📝 Laravel Routes Setup

Add these routes to `routes/api.php`:

```php
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\UserController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'forgotPassword']);
    Route::get('/verify-reset-token', [ResetPasswordController::class, 'verifyResetToken']);
    Route::post('/reset-password', [ResetPasswordController::class, 'resetPassword']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/me', [UserController::class, 'me']);
});
```

---

## ✅ Testing Checklist

Once the backend is implemented, test these scenarios:

### Login Flow
- [ ] Valid credentials return token and user
- [ ] Invalid email returns 401
- [ ] Invalid password returns 401
- [ ] Missing fields return 422 with validation errors
- [ ] Rate limiting works after 5 failed attempts

### Logout Flow
- [ ] Valid token logs out successfully
- [ ] Token is invalidated after logout
- [ ] Subsequent requests with old token return 401

### Forgot Password Flow
- [ ] Valid email sends reset email
- [ ] Email contains correct reset link format
- [ ] Invalid email returns appropriate error
- [ ] Rate limiting works

### Reset Password Flow
- [ ] Valid token allows password reset
- [ ] Password is updated in database
- [ ] Old password no longer works
- [ ] New password works for login
- [ ] Expired token (>60 min) returns error
- [ ] Token cannot be reused
- [ ] Password confirmation mismatch returns error

### Get Current User
- [ ] Valid token returns user info
- [ ] Invalid token returns 401
- [ ] Expired token returns 401

---

## 🚀 Frontend Integration Status

The frontend is **100% complete** and ready to integrate. Once the backend endpoints are live:

1. Update `.env` file with production API URL:
   ```env
   VITE_API_BASE_URL=https://api.yourproduction.com
   ```

2. The frontend will automatically:
   - Make requests to correct endpoints
   - Handle authentication tokens
   - Display validation errors
   - Show success/error messages
   - Redirect appropriately

---

## 📞 Questions or Issues?

If you encounter any issues or have questions:

1. **API Endpoint Questions**: Refer to this document
2. **Request/Response Format**: See examples above
3. **Integration Issues**: Check CORS configuration first
4. **Error Handling**: Ensure error responses match format above

---

## 📚 Additional Resources

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Laravel Password Reset](https://laravel.com/docs/passwords)
- [Laravel API Authentication](https://laravel.com/docs/authentication)
- [Laravel CORS](https://github.com/fruitcake/laravel-cors)

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Frontend Ready**: Yes ✅
**Backend Status**: Awaiting Implementation

**Questions? Contact the frontend team or refer to the code in `src/services/auth.ts`**
