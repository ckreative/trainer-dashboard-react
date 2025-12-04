import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, MoreHorizontal, ExternalLink, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Switch } from '../components/ui/switch';
import { eventTypesService } from '../services/event-types';
import { EventType } from '../types/event-types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { NewEventTypeModal } from '../components/NewEventTypeModal';

export function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      const response = await eventTypesService.list();
      setEventTypes(response.eventTypes);
    } catch (error) {
      console.error('Failed to load event types:', error);
      toast.error('Failed to load event types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await eventTypesService.toggle(id, enabled);
      setEventTypes((prev) =>
        prev.map((et) => (et.id === id ? { ...et, enabled } : et))
      );
      toast.success(enabled ? 'Event type enabled' : 'Event type disabled');
    } catch (error) {
      console.error('Failed to toggle event type:', error);
      toast.error('Failed to update event type');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await eventTypesService.duplicate(id);
      setEventTypes((prev) => [...prev, duplicated]);
      toast.success('Event type duplicated');
    } catch (error) {
      console.error('Failed to duplicate event type:', error);
      toast.error('Failed to duplicate event type');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventTypesService.delete(id);
      setEventTypes((prev) => prev.filter((et) => et.id !== id));
      toast.success('Event type deleted');
    } catch (error) {
      console.error('Failed to delete event type:', error);
      toast.error('Failed to delete event type');
    }
  };

  const handleCopyLink = (eventType: EventType) => {
    navigator.clipboard.writeText(eventType.fullUrl);
    toast.success('Link copied to clipboard');
  };

  const handleEventTypeCreated = (newEventType: EventType) => {
    setEventTypes((prev) => [...prev, newEventType]);
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
          <h1 className="text-2xl font-semibold text-foreground">Event Types</h1>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
          New
        </Button>
      </div>

      {/* Event Types List */}
      {eventTypes.length === 0 ? (
        <div
          className="bg-card border border-border rounded-lg text-center"
          style={{ padding: '3rem' }}
        >
          <p className="text-muted-foreground" style={{ marginBottom: '1rem' }}>No event types yet</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
            Create your first event type
          </Button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '0.75rem' }}>
          {eventTypes.map((eventType) => (
            <div
              key={eventType.id}
              className="bg-card border border-border rounded-lg flex items-center"
              style={{ padding: '1.25rem 1.5rem', gap: '1rem' }}
            >
              <div
                className="rounded-full"
                style={{ width: '4px', height: '48px', backgroundColor: '#9ca3af' }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: '0.5rem' }}>
                  <h3 className="font-medium text-foreground">{eventType.title}</h3>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{eventType.url}</span>
                </div>
                <div
                  className="flex items-center text-sm text-muted-foreground"
                  style={{ marginTop: '0.25rem', gap: '0.5rem' }}
                >
                  <span>{eventType.duration} min</span>
                  {eventType.location && (
                    <>
                      <span>|</span>
                      <span>{eventType.location}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center" style={{ gap: '1rem' }}>
                <Switch
                  checked={eventType.enabled}
                  onCheckedChange={(checked) => handleToggle(eventType.id, checked)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/event-types/${eventType.id}`)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open(eventType.fullUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyLink(eventType)}>
                      <Copy className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(eventType.id)}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(eventType.id)}
                      className="text-destructive"
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

      <NewEventTypeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleEventTypeCreated}
      />
    </div>
  );
}
