# Authentication API - Quick Reference

**Backend URL**: `http://localhost:8000`

---

## 📡 Endpoints

### Login
```
POST /api/auth/login
Body: {"email": "test@example.com", "password": "password"}
Response: {"token": "...", "user": {...}}
```

### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
Response: {"message": "Logged out successfully"}
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: {"id": "...", "name": "...", "email": "..."}
```

### Forgot Password
```
POST /api/auth/forgot-password
Body: {"email": "test@example.com"}
Response: {"message": "Password reset link has been sent..."}
```

### Verify Reset Token
```
GET /api/auth/verify-reset-token?token={token}
Response: {"valid": true}
```

### Reset Password
```
POST /api/auth/reset-password
Body: {
  "token": "...",
  "password": "newPassword123",
  "password_confirmation": "newPassword123"
}
Response: {"message": "Your password has been reset successfully"}
```

---

## 🔑 Test Credentials

**Email**: `test@example.com`
**Password**: `password`

**Create test user**:
```bash
cd ../concrete-kreative-management-platform-api-laravel
php artisan tinker

\App\Models\User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'password'
]);
```

---

## 🚀 Start Backend

```bash
cd ../concrete-kreative-management-platform-api-laravel
php artisan serve
```

Backend runs at: `http://localhost:8000`

---

## ⚙️ React .env

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📧 View Password Reset Emails

```bash
cd ../concrete-kreative-management-platform-api-laravel
tail -f storage/logs/laravel.log
```

---

## 📖 Full Documentation

- `MESSAGE_FROM_BACKEND_TEAM.md` - Start here!
- `BACKEND_INTEGRATION_COMPLETE.md` - Complete guide
- `BACKEND_REQUIREMENTS.md` - Original specification
