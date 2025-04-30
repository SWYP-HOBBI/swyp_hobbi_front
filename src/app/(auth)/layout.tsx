import Modal from '@/components/common/modal';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-screen p-4 bg-grayscale-0">
      {children}
      <Modal />
    </div>
  );
}
