'use client';

export type TagVariant = 'primary' | 'white' | 'gray';

interface TagProps {
  label: string;
  variant?: TagVariant;
  onDelete?: () => void;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  primary:
    'bg-primary-w80 text-primary-b80 border-primary-b20 hover:bg-primary-w40',
  white:
    'bg-grayscale-0 text-grayscale-80 border-grayscale-20 hover:bg-grayscale-5',
  gray: 'bg-grayscale-10 text-grayscale-80 border-grayscale-20 hover:bg-grayscale-20',
};

export default function Tag({
  label,
  variant = 'primary',
  onDelete,
  className = '',
}: TagProps) {
  return (
    <span
      className={`
        px-2 py-1 rounded-full text-xs cursor-pointer font-medium
        flex items-center gap-1 border button_transition
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-primary-b80 hover:text-primary-b60"
        >
          ×
        </button>
      )}
    </span>
  );
}
