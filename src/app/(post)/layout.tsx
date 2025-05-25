'use client';
import Modal from '@/components/common/modal';
import TabBar from '@/components/common/tab_bar';
import Search from '@/components/search/search';
import Providers from '@/services/providers';
import NotificationPage from '@/components/notification/notification_page';

import Header from '@/components/common/header';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex relative">
        <Header />
        <TabBar />
        <div className="flex-1 bg-grayscale-1 max-md:pt-[64px]">
          {children}
          <Search />
          <NotificationPage />
        </div>
        <Modal />
      </div>
    </Providers>
  );
}
