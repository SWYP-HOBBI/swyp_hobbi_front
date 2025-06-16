import React from 'react';
import SvgIcon from '../components/common/svg_icon';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { IconName } from '../components/common/svg_icon';

const iconNames: IconName[] = [
  'logo',
  'checkbox_on',
  'checkbox_off',
  'heart',
  'eye_on',
  'eye_off',
  'home',
  'my_page',
  'alarm',
  'search',
  'write',
  'camera',
  'chat',
  'share',
  'setting',
  'add',
  'arrow_left',
  'arrow_down',
  'delete',
  'meatball',
  'reply',
  'loader',
  'kakao',
  'google',
  'tooltip',
];

const meta: Meta<typeof SvgIcon> = {
  title: 'Icon/SvgIcon',
  component: SvgIcon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '공통 SVG 아이콘 컴포넌트입니다. name에 따라 다양한 아이콘을 렌더링하며, size/width/height/color/className 등 다양한 props로 커스터마이즈할 수 있습니다.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: iconNames,
      description: '아이콘 이름',
    },
    size: {
      control: 'number',
      description: '아이콘 크기(px, rem 등)',
    },
    width: {
      control: 'text',
      description: 'width (size보다 우선)',
    },
    height: {
      control: 'text',
      description: 'height (size보다 우선)',
    },
    color: {
      control: 'color',
      description: '아이콘 색상',
    },
    className: {
      control: 'text',
      description: '추가 클래스',
    },
  },
  args: {
    name: 'heart',
    size: 32,
    color: '#222',
  },
};
export default meta;

type Story = StoryObj<typeof SvgIcon>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          '기본 아이콘(heart) 예시입니다. name, size, color 등 props를 조절해보세요.',
      },
    },
  },
};

export const AllIcons: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {iconNames.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 80,
          }}
        >
          <SvgIcon {...args} name={name} />
          <span style={{ fontSize: 12, marginTop: 8 }}>{name}</span>
        </div>
      ))}
    </div>
  ),
  args: {
    size: 32,
    color: '#666',
  },
  parameters: {
    docs: {
      description: {
        story:
          '모든 아이콘(name) 미리보기입니다. props를 바꿔서 전체 스타일을 한 번에 확인할 수 있습니다.',
      },
    },
  },
};

export const ColorChange: Story = {
  args: {
    name: 'alarm',
    color: '#E53E3E',
    size: 40,
  },
  parameters: {
    docs: {
      description: {
        story: 'color props로 아이콘 색상을 변경할 수 있습니다.',
      },
    },
  },
};

export const WidthHeight: Story = {
  args: {
    name: 'logo',
    width: 120,
    height: 36,
    color: '#222',
  },
  parameters: {
    docs: {
      description: {
        story: 'width/height props를 지정하면 size보다 우선 적용됩니다.',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    name: 'search',

    size: 36,
    color: '#3182F6',
  },
  parameters: {
    docs: {
      description: {
        story:
          'className으로 커스텀 스타일을 적용할 수 있습니다. (예: Tailwind)',
      },
    },
  },
};
