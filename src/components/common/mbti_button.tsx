interface MbtiButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function MbtiButton({
  label,
  isSelected,
  onClick,
}: MbtiButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-[80px] h-[32px] rounded-[24px] text-xl font-semibold flex items-center justify-center
        ${isSelected ? 'bg-primary' : 'bg-grayscale-20'}`}
    >
      {label}
    </button>
  );
}
