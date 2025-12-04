import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import {
  AvailabilitySchedule,
  CreateAvailabilityScheduleData,
  UpdateAvailabilityScheduleData,
  AvailabilitySchedulesListParams,
  AvailabilitySchedulesListResponse,
} from '@/types/availability';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class AvailabilityService {
  private buildQueryString(params: AvailabilitySchedulesListParams): string {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sort_by', params.sortBy);
    if (params.sortDirection) searchParams.set('sort_direction', params.sortDirection);
    return searchParams.toString();
  }

  async list(params: AvailabilitySchedulesListParams = {}): Promise<AvailabilitySchedulesListResponse> {
    const query = this.buildQueryString(params);
    const url = `${API_BASE}/api/availability-schedules${query ? `?${query}` : ''}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<AvailabilitySchedulesListResponse>(response);
  }

  async get(id: string): Promise<AvailabilitySchedule> {
    const url = `${API_BASE}/api/availability-schedules/${id}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<AvailabilitySchedule>(response);
  }

  async create(data: CreateAvailabilityScheduleData): Promise<AvailabilitySchedule> {
    const url = `${API_BASE}/api/availability-schedules`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse<AvailabilitySchedule>(response);
  }

  async update(id: string, data: UpdateAvailabilityScheduleData): Promise<AvailabilitySchedule> {
    const url = `${API_BASE}/api/availability-schedules/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse<AvailabilitySchedule>(response);
  }

  async delete(id: string): Promise<void> {
    const url = `${API_BASE}/api/availability-schedules/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw { message: data.message || 'Failed to delete availability schedule', errors: data.errors };
    }
  }

  async duplicate(id: string): Promise<AvailabilitySchedule> {
    const url = `${API_BASE}/api/availability-schedules/${id}/duplicate`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
    });
    return handleApiResponse<AvailabilitySchedule>(response);
  }

  async setDefault(id: string): Promise<AvailabilitySchedule> {
    const url = `${API_BASE}/api/availability-schedules/${id}/set-default`;
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
    });
    return handleApiResponse<AvailabilitySchedule>(response);
  }
}

export const availabilityService = new AvailabilityService();
