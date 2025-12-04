import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ExternalLink, ChevronLeft } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { bookingsService } from '../services/bookings';
import { Booking } from '../types/bookings';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Helper to format date like "Tuesday, October 28, 2025"
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper to format time like "10:00 AM"
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Helper to get timezone display name
function getTimezoneDisplay(timezone: string): string {
  const timezoneMap: Record<string, string> = {
    'America/Los_Angeles': 'Pacific Daylight Time',
    'America/Denver': 'Mountain Daylight Time',
    'America/Chicago': 'Central Daylight Time',
    'America/New_York': 'Eastern Daylight Time',
    'Europe/London': 'British Summer Time',
    'Europe/Paris': 'Central European Summer Time',
    'Asia/Tokyo': 'Japan Standard Time',
  };
  return timezoneMap[timezone] || timezone;
}

// Helper to get status message
function getStatusMessage(status: string): string {
  switch (status) {
    case 'past':
      return 'The event is in the past';
    case 'upcoming':
      return 'This event is confirmed';
    case 'cancelled':
      return 'This event was cancelled';
    case 'unconfirmed':
      return 'This event is pending confirmation';
    default:
      return 'Event details';
  }
}

// Helper to get location display
function getLocationDisplay(location: string | null): string {
  switch (location) {
    case 'google_meet':
      return 'Google Meet';
    case 'zoom':
      return 'Zoom';
    case 'phone':
      return 'Phone Call';
    case 'in_person':
      return 'In Person';
    default:
      return location || 'No location specified';
  }
}

export function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBooking(id);
    }
  }, [id]);

  const loadBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      const data = await bookingsService.get(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Failed to load booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#f8fafc' }}
      >
        <div className="text-center">
          <p className="text-muted-foreground">Booking not found</p>
          <Link
            to="/bookings"
            className="text-primary hover:underline"
            style={{ marginTop: '1rem', display: 'inline-block' }}
          >
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Back Link */}
      <div style={{ padding: '1.5rem' }}>
        <Link
          to="/bookings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          style={{ gap: '0.25rem' }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to bookings
        </Link>
      </div>

      {/* Centered Card */}
      <div
        className="flex justify-center"
        style={{ padding: '0 1.5rem 3rem' }}
      >
        <div
          className="bg-card border border-border rounded-lg w-full"
          style={{ maxWidth: '560px', padding: '2.5rem' }}
        >
          {/* Success Icon */}
          <div className="flex justify-center" style={{ marginBottom: '1.5rem' }}>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dcfce7',
              }}
            >
              <Check className="h-7 w-7" style={{ color: '#16a34a' }} />
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-xl font-semibold text-foreground text-center"
            style={{ marginBottom: '0.5rem' }}
          >
            {getStatusMessage(booking.status)}
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm text-muted-foreground text-center"
            style={{ marginBottom: '2rem' }}
          >
            We sent an email with a calendar invitation with the details to everyone.
          </p>

          {/* Details Grid */}
          <div className="flex flex-col" style={{ gap: '1.25rem' }}>
            {/* What */}
            <div className="flex" style={{ gap: '2rem' }}>
              <span
                className="text-sm text-muted-foreground"
                style={{ width: '60px', flexShrink: 0 }}
              >
                What
              </span>
              <span className="text-sm font-medium text-foreground">
                {booking.title}
              </span>
            </div>

            {/* When */}
            <div className="flex" style={{ gap: '2rem' }}>
              <span
                className="text-sm text-muted-foreground"
                style={{ width: '60px', flexShrink: 0 }}
              >
                When
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatFullDate(booking.startTime)}
                </p>
                <p className="text-sm text-foreground">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)} ({getTimezoneDisplay(booking.timezone)})
                </p>
              </div>
            </div>

            {/* Who */}
            <div className="flex" style={{ gap: '2rem' }}>
              <span
                className="text-sm text-muted-foreground"
                style={{ width: '60px', flexShrink: 0 }}
              >
                Who
              </span>
              <div className="flex flex-col" style={{ gap: '0.75rem' }}>
                {/* Host */}
                <div>
                  <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    <span className="text-sm font-medium text-foreground">You</span>
                    <Badge variant="secondary" className="text-xs">
                      Host
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || 'you@example.com'}
                  </p>
                </div>

                {/* Attendee */}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.attendeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.attendeeEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Where */}
            {booking.location && (
              <div className="flex" style={{ gap: '2rem' }}>
                <span
                  className="text-sm text-muted-foreground"
                  style={{ width: '60px', flexShrink: 0 }}
                >
                  Where
                </span>
                <div>
                  {booking.meetingUrl ? (
                    <a
                      href={booking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary"
                      style={{ gap: '0.25rem' }}
                    >
                      {getLocationDisplay(booking.location)}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {getLocationDisplay(booking.location)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <p
              className="text-sm text-muted-foreground text-center"
              style={{ marginBottom: '1rem' }}
            >
              Need to make a change?
            </p>

            {/* Add to Calendar */}
            <div className="flex items-center justify-center" style={{ gap: '0.75rem' }}>
              <span className="text-sm text-muted-foreground">Add to calendar</span>
              <div className="flex items-center" style={{ gap: '0.5rem' }}>
                {/* Apple Calendar */}
                <button
                  type="button"
                  className="flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                  style={{ width: '32px', height: '32px' }}
                  title="Apple Calendar"
                >
                  <span style={{ fontSize: '14px' }}>+</span>
                </button>
                {/* Google Calendar */}
                <button
                  type="button"
                  className="flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                  style={{ width: '32px', height: '32px', backgroundColor: '#ea4335' }}
                  title="Google Calendar"
                >
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>G</span>
                </button>
                {/* Outlook */}
                <button
                  type="button"
                  className="flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                  style={{ width: '32px', height: '32px', backgroundColor: '#0078d4' }}
                  title="Outlook"
                >
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>O</span>
                </button>
                {/* Other */}
                <button
                  type="button"
                  className="flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                  style={{ width: '32px', height: '32px', backgroundColor: '#00a4ef' }}
                  title="Other Calendar"
                >
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
