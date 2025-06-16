import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import Button from '../components/common/button';

const meta: Meta<typeof Button> = {
  title: 'Button/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '공통적으로 사용하는 버튼 컴포넌트입니다. variant, size, fullWidth, disabled 등 다양한 옵션을 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'secondary'],
      description:
        '버튼의 스타일(색상/테두리 등)을 지정합니다. (primary: 메인, outline: 외곽선, secondary: 보조)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description:
        '버튼의 크기를 설정합니다. (sm: 작음, md: 보통, lg: 큼, xl: 매우 큼)',
    },
    fullWidth: {
      control: 'boolean',
      description: '버튼을 부모의 가로 전체로 확장할지 여부를 설정합니다.',
    },
    disabled: {
      control: 'boolean',
      description: '버튼을 비활성화할지 여부를 설정합니다.',
    },
    children: {
      control: 'text',
      description: '버튼에 표시될 텍스트 또는 요소입니다.',
    },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'xl',
    fullWidth: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

export const Sizes: Story = {
  render: (args) => {
    return (
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexDirection: 'column',
          width: 220,
        }}
      >
        <Button {...args} size="sm">
          Small
        </Button>
        <Button {...args} size="md">
          Medium
        </Button>
        <Button {...args} size="lg">
          Large
        </Button>
        <Button {...args} size="xl">
          XLarge
        </Button>
      </div>
    );
  },
};
