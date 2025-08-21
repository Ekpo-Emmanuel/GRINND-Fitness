'use client';

import * as React from 'react';
import { isValidElement, cloneElement } from 'react';
import { cn } from '@/lib/utils';

type PillVariant = 'secondary' | 'tertiary' | 'accent' | 'outline';
type PillSize = 'sm' | 'md';

export interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  variant?: PillVariant;
  size?: PillSize;
}

export function Pill({ icon, children, className, variant = 'secondary', size = 'sm', ...props }: PillProps) {
  const base = 'inline-flex items-center gap-1 rounded-full border transition-colors';
  const sizes: Record<PillSize, string> = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  };
  const variants: Record<PillVariant, string> = {
    secondary: 'bg-[var(--ds-bg-secondary)] border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)]',
    tertiary: 'bg-[var(--ds-bg-tertiary)] border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)]',
    accent: 'text-[var(--ds-bg-primary)] border-transparent',
    outline: 'bg-transparent border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)]',
  };

  const accentStyle = variant === 'accent' ? { backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' } as React.CSSProperties : undefined;

  const renderedIcon = React.useMemo(() => {
    if (!icon) return null;
    const iconColorClass = variant === 'accent' ? 'text-[var(--ds-bg-primary)]' : 'text-[color:var(--ds-text-primary)]';
    const iconSize = size === 'sm' ? 14 : 16;
    if (isValidElement(icon)) {
      const iconElement = icon as React.ReactElement<{ className?: string; size?: number; strokeWidth?: number }>;
      const existing = iconElement.props?.className;
      return cloneElement(iconElement, {
        size: iconSize,
        strokeWidth: 1.5,
        className: cn(iconColorClass, existing),
      });
    }
    return icon;
  }, [icon, size, variant]);

  return (
    <div
      className={cn(base, sizes[size], variants[variant], className)}
      style={accentStyle}
      {...props}
    >
      {renderedIcon ? <span className="shrink-0">{renderedIcon}</span> : null}
      <span className={cn('truncate', variant === 'accent' ? 'text-[var(--ds-on-accent)]' : undefined)}>{children}</span>
    </div>
  );
}


