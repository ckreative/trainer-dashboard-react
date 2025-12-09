import { fetchWithAuth, handleApiResponse } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface BrandingSettings {
  handle: string | null;
  brandName: string | null;
  primaryColor: string;
  heroImageUrl: string | null;
}

export interface UpdateBrandingData {
  handle?: string;
  brandName?: string;
  primaryColor?: string;
  heroImageUrl?: string | null;
}

export const brandingService = {
  async get(): Promise<BrandingSettings> {
    const response = await fetchWithAuth(`${API_URL}/branding`);
    return handleApiResponse<BrandingSettings>(response);
  },

  async update(data: UpdateBrandingData): Promise<BrandingSettings & { message: string }> {
    const response = await fetchWithAuth(`${API_URL}/branding`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleApiResponse<BrandingSettings & { message: string }>(response);
  },
};
