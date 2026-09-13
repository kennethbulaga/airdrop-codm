import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';
import { cn } from 'cn';

const announcementVariants = cva(
  'group/announcement inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border p-1 text-xs font-medium transition-all duration-150 hover:scale-[1.01] active:scale-[0.98] select-none cursor-pointer',
  {
    variants: {
      variant: {
        brand:
          'border-[#0071E3]/20 bg-[#0071E3]/[0.06] text-[#0071E3] hover:border-[#0071E3]/35 hover:bg-[#0071E3]/10 shadow-xs',
        info:
          'border-sky-500/20 bg-sky-500/10 text-sky-700 hover:border-sky-500/35 hover:bg-sky-500/15 shadow-xs dark:text-sky-300',
        neutral:
          'border-black/[0.08] bg-[#F2F2F7] text-[#1D1D1F] hover:border-black/15 hover:bg-[#E5E5EA] shadow-xs dark:border-white/10 dark:bg-white/10 dark:text-white',
        success:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:border-emerald-500/35 hover:bg-emerald-500/15 shadow-xs dark:text-emerald-300',
        warning:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 hover:border-amber-500/35 hover:bg-amber-500/15 shadow-xs dark:text-amber-300',
        error:
          'border-rose-500/20 bg-rose-500/10 text-rose-700 hover:border-rose-500/35 hover:bg-rose-500/15 shadow-xs dark:text-rose-300',
      },
      size: {
        sm: 'h-6 pl-0.5 pr-2 text-[10px]',
        default: 'h-7 sm:h-8 pl-1 pr-2.5 sm:pr-3 text-[11px] sm:text-xs',
        lg: 'h-8 sm:h-9 pl-1 pr-3 sm:pr-3.5 text-xs sm:text-sm',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'default',
    },
  }
);

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold transition-colors shrink-0',
  {
    variants: {
      variant: {
        brand: 'bg-[#0071E3] text-white shadow-xs',
        info: 'bg-sky-500 text-white shadow-xs',
        neutral: 'bg-white text-[#1D1D1F] border border-black/10 shadow-xs dark:bg-zinc-800 dark:text-white',
        success: 'bg-emerald-600 text-white shadow-xs',
        warning: 'bg-amber-500 text-white shadow-xs',
        error: 'bg-rose-500 text-white shadow-xs',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[9px]',
        default: 'px-2 py-0.5 text-[10px] sm:text-[11px]',
        lg: 'px-2.5 py-0.5 text-[11px]',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'default',
    },
  }
);

export interface AnnouncementProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof announcementVariants> {
  badge?: React.ReactNode;
  showArrow?: boolean;
  pulse?: boolean;
}

export function Announcement({
  badge,
  variant = 'brand',
  size = 'default',
  showArrow = true,
  pulse = false,
  href,
  children,
  className,
  ...props
}: AnnouncementProps) {
  const content = (
    <>
      {badge && (
        <span className={cn(badgeVariants({ variant, size }))}>
          {pulse && (
            <span className="size-1.5 rounded-full bg-white/90 animate-pulse" />
          )}
          {badge}
        </span>
      )}

      <span className="truncate font-medium leading-none tracking-tight">
        {children}
      </span>

      {showArrow && (
        <ArrowUpRight className="size-3.5 shrink-0 opacity-70 transition-all duration-200 group-hover/announcement:translate-x-0.5 group-hover/announcement:-translate-y-0.5 group-hover/announcement:opacity-100" />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(announcementVariants({ variant, size }), className)}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={cn(announcementVariants({ variant, size }), className)}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {content}
    </div>
  );
}
