'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock9, Plus, LayoutPanelTop, UserRound } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Progress', icon: Clock9, href: '/progress' },
  { label: 'Workout', icon: Plus, href: '/workout/setup' },
  { label: 'Templates', icon: LayoutPanelTop, href: '/templates' },
  { label: 'Profile', icon: UserRound, href: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path === '/progress' && pathname === '/progress') return true;
    if (path === '/analytics' && pathname === '/analytics') return true;
    if (path === '/workout/setup' && pathname.includes('/workout')) return true;
    if (path === '/templates' && pathname === '/templates') return true;
    if (path === '/profile' && pathname === '/profile') return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--ds-bg-primary)] border-t// border-[color:var(--ds-border)]// pt-1 px-0 z-10">
      <div className="max-w-md mx-auto">
        {/* Pill container per design system */}
        <div className="flex items-center justify-between rounded-lg// bg-[var(--ds-surface-elevated)]/20 border// border-[color:var(--ds-border)//] px-4">
          {navItems.map((item, idx) => {
            const active = isActive(item.href);
            const ItemIcon = item.icon;
            const isCenter = item.label === 'Workout';

            if (isCenter) {
              return (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className="relative -mt-10 flex flex-col items-center">
                  <div
                    className="rounded-full p-4 border-4 border-[var(--ds-bg-primary)] shadow-md"
                    style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}
                  >
                    <ItemIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[11px] mt-1 text-[color:var(--ds-text-secondary)]">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center px-2 py-1"
              >
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border transition-colors ${
                    active
                      ? 'bg-[var(--ds-text-primary)] text-[var(--ds-bg-primary)] border-[color:var(--ds-border-strong)]'
                      : 'bg-transparent text-[color:var(--ds-text-secondary)] border-transparent'
                  }`}
                >
                  <ItemIcon className="h-5 w-5" />
                </div>
                <span
                  className={`text-[11px] mt-1 ${
                    active ? 'text-[color:var(--ds-text-primary)]' : 'text-[color:var(--ds-text-secondary)]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}