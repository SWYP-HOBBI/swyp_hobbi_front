'use client';

import { useRouter } from 'next/navigation';

export default function DeleteConfirm() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-grayscale-0 flex flex-col justify-center items-center">
      <div className="w-[686px] max-md:w-[355px] max-md:h-[155px] h-[271px] flex flex-col items-center justify-center rounded-[12px] border border-[var(--grayscale-20)] max-md:p-4">
        <span className="text-[32px] max-md:text-[18px] text-[var(--like)] font-bold">
          회원 탈퇴가 완료 되었습니다.
        </span>
        <span className="text-[18px] max-md:text-[12px] font-semibold mt-2 ">
          지금까지 취미 커뮤니티 [HOBBi]를 이용해주셔서 감사합니다.
        </span>
        <span className="text-[18px] max-md:text-[12px] font-semibold">
          더 나은 모습으로 다시 찾아뵐 수 있도록 노력하겠습니다.
        </span>
      </div>
      <button
        className="w-[686px] h-[72px] max-md:w-[350px] max-md:h-[48px] rounded-[12px] bg-[var(--grayscale-10)] text-xl text-[var(--grayscale-50)] font-semibold mt-[48px]"
        onClick={() => router.push('/posts')}
      >
        메인페이지로 이동
      </button>
    </div>
  );
}
