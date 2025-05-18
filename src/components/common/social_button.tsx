import React, { ButtonHTMLAttributes } from 'react';
import SvgIcon from './svg_icon';

type SocialProvider = 'kakao' | 'google';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
  fullWidth?: boolean;
  className?: string;
}

interface ProviderConfig {
  background: string;
  color: string;
  text: string;
  border?: string;
  iconColor?: string;
  hoverBackground: string;
}

const providerConfig: Record<SocialProvider, ProviderConfig> = {
  kakao: {
    background: '#FFE600',
    color: '#000000',
    text: '카카오로 로그인',
    iconColor: '#000000',
    hoverBackground: '#FFE600CC',
  },
  google: {
    background: '#FFFFFF',
    color: '#000000',
    text: 'Google로 로그인',
    border: 'border border-[#74775]',
    hoverBackground: '#F8F9FA',
  },
};

export default function SocialButton({
  provider,
  fullWidth = false,
  className = '',
  ...props
}: SocialButtonProps) {
  const config = providerConfig[provider];

  return (
    <button
      className={`
        h-[60px] max-md:h-[48px] px-6 rounded-lg
        flex items-center justify-center gap-2
        font-medium text-xl whitespace-nowrap
        transition-all duration-200 ease-in-out
        hover:opacity-90
        ${fullWidth ? 'w-full' : 'w-[280px] max-md:w-full'}
        ${config.border ?? ''}
        ${className}
      `}
      style={
        {
          backgroundColor: config.background,
          color: config.color,
          '--hover-bg': config.hoverBackground,
        } as React.CSSProperties
      }
      onMouseOver={(e) => {
        const target = e.currentTarget;
        target.style.backgroundColor = config.hoverBackground;
      }}
      onMouseOut={(e) => {
        const target = e.currentTarget;
        target.style.backgroundColor = config.background;
      }}
      {...props}
    >
      <SvgIcon name={provider} size={24} color={config.iconColor} />
      <span>{config.text}</span>
    </button>
  );
}
