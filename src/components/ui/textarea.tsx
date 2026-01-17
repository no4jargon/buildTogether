import type { TextareaHTMLAttributes } from 'react';
import { cn } from './utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
};
