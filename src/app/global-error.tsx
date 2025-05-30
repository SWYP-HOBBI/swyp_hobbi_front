'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/common/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          {/* 에러 이미지 */}
          <div className="relative w-[400px] h-[400px] max-md:w-[280px] max-md:h-[280px]">
            <Image
              src="/images/ERROR.png"
              alt="에러 이미지"
              fill
              className="object-contain bg-transparent"
            />
          </div>

          {/* 텍스트 */}
          <h1 className="text-2xl font-bold text-grayscale-90 mb-4">
            치명적인 오류가 발생했습니다
          </h1>
          <p className="text-grayscale-60 text-center mb-8">
            예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>

          {/* 버튼 그룹 */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={reset}>
              다시 시도하기
            </Button>
            <Link href="/posts">
              <Button>홈으로 가기</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
