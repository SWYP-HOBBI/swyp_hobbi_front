import Link from 'next/link';
import Image from 'next/image';
import SvgIcon from '@/components/common/svg_icon';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* 404 이미지 */}
      <div className="relative w-[400px] h-[400px] max-md:w-[280px] max-md:h-[280px]">
        <Image
          src="/images/404.png"
          alt="404 이미지"
          fill
          className="object-contain"
        />
      </div>

      {/* 텍스트 */}
      <h1 className="text-2xl font-bold text-grayscale-90 mb-4">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-grayscale-60 text-center mb-8">
        요청하신 페이지가 삭제되었거나 잘못된 경로입니다.
      </p>

      {/* 홈으로 가기 버튼 */}
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-primary text-grayscale-0 rounded-full hover:bg-primary/80 transition-colors"
      >
        <span>홈으로 가기</span>
      </Link>
    </div>
  );
}
