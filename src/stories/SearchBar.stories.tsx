import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SearchBar from '../components/common/search_bar';

const meta: Meta<typeof SearchBar> = {
  title: 'Form/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '검색 입력(SearchBar) 컴포넌트입니다. value, onChange, onSearch, className 등 다양한 props로 커스터마이즈할 수 있습니다.',
      },
    },
  },
  argTypes: {
    value: { control: 'text', description: '입력값' },
    onChange: { action: '입력 변경', description: '입력 변경 핸들러' },
    onSearch: { action: '검색 실행', description: '검색 실행 핸들러' },
    className: { control: 'text', description: '추가 클래스' },
    placeholder: { control: 'text', description: 'placeholder 텍스트' },
  },
  args: {
    value: '',
    placeholder: '검색어를 입력하세요',
  },
};
export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '기본 검색바 예시입니다.',
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    value: '프론트엔드',
  },
  parameters: {
    docs: {
      description: {
        story: '입력값이 있는 상태 예시입니다.',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    value: '',
    className: 'border-2 border-primary rounded-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'className으로 커스텀 스타일을 적용한 예시입니다.',
      },
    },
  },
};
