export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

export interface DateOverride {
  date: string; // YYYY-MM-DD format
  type: 'available' | 'unavailable';
  slots?: TimeSlot[]; // Required when type is 'available'
}

export interface AvailabilitySchedule {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  timezone: string;
  schedule: DaySchedule[];
  dateOverrides: DateOverride[];
  eventTypeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityScheduleData {
  name: string;
  timezone: string;
  schedule: DaySchedule[];
  dateOverrides?: DateOverride[];
  isDefault?: boolean;
}

export interface UpdateAvailabilityScheduleData extends Partial<CreateAvailabilityScheduleData> {}

export interface AvailabilitySchedulesListParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AvailabilitySchedulesListResponse {
  schedules: AvailabilitySchedule[];
  total: number;
  limit: number;
  offset: number;
}
