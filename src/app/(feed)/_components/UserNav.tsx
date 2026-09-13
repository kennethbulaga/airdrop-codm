'use client';

import React, { useEffect, useState, useTransition, useRef } from 'react';
import type { UserSessionProfile } from '@/lib/types';
import { LogOut, ShieldCheck, UserCog } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signOutAction } from '@/app/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileSettingsModal } from './ProfileSettingsModal';

interface UserNavProps {
  initialUser?: UserSessionProfile | null;
  onProfileUpdated?: (updated: UserSessionProfile) => void;
}

export function UserNav({ initialUser, onProfileUpdated }: UserNavProps = {}) {
  const [user, setUser] = useState<UserSessionProfile | null>(initialUser ?? null);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  if (initialUser !== undefined && initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }

  // Listen for sign-out events only (RSC hydrates profile on page loads and OAuth callbacks)
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = () => {
    setIsOpen(false);
    startTransition(async () => {
      await signOutAction();
    });
  };

  const handleProfileUpdated = (updated: UserSessionProfile) => {
    setUser(updated);
    onProfileUpdated?.(updated);
  };

  if (!user) {
    return null;
  }

  const name = user.name;
  const avatarUrl = user.avatarUrl;
  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`User menu for ${name}`}
          className="flex size-10 sm:size-9 min-h-[40px] min-w-[40px] items-center justify-center rounded-full ring-2 ring-black/10 hover:ring-[#0071E3]/60 transition-all focus-visible:outline-none focus-visible:ring-[#0071E3] active:scale-[0.96]"
        >
          <Avatar className="size-10 sm:size-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white font-bold text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Floating Apple-Style Dropdown Menu */}
        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 top-12 z-50 w-64 rounded-[20px] border border-black/10 bg-white/95 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.14)] backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {/* User Details Header */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar className="size-10 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback className="bg-[#0071E3] text-white font-bold text-sm">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.clanTag && (
                    <span className="inline-flex items-center rounded bg-[#0071E3]/10 px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#0071E3] border border-[#0071E3]/20">
                      {user.clanTag}
                    </span>
                  )}
                  <span className="truncate text-xs font-bold font-heading text-[#1D1D1F]">
                    {name}
                  </span>
                  <ShieldCheck className="size-3 text-[#0071E3] shrink-0" />
                </div>
                <span className="truncate text-[11px] text-[#86868B] font-mono">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="my-1.5 h-px bg-black/[0.06]" />

            {/* Menu Actions */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileModalOpen(true);
                }}
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#1D1D1F] hover:bg-[#F2F2F7] transition-colors text-left"
              >
                <UserCog className="size-3.5 text-[#0071E3]" />
                <span>Edit Player Profile</span>
              </button>

              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-[#6E6E73] select-none">
                <span>Account Status</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600">
                  Verified
                </span>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isPending}
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors text-left"
              >
                <LogOut className="size-3.5" />
                <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isProfileModalOpen && (
        <ProfileSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
}
