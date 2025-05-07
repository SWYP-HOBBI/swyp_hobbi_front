import Modal from '@/components/common/modal';
import Providers from '@/services/providers';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex">
        {/* tab_bar */}
        <main className="flex-1 ml-80 ">{children}</main>
        <Modal />
      </div>
    </Providers>
  );
}
