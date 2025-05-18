'use client';

import Modal from '@/components/common/modal';
import Providers from '@/services/providers';
import { useRouter } from 'next/navigation';
import SvgIcon from '@/components/common/svg_icon';

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Providers>
      <div className="bg-grayscale-1 min-h-screen">
        <div className="absolute top-12 left-6">
          <button
            onClick={() => router.push('/posts')}
            className="flex items-center  text-grayscale-60 hover:text-grayscale-80"
          >
            <SvgIcon name="arrow_left" size={48} />
          </button>
        </div>
        {children}
      </div>
      <Modal />
    </Providers>
  );
}
