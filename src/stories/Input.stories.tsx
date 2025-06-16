import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import Input from '../components/common/input';

const meta: Meta<typeof Input> = {
  title: 'Input/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          '공통적으로 사용하는 인풋 컴포넌트입니다. label, error, helperText, 비밀번호 토글, 클리어 버튼 등 다양한 옵션을 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '인풋 상단에 표시될 라벨',
    },
    error: {
      control: 'text',
      description: '에러 메시지(있으면 빨간색 표시)',
    },
    helperText: {
      control: 'text',
      description: '도움말 텍스트',
    },
    showPasswordToggle: {
      control: 'boolean',
      description: '비밀번호 표시/숨김 토글 버튼 표시',
    },
    showClearButton: {
      control: 'boolean',
      description: '입력값 지우기 버튼 표시',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부',
    },
    required: {
      control: 'boolean',
      description: '필수 입력 여부',
    },
    type: {
      control: 'text',
      description: 'input type (text, password 등)',
    },
  },
  args: {
    label: '이메일',
    helperText: '이메일을 입력하세요',
    type: 'text',
    showPasswordToggle: false,
    showClearButton: false,
    disabled: false,
    required: false,
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Password: Story = {
  args: {
    label: '비밀번호',
    type: 'password',
    showPasswordToggle: true,
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const WithError: Story = {
  args: {
    error: '에러가 발생했습니다.',
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const WithClearButton: Story = {
  args: {
    showClearButton: true,
  },
  render: (args) => {
    const [value, setValue] = useState('입력값');
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};
