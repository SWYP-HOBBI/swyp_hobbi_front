'use client';

import { useModalStore } from '@/store/modal';

export default function TestModal() {
  const { openModal } = useModalStore();

  const handleOpenModal = () => {
    openModal({
      title: '새 비밀번호가 설정되었습니다.',
      message: '다시 로그인 해주세요.',
      confirmText: '로그인 하기',
      onConfirm: () => console.log('확인 버튼 클릭!'), // 여기에 페이지로 이동하는 로직 추가하면 됨
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        모달 열기
      </button>
    </div>
  );
}
