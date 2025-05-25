'use client';

import { useRouter } from 'next/navigation';

export default function DeleteConfirm() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-grayscale-0 flex flex-col justify-center items-center">
      <div className="w-[960px] max-md:w-full h-[302px] flex flex-col items-center justify-center rounded-[24px] border border-[var(--grayscale-20)] max-md:p-4">
        <span className="text-[48px] max-md:text-[27px] text-[var(--like)] font-bold">
          회원 탈퇴가 완료 되었습니다.
        </span>
        <span className="text-xl max-md:text-sm font-semibold mt-6 ">
          지금까지 취미 커뮤니티 [HOBBi]를 이용해주셔서 감사합니다.
        </span>
        <span className="text-xl max-md:text-sm font-semibold">
          더 나은 모습으로 다시 찾아뵐 수 있도록 노력하겠습니다.
        </span>
      </div>
      <button
        className="w-[960px] max-md:w-full h-[72px] rounded-[12px] bg-[var(--grayscale-10)] text-xl text-[var(--grayscale-50)] font-semibold mt-[48px]"
        onClick={() => router.push('/posts')}
      >
        메인페이지로 이동
      </button>
    </div>
  );
}
