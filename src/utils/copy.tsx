import { useToastStore } from '@/store/toast';

export const copy = async (text: string) => {
  const { showToast } = useToastStore.getState();

  try {
    await navigator.clipboard.writeText(text);
    showToast('링크를 클립보드에 복사했습니다.');
  } catch (error) {
    console.error('Failed to copy text:', error);
    showToast('링크 복사에 실패했습니다.');
  }
};
