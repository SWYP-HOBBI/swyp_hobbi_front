'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/modal';

export default function VerifyFail() {
  const router = useRouter();
  const { openModal } = useModalStore();

  useEffect(() => {
    openModal({
      title: '만료된 링크입니다.',
      message:
        '이메일 인증 링크가 만료되었습니다.\n새로운 인증 이메일을 받으시려면 다시 회원가입을 진행해 주세요.',
      confirmText: '확인',
      onConfirm: () => {
        router.push('/'); // 메인 페이지 또는 회원가입 페이지로 이동
      },
    });
  }, [openModal, router]);

  // 모달이 표시되는 동안 빈 페이지 렌더링
  return null;
}
