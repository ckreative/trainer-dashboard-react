import { Plus, Pencil, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatTimeFor12h } from './TimeSlotInput';
import type { DateOverride } from '@/types/availability';

interface DateOverridesSectionProps {
  overrides: DateOverride[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

// Format date for display (e.g., "Dec 25, 2024")
const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format slots for display (e.g., "9:00 AM - 5:00 PM")
const formatSlotsForDisplay = (override: DateOverride): string => {
  if (override.type === 'unavailable') {
    return 'Unavailable';
  }
  if (!override.slots || override.slots.length === 0) {
    return 'No times set';
  }
  return override.slots
    .map((slot) => `${formatTimeFor12h(slot.start)} - ${formatTimeFor12h(slot.end)}`)
    .join(', ');
};

export function DateOverridesSection({
  overrides,
  onAdd,
  onEdit,
  onRemove,
  disabled = false,
}: DateOverridesSectionProps) {
  // Sort overrides by date
  const sortedOverrides = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card style={{ marginTop: '24px' }}>
      <CardHeader className="pb-4 pt-6 px-6 space-y-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Date overrides</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[250px] text-xs">
                  Add specific dates when your availability differs from your regular weekly hours.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-sm">
          Add dates when your availability changes from your daily hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        {sortedOverrides.length > 0 && (
          <div className="space-y-2 mb-3">
            {sortedOverrides.map((override) => {
              const originalIndex = overrides.findIndex((o) => o.date === override.date);
              return (
                <div
                  key={override.date}
                  className="flex items-center justify-between py-2.5 px-3 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatDateForDisplay(override.date)}</span>
                    {override.type === 'unavailable' ? (
                      <Badge variant="secondary" className="text-xs font-normal">Unavailable</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {formatSlotsForDisplay(override)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(originalIndex)}
                      disabled={disabled}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(originalIndex)}
                      disabled={disabled}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add an override
        </Button>
      </CardContent>
    </Card>
  );
}
