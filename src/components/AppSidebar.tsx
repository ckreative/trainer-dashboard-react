import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Settings,
  ExternalLink,
  Copy,
  LogOut,
  ChevronDown,
  Palette,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const mainItems = [
    {
      title: 'Event Types',
      icon: Calendar,
      path: '/event-types',
    },
    {
      title: 'Bookings',
      icon: BookOpen,
      path: '/bookings',
    },
    {
      title: 'Availability',
      icon: Clock,
      path: '/availability',
    },
  ];

  const getPublicPageUrl = () => {
    const baseUrl = import.meta.env.VITE_BOOKING_APP_URL || 'http://localhost:3001';
    const handle = user?.handle || user?.username || 'user';
    return `${baseUrl}/${handle}/book`;
  };

  const handleCopyPublicLink = () => {
    const publicUrl = getPublicPageUrl();
    navigator.clipboard.writeText(publicUrl);
    toast.success('Public page link copied to clipboard');
  };

  const handleViewPublicPage = () => {
    const publicUrl = getPublicPageUrl();
    window.open(publicUrl, '_blank');
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'U';

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 -m-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.username}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile/general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/branding" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-9">
                      <Link to={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <button
          onClick={handleViewPublicPage}
          className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground py-1.5"
        >
          <ExternalLink className="h-4 w-4" />
          View public page
        </button>
        <button
          onClick={handleCopyPublicLink}
          className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground py-1.5"
        >
          <Copy className="h-4 w-4" />
          Copy public page link
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
