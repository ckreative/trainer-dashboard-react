import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingsService } from '../services/bookings';
import { Booking, BookingStatus } from '../types/bookings';
import { toast } from 'sonner';

const tabs: { id: BookingStatus; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'unconfirmed', label: 'Unconfirmed' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTimeOnly = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  };

  return `${formatTimeOnly(start)} - ${formatTimeOnly(end)}`;
}

function formatAttendees(attendeeName: string): string {
  return `You and ${attendeeName}`;
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingsService.list({ status: activeTab });
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationIcon = (location: string | null) => {
    if (location === 'google_meet' || location === 'zoom') {
      return <Video className="h-4 w-4" />;
    }
    if (location === 'phone') {
      return <Phone className="h-4 w-4" />;
    }
    return null;
  };

  const getLocationLabel = (location: string | null) => {
    switch (location) {
      case 'google_meet':
        return 'Google Meet';
      case 'zoom':
        return 'Zoom';
      case 'phone':
        return 'Phone';
      case 'in_person':
        return 'In Person';
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b border-border"
        style={{ gap: '0.25rem', marginBottom: '1.5rem' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
            }`}
            style={{ padding: '0.5rem 1rem', marginBottom: '-1px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="bg-card border border-border rounded-lg text-center"
          style={{ padding: '3rem' }}
        >
          <p className="text-muted-foreground">No {activeTab} bookings</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '0.75rem' }}>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className="bg-card border border-border rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
              style={{ padding: '1.25rem 1.5rem' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground" style={{ marginBottom: '0.25rem' }}>
                    {formatDate(booking.startTime)}, {formatTime(booking.startTime, booking.endTime)}
                  </div>
                  <h3 className="font-medium text-foreground">{booking.title}</h3>
                  <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
                    {formatAttendees(booking.attendeeName)}
                  </p>
                </div>
                {booking.location && (
                  <div
                    className="flex items-center text-sm text-muted-foreground"
                    style={{ gap: '0.25rem' }}
                  >
                    {getLocationIcon(booking.location)}
                    <span>{getLocationLabel(booking.location)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
