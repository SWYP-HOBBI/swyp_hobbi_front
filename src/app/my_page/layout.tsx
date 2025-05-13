import TabBar from '@/components/common/tab_bar';
import Providers from '@/services/providers';

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex">
        <TabBar />
        {children}
      </div>
    </Providers>
  );
}
