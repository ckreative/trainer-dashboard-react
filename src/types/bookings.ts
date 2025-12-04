import { EventType } from './event-types';

export type BookingStatus = 'upcoming' | 'unconfirmed' | 'recurring' | 'past' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  eventTypeId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  attendeeName: string;
  attendeeEmail: string;
  location: string | null;
  meetingUrl: string | null;
  notes: string | null;
  timezone: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdAt: string;
  updatedAt: string;
  eventType?: EventType;
}

export interface BookingsListParams {
  status?: BookingStatus;
  limit?: number;
  offset?: number;
}

export interface BookingsListResponse {
  bookings: Booking[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateBookingData {
  eventTypeId: string;
  title: string;
  startTime: string;
  endTime: string;
  status?: BookingStatus;
  attendeeName: string;
  attendeeEmail: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  timezone?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {}
