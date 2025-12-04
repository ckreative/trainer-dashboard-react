import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import {
  Booking,
  BookingsListParams,
  BookingsListResponse,
  CreateBookingData,
  UpdateBookingData,
} from '@/types/bookings';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class BookingsService {
  private buildQueryString(params: BookingsListParams): string {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    return searchParams.toString();
  }

  async list(params: BookingsListParams = {}): Promise<BookingsListResponse> {
    const query = this.buildQueryString(params);
    const url = `${API_BASE}/api/bookings${query ? `?${query}` : ''}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<BookingsListResponse>(response);
  }

  async get(id: string): Promise<Booking> {
    const url = `${API_BASE}/api/bookings/${id}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<Booking>(response);
  }

  async create(data: CreateBookingData): Promise<Booking> {
    const url = `${API_BASE}/api/bookings`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse<Booking>(response);
  }

  async update(id: string, data: UpdateBookingData): Promise<Booking> {
    const url = `${API_BASE}/api/bookings/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse<Booking>(response);
  }

  async delete(id: string): Promise<void> {
    const url = `${API_BASE}/api/bookings/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw { message: data.message || 'Failed to delete booking', errors: data.errors };
    }
  }

  async cancel(id: string): Promise<Booking> {
    const url = `${API_BASE}/api/bookings/${id}/cancel`;
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
    });
    return handleApiResponse<Booking>(response);
  }
}

export const bookingsService = new BookingsService();
