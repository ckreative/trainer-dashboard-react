import { Plus, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TimeSlotInput } from './TimeSlotInput';
import type { TimeSlot } from '@/types/availability';

interface DayScheduleRowProps {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
  onToggle: (enabled: boolean) => void;
  onSlotsChange: (slots: TimeSlot[]) => void;
  onCopy: () => void;
  disabled?: boolean;
}

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };
const DAY_COLUMN_WIDTH = 'w-56'; // 224px for toggle + day name + spacious gap

export function DayScheduleRow({
  day,
  enabled,
  slots,
  onToggle,
  onSlotsChange,
  onCopy,
  disabled = false,
}: DayScheduleRowProps) {
  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (checked && slots.length === 0) {
      onSlotsChange([{ ...DEFAULT_SLOT }]);
    }
  };

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

    onSlotsChange([...slots, { start: newStart, end: newEnd }]);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    onSlotsChange(newSlots);
    if (newSlots.length === 0) {
      onToggle(false);
    }
  };

  const handleSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    const newSlots = slots.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    onSlotsChange(newSlots);
  };

  const canCopy = enabled && slots.length > 0;

  return (
    <div className="py-4 border-b border-border last:border-b-0">
      {/* All slot rows use same grid structure for alignment */}
      {enabled && slots.length > 0 ? (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={index} className="flex items-center">
              {/* Day column - only show content on first row */}
              <div className={`${DAY_COLUMN_WIDTH} shrink-0 flex items-center gap-3 mr-4`}>
                {index === 0 ? (
                  <>
                    <Switch
                      checked={enabled}
                      onCheckedChange={handleToggle}
                      disabled={disabled}
                    />
                    <span className="text-sm font-medium">{day}</span>
                  </>
                ) : null}
              </div>

              {/* Time slot */}
              <TimeSlotInput
                start={slot.start}
                end={slot.end}
                onStartChange={(value) => handleSlotChange(index, 'start', value)}
                onEndChange={(value) => handleSlotChange(index, 'end', value)}
                onRemove={() => handleRemoveSlot(index)}
                showRemove={slots.length > 1}
                disabled={disabled}
              />

              {/* Actions column - only show on first row */}
              <div className="flex items-center gap-3 ml-6 shrink-0">
                {index === 0 ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleAddSlot}
                      disabled={disabled}
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
                      title="Add time slot"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onCopy}
                      disabled={disabled || !canCopy}
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
                      title="Copy to other days"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <div className="w-[78px]" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Disabled state - just show toggle and day name */
        <div className="flex items-center">
          <div className={`${DAY_COLUMN_WIDTH} shrink-0 flex items-center gap-3`}>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={disabled}
            />
            <span className="text-sm font-medium text-muted-foreground">{day}</span>
          </div>
        </div>
      )}
    </div>
  );
}
