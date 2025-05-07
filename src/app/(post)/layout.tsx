import Modal from '@/components/common/modal';
import TabBar from '@/components/common/tab_bar';
import Providers from '@/services/providers';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex">
        <TabBar />
        {children}
        <Modal />
      </div>
    </Providers>
  );
}
