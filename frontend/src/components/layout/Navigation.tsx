/**
 * Main Navigation component
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useMusic } from '../../contexts/MusicContext';
import {
  Home,
  Gamepad2,
  Music,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Headphones,
  Plus,
  Search,
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Music', href: '/music', icon: Music },
] as const;

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { mode, isPremium, initialize } = useMusic();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % 3];
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark' || (nextTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-white/10 dark:border-black/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-main h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-foreground" aria-label="RetroPlay Home">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-green">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="hidden sm:block gradient-text">RetroPlay</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
            className="md:hidden"
          >
            <ThemeIcon className="h-5 w-5" />
          </Button>

          {/* Spotify Connection Status */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => initialize()}
              aria-label={mode === 'none' ? 'Connect Spotify' : `Spotify: ${mode === 'web-playback' ? 'Premium' : 'Free'}`}
              className={cn('relative md:block hidden', mode !== 'none' && 'text-accent-green')}
            >
              <Headphones className="h-5 w-5" />
              {mode !== 'none' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent-green border-2 border-background" />
              )}
            </Button>
          )}

          {/* Spotify Connection Status - Mobile */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => initialize()}
              aria-label={mode === 'none' ? 'Connect Spotify' : `Spotify: ${mode === 'web-playback' ? 'Premium' : 'Free'}`}
              className={cn('relative md:hidden', mode !== 'none' && 'text-accent-green')}
            >
              <Headphones className="h-5 w-5" />
              {mode !== 'none' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent-green border-2 border-background" />
              )}
            </Button>
          )}

          {/* User Menu */}
          {user ? (
            <Dropdown>
              <DropdownTrigger
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-accent"
                aria-label="User menu"
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.display_name || profile?.username || user.email}
                  size="sm"
                  status={mode !== 'none' ? 'online' : 'offline'}
                />
                <span className="hidden sm:block font-medium truncate max-w-[120px]">
                  {profile?.display_name || profile?.username || 'User'}
                </span>
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem onClick={() => {}} icon={<User className="h-4 w-4" />}>
                  Profile
                </DropdownItem>
                <DropdownItem onClick={() => {}} icon={<Settings className="h-4 w-4" />}>
                  Settings
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  onClick={() => signOut()}
                  icon={<LogOut className="h-4 w-4" />}
                  danger
                >
                  Sign Out
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/auth" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/auth?mode=signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-white/10 dark:border-black/10 animate-in slide-in-from-top-2">
          <div className="container-main py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Menu</h3>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                <ThemeIcon className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="pt-4 border-t border-white/10 dark:border-black/10 space-y-2">
                <Dropdown>
                  <DropdownTrigger className="w-full justify-start px-3 py-2 rounded-xl">
                    <Avatar
                      src={profile?.avatar_url}
                      name={profile?.display_name || profile?.username || user.email}
                      size="md"
                      status={mode !== 'none' ? 'online' : 'offline'}
                    />
                    <div className="text-left">
                      <p className="font-medium">{profile?.display_name || profile?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownTrigger>
                  <DropdownContent align="end">
                    <DropdownItem onClick={() => {}} icon={<User className="h-4 w-4" />}>
                      Profile
                    </DropdownItem>
                    <DropdownItem onClick={() => {}} icon={<Settings className="h-4 w-4" />}>
                      Settings
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem
                      onClick={() => signOut()}
                      icon={<LogOut className="h-4 w-4" />}
                      danger
                    >
                      Sign Out
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>
            )}
            {!user && (
              <div className="pt-4 border-t border-white/10 dark:border-black/10 flex flex-col gap-2">
                <Link to="/auth" className="btn btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/auth?mode=signup" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}