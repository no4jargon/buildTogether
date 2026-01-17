import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button = ({
  className,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const variantClass =
    variant === 'primary'
      ? 'bg-sky-500 text-white hover:bg-sky-400'
      : variant === 'secondary'
        ? 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500'
        : 'text-slate-200 hover:bg-slate-800';

  return (
    <button
      className={cn(
        'rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClass,
        className
      )}
      {...props}
    />
  );
};
