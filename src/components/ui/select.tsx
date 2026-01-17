import type { SelectHTMLAttributes } from 'react';
import { cn } from './utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, ...props }: SelectProps) => {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
};
