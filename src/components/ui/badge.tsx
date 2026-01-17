import type { HTMLAttributes } from 'react';
import { cn } from './utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'muted';
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variantClass =
    variant === 'default'
      ? 'bg-slate-800 text-slate-200'
      : 'bg-slate-900 text-slate-400';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variantClass,
        className
      )}
      {...props}
    />
  );
};
