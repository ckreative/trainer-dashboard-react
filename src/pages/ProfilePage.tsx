import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft,
  Calendar,
  Video,
  Lock,
  Check,
  MessageSquare,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';

const mainSections = [
  { id: 'profile', label: 'Profile' },
  { id: 'general', label: 'General' },
  { id: 'calendars', label: 'Calendars' },
  { id: 'conferencing', label: 'Conferencing' },
];

const securitySections = [
  { id: 'password', label: 'Password' },
];

export function ProfilePage() {
  const { section = 'profile' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || 'concrete-kreative');
  const [fullName, setFullName] = useState(
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Concrete Kreative'
  );
  const [email] = useState(user?.email || 'darrell@concretekreative.com');
  const [about, setAbout] = useState('');
  const [timezone, setTimezone] = useState(user?.timezone || 'America/New_York');

  // General settings state
  const [language, setLanguage] = useState('en');
  const [generalTimezone, setGeneralTimezone] = useState(user?.timezone || 'America/New_York');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [startOfWeek, setStartOfWeek] = useState('sunday');

  // Calendars state
  const [destinationCalendar, setDestinationCalendar] = useState('darrell-ck');
  const [calendarToggles, setCalendarToggles] = useState({
    'darrell-ck': true,
    'holidays': false,
    'transferred-jan': false,
    'transferred-chirag1': false,
    'transferred-chirag2': false,
  });

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'CK';

  const renderSection = () => {
    switch (section) {
      case 'profile':
        return (
          <div>
            {/* Profile Picture Card */}
            <div
              className="bg-card border border-border rounded-lg"
              style={{ padding: '1.5rem', marginBottom: '1rem' }}
            >
              <div className="flex items-center" style={{ gap: '1.5rem' }}>
                <Avatar style={{ width: '80px', height: '80px' }}>
                  <AvatarImage src={user?.avatarUrl || undefined} />
                  <AvatarFallback
                    className="text-white text-xl font-medium"
                    style={{ backgroundColor: '#6b7280' }}
                  >
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground" style={{ marginBottom: '0.25rem' }}>
                    Profile Picture
                  </p>
                  <p className="text-sm text-muted-foreground" style={{ marginBottom: '0.75rem' }}>
                    Upload a new avatar. Recommended size is 256x256px.
                  </p>
                  <div className="flex items-center" style={{ gap: '0.75rem' }}>
                    <Button variant="outline" size="sm">
                      Upload
                    </Button>
                    <button className="text-sm font-medium text-destructive hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information Card */}
            <div
              className="bg-card border border-border rounded-lg"
              style={{ padding: '1.5rem' }}
            >
              <h2 className="font-semibold text-foreground" style={{ marginBottom: '1.25rem' }}>
                Basic Information
              </h2>

              <div className="flex flex-col" style={{ gap: '1.25rem' }}>
                {/* Username */}
                <div>
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <div className="flex items-center" style={{ marginTop: '0.5rem' }}>
                    <span className="text-sm text-muted-foreground" style={{ marginRight: '0.5rem' }}>
                      yourcompany.com/
                    </span>
                    <div className="relative flex-1">
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-destructive text-white"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ marginTop: '0.5rem' }}>
                    This is your personal URL namespace within our scheduling system.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative" style={{ marginTop: '0.5rem' }}>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-destructive text-white"
                      style={{ width: '28px', height: '28px' }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    style={{ marginTop: '0.5rem' }}
                  />
                  <div className="flex items-center text-sm" style={{ marginTop: '0.5rem', gap: '0.25rem' }}>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Verified</span>
                  </div>
                </div>

                {/* About */}
                <div>
                  <Label htmlFor="about" className="text-sm font-medium">
                    About
                  </Label>
                  <Textarea
                    id="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Tell people a bit about yourself..."
                    rows={3}
                    style={{ marginTop: '0.5rem' }}
                  />
                </div>

                {/* Timezone */}
                <div>
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone
                  </Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger style={{ marginTop: '0.5rem' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (US & Canada)
                      </SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div
            className="bg-card border border-border rounded-lg"
            style={{ padding: '1.5rem' }}
          >
            <div className="flex flex-col" style={{ gap: '1.25rem' }}>
              {/* Language */}
              <div>
                <Label className="text-sm font-medium">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger style={{ marginTop: '0.5rem' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div>
                <Label className="text-sm font-medium">Timezone</Label>
                <div className="flex items-center" style={{ marginTop: '0.5rem', gap: '0.75rem' }}>
                  <Select value={generalTimezone} onValueChange={setGeneralTimezone}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                      <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                      <SelectItem value="America/Denver">America/Denver</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                    Schedule timezone change
                  </Button>
                </div>
              </div>

              {/* Time format */}
              <div>
                <Label className="text-sm font-medium">Time format</Label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger style={{ marginTop: '0.5rem' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 hour</SelectItem>
                    <SelectItem value="24h">24 hour</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" style={{ marginTop: '0.5rem' }}>
                  This is an internal setting that only affects the way time is displayed.
                </p>
              </div>

              {/* Start of week */}
              <div>
                <Label className="text-sm font-medium">Start of week</Label>
                <Select value={startOfWeek} onValueChange={setStartOfWeek}>
                  <SelectTrigger style={{ marginTop: '0.5rem' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end" style={{ marginTop: '1.5rem' }}>
              <Button>Update</Button>
            </div>
          </div>
        );

      case 'calendars':
        return (
          <div className="flex flex-col" style={{ gap: '1.5rem' }}>
            {/* Add to calendar Card */}
            <div
              className="bg-card border border-border rounded-lg"
              style={{ padding: '1.5rem' }}
            >
              <h3 className="font-semibold text-foreground" style={{ marginBottom: '0.25rem' }}>
                Add to calendar
              </h3>
              <p className="text-sm text-muted-foreground" style={{ marginBottom: '1rem' }}>
                Select where to add events when you're booked.
              </p>

              <Label className="text-sm font-medium">Add events to</Label>
              <Select value={destinationCalendar} onValueChange={setDestinationCalendar}>
                <SelectTrigger style={{ marginTop: '0.5rem' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="darrell-ck">Darrell (CK) (Google - Darrell (CK))</SelectItem>
                  <SelectItem value="work">Work Calendar</SelectItem>
                  <SelectItem value="personal">Personal Calendar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground" style={{ marginTop: '0.5rem' }}>
                You can override this on a per-event basis in Advanced settings in each event type.
              </p>
            </div>

            {/* Check for conflicts Card */}
            <div
              className="bg-card border border-border rounded-lg"
              style={{ padding: '1.5rem' }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                <h3 className="font-semibold text-foreground">Check for conflicts</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground" style={{ marginBottom: '1.25rem' }}>
                Select which calendars you want to check for conflicts to prevent double bookings.
              </p>

              {/* Google Calendar Integration */}
              <div
                className="border border-border rounded-lg"
                style={{ padding: '1rem' }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center" style={{ gap: '0.75rem' }}>
                    <div
                      className="flex items-center justify-center rounded-lg"
                      style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe' }}
                    >
                      <Calendar className="h-5 w-5" style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Google Calendar</p>
                      <p className="text-sm text-muted-foreground">darrell@concretekreative.com</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground" style={{ marginBottom: '1rem' }}>
                  Toggle the calendars you want to check for conflicts to prevent double bookings.
                </p>

                {/* Calendar Toggles */}
                <div className="flex flex-col" style={{ gap: '0.75rem' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Darrell (CK)</span>
                    <Switch
                      checked={calendarToggles['darrell-ck']}
                      onCheckedChange={(checked) =>
                        setCalendarToggles((prev) => ({ ...prev, 'darrell-ck': checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Holidays in United States</span>
                    <Switch
                      checked={calendarToggles['holidays']}
                      onCheckedChange={(checked) =>
                        setCalendarToggles((prev) => ({ ...prev, 'holidays': checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Transferred from janpatrick@concretekreative.com</span>
                    <Switch
                      checked={calendarToggles['transferred-jan']}
                      onCheckedChange={(checked) =>
                        setCalendarToggles((prev) => ({ ...prev, 'transferred-jan': checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Transferred from chirag.patel@concretekreative.com</span>
                    <Switch
                      checked={calendarToggles['transferred-chirag1']}
                      onCheckedChange={(checked) =>
                        setCalendarToggles((prev) => ({ ...prev, 'transferred-chirag1': checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Transferred from chirag.patel@concretekreative.com</span>
                    <Switch
                      checked={calendarToggles['transferred-chirag2']}
                      onCheckedChange={(checked) =>
                        setCalendarToggles((prev) => ({ ...prev, 'transferred-chirag2': checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'conferencing':
        return (
          <div
            className="bg-card border border-border rounded-lg"
            style={{ padding: '1.25rem' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start" style={{ gap: '1rem' }}>
                {/* Google Meet Icon */}
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#1a73e8' }}
                >
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <p className="font-medium text-foreground">Google Meet</p>
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Google Meet is Google's web-based video conferencing platform, designed to compete with major conferencing platforms.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div
            className="bg-card border border-border rounded-lg"
            style={{ padding: '1.5rem' }}
          >
            <h3 className="font-semibold text-foreground" style={{ marginBottom: '0.5rem' }}>
              Your account is managed by GOOGLE
            </h3>
            <p className="text-sm text-muted-foreground" style={{ marginBottom: '1.25rem' }}>
              To change your email, password, enable two-factor authentication and more, please visit your GOOGLE account settings.
            </p>
            <Button>Create account password</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <div
          className="bg-card border-r border-border flex-shrink-0"
          style={{ width: '220px', minHeight: '100vh', padding: '1rem 0' }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/event-types')}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            style={{ padding: '0.5rem 1rem', gap: '0.5rem', marginBottom: '1rem' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Organization Name */}
          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            <p className="font-semibold text-foreground">Concrete Kreative</p>
          </div>

          {/* Main Navigation */}
          <nav>
            {mainSections.map((s) => {
              const isActive = section === s.id;
              return (
                <Link
                  key={s.id}
                  to={`/profile/${s.id}`}
                  className={`block text-sm transition-colors ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{
                    padding: '0.5rem 1rem',
                    borderLeft: isActive ? '2px solid #18181b' : '2px solid transparent',
                  }}
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>

          {/* Security Section */}
          <div style={{ marginTop: '1.5rem' }}>
            <div
              className="flex items-center text-sm text-muted-foreground"
              style={{ padding: '0.5rem 1rem', gap: '0.5rem' }}
            >
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </div>
            <nav>
              {securitySections.map((s) => {
                const isActive = section === s.id;
                return (
                  <Link
                    key={s.id}
                    to={`/profile/${s.id}`}
                    className={`block text-sm transition-colors ${
                      isActive
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    style={{
                      padding: '0.5rem 1rem 0.5rem 2.5rem',
                      borderLeft: isActive ? '2px solid #18181b' : '2px solid transparent',
                    }}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* White Header Bar */}
          <div
            className="bg-card border-b border-border"
            style={{ padding: '2rem 3rem' }}
          >
            <div className="flex items-start justify-between" style={{ maxWidth: '900px' }}>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {section === 'profile' && 'Profile'}
                  {section === 'general' && 'General'}
                  {section === 'calendars' && 'Calendars'}
                  {section === 'conferencing' && 'Conferencing'}
                  {section === 'password' && 'Password'}
                </h1>
                <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
                  {section === 'profile' && 'Manage settings for your public profile.'}
                  {section === 'general' && 'Manage your general settings.'}
                  {section === 'calendars' && 'Configure how your event types interact with your calendars'}
                  {section === 'conferencing' && 'Add your favourite video conferencing apps for your meetings'}
                  {section === 'password' && 'Manage settings for your account passwords'}
                </p>
              </div>
              {section === 'calendars' && (
                <Button variant="outline">
                  <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                  Add Calendar
                </Button>
              )}
              {section === 'conferencing' && (
                <Button variant="outline">
                  <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                  Add
                </Button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div style={{ padding: '1.5rem 3rem', maxWidth: '900px' }}>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
