import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, MoreHorizontal, Trash2, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { availabilityService } from '../services/availability';
import { AvailabilitySchedule } from '../types/availability';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function AvailabilityPage() {
  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await availabilityService.list();
      setSchedules(response.schedules);
    } catch (error) {
      console.error('Failed to load availability schedules:', error);
      toast.error('Failed to load availability schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await availabilityService.setDefault(id);
      setSchedules((prev) =>
        prev.map((s) => ({ ...s, isDefault: s.id === id }))
      );
      toast.success('Default schedule updated');
    } catch (error) {
      console.error('Failed to set default schedule:', error);
      toast.error('Failed to update default schedule');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await availabilityService.duplicate(id);
      setSchedules((prev) => [...prev, duplicated]);
      toast.success('Schedule duplicated');
    } catch (error) {
      console.error('Failed to duplicate schedule:', error);
      toast.error('Failed to duplicate schedule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await availabilityService.delete(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      toast.success('Schedule deleted');
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const formatScheduleSummary = (schedule: AvailabilitySchedule) => {
    const enabledDays = schedule.schedule.filter((d) => d.enabled);
    if (enabledDays.length === 0) return 'No availability set';

    // Group days by their time signature (slots stringified)
    const getTimeSignature = (slots: { start: string; end: string }[]) =>
      slots.map((s) => `${s.start}-${s.end}`).sort().join(', ');

    const dayAbbr: Record<string, string> = {
      Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
      Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
    };

    // Group days by time signature
    const groups = new Map<string, { days: string[]; slots: { start: string; end: string }[] }>();
    enabledDays.forEach((day) => {
      const sig = getTimeSignature(day.slots);
      if (!groups.has(sig)) {
        groups.set(sig, { days: [], slots: day.slots });
      }
      groups.get(sig)!.days.push(day.day);
    });

    // Format time as 12h (9:00am)
    const formatTime = (time: string) => {
      const [hourStr, minute] = time.split(':');
      const hour = parseInt(hourStr, 10);
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'am' : 'pm';
      return `${displayHour}:${minute}${period}`;
    };

    // Build summary parts
    const parts: string[] = [];
    groups.forEach(({ days, slots }) => {
      const dayStr = days.map((d) => dayAbbr[d]).join(', ');
      const timeStr = slots.map((s) => `${formatTime(s.start)}-${formatTime(s.end)}`).join(', ');
      parts.push(`${dayStr}: ${timeStr}`);
    });

    return parts.join(' | ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-start justify-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Availability</h1>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            Configure times when you are available for bookings.
          </p>
        </div>
        <Button onClick={() => navigate('/availability/new')}>
          <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
          New
        </Button>
      </div>

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <div
          className="bg-card border border-border rounded-lg text-center"
          style={{ padding: '3rem' }}
        >
          <p className="text-muted-foreground mb-4">No availability schedules yet</p>
          <Button onClick={() => navigate('/availability/new')}>
            <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
            Create your first schedule
          </Button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '0.75rem' }}>
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-card border border-border rounded-lg"
              style={{ padding: '1.25rem 1.5rem' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{schedule.name}</h3>
                    {schedule.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
                    {formatScheduleSummary(schedule)}
                  </p>
                  <div
                    className="flex items-center text-xs text-muted-foreground"
                    style={{ marginTop: '0.5rem', gap: '0.25rem' }}
                  >
                    <Globe className="h-3 w-3" />
                    <span>{schedule.timezone}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/availability/${schedule.id}`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    {!schedule.isDefault && (
                      <DropdownMenuItem
                        onClick={() => handleSetDefault(schedule.id)}
                      >
                        Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(schedule.id)}
                    >
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(schedule.id)}
                      className="text-destructive"
                      disabled={schedule.isDefault}
                    >
                      <Trash2 className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
