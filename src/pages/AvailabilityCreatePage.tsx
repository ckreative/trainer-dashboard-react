import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Pencil } from 'lucide-react';
import { availabilityService } from '@/services/availability';
import { DayScheduleRow } from '@/components/availability/DayScheduleRow';
import { CopyScheduleModal } from '@/components/availability/CopyScheduleModal';
import { DateOverridesSection } from '@/components/availability/DateOverridesSection';
import { DateOverrideModal } from '@/components/availability/DateOverrideModal';
import { formatTimeFor12h } from '@/components/availability/TimeSlotInput';
import type { DaySchedule, DateOverride, TimeSlot } from '@/types/availability';
import { toast } from 'sonner';

const TIMEZONES = [
  { value: 'America/New_York', label: 'America/New York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Denver', label: 'America/Denver' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles' },
  { value: 'America/Anchorage', label: 'America/Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
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

// Generate schedule summary (e.g., "Mon - Fri, 9:00 AM - 5:00 PM")
function generateScheduleSummary(schedule: DaySchedule[]): string {
  const enabledDays = schedule.filter((d) => d.enabled);
  if (enabledDays.length === 0) return 'No availability set';

  // Get day abbreviations
  const dayAbbr: Record<string, string> = {
    Sunday: 'Sun',
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
  };

  // Find consecutive day ranges
  const dayIndices = enabledDays.map((d) => DAYS_OF_WEEK.indexOf(d.day)).sort((a, b) => a - b);

  // Get unique time ranges
  const timeRanges = new Set<string>();
  enabledDays.forEach((day) => {
    day.slots.forEach((slot) => {
      timeRanges.add(`${formatTimeFor12h(slot.start)} - ${formatTimeFor12h(slot.end)}`);
    });
  });

  // Build day string
  let dayString = '';
  if (dayIndices.length === 7) {
    dayString = 'Every day';
  } else if (dayIndices.length === 5 && !dayIndices.includes(0) && !dayIndices.includes(6)) {
    dayString = 'Mon - Fri';
  } else if (dayIndices.length === 2 && dayIndices.includes(0) && dayIndices.includes(6)) {
    dayString = 'Weekends';
  } else {
    dayString = enabledDays.map((d) => dayAbbr[d.day]).join(', ');
  }

  // Build time string
  const timeString = Array.from(timeRanges).slice(0, 2).join(', ');
  if (timeRanges.size > 2) {
    return `${dayString}, ${timeString}...`;
  }

  return `${dayString}, ${timeString}`;
}

export function AvailabilityCreatePage() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('New Schedule');
  const [isEditingName, setIsEditingName] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');
  const [weeklyHours, setWeeklyHours] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceDayIndex, setCopySourceDayIndex] = useState<number | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [editingOverrideIndex, setEditingOverrideIndex] = useState<number | null>(null);

  const handleSave = async () => {
    // Validate name
    if (!name.trim()) {
      toast.error('Schedule name is required');
      return;
    }

    // Validate time slots
    for (const day of weeklyHours) {
      if (day.enabled) {
        for (const slot of day.slots) {
          if (!slot.start || !slot.end) {
            toast.error(`Please fill in all time slots for ${day.day}`);
            return;
          }
          if (slot.start >= slot.end) {
            toast.error(`End time must be after start time for ${day.day}`);
            return;
          }
        }
      }
    }

    setIsSaving(true);
    try {
      const created = await availabilityService.create({
        name: name.trim(),
        timezone,
        schedule: weeklyHours,
        dateOverrides,
      });
      toast.success('Schedule created');
      navigate(`/availability/${created.id}`);
    } catch (error) {
      console.error('Failed to create schedule:', error);
      toast.error('Failed to create schedule');
    } finally {
      setIsSaving(false);
    }
  };

  // Day schedule handlers
  const handleDayToggle = (dayIndex: number, enabled: boolean) => {
    setWeeklyHours((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return {
          ...day,
          enabled,
          slots: enabled && day.slots.length === 0 ? [{ start: '09:00', end: '17:00' }] : day.slots,
        };
      })
    );
  };

  const handleDaySlotsChange = (dayIndex: number, slots: TimeSlot[]) => {
    setWeeklyHours((prev) =>
      prev.map((day, idx) => (idx === dayIndex ? { ...day, slots } : day))
    );
  };

  const handleCopyClick = (dayIndex: number) => {
    setCopySourceDayIndex(dayIndex);
    setCopyModalOpen(true);
  };

  const handleCopyApply = (targetDays: number[]) => {
    if (copySourceDayIndex === null) return;

    const sourceDay = weeklyHours[copySourceDayIndex];
    setWeeklyHours((prev) =>
      prev.map((day, idx) => {
        if (!targetDays.includes(idx)) return day;
        return {
          ...day,
          enabled: true,
          slots: sourceDay.slots.map((slot) => ({ ...slot })),
        };
      })
    );

    toast.success(`Copied to ${targetDays.length} day(s)`);
  };

  // Date override handlers
  const handleAddOverride = () => {
    setEditingOverrideIndex(null);
    setOverrideModalOpen(true);
  };

  const handleEditOverride = (index: number) => {
    setEditingOverrideIndex(index);
    setOverrideModalOpen(true);
  };

  const handleRemoveOverride = (index: number) => {
    setDateOverrides((prev) => prev.filter((_, i) => i !== index));
    toast.success('Override removed');
  };

  const handleSaveOverride = (override: DateOverride) => {
    if (editingOverrideIndex !== null) {
      setDateOverrides((prev) =>
        prev.map((o, i) => (i === editingOverrideIndex ? override : o))
      );
      toast.success('Override updated');
    } else {
      setDateOverrides((prev) => [...prev, override]);
      toast.success('Override added');
    }
  };

  const scheduleSummary = generateScheduleSummary(weeklyHours);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Back link, Name, Summary */}
            <div className="min-w-0">
              <Link
                to="/availability"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1 mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Link>

              <div className="flex items-center gap-1.5">
                {isEditingName ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingName(false);
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    className="text-lg font-semibold h-8 py-1 px-2 w-auto max-w-[300px]"
                    autoFocus
                  />
                ) : (
                  <>
                    <h1 className="text-lg font-semibold truncate">{name}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{scheduleSummary}</p>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" onClick={() => navigate('/availability')} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-6 items-start">
          {/* Left Column: Weekly Hours + Date Overrides */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardContent className="p-6">
                {weeklyHours.map((day, index) => (
                  <DayScheduleRow
                    key={day.day}
                    day={day.day}
                    enabled={day.enabled}
                    slots={day.slots}
                    onToggle={(enabled) => handleDayToggle(index, enabled)}
                    onSlotsChange={(slots) => handleDaySlotsChange(index, slots)}
                    onCopy={() => handleCopyClick(index)}
                    disabled={isSaving}
                  />
                ))}
              </CardContent>
            </Card>

            <DateOverridesSection
              overrides={dateOverrides}
              onAdd={handleAddOverride}
              onEdit={handleEditOverride}
              onRemove={handleRemoveOverride}
              disabled={isSaving}
            />
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-72 shrink-0">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone} disabled={isSaving}>
                <SelectTrigger className="h-10">
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
          </div>
        </div>
      </div>

      {/* Copy Schedule Modal */}
      <CopyScheduleModal
        open={copyModalOpen}
        onClose={() => {
          setCopyModalOpen(false);
          setCopySourceDayIndex(null);
        }}
        sourceDay={copySourceDayIndex !== null ? weeklyHours[copySourceDayIndex]?.day ?? '' : ''}
        sourceDayIndex={copySourceDayIndex ?? 0}
        days={weeklyHours.map((d) => d.day)}
        onApply={handleCopyApply}
      />

      {/* Date Override Modal */}
      <DateOverrideModal
        open={overrideModalOpen}
        onClose={() => {
          setOverrideModalOpen(false);
          setEditingOverrideIndex(null);
        }}
        override={editingOverrideIndex !== null ? dateOverrides[editingOverrideIndex] : undefined}
        existingDates={dateOverrides.map((o) => o.date)}
        onSave={handleSaveOverride}
      />
    </div>
  );
}
