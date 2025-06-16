import clsx from 'clsx';

/**
 * MBTI 선택 버튼 컴포넌트
 * - label: 버튼 텍스트
 * - isSelected: 선택 여부
 * - onClick: 클릭 핸들러
 * - className: 추가 클래스(확장성)
 */
interface MbtiButtonProps {
  /** 버튼 텍스트 */
  label: string;
  /** 선택 여부 */
  isSelected: boolean;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 추가 클래스 */
  className?: string;
}

export default function MbtiButton({
  label,
  isSelected,
  onClick,
  className = '',
}: MbtiButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-[80px] h-[32px] rounded-[24px] text-xl font-semibold flex items-center justify-center',
        isSelected ? 'bg-primary' : 'bg-grayscale-20',
        className,
      )}
    >
      {label}
    </button>
  );
}
