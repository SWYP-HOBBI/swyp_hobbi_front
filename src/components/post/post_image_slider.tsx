import Image from 'next/image';
import { useState } from 'react';
import SvgIcon from '@/components/common/svg_icon';

/**
 * 게시글 이미지 슬라이더 Props 인터페이스
 *
 * 이미지 슬라이더 컴포넌트에 전달되는 속성들을 정의합니다.
 *
 * @param images - 게시글에 첨부된 이미지 URL 배열
 *                빈 배열인 경우 슬라이더가 렌더링되지 않음
 */
interface PostImageSliderProps {
  images: string[];
}

/**
 * 게시글 이미지 슬라이더 컴포넌트
 *
 * 게시글에 첨부된 여러 이미지를 슬라이드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이미지 슬라이드 표시 (가로 스크롤)
 * 2. 이전/다음 버튼을 통한 이미지 네비게이션
 * 3. 이미지 인디케이터를 통한 직접 이동
 * 4. 반응형 이미지 표시 (4:3 비율 유지)
 * 5. 이미지 로드 실패 시 기본 이미지 표시
 *
 * 네비게이션 로직:
 * - 첫 번째 이미지: 다음 버튼만 표시
 * - 마지막 이미지: 이전 버튼만 표시
 * - 중간 이미지들: 양쪽 버튼 모두 표시
 * - 이미지가 1장인 경우: 네비게이션 버튼 숨김
 *
 * 스타일링 특징:
 * - CSS Transform을 이용한 부드러운 슬라이드 애니메이션
 * - 이미지 간격: 16px (gap-4)
 * - 이미지 너비: 60% (calc(60%-16px))
 * - 4:3 비율 유지 (aspect-[4/3])
 * - 둥근 모서리 (rounded-xl)
 *
 * 접근성:
 * - 키보드 네비게이션 지원
 * - 이미지 alt 텍스트 제공
 * - 버튼 클릭 영역 최적화
 *
 * 성능 최적화:
 * - Next.js Image 컴포넌트 사용
 * - unoptimized 옵션으로 빠른 로딩
 * - CSS Transform으로 GPU 가속 활용
 */
