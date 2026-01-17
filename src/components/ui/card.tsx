import type { HTMLAttributes } from 'react';
import { cn } from './utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm',
        className
      )}
      {...props}
    />
  );
};
