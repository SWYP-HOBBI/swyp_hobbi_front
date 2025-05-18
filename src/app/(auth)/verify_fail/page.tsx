'use client';

import { useEffect } from 'react';
import { useModalStore } from '@/store/modal';

export default function VerifyFail() {
  const { openModal } = useModalStore();

  useEffect(() => {
    openModal({
      title: '만료된 링크입니다.',
      type: 'error',
      hideButtons: true,
    });

    // 2초 후 창 닫기
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      } else {
        window.history.back();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [openModal]);

  // 모달이 표시되는 동안 빈 페이지 렌더링
  return null;
}
