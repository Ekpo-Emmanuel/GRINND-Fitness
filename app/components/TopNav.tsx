'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound, ChevronDown, LayoutPanelTop, FileText, Sun, Moon } from 'lucide-react';
import SignOutButton from '../auth/components/SignOutButton';
import Logo from '@/components/logo';
import { useAuth } from '@/app/providers';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 bg-[var(--ds-bg-primary)] border-b border-[color:var(--ds-border)] py-2 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
          <Logo className="" />
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => {
              const current = theme === 'system' ? systemTheme : theme;
              setTheme(current === 'dark' ? 'light' : 'dark');
            }}
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-bg-secondary)] transition-colors"
          >
            {mounted && ((theme === 'system' ? systemTheme : theme) === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            ))}
          </button>

          <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-bg-secondary)] transition-colors"
          >
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="User avatar"
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5" />
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={closeDropdown}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[color:var(--ds-border)] bg-[var(--ds-surface)] shadow-md z-20 py-2">
                <Link
                  href="/analytics"
                  className={`flex items-center px-4 py-2 text-sm rounded-md mx-2 ${
                    isActive('/analytics')
                      ? 'bg-[var(--ds-bg-secondary)] text-[color:var(--ds-text-primary)]'
                      : 'text-[color:var(--ds-text-secondary)] hover:bg-[var(--ds-bg-secondary)]'
                  }`}
                  onClick={closeDropdown}
                >
                  <LayoutPanelTop className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
                <Link
                  href="/templates"
                  className={`flex items-center px-4 py-2 text-sm rounded-md mx-2 ${
                    isActive('/templates')
                      ? 'bg-[var(--ds-bg-secondary)] text-[color:var(--ds-text-primary)]'
                      : 'text-[color:var(--ds-text-secondary)] hover:bg-[var(--ds-bg-secondary)]'
                  }`}
                  onClick={closeDropdown}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Link>
                <div className="border-t border-[color:var(--ds-border)] my-2" />
                <div className="px-2">
                  <SignOutButton className="w-full flex items-center justify-start bg-transparent text-[color:var(--ds-text-secondary)] hover:bg-[var(--ds-bg-secondary)] px-2 py-2 rounded-md" />
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
} 