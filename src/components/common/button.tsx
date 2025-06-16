import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'outline' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const variantStyles = {
  primary: 'bg-primary text-primary-b80 hover:bg-primary/80',
  outline:
    'border border-primary-b60 bg-grayscale-0 text-primary-b60 hover:bg-primary-b60 hover:text-grayscale-0',
  secondary: 'bg-grayscale-10 text-grayscale-50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'xl',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const currentVariant = disabled ? 'secondary' : variant;

  return (
    <button
      className={clsx(
        'py-3 px-4 rounded-lg button_transition font-semibold text-center cursor-pointer disabled:cursor-not-allowed h-[60px] max-md:h-[48px] whitespace-nowrap',
        sizeStyles[size],
        variantStyles[currentVariant],
        { 'w-full': fullWidth },
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
