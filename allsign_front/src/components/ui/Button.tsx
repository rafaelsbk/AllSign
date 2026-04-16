import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends AriaButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'solar';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-solar-blue text-white hover:bg-blue-800 shadow-crisp focus:ring-solar-blue',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 shadow-crisp',
    outline: 'border border-zinc-300 bg-transparent hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 shadow-crisp',
    ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-crisp focus:ring-red-500',
    solar: 'bg-solar-orange text-white hover:bg-solar-gold shadow-solar focus:ring-solar-gold transition-all duration-200 transform hover:-translate-y-[1px]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-bold',
    icon: 'p-2',
  };

  return (
    <AriaButton
      {...props}
      className={({ isFocusVisible, isPressed }) => cn(
        'inline-flex items-center justify-center rounded-lg outline-none transition-colors focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        isFocusVisible && 'ring-2 ring-offset-2',
        isPressed && 'scale-95',
        className
      )}
    />
  );
};

export { Button };
