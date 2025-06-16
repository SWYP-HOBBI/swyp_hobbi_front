import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import Loader from '../components/common/loader';

const meta: Meta<typeof Loader> = {
  title: 'Loader/Loader',
  component: Loader,
  parameters: {
    docs: {
      description: {
        component:
          '로딩 상태를 나타내는 공통 컴포넌트입니다. 색상, 크기, 개수, 전체화면 여부 등 다양한 옵션을 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'color',
      description: '로딩 아이콘 색상',
    },
    size: {
      control: 'number',
      description: '로딩 아이콘 크기(px)',
    },
    count: {
      control: 'number',
      description: '로딩 아이콘 개수',
    },
    fullScreen: {
      control: 'boolean',
      description: '전체 화면 높이 적용 여부',
    },
    className: {
      control: 'text',
      description: '추가적인 TailwindCSS 클래스',
    },
  },
  args: {
    color: 'var(--primary)',
    size: 20,
    count: 3,
    fullScreen: true,
  },
};
export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 12,
    count: 3,
    fullScreen: false,
  },
};

export const Many: Story = {
  args: {
    count: 6,
    size: 20,
    fullScreen: false,
  },
};

export const CustomColor: Story = {
  args: {
    color: '#FF5722',
    size: 24,
    count: 3,
    fullScreen: false,
  },
};
