import { fetchWithAuth, handleApiResponse, ApiError as ApiErrorType } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  username: string;
  handle: string | null;
  avatarUrl: string | null;
  timezone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export type ApiError = ApiErrorType;

class AuthService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await handleApiResponse<LoginResponse>(response);
    this.setAuthToken(data.accessToken);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetchWithAuth(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });
    } finally {
      this.removeAuthToken();
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return handleApiResponse<{ message: string }>(response);
  }

  async resetPassword(
    token: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ message: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        token,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    return handleApiResponse<{ message: string }>(response);
  }

  async verifyResetToken(token: string): Promise<{ valid: boolean }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
      }
    );

    return handleApiResponse<{ valid: boolean }>(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
    });

    return handleApiResponse<User>(response);
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }
}

export const authService = new AuthService();
