import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SocialButton from '../components/common/social_button';

const meta: Meta<typeof SocialButton> = {
  title: 'Button/SocialButton',
  component: SocialButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '소셜 로그인 버튼 컴포넌트입니다. provider, fullWidth, className 등 다양한 props로 커스터마이즈할 수 있습니다.',
      },
    },
  },
  argTypes: {
    provider: {
      control: 'select',
      options: ['kakao', 'google'],
      description: '소셜 로그인 제공자',
    },
    fullWidth: { control: 'boolean', description: '전체 너비 여부' },
    className: { control: 'text', description: '추가 클래스' },
    onClick: { action: '클릭', description: '클릭 핸들러' },
  },
  args: {
    provider: 'kakao',
    fullWidth: false,
  },
};
export default meta;

type Story = StoryObj<typeof SocialButton>;

export const Kakao: Story = {
  args: {
    provider: 'kakao',
  },
  parameters: {
    docs: {
      description: {
        story: '카카오 로그인 버튼 예시입니다.',
      },
    },
  },
};

export const Google: Story = {
  args: {
    provider: 'google',
  },
  parameters: {
    docs: {
      description: {
        story: '구글 로그인 버튼 예시입니다.',
      },
    },
  },
};

export const FullWidth: Story = {
  args: {
    provider: 'kakao',
    fullWidth: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'fullWidth로 전체 너비를 차지하는 예시입니다.',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    provider: 'google',
    className: 'ring-2 ring-blue-400',
  },
  parameters: {
    docs: {
      description: {
        story: 'className으로 커스텀 스타일을 적용한 예시입니다.',
      },
    },
  },
};
