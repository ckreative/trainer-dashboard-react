import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Bold, Italic, MessageSquare } from 'lucide-react';
import { eventTypesService } from '../services/event-types';
import { EventType } from '../types/event-types';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface NewEventTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (eventType: EventType) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function NewEventTypeModal({
  open,
  onOpenChange,
  onSuccess,
}: NewEventTypeModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate URL from title
  useEffect(() => {
    if (title) {
      setUrl(slugify(title));
    }
  }, [title]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (duration <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEventType = await eventTypesService.create({
        title: title.trim(),
        url: url.trim() || slugify(title),
        description: description.trim() || null,
        duration,
        enabled: true,
      });
      toast.success('Event type created successfully');
      onSuccess(newEventType);
      handleClose();
    } catch (error) {
      console.error('Failed to create event type:', error);
      toast.error('Failed to create event type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setDuration(30);
    onOpenChange(false);
  };

  const domainPrefix = `yourcompany.com/${user?.username || 'user'}/`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '480px' }}>
        <DialogHeader>
          <DialogTitle>Add a new event type</DialogTitle>
          <DialogDescription>
            Set up event types to offer different types of meetings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col" style={{ gap: '1.25rem', marginTop: '0.5rem' }}>
          {/* Title */}
          <div>
            <Label htmlFor="event-title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick chat"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          {/* URL */}
          <div>
            <Label htmlFor="event-url" className="text-sm font-medium">
              URL
            </Label>
            <div className="flex items-center" style={{ marginTop: '0.5rem' }}>
              <span
                className="text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-md"
                style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}
              >
                {domainPrefix}
              </span>
              <div className="relative flex-1">
                <Input
                  id="event-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-l-none"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-destructive text-white"
                  style={{ width: '28px', height: '28px' }}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="event-description" className="text-sm font-medium">
              Description
            </Label>
            <div
              className="flex items-center border border-border rounded-t-md bg-muted"
              style={{ marginTop: '0.5rem', padding: '0.25rem', gap: '0.25rem' }}
            >
              <button
                type="button"
                className="p-1.5 rounded hover:bg-background transition-colors"
              >
                <Bold className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-background transition-colors"
              >
                <Italic className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A quick chat with me"
              rows={3}
              className="rounded-t-none border-t-0"
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="event-duration" className="text-sm font-medium">
              Duration
            </Label>
            <div className="flex items-center" style={{ marginTop: '0.5rem', gap: '0.5rem' }}>
              <Input
                id="event-duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                min={1}
                style={{ width: '80px' }}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>
        </div>

        <DialogFooter style={{ marginTop: '1rem' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
