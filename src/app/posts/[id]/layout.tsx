'use client';

import Modal from '@/components/common/modal';
import Providers from '@/services/providers';
import { useRouter } from 'next/navigation';
import SvgIcon from '@/components/common/svg_icon';
import Header from '@/components/common/header';
import { useToastStore } from '@/store/toast';
import FloatingToast from '@/components/common/floating_toast';
import { useEffect } from 'react';

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isVisible, message, hideToast } = useToastStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID);
      }
    }
  }, []);

  return (
    <Providers>
      <Header />
      <div className="bg-grayscale-1 min-h-screen max-md:pt-[64px]">
        <div className="absolute top-12 left-6">
          <button
            onClick={() => router.push('/posts')}
            className="flex items-center  text-grayscale-60 hover:text-grayscale-80 max-md:hidden"
          >
            <SvgIcon name="arrow_left" size={48} />
          </button>
        </div>
        {children}
      </div>
      {isVisible && <FloatingToast message={message} onClose={hideToast} />}
      <Modal />
    </Providers>
  );
}
