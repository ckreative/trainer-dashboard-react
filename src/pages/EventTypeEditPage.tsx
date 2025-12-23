import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  ArrowLeft,
  Clock,
  Calendar,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Bookmark,
  MoreHorizontal,
  Bold,
  Italic,
  Link as LinkIcon,
  Video,
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Globe,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { eventTypesService } from '../services/event-types';
import { availabilityService } from '../services/availability';
import { AvailabilitySchedule, DaySchedule } from '../types/availability';
import { EventType } from '../types/event-types';
import { toast } from 'sonner';

const sections = [
  {
    id: 'basics',
    label: 'Basics',
    icon: Clock,
    getSubtitle: (eventType: EventType | null) =>
      eventType ? `${eventType.duration} mins` : '',
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: Calendar,
    getSubtitle: () => 'Working Hours',
  },
  {
    id: 'limits',
    label: 'Limits',
    icon: SlidersHorizontal,
    getSubtitle: () => 'How often you can be booked',
  },
];

export function EventTypeEditPage() {
  const { id, section = 'basics' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availabilitySchedules, setAvailabilitySchedules] = useState<AvailabilitySchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(30);
  const [allowMultipleDurations, setAllowMultipleDurations] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (id) {
      loadEventType(id);
    }
    loadAvailabilitySchedules();
  }, [id]);

  const loadAvailabilitySchedules = async () => {
    try {
      const response = await availabilityService.list();
      setAvailabilitySchedules(response.schedules);
    } catch (error) {
      console.error('Failed to load availability schedules:', error);
    }
  };

  const loadEventType = async (eventTypeId: string) => {
    setIsLoading(true);
    try {
      const data = await eventTypesService.get(eventTypeId);
      setEventType(data);
      // Populate form state
      setTitle(data.title);
      setDescription(data.description || '');
      setUrl(data.url);
      setDuration(data.duration);
      setAllowMultipleDurations(data.allowMultipleDurations);
      setLocation(data.location);
      setEnabled(data.enabled);
      setSelectedScheduleId(data.availabilityScheduleId);
    } catch (error) {
      console.error('Failed to load event type:', error);
      toast.error('Failed to load event type');
      navigate('/event-types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      const updated = await eventTypesService.update(id, {
        title,
        description: description || null,
        url,
        duration,
        allowMultipleDurations,
        location,
        enabled,
      });
      setEventType(updated);
      toast.success('Event type saved');
    } catch (error) {
      console.error('Failed to save event type:', error);
      toast.error('Failed to save event type');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (eventType) {
      navigator.clipboard.writeText(eventType.fullUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const handleRemoveLocation = () => {
    setLocation(null);
  };

  const getLocationLabel = (loc: string | null) => {
    switch (loc) {
      case 'google_meet':
        return 'Google Meet';
      case 'zoom':
        return 'Zoom';
      case 'phone':
        return 'Phone';
      case 'in_person':
        return 'In Person';
      default:
        return loc;
    }
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'U';

  const domainPrefix = `yourdomain.com/${user?.username || 'username'}/`;

  // Get the selected schedule (either by ID or fall back to default)
  const selectedSchedule = selectedScheduleId
    ? availabilitySchedules.find((s) => s.id === selectedScheduleId)
    : availabilitySchedules.find((s) => s.isDefault);

  // Helper to format time from 24h (HH:MM) to 12h (H:MM AM/PM)
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Days in order for display
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  const renderBasicsSection = () => (
    <div className="flex flex-col" style={{ gap: '1.5rem' }}>
      {/* Title */}
      <div>
        <Label htmlFor="event-title" className="text-sm font-medium">
          Title
        </Label>
        <Input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-muted border-0"
          style={{ marginTop: '0.5rem' }}
        />
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
          <button
            type="button"
            className="p-1.5 rounded hover:bg-background transition-colors"
          >
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <Textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A quick video meeting."
          rows={3}
          className="rounded-t-none border-t-0 bg-muted border-0"
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
              className="rounded-l-none bg-muted border-0"
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-destructive text-white flex items-center justify-center"
              style={{ width: '28px', height: '28px' }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="event-duration" className="text-sm font-medium">
          Duration
        </Label>
        <div
          className="flex items-center"
          style={{ marginTop: '0.5rem', gap: '0.5rem' }}
        >
          <Input
            id="event-duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            min={1}
            className="bg-muted border-0"
            style={{ width: '80px' }}
          />
          <span className="text-sm text-muted-foreground">Minutes</span>
        </div>
        <div
          className="flex items-center"
          style={{ marginTop: '0.75rem', gap: '0.5rem' }}
        >
          <Switch
            checked={allowMultipleDurations}
            onCheckedChange={setAllowMultipleDurations}
          />
          <span className="text-sm text-foreground">Allow multiple durations</span>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-medium">Location</Label>
        <div style={{ marginTop: '0.5rem' }}>
          {location && (
            <div
              className="flex items-center justify-between border border-border rounded-lg"
              style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem' }}
            >
              <div className="flex items-center" style={{ gap: '0.75rem' }}>
                <Video className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {getLocationLabel(location)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveLocation}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}
          <button
            type="button"
            className="flex items-center justify-center w-full border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            style={{ padding: '0.75rem' }}
            onClick={() => setLocation('google_meet')}
          >
            <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
            Add a location
          </button>
        </div>
      </div>
    </div>
  );

  const renderAvailabilitySection = () => {
    // Get schedule data for display
    const getDaySchedule = (dayName: string): DaySchedule | undefined => {
      if (!selectedSchedule) return undefined;
      return selectedSchedule.schedule.find(
        (d) => d.day.toLowerCase() === dayName.toLowerCase()
      );
    };

    return (
      <div className="flex flex-col" style={{ gap: '1.5rem' }}>
        {/* Availability Label */}
        <div>
          <Label className="text-sm font-medium">Availability</Label>
        </div>

        {/* Schedule Selector */}
        <div>
          <Select
            value={selectedScheduleId || selectedSchedule?.id || ''}
            onValueChange={(value) => setSelectedScheduleId(value)}
          >
            <SelectTrigger className="bg-muted border-0" style={{ width: '100%' }}>
              <div className="flex items-center" style={{ gap: '0.5rem' }}>
                <SelectValue placeholder="Select a schedule">
                  {selectedSchedule?.name || 'Working Hours'}
                </SelectValue>
                {selectedSchedule?.isDefault && (
                  <span
                    className="text-xs bg-gray-200 text-gray-600 rounded"
                    style={{ padding: '0.125rem 0.375rem' }}
                  >
                    Default
                  </span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              {availabilitySchedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.id}>
                  <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    {schedule.name}
                    {schedule.isDefault && (
                      <span
                        className="text-xs bg-gray-200 text-gray-600 rounded"
                        style={{ padding: '0.125rem 0.375rem' }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weekly Schedule Display */}
        <div className="flex flex-col" style={{ gap: '0.5rem' }}>
          {daysOfWeek.map((day) => {
            const daySchedule = getDaySchedule(day);
            const isAvailable = daySchedule?.enabled && daySchedule.slots.length > 0;

            return (
              <div
                key={day}
                className="flex items-center justify-between"
                style={{ padding: '0.25rem 0' }}
              >
                <span className="text-sm text-foreground" style={{ width: '100px' }}>
                  {day}
                </span>
                <div className="flex items-center" style={{ gap: '0.5rem' }}>
                  {isAvailable && daySchedule.slots.length > 0 ? (
                    daySchedule.slots.map((slot, idx) => (
                      <span key={idx} className="text-sm text-muted-foreground">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timezone and Edit Link */}
        <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
          <div className="flex items-center" style={{ gap: '0.5rem' }}>
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedSchedule?.timezone || 'America/New_York'}
            </span>
          </div>
          <Link
            to={selectedSchedule ? `/availability/${selectedSchedule.id}?returnTo=/event-types/${id}/availability` : '/availability'}
            className="text-sm text-primary hover:underline"
          >
            Edit availability
          </Link>
        </div>
      </div>
    );
  };

  const renderLimitsSection = () => (
    <div className="flex flex-col" style={{ gap: '1.5rem' }}>
      {/* Before/After Event Buffer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <Label className="text-sm font-medium">Before event</Label>
          <Select defaultValue="no_buffer">
            <SelectTrigger className="bg-muted border-0" style={{ marginTop: '0.5rem' }}>
              <SelectValue placeholder="No buffer time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_buffer">No buffer time</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">After event</Label>
          <Select defaultValue="no_buffer">
            <SelectTrigger className="bg-muted border-0" style={{ marginTop: '0.5rem' }}>
              <SelectValue placeholder="No buffer time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_buffer">No buffer time</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Minimum Notice / Time-slot intervals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <Label className="text-sm font-medium">Minimum Notice</Label>
          <div className="flex" style={{ marginTop: '0.5rem', gap: '0.5rem' }}>
            <Input
              type="number"
              defaultValue={2}
              className="bg-muted border-0"
              style={{ width: '80px' }}
            />
            <Select defaultValue="hours">
              <SelectTrigger className="bg-muted border-0 flex-1">
                <SelectValue placeholder="Hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Time-slot intervals</Label>
          <Select defaultValue="event_length">
            <SelectTrigger className="bg-muted border-0" style={{ marginTop: '0.5rem' }}>
              <SelectValue placeholder="Use event length (default)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event_length">Use event length (default)</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Limit booking frequency */}
      <div
        className="border border-border rounded-lg flex items-center justify-between"
        style={{ padding: '1rem 1.25rem' }}
      >
        <div>
          <p className="text-sm font-medium text-foreground">Limit booking frequency</p>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            Limit how many times this event can be booked
          </p>
        </div>
        <Switch />
      </div>

      {/* Only show first slot */}
      <div
        className="border border-border rounded-lg flex items-center justify-between"
        style={{ padding: '1rem 1.25rem' }}
      >
        <div style={{ maxWidth: '85%' }}>
          <p className="text-sm font-medium text-foreground">
            Only show the first slot of each day as available
          </p>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            This will limit your availability for this event type to one slot per day, scheduled at the earliest available time.
          </p>
        </div>
        <Switch />
      </div>

      {/* Limit total booking duration */}
      <div
        className="border border-border rounded-lg flex items-center justify-between"
        style={{ padding: '1rem 1.25rem' }}
      >
        <div>
          <p className="text-sm font-medium text-foreground">Limit total booking duration</p>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            Limit total amount of time that this event can be booked
          </p>
        </div>
        <Switch />
      </div>

      {/* Limit number of upcoming bookings per booker */}
      <div
        className="border border-border rounded-lg flex items-center justify-between"
        style={{ padding: '1rem 1.25rem' }}
      >
        <div>
          <p className="text-sm font-medium text-foreground">
            Limit number of upcoming bookings per booker
          </p>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            Limit the number of active bookings a booker can make for this event type
          </p>
        </div>
        <Switch />
      </div>

      {/* Limit future bookings */}
      <div
        className="border border-border rounded-lg flex items-center justify-between"
        style={{ padding: '1rem 1.25rem' }}
      >
        <div>
          <p className="text-sm font-medium text-foreground">Limit future bookings</p>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
            Limit how far in the future this event can be booked
          </p>
        </div>
        <Switch />
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'basics':
        return renderBasicsSection();
      case 'availability':
        return renderAvailabilitySection();
      case 'limits':
        return renderLimitsSection();
      default:
        return renderBasicsSection();
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Left Sidebar - Main App Navigation */}
        <div
          className="bg-card border-r border-border flex-shrink-0 flex flex-col"
          style={{ width: '220px', minHeight: '100vh' }}
        >
          {/* User Header */}
          <div
            className="border-b border-border flex items-center"
            style={{ padding: '0 1rem', height: '57px' }}
          >
            <div className="flex items-center" style={{ gap: '0.75rem' }}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName
                    ? `${user.firstName.substring(0, 10)}...`
                    : 'User'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Main Navigation */}
          <nav style={{ padding: '0.5rem' }}>
            <Link
              to="/event-types"
              className="flex items-center text-sm text-foreground font-medium rounded-md hover:bg-muted transition-colors"
              style={{ padding: '0.5rem 0.75rem', gap: '0.75rem' }}
            >
              <Calendar className="h-4 w-4" />
              Event Types
            </Link>
            <Link
              to="/bookings"
              className="flex items-center text-sm text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
              style={{ padding: '0.5rem 0.75rem', gap: '0.75rem' }}
            >
              <BookOpen className="h-4 w-4" />
              Bookings
            </Link>
            <Link
              to="/availability"
              className="flex items-center text-sm text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
              style={{ padding: '0.5rem 0.75rem', gap: '0.75rem' }}
            >
              <Clock className="h-4 w-4" />
              Availability
            </Link>
          </nav>

          {/* Footer */}
          <div className="mt-auto border-t border-border" style={{ padding: '0.75rem 1rem' }}>
            <button className="flex items-center text-sm text-muted-foreground hover:text-foreground w-full" style={{ gap: '0.5rem', padding: '0.5rem 0' }}>
              <ExternalLink className="h-4 w-4" />
              View public page
            </button>
            <button className="flex items-center text-sm text-muted-foreground hover:text-foreground w-full" style={{ gap: '0.5rem', padding: '0.5rem 0' }}>
              <Copy className="h-4 w-4" />
              Copy public page link
            </button>
          </div>
        </div>

        {/* Middle Sidebar - Event Type Navigation */}
        <div
          className="bg-card border-r border-border flex-shrink-0 flex flex-col"
          style={{ width: '260px', minHeight: '100vh' }}
        >
          {/* Back Link Header - matches height of content header */}
          <div
            className="border-b border-border flex items-center"
            style={{ padding: '0 1rem', height: '57px' }}
          >
            <Link
              to="/event-types"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              style={{ gap: '0.5rem' }}
            >
              <ArrowLeft className="h-4 w-4" />
              {eventType?.title || 'Back'}
            </Link>
          </div>

          {/* Section Navigation */}
          <nav>
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = section === s.id;
              return (
                <Link
                  key={s.id}
                  to={`/event-types/${id}/${s.id}`}
                  className="flex items-center justify-between transition-colors"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center" style={{ gap: '0.75rem' }}>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.getSubtitle(eventType)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#fafafa' }}>
          {/* Header Bar */}
          <div
            className="bg-card border-b border-border flex items-center justify-between"
            style={{ padding: '0 1.5rem', height: '57px' }}
          >
            <h1 className="text-lg font-semibold text-foreground">
              {eventType?.title || 'Event Type'}
            </h1>
            <div className="flex items-center" style={{ gap: '0.5rem' }}>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <button
                type="button"
                className="p-2 rounded hover:bg-muted transition-colors"
                onClick={() => window.open(eventType?.fullUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="p-2 rounded hover:bg-muted transition-colors"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="p-2 rounded hover:bg-muted transition-colors"
              >
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ padding: '1.5rem', maxWidth: '720px' }}>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
