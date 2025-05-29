'use client';

import { usePathname } from 'next/navigation';
import Modal from '@/components/common/modal';
import TabBar from '@/components/common/tab_bar';
import NotificationPage from '@/components/notification/notification_page';
import Search from '@/components/search/search';
import Providers from '@/services/providers';
import Header from '@/components/common/header';

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideTabBarRoutes = [
    '/my_page/delete_account',
    '/my_page/delete_confirm',
  ];
  const hideTabBar = hideTabBarRoutes.includes(pathname);

  return (
    <Providers>
      <Header />
      <div className="flex relative">
        {!hideTabBar && <TabBar />}
        <div className="flex-1 bg-grayscale-1 max-md:h-[64px]">
          {children}
          <Search />

          <NotificationPage />
        </div>
        <Modal />
      </div>
    </Providers>
  );
}
