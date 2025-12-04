export interface EventType {
  id: string;
  userId: string;
  title: string;
  url: string;
  fullUrl: string;
  description: string | null;
  duration: number;
  enabled: boolean;
  allowMultipleDurations: boolean;
  multipleDurationOptions: number[] | null;
  location: string | null;
  customLocation: string | null;
  beforeEventBuffer: number | null;
  afterEventBuffer: number | null;
  minimumNotice: number | null;
  timeSlotInterval: number | null;
  limitBookingFrequency: boolean;
  bookingFrequencyLimit: { count: number; period: string } | null;
  onlyFirstSlotPerDay: boolean;
  limitTotalDuration: boolean;
  totalDurationLimit: { duration: number; period: string } | null;
  limitUpcomingBookings: boolean;
  upcomingBookingsLimit: number | null;
  limitFutureBookings: boolean;
  futureBookingsLimit: number | null;
  availabilityScheduleId: string | null;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventTypeData {
  title: string;
  url?: string;
  description?: string | null;
  duration: number;
  enabled?: boolean;
  allowMultipleDurations?: boolean;
  multipleDurationOptions?: number[] | null;
  location?: string | null;
  customLocation?: string | null;
  beforeEventBuffer?: number | null;
  afterEventBuffer?: number | null;
  minimumNotice?: number | null;
  timeSlotInterval?: number | null;
  limitBookingFrequency?: boolean;
  bookingFrequencyLimit?: { count: number; period: string } | null;
  onlyFirstSlotPerDay?: boolean;
  limitTotalDuration?: boolean;
  totalDurationLimit?: { duration: number; period: string } | null;
  limitUpcomingBookings?: boolean;
  upcomingBookingsLimit?: number | null;
  limitFutureBookings?: boolean;
  futureBookingsLimit?: number | null;
  availabilityScheduleId?: string | null;
}

export interface UpdateEventTypeData extends Partial<CreateEventTypeData> {}

export interface EventTypesListParams {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface EventTypesListResponse {
  eventTypes: EventType[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
