import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import Tag, { TagVariant } from '../components/common/tag';

const meta: Meta<typeof Tag> = {
  title: 'Tag/Tag',
  component: Tag,
  parameters: {
    docs: {
      description: {
        component:
          '태그 형태의 UI 컴포넌트입니다. variant, onDelete 등 다양한 옵션을 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '태그에 표시될 텍스트',
    },
    variant: {
      control: 'select',
      options: ['primary', 'white', 'gray'],
      description: '태그 스타일',
    },
    onDelete: {
      action: 'delete',
      description: '삭제 버튼 클릭 시 호출되는 콜백',
    },
    className: {
      control: 'text',
      description: '추가적인 TailwindCSS 클래스',
    },
  },
  args: {
    label: '운동',
    variant: 'primary' as TagVariant,
  },
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const TagContainer: Story = {
  render: (args) => (
    <div className="tag_container">
      <Tag {...args} label="운동" />
      <Tag {...args} label="음악" variant="white" />
      <Tag {...args} label="요리" variant="gray" />
      <Tag {...args} label="삭제가능" onDelete={() => alert('삭제!')} />
    </div>
  ),
};
