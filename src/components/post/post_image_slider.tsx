import Image from 'next/image';
import { useState } from 'react';
import SvgIcon from '@/components/common/svg_icon';

/**
 * 게시글 이미지 슬라이더 Props 인터페이스
 * @param images - 이미지 배열
 */
interface PostImageSliderProps {
  images: string[];
}

/**
 * 게시글 이미지 슬라이더 컴포넌트
 *
 * 주요 기능:
 * 1. 이미지 슬라이드 표시
 * 2. 첫 번째 이미지일 때는 오른쪽 버튼만 표시
 * 3. 마지막 이미지일 때는 왼쪽 버튼만 표시
 * 4. 중간 이미지들은 양쪽 버튼 모두 표시
 */
export default function PostImageSlider({ images }: PostImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 이전/다음 버튼 표시 여부 확인
  const showPrevButton = currentImageIndex > 0;
  const showNextButton = currentImageIndex < images.length - 1;

  return (
    images.length > 0 && (
      <div className="relative mb-12">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{ transform: `translateX(-${currentImageIndex * 60}%)` }}
          >
            {images.map((imageUrl, index) => (
              <div key={index} className="flex-none w-[calc(60%-16px)]">
                <div className="aspect-[4/3] relative rounded-xl">
                  <Image
                    src={imageUrl}
                    alt={`게시글 이미지 ${index + 1}`}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이미지가 2장 이상일 때만 네비게이션 버튼 표시 */}
        {images.length > 1 && (
          <>
            {/* 이전 버튼 (첫 번째 이미지가 아닐 때만 표시) */}
            {showPrevButton && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={() => setCurrentImageIndex((prev) => prev - 1)}
              >
                <SvgIcon
                  name="arrow_left"
                  size={32}
                  color="var(--grayscale-20)"
                />
              </button>
            )}

            {/* 다음 버튼 (마지막 이미지가 아닐 때만 표시) */}
            {showNextButton && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={() => setCurrentImageIndex((prev) => prev + 1)}
              >
                <SvgIcon
                  name="arrow_left"
                  size={32}
                  color="var(--grayscale-20)"
                  className="rotate-180"
                />
              </button>
            )}
          </>
        )}

        {/* 이미지 인디케이터 (이미지가 2장 이상일 때만 표시) */}
        {images.length > 1 && (
          <div className="absolute -bottom-7 left-[calc(50%)] -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className="flex items-center justify-center"
                onClick={() => setCurrentImageIndex(index)}
              >
                <SvgIcon
                  name="home"
                  size={18}
                  color={
                    index === currentImageIndex
                      ? 'var(--primary)'
                      : 'var(--grayscale-20)'
                  }
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  );
}
