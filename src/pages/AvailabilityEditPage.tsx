import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ArrowLeft, Clock } from 'lucide-react';
import { availabilityService } from '../services/availability';
import { AvailabilitySchedule, DaySchedule } from '../types/availability';
import { toast } from 'sonner';

const TIMEZONES = [
  { value: 'America/New_York', label: '(GMT-05:00) America/New York' },
  { value: 'America/Chicago', label: '(GMT-06:00) America/Chicago' },
  { value: 'America/Denver', label: '(GMT-07:00) America/Denver' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) America/Los Angeles' },
  { value: 'America/Anchorage', label: '(GMT-09:00) America/Anchorage' },
  { value: 'Pacific/Honolulu', label: '(GMT-10:00) Pacific/Honolulu' },
  { value: 'Europe/London', label: '(GMT+00:00) Europe/London' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Europe/Paris' },
  { value: 'Europe/Berlin', label: '(GMT+01:00) Europe/Berlin' },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: '(GMT+08:00) Asia/Shanghai' },
  { value: 'Australia/Sydney', label: '(GMT+11:00) Australia/Sydney' },
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map((day) => ({
  day,
  enabled: !['Sunday', 'Saturday'].includes(day),
  slots: !['Sunday', 'Saturday'].includes(day)
    ? [{ start: '09:00', end: '17:00' }]
    : [],
}));

// Convert 24h time to 12h format for display
function formatTimeFor12h(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Convert 12h time to 24h format for storage
function parse12hTo24h(time12h: string): string {
  const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12h;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

export function AvailabilityEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState<AvailabilitySchedule | null>(null);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [weeklyHours, setWeeklyHours] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadSchedule(id);
    }
  }, [id]);

  const loadSchedule = async (scheduleId: string) => {
    setIsLoading(true);
    try {
      const data = await availabilityService.get(scheduleId);
      setSchedule(data);
      setName(data.name);
      setTimezone(data.timezone);
      setWeeklyHours(data.schedule);
    } catch (error) {
      console.error('Failed to load schedule:', error);
      toast.error('Failed to load schedule');
      navigate('/availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      await availabilityService.update(id, {
        name,
        timezone,
        schedule: weeklyHours,
      });
      toast.success('Schedule saved');
      navigate('/availability');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/availability');
  };

  const handleDayToggle = (dayIndex: number) => {
    setWeeklyHours((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const newEnabled = !day.enabled;
        return {
          ...day,
          enabled: newEnabled,
          slots: newEnabled && day.slots.length === 0
            ? [{ start: '09:00', end: '17:00' }]
            : day.slots,
        };
      })
    );
  };

  const handleTimeChange = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setWeeklyHours((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const newSlots = [...day.slots];
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          [field]: parse12hTo24h(value),
        };
        return { ...day, slots: newSlots };
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Back Link */}
      <Link
        to="/availability"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        style={{ marginBottom: '1.5rem', gap: '0.5rem' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-xl font-semibold text-foreground">Edit Schedule</h1>
        <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
          Configure your availability schedule
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col" style={{ gap: '1.5rem' }}>
        {/* Schedule Name */}
        <div>
          <Label htmlFor="schedule-name" className="text-sm font-medium">
            Schedule Name
          </Label>
          <Input
            id="schedule-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-muted border-0"
            style={{ marginTop: '0.5rem' }}
          />
        </div>

        {/* Timezone */}
        <div>
          <Label className="text-sm font-medium">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="bg-muted border-0" style={{ marginTop: '0.5rem' }}>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weekly Hours */}
        <div>
          <Label className="text-sm font-medium">Weekly Hours</Label>
          <div className="flex flex-col" style={{ marginTop: '0.75rem', gap: '0.5rem' }}>
            {weeklyHours.map((day, dayIndex) => (
              <div
                key={day.day}
                className="flex items-center"
                style={{ gap: '1rem', minHeight: '40px' }}
              >
                <Checkbox
                  checked={day.enabled}
                  onCheckedChange={() => handleDayToggle(dayIndex)}
                  id={`day-${day.day}`}
                />
                <label
                  htmlFor={`day-${day.day}`}
                  className="text-sm text-foreground cursor-pointer"
                  style={{ width: '100px' }}
                >
                  {day.day}
                </label>

                {day.enabled && day.slots.length > 0 && (
                  <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formatTimeFor12h(day.slots[0].start)}
                        onChange={(e) =>
                          handleTimeChange(dayIndex, 0, 'start', e.target.value)
                        }
                        className="bg-muted border-0 text-sm"
                        style={{ width: '120px', paddingRight: '2rem' }}
                      />
                      <Clock
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">to</span>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formatTimeFor12h(day.slots[0].end)}
                        onChange={(e) =>
                          handleTimeChange(dayIndex, 0, 'end', e.target.value)
                        }
                        className="bg-muted border-0 text-sm"
                        style={{ width: '120px', paddingRight: '2rem' }}
                      />
                      <Clock
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div
        className="flex items-center justify-end"
        style={{ marginTop: '2rem', gap: '0.75rem' }}
      >
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
