import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MyProfile from '../components/common/my_profile';

const meta: Meta<typeof MyProfile> = {
  title: 'Profile/MyProfile',
  component: MyProfile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '내 프로필(아바타) 컴포넌트입니다. imageUrl, editable, level, className 등 다양한 props로 커스터마이즈할 수 있습니다.',
      },
    },
  },
  argTypes: {
    imageUrl: { control: 'text', description: '프로필 이미지 URL' },
    editable: { control: 'boolean', description: '편집 가능(업로드) 여부' },
    level: { control: 'number', description: '레벨(뱃지)' },
    className: { control: 'text', description: '추가 클래스' },
  },
  args: {
    imageUrl: '',
    editable: false,
    level: 3,
  },
};
export default meta;

type Story = StoryObj<typeof MyProfile>;

export const Default: Story = {
  args: {
    imageUrl: '',
    editable: false,
    level: 3,
  },
  parameters: {
    docs: {
      description: {
        story: '기본(비편집) 프로필 예시입니다. (레벨 뱃지 표시)',
      },
    },
  },
};

export const Editable: Story = {
  args: {
    imageUrl: '',
    editable: true,
    level: 1,
  },
  parameters: {
    docs: {
      description: {
        story: '편집(업로드) 모드 예시입니다. (카메라 버튼 표시)',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    imageUrl:
      'https://www.hyun-seok.com/static/c9171443265b18c4031b692caaee2581/5079c/thumbnail.webp',
    editable: false,
    level: 5,
  },
  parameters: {
    docs: {
      description: {
        story: '이미지와 레벨 뱃지가 함께 표시된 예시입니다.',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    imageUrl: '',
    editable: true,
    className: 'ring-4 ring-blue-400',
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
