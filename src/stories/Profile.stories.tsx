import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Profile from '../components/common/profile';

const meta: Meta<typeof Profile> = {
  title: 'Profile/Profile',
  component: Profile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '프로필(아바타+닉네임+레벨) 컴포넌트입니다. imageUrl, nickname, variant, userLevel, className 등 다양한 props로 커스터마이즈할 수 있습니다.',
      },
    },
  },
  argTypes: {
    imageUrl: { control: 'text', description: '프로필 이미지 URL' },
    nickname: { control: 'text', description: '닉네임' },
    variant: {
      control: 'select',
      options: [
        'vertical',
        'vertical-large',
        'horizontal-large',
        'horizontal-small',
      ],
      description: '레이아웃/크기',
    },
    userLevel: { control: 'number', description: '레벨(뱃지)' },
    className: { control: 'text', description: '추가 클래스' },
  },
  args: {
    imageUrl: '',
    nickname: '닉네임',
    variant: 'vertical',
    userLevel: 3,
  },
};
export default meta;

type Story = StoryObj<typeof Profile>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '기본(세로) 프로필 예시입니다.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    imageUrl:
      'https://www.hyun-seok.com/static/c9171443265b18c4031b692caaee2581/5079c/thumbnail.webp',
    nickname: '현석',
    userLevel: 7,
    variant: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: '이미지와 닉네임, 레벨 뱃지가 함께 표시된 예시입니다.',
      },
    },
  },
};

export const HorizontalLarge: Story = {
  args: {
    imageUrl: '',
    nickname: '가로Large',
    userLevel: 2,
    variant: 'horizontal-large',
  },
  parameters: {
    docs: {
      description: {
        story: '가로(large) 레이아웃 예시입니다.',
      },
    },
  },
};

export const HorizontalSmall: Story = {
  args: {
    imageUrl: '',
    nickname: '가로Small',
    userLevel: 1,
    variant: 'horizontal-small',
  },
  parameters: {
    docs: {
      description: {
        story: '가로(small) 레이아웃 예시입니다.',
      },
    },
  },
};

export const VerticalLarge: Story = {
  args: {
    imageUrl: '',
    nickname: '세로Large',
    userLevel: 5,
    variant: 'vertical-large',
  },
  parameters: {
    docs: {
      description: {
        story: '세로(large) 레이아웃 예시입니다.',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    imageUrl: '',
    nickname: '커스텀',
    userLevel: 3,
    variant: 'vertical',
    className: 'ring-1 ring-green-400',
  },
  parameters: {
    docs: {
      description: {
        story:
          'className으로 커스텀 스타일을 적용한 예시입니다. (예: Tailwind)',
      },
    },
  },
};
