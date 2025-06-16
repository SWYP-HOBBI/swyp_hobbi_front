import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import HobbySelector from '../components/common/hobby_selector';
import { HobbyTag } from '@/types/hobby';

const meta: Meta<typeof HobbySelector> = {
  title: 'HobbySelector/HobbySelector',
  component: HobbySelector,
  parameters: {
    docs: {
      description: {
        component:
          '취미 대분류/소분류를 선택하고 태그로 관리할 수 있는 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxCount: {
      control: 'number',
      description: '최대 선택 가능한 태그 개수',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: '태그 스타일',
    },
    isSearchMode: {
      control: 'boolean',
      description: '검색 모드 여부',
    },
  },
  args: {
    maxCount: 5,
    variant: 'primary',
    isSearchMode: false,
  },
};
export default meta;
type Story = StoryObj<typeof HobbySelector>;

export const Default: Story = {};

export const SearchMode: Story = {
  args: {
    isSearchMode: true,
  },
  render: (args) => {
    const [tags, setTags] = useState<HobbyTag[]>([]);
    return (
      <HobbySelector {...args} selectedTags={tags} onTagsChange={setTags} />
    );
  },
};
