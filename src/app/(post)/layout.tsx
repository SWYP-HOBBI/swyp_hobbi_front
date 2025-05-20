'use client';
import Modal from '@/components/common/modal';
import TabBar from '@/components/common/tab_bar';
import Search from '@/components/search/search';
import Providers from '@/services/providers';
import NotificationPage from '@/components/notification/notification_page';
import { useNotificationStore } from '@/store/notification';
import Header from '@/components/common/header';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isNotificationOpen } = useNotificationStore();
  return (
    <Providers>
      <div className="flex relative">
        <Header />
        <TabBar />
        <div className="flex-1 bg-grayscale-1 max-md:pt-[64px]">
          {children}
          <Search />
          {isNotificationOpen && (
            <div className="fixed left-[200px] z-[9999]">
              <NotificationPage />
            </div>
          )}
        </div>
        <Modal />
      </div>
    </Providers>
  );
}
