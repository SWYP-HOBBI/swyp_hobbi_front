import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MbtiButton from '../components/common/mbti_button';

const meta: Meta<typeof MbtiButton> = {
  title: 'Button/MbtiButton',
  component: MbtiButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'MBTI 선택 버튼 컴포넌트입니다. label, isSelected, onClick, className 등 다양한 props로 커스터마이즈할 수 있습니다.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: '버튼 텍스트',
    },
    isSelected: {
      control: 'boolean',
      description: '선택 여부',
    },
    onClick: {
      action: 'clicked',
      description: '클릭 핸들러',
    },
    className: {
      control: 'text',
      description: '추가 클래스',
    },
  },
  args: {
    label: 'ENFP',
    isSelected: false,
  },
};
export default meta;

type Story = StoryObj<typeof MbtiButton>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          '기본 MBTI 버튼 예시입니다. label, isSelected, className 등 props를 조절해보세요.',
      },
    },
  },
};

export const Selected: Story = {
  args: {
    label: 'INFJ',
    isSelected: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'isSelected가 true인 경우(선택된 상태) 예시입니다.',
      },
    },
  },
};

export const MultipleMBTI: Story = {
  render: (args) => {
    const mbtis = ['ENFP', 'INFJ', 'ISTJ', 'ENTP', 'ISFP', 'ESTJ'];
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        {mbtis.map((mbti, idx) => (
          <MbtiButton
            key={mbti}
            label={mbti}
            isSelected={idx === 2}
            onClick={() => {}}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '여러 MBTI 버튼을 한 줄에 나열한 예시입니다. (3번째만 선택됨)',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    label: 'ESTP',
    isSelected: false,
    className: 'border-2 border-blue-500 text-blue-700',
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
