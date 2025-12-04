import { Outlet } from 'react-router-dom';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col bg-gray-50">
          <main className="flex-1 p-6">
            {/* Nested routes will render here */}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
