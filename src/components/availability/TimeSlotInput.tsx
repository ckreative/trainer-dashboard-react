import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeSlotInputProps {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  disabled?: boolean;
}

// Generate time options in 15-minute increments
const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'am' : 'pm';
      const label = `${displayHour}:${minute.toString().padStart(2, '0')}${period}`;
      options.push({ value, label });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Convert 24h format to 12h display format (e.g., "12:00pm")
export const formatTimeFor12h = (time24: string): string => {
  if (!time24) return '';
  const [hourStr, minute] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? 'am' : 'pm';
  return `${displayHour}:${minute}${period}`;
};

export function TimeSlotInput({
  start,
  end,
  onStartChange,
  onEndChange,
  onRemove,
  showRemove = true,
  disabled = false,
}: TimeSlotInputProps) {
  return (
    <div className="flex items-center">
      <Select value={start} onValueChange={onStartChange} disabled={disabled}>
        <SelectTrigger className="w-[105px] h-10">
          <SelectValue placeholder="Start">
            {start ? formatTimeFor12h(start) : 'Start'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-10 flex justify-center">
        <span className="text-muted-foreground">-</span>
      </div>

      <Select value={end} onValueChange={onEndChange} disabled={disabled}>
        <SelectTrigger className="w-[105px] h-10">
          <SelectValue placeholder="End">
            {end ? formatTimeFor12h(end) : 'End'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showRemove && onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
