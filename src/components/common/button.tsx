import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'py-3 px-4 rounded-lg button_transition font-semibold text-center cursor-pointer';

  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const variantStyles = {
    primary: 'bg-primary text-primary-b80 hover:bg-primary/80',
    outline:
      'border-[1.5px] border-primary-b80 bg-grayscale-0 text-primary-b80 hover:bg-primary-b80 hover:text-grayscale-0',
    secondary: 'bg-grayscale-10 text-grayscale-50 hover:bg-grayscale-20',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
