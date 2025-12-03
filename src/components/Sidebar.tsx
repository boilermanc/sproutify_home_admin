import { LayoutDashboard, Users, Leaf, MessageSquare, Bell, Settings, LogOut, UserPlus, CheckCircle2, Shield, Filter, FileText, Rss } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/authContextBase';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Users, label: 'Users', to: '/users' },
  { icon: Leaf, label: 'Content', to: '/content' },
  { icon: MessageSquare, label: 'Challenges', to: '/challenges' },
  { icon: Bell, label: 'Notifications', to: '/notifications' },
  { icon: UserPlus, label: 'Community Signups', to: '/community-signups' },
  { icon: CheckCircle2, label: 'Trial Conversions', to: '/trial-conversions' },
  { icon: Shield, label: 'Moderation', to: '/moderation' },
  { icon: Filter, label: 'Profanity Filter', to: '/profanity-filter' },
  { icon: FileText, label: 'Guidelines', to: '/guidelines' },
  { icon: Rss, label: 'Feed Management', to: '/feed' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out', error);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Sproutify</p>
            <h1 className="text-lg font-semibold text-zinc-900">Home Admin</h1>
          </div>
        </div>

        <Separator className="bg-zinc-100" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Separator className="bg-zinc-100" />

        {/* Logout */}
        <div className="px-3 py-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full justify-start gap-3 rounded-xl px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          >
            {isSigningOut ? (
              <span className="h-5 w-5 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            <span>{isSigningOut ? 'Signing out...' : 'Logout'}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
