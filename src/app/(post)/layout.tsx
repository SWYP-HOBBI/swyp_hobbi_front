'use client';
import Modal from '@/components/common/modal';
import TabBar from '@/components/common/tab_bar';
import Search from '@/components/search/search';
import Providers from '@/services/providers';
import NotificationPage from '@/components/notification/notification_page';
import { useNotificationStore } from '@/store/notification';
// import { useState } from 'react';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isNotificationOpen } = useNotificationStore();
  return (
    <Providers>
      <div className="flex relative">
        <TabBar />
        <div className="relative flex-1">
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
