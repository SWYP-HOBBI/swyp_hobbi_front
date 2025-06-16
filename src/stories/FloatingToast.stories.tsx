import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import FloatingToast from '../components/common/floating_toast';

const meta: Meta<typeof FloatingToast> = {
  title: 'Toast/FloatingToast',
  component: FloatingToast,
  parameters: {
    docs: {
      description: {
        component:
          '공통적으로 사용하는 토스트 컴포넌트입니다. 복사 시 사용됩니다. 토스트 위치는 공유 버튼 기준으로 설정됩니다.',
      },
      story: {
        inline: false,
        height: '300px',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: '토스트에 표시될 메시지',
    },
    duration: {
      control: 'number',
      description: '토스트가 표시되는 시간(ms)',
    },
    onClose: {
      action: 'closed',
      description: '토스트가 사라질 때 호출되는 콜백',
    },
  },
  args: {
    message: '복사가 완료되었습니다!',
    duration: 2000,
  },
};
export default meta;
type Story = StoryObj<typeof FloatingToast>;

export const Default: Story = {
  args: {
    message: '복사가 완료되었습니다!',
    duration: 2000,
  },
};