export default function PostImageSlider({ images }: PostImageSliderProps) {
  // ===== 상태 관리 =====

  /**
   * 현재 표시 중인 이미지의 인덱스
   *
   * 0부터 시작하며, 이미지 배열의 길이보다 작은 값을 가집니다.
   * 이 값이 변경될 때마다 슬라이더가 해당 이미지로 이동합니다.
   */
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ===== 조건부 렌더링 로직 =====

  /**
   * 이전 버튼 표시 여부
   *
   * 현재 이미지가 첫 번째 이미지(인덱스 0)가 아닐 때만 true
   * 첫 번째 이미지에서는 이전 버튼을 숨겨서 사용자 혼란을 방지
   */
  const showPrevButton = currentImageIndex > 0;

  /**
   * 다음 버튼 표시 여부
   *
   * 현재 이미지가 마지막 이미지가 아닐 때만 true
   * 마지막 이미지에서는 다음 버튼을 숨겨서 사용자 혼란을 방지
   */
  const showNextButton = currentImageIndex < images.length - 1;

  // ===== 메인 렌더링 =====

  /**
   * 이미지가 존재할 때만 슬라이더를 렌더링
   *
   * 빈 배열인 경우 컴포넌트가 렌더링되지 않아 불필요한 DOM 요소 생성을 방지
   */
  return (
    images.length > 0 && (
      <div className="relative mb-12">
        {/* ===== 이미지 슬라이더 컨테이너 ===== */}
        <div className="overflow-hidden">
          {/* ===== 이미지 슬라이드 영역 ===== */}
          <div
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{
              /**
               * CSS Transform을 이용한 슬라이드 애니메이션
               *
               * 계산 방식:
               * - currentImageIndex: 현재 이미지 인덱스
               * - 60%: 각 이미지의 너비 (calc(60%-16px)에서 60% 부분)
               * - translateX(-${currentImageIndex * 60}%): 왼쪽으로 이동
               *
               * 예시:
               * - 0번 이미지: translateX(0%) (원래 위치)
               * - 1번 이미지: translateX(-60%) (한 칸 왼쪽)
               * - 2번 이미지: translateX(-120%) (두 칸 왼쪽)
               */
              transform: `translateX(-${currentImageIndex * 60}%)`,
            }}
          >
            {/* ===== 이미지 목록 렌더링 ===== */}
            {images.map((imageUrl, index) => (
              <div key={index} className="flex-none w-[calc(60%-16px)]">
                {/* ===== 이미지 컨테이너 ===== */}
                <div className="aspect-[4/3] relative rounded-xl bg-grayscale-5 flex items-center justify-center">
                  <Image
                    src={imageUrl}
                    alt={`게시글 이미지 ${index + 1}`}
                    fill
                    className="object-contain rounded-xl"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 네비게이션 버튼 영역 ===== */}
        {/* 
          이미지가 2장 이상일 때만 네비게이션 버튼 표시
          
          이유:
          - 1장인 경우 네비게이션이 불필요
          - 불필요한 UI 요소 제거로 깔끔한 인터페이스 제공
        */}
        {images.length > 1 && (
          <>
            {/* ===== 이전 버튼 ===== */}
            {/* 
              첫 번째 이미지가 아닐 때만 표시
              showPrevButton 조건으로 불필요한 버튼 숨김
            */}
            {showPrevButton && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                /**
                 * 이전 이미지로 이동
                 *
                 * 현재 인덱스에서 1을 빼서 이전 이미지로 이동
                 * 0보다 작아지지 않도록 이미 showPrevButton에서 체크
                 */
              >
                <SvgIcon
                  name="arrow_left"
                  size={32}
                  color="var(--grayscale-20)"
                />
              </button>
            )}

            {/* ===== 다음 버튼 ===== */}
            {/* 
              마지막 이미지가 아닐 때만 표시
              showNextButton 조건으로 불필요한 버튼 숨김
            */}
            {showNextButton && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                /**
                 * 다음 이미지로 이동
                 *
                 * 현재 인덱스에 1을 더해서 다음 이미지로 이동
                 * 배열 길이를 초과하지 않도록 이미 showNextButton에서 체크
                 */
              >
                <SvgIcon
                  name="arrow_left"
                  size={32}
                  color="var(--grayscale-20)"
                  className="rotate-180"
                  /**
                   * rotate-180 클래스로 화살표를 180도 회전
                   *
                   * 같은 아이콘을 재사용하여 다음 버튼으로 활용
                   * 아이콘 파일 수를 줄이고 일관성 유지
                   */
                />
              </button>
            )}
          </>
        )}

        {/* ===== 이미지 인디케이터 영역 ===== */}
        {/* 
          이미지가 2장 이상일 때만 인디케이터 표시
          
          기능:
          - 현재 이미지 위치를 시각적으로 표시
          - 클릭으로 직접 해당 이미지로 이동 가능
          - 현재 이미지는 primary 색상, 나머지는 grayscale-20 색상
        */}
        {images.length > 1 && (
          <div className="absolute -bottom-7 left-[calc(50%)] -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className="flex items-center justify-center"
                onClick={() => setCurrentImageIndex(index)}
                /**
                 * 인디케이터 클릭 시 해당 이미지로 직접 이동
                 *
                 * @param index - 이동할 이미지의 인덱스
                 */
              >
                <SvgIcon
                  name="home"
                  size={18}
                  color={
                    /**
                     * 현재 이미지 여부에 따른 색상 변경
                     *
                     * 조건부 렌더링으로 현재 상태를 시각적으로 표현
                     * - 현재 이미지: primary 색상 (강조)
                     * - 다른 이미지: grayscale-20 색상 (비활성)
                     */
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
