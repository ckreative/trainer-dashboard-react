import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TimeSlotInput } from './TimeSlotInput';
import { cn } from '@/components/ui/utils';
import type { DateOverride, TimeSlot } from '@/types/availability';

interface DateOverrideModalProps {
  open: boolean;
  onClose: () => void;
  override?: DateOverride;
  existingDates: string[];
  onSave: (override: DateOverride) => void;
}

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };

export function DateOverrideModal({
  open,
  onClose,
  override,
  existingDates,
  onSave,
}: DateOverrideModalProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [type, setType] = useState<'available' | 'unavailable'>('unavailable');
  const [slots, setSlots] = useState<TimeSlot[]>([{ ...DEFAULT_SLOT }]);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!override;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (override) {
        setDate(new Date(override.date + 'T00:00:00'));
        setType(override.type);
        setSlots(override.slots && override.slots.length > 0 ? override.slots : [{ ...DEFAULT_SLOT }]);
      } else {
        setDate(undefined);
        setType('unavailable');
        setSlots([{ ...DEFAULT_SLOT }]);
      }
      setError(null);
    }
  }, [open, override]);

  const handleAddSlot = () => {
    const lastSlot = slots[slots.length - 1];
    let newStart = '09:00';
    let newEnd = '17:00';

    if (lastSlot) {
      const [lastEndHour, lastEndMinute] = lastSlot.end.split(':').map(Number);
      const newStartHour = Math.min(lastEndHour + 1, 23);
      newStart = `${newStartHour.toString().padStart(2, '0')}:${lastEndMinute.toString().padStart(2, '0')}`;
      const newEndHour = Math.min(newStartHour + 1, 23);
      newEnd = `${newEndHour.toString().padStart(2, '0')}:${lastEndMinute.toString().padStart(2, '0')}`;
    }

    setSlots([...slots, { start: newStart, end: newEnd }]);
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    setSlots(slots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)));
  };

  const handleSave = () => {
    setError(null);

    if (!date) {
      setError('Please select a date');
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');

    // Check for duplicate dates (excluding current override when editing)
    const isDuplicate = existingDates.some((d) => d === dateStr && (!isEditing || d !== override?.date));
    if (isDuplicate) {
      setError('An override for this date already exists');
      return;
    }

    // Validate slots if type is available
    if (type === 'available') {
      for (const slot of slots) {
        if (!slot.start || !slot.end) {
          setError('Please fill in all time slots');
          return;
        }
        if (slot.start >= slot.end) {
          setError('End time must be after start time');
          return;
        }
      }
    }

    onSave({
      date: dateStr,
      type,
      slots: type === 'available' ? slots : undefined,
    });
    onClose();
  };

  // Disable dates that already have overrides
  const disabledDates = existingDates
    .filter((d) => !isEditing || d !== override?.date)
    .map((d) => new Date(d + 'T00:00:00'));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit override' : 'Add date override'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modify the availability for this specific date.'
              : 'Set custom availability for a specific date.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Date picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    disabledDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    )
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Type selector */}
          <div className="space-y-3">
            <Label>Availability</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'available' | 'unavailable')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unavailable" id="unavailable" />
                <Label htmlFor="unavailable" className="cursor-pointer">
                  Unavailable (entire day off)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="available" />
                <Label htmlFor="available" className="cursor-pointer">
                  Available (custom hours)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time slots (only shown when type is 'available') */}
          {type === 'available' && (
            <div className="space-y-3">
              <Label>Hours</Label>
              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <TimeSlotInput
                    key={index}
                    start={slot.start}
                    end={slot.end}
                    onStartChange={(value) => handleSlotChange(index, 'start', value)}
                    onEndChange={(value) => handleSlotChange(index, 'end', value)}
                    onRemove={() => handleRemoveSlot(index)}
                    showRemove={slots.length > 1}
                  />
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSlot}>
                <Plus className="h-4 w-4 mr-2" />
                Add time slot
              </Button>
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEditing ? 'Save changes' : 'Add override'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
