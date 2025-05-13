import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

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
  const baseStyle =
    'py-3 px-4 rounded-lg button_transition font-semibold text-center cursor-pointer disabled:cursor-not-allowed h-[60px] max-md:h-[48px]';

  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // disabled일 때는 secondary 스타일 적용
  const currentVariant = disabled ? 'secondary' : variant;

  const variantStyles = {
    primary: 'bg-primary text-primary-b80 hover:bg-primary/80',
    outline:
      'border-[1.5px] border-primary-b80 bg-grayscale-0 text-primary-b80 hover:bg-primary-b80 hover:text-grayscale-0',
    secondary: 'bg-grayscale-10 text-grayscale-50',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[currentVariant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
