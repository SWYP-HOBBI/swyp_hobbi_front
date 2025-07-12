import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

const meta: Meta = {
  title: 'DesignGuide',
};

export default meta;

const colors = [
  {
    name: 'primary',
    color: '#16ebc2',
  },
  {
    name: 'primary-w20',
    color: '#45efce',
  },
  {
    name: 'primary-w40',
    color: '#73f3da',
  },
  {
    name: 'primary-w60',
    color: '#a2f7e7',
  },
  {
    name: 'primary-w80',
    color: '#d0fbf3',
  },
  {
    name: 'primary-b20',
    color: '#12bc9b',
  },
  {
    name: 'primary-b40',
    color: '#0d8d74',
  },
  {
    name: 'primary-b60',
    color: '#095e4e',
  },
  {
    name: 'primary-b80',
    color: '#042f27',
  },
  {
    name: 'like',
    color: '#eb165d',
  },
  {
    name: 'grayscale-0',
    color: '#ffffff',
  },
  {
    name: 'grayscale-1',
    color: '#f7f7f7',
  },
  {
    name: 'grayscale-5',
    color: '#f2f2f2',
  },
  {
    name: 'grayscale-10',
    color: '#e5e5e5',
  },
  {
    name: 'grayscale-20',
    color: '#cccccc',
  },
  {
    name: 'grayscale-30',
    color: '#b3b3b3',
  },
  {
    name: 'grayscale-40',
    color: '#999999',
  },
  {
    name: 'grayscale-50',
    color: '#808080',
  },
  {
    name: 'grayscale-60',
    color: '#666666',
  },
  {
    name: 'grayscale-70',
    color: '#4c4c4c',
  },
  {
    name: 'grayscale-80',
    color: '#333333',
  },
  {
    name: 'grayscale-90',
    color: '#1a1a1a',
  },
  {
    name: 'grayscale-100',
    color: '#000000',
  },
  {
    name: 'rank-1',
    color: '#f8bcbc',
  },
  {
    name: 'rank-2',
    color: '#f5ce90',
  },
  {
    name: 'rank-3',
    color: '#f8e87c',
  },
  {
    name: 'rank-4',
    color: '#b8e58d',
  },
  {
    name: 'rank-5',
    color: '#a7cfe6',
  },
  {
    name: 'rank-6',
    color: '#6f97c6',
  },
  {
    name: 'rank-7',
    color: '#b7b5e6',
  },
  {
    name: 'rank-8',
    color: '#97b5e6',
  },
  {
    name: 'rank-9',
    color: '#7775e6',
  },
  {
    name: 'rank-10',
    color: '#5755e6',
  },
];

