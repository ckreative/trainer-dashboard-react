import { toast } from 'sonner';

// This will be set by AuthContext on mount
let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Global fetch wrapper that handles authentication errors
 * Automatically logs out and redirects on 401 responses
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');

  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;

  // Add auth header if token exists
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Only add Content-Type for non-FormData requests
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Check for 401 Unauthorized
  if (response.status === 401) {
    // Don't treat login endpoint 401 as session expiry - it means invalid credentials
    const isLoginEndpoint = url.includes('/api/auth/login');

    if (!isLoginEndpoint) {
      // Clear token immediately
      localStorage.removeItem('auth_token');

      // Show session expired message
      toast.error('Your session has expired. Please log in again.');

      // Trigger logout if callback is set
      if (logoutCallback) {
        // Small delay to ensure toast is visible
        setTimeout(() => {
          logoutCallback!();
        }, 100);
      }

      // Throw error to prevent further processing
      throw {
        message: 'Session expired',
        errors: {},
      } as ApiError;
    }
  }

  return response;
}

/**
 * Helper to handle JSON response and throw ApiError on non-2xx responses
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.message || 'An error occurred',
      errors: data.errors,
    } as ApiError;
  }

  return data;
}
