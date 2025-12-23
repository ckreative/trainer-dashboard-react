import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CopyScheduleModalProps {
  open: boolean;
  onClose: () => void;
  sourceDay: string;
  sourceDayIndex: number;
  days: string[];
  onApply: (targetDays: number[]) => void;
}

export function CopyScheduleModal({
  open,
  onClose,
  sourceDay,
  sourceDayIndex,
  days,
  onApply,
}: CopyScheduleModalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Reset selected days when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDays([]);
    }
  }, [open]);

  const handleToggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleApply = () => {
    onApply(selectedDays);
    setSelectedDays([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedDays([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Copy times to other days</DialogTitle>
          <DialogDescription>
            Copy {sourceDay}'s availability to the selected days.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {days.map((day, index) => {
            if (index === sourceDayIndex) return null;
            return (
              <div key={day} className="flex items-center space-x-3">
                <Checkbox
                  id={`day-${index}`}
                  checked={selectedDays.includes(index)}
                  onCheckedChange={() => handleToggleDay(index)}
                />
                <Label
                  htmlFor={`day-${index}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {day}
                </Label>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={selectedDays.length === 0}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
