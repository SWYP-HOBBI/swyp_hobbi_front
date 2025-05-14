import Modal from '@/components/common/modal';
import TabBar from '@/components/common/tab_bar';
import Search from '@/components/search/search';
import Providers from '@/services/providers';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex relative">
        <TabBar />
        <div className="relative flex-1">
          {children}
          <Search />
        </div>
        <Modal />
      </div>
    </Providers>
  );
}
