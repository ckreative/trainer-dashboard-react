export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

export interface AvailabilitySchedule {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  timezone: string;
  schedule: DaySchedule[];
  eventTypeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityScheduleData {
  name: string;
  timezone: string;
  schedule: DaySchedule[];
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
