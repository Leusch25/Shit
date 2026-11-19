/**
 * Main Layout component
 */

import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { MusicPlayerBar } from './MusicPlayerBar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  showSidebar?: boolean;
  sidebarProps?: React.ComponentProps<typeof Sidebar>;
}

export function Layout({ showSidebar = true, sidebarProps }: LayoutProps) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navigation />

      <main className="pt-16 pb-88 lg:pb-24 min-h-[calc(100vh-16rem)]">
        <div className="container-main">
          <div className={cn(
            'flex gap-6',
            showSidebar ? 'lg:pl-80' : ''
          )}>
            {showSidebar && <Sidebar {...sidebarProps} />}
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <MusicPlayerBar />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}