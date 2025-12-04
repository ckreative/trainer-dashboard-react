import { fetchWithAuth, handleApiResponse } from '@/lib/api';
import {
  EventType,
  CreateEventTypeData,
  UpdateEventTypeData,
  EventTypesListParams,
  EventTypesListResponse,
} from '@/types/event-types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class EventTypesService {
  private buildQueryString(params: EventTypesListParams): string {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.enabled !== undefined) searchParams.set('enabled', params.enabled.toString());
    if (params.sortBy) searchParams.set('sort_by', params.sortBy);
    if (params.sortDirection) searchParams.set('sort_direction', params.sortDirection);
    return searchParams.toString();
  }

  async list(params: EventTypesListParams = {}): Promise<EventTypesListResponse> {
    const query = this.buildQueryString(params);
    const url = `${API_BASE}/api/event-types${query ? `?${query}` : ''}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<EventTypesListResponse>(response);
  }

  async get(id: string): Promise<EventType> {
    const url = `${API_BASE}/api/event-types/${id}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<EventType>(response);
  }

  async create(data: CreateEventTypeData): Promise<EventType> {
    const url = `${API_BASE}/api/event-types`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiResponse<EventType>(response);
  }

  async update(id: string, data: UpdateEventTypeData): Promise<EventType> {
    const url = `${API_BASE}/api/event-types/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse<EventType>(response);
  }

  async delete(id: string): Promise<void> {
    const url = `${API_BASE}/api/event-types/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw { message: data.message || 'Failed to delete event type', errors: data.errors };
    }
  }

  async duplicate(id: string): Promise<EventType> {
    const url = `${API_BASE}/api/event-types/${id}/duplicate`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
    });
    return handleApiResponse<EventType>(response);
  }

  async toggle(id: string, enabled: boolean): Promise<EventType> {
    const url = `${API_BASE}/api/event-types/${id}/toggle`;
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
    return handleApiResponse<EventType>(response);
  }
}

export const eventTypesService = new EventTypesService();