const fontSizes = [
  {
    label: 'Display/Pretendard/Bold/48pt',
    style: {
      fontSize: '48pt',
      fontWeight: '700',
      lineHeight: '130%',
      letterSpacing: '-1.0px',
    },
  },
  {
    label: 'H1/Pretendard/Bold/32pt',
    style: {
      fontSize: '32pt',
      fontWeight: '700',
      lineHeight: '140%',
      letterSpacing: '-0.5px',
    },
  },
  {
    label: 'H2/Pretendard/Bold/24pt',
    style: {
      fontSize: '24pt',
      fontWeight: '700',
      lineHeight: '140%',
      letterSpacing: '-0.3px',
    },
  },
  {
    label: 'H3/Pretendard/SemiBold/20pt',
    style: {
      fontSize: '20pt',
      fontWeight: '600',
      lineHeight: '140%',
      letterSpacing: '-0.3px',
    },
  },
  {
    label: 'Subtitle/Pretendard/Medium/18pt',
    style: {
      fontSize: '18pt',
      fontWeight: '500',
      lineHeight: '150%',
      letterSpacing: '-0.1px',
    },
  },
  {
    label: 'B1/Pretendard/Regular/16pt',
    style: {
      fontSize: '16pt',
      fontWeight: '400',
      lineHeight: '150%',
      letterSpacing: '-0.2px',
    },
  },
  {
    label: 'B2/Pretendard/Regular/14pt',
    style: {
      fontSize: '14pt',
      fontWeight: '400',
      lineHeight: '150%',
      letterSpacing: '-0.1px',
    },
  },
  {
    label: 'Caption/Pretendard/Regular/12pt',
    style: {
      fontSize: '12pt',
      fontWeight: '400',
      lineHeight: '140%',
      letterSpacing: '-0px',
    },
  },
  {
    label: 'Label/Pretendard/Medium/14pt',
    style: {
      fontSize: '14pt',
      fontWeight: '500',
      lineHeight: '140%',
      letterSpacing: '-0px',
    },
  },
  {
    label: 'Button/Pretendard/Semibold/14pt',
    style: {
      fontSize: '14pt',
      fontWeight: '600',
      lineHeight: '130%',
      letterSpacing: '-0.1px',
    },
  },
  {
    label: 'Tooltip/Pretendard/Regular/12pt',
    style: {
      fontSize: '12pt',
      fontWeight: '400',
      lineHeight: '140%',
      letterSpacing: '-0px',
    },
  },
  {
    label: 'Helper/Pretendard/Regular/12pt',
    style: {
      fontSize: '12pt',
      fontWeight: '400',
      lineHeight: '140%',
      letterSpacing: '-0px',
    },
  },
  {
    label: 'Error/Pretendard/Regular/12pt',
    style: {
      fontSize: '12pt',
      fontWeight: '400',
      lineHeight: '140%',
      letterSpacing: '-0px',
    },
  },
  {
    label: 'Tag,Badge/Pretendard/Medium/12pt',
    style: {
      fontSize: '12pt',
      fontWeight: '500',
      lineHeight: '140%',
      letterSpacing: '-0.2px',
    },
  },
  {
    label: 'Nav/Pretendard/Medium/16pt',
    style: {
      fontSize: '16pt',
      fontWeight: '500',
      lineHeight: '150%',
      letterSpacing: '-0px',
    },
  },
];

const shadows = [
  {
    name: 'shadow-sm',
    boxShadow: '4px 4px 2px 0 rgba(0, 0, 0, 0.08)',
  },
  {
    name: 'shadow-md',
    boxShadow: '4px 4px 4px 0 rgba(0, 0, 0, 0.12)',
  },
  {
    name: 'shadow-lg',
    boxShadow: '4px 4px 8px 2px rgba(0, 0, 0, 0.16)',
  },
];

const radius = [
  {
    name: 'radius-sm',
    borderRadius: '4px',
  },
  {
    name: 'radius-md',
    borderRadius: '8px',
  },
  {
    name: 'radius-lg',
    borderRadius: '12px',
  },
  {
    name: 'radius-xl',
    borderRadius: '24px',
  },
];

export const DesignGuide: StoryObj = {
  render: () => {
    return (
      <div className="flex  gap-4">
        <div>
          <h2 className="text-2xl font-bold">Colors</h2>
          <div className="flex flex-col gap-2">
            {colors.map((color) => (
              <div key={color.name} className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">{color.name}</span>
                <div
                  className={`w-10 h-10 bg-${color.name} rounded-full`}
                  style={{ backgroundColor: color.color }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Font Sizes</h2>
          <div className="flex flex-col gap-2">
            {fontSizes.map((fontSize) => (
              <div key={fontSize.label} className="flex flex-col gap-1">
                <span
                  style={{
                    fontSize: fontSize.style.fontSize,
                    fontWeight: fontSize.style.fontWeight,
                    lineHeight: fontSize.style.lineHeight,
                    letterSpacing: fontSize.style.letterSpacing,
                  }}
                >
                  {fontSize.label}
                </span>
                <div />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Shadows</h2>
          <div className="flex flex-col gap-2">
            {shadows.map((shadow) => (
              <div key={shadow.name} className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">{shadow.name}</span>
                <div
                  className={`w-10 h-10 bg-black rounded-full`}
                  style={{ boxShadow: shadow.boxShadow }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Radius</h2>
          <div className="flex flex-col gap-2">
            {radius.map((radius) => (
              <div key={radius.name} className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">{radius.name}</span>
                <div
                  className={`w-10 h-10 bg-black rounded-full`}
                  style={{ borderRadius: radius.borderRadius }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
