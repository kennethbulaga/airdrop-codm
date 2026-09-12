'use client';

import React, { useEffect, useState, useTransition, useRef } from 'react';
import type { UserSessionProfile } from '@/lib/types';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signInWithGoogle, signOutAction } from '@/app/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserNavProps {
  initialUser?: UserSessionProfile | null;
}

export function UserNav({ initialUser }: UserNavProps = {}) {
  const [user, setUser] = useState<UserSessionProfile | null>(initialUser ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    const supabase = createClient();

    // Real-time auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'Operator',
          avatarUrl: (session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture) as string | undefined,
        });
      } else {
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

  const handleSignIn = () => {
    startTransition(async () => {
      await signInWithGoogle(window.location.pathname);
    });
  };

  const handleSignOut = () => {
    setIsOpen(false);
    startTransition(async () => {
      await signOutAction();
    });
  };

  if (!user) {
    return null;
  }

  const name = user.name;
  const avatarUrl = user.avatarUrl;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User menu for ${name}`}
        className="flex size-9 items-center justify-center rounded-full ring-2 ring-black/10 hover:ring-[#0071E3]/60 transition-all focus-visible:outline-none focus-visible:ring-[#0071E3]"
      >
        <Avatar className="size-9">
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
              <div className="flex items-center gap-1">
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
  );
}
