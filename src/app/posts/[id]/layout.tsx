import Modal from '@/components/common/modal';
import Providers from '@/services/providers';

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
      <Modal />
    </Providers>
  );
}
