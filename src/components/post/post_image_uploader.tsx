'use client';

import Image from 'next/image';
import SvgIcon from '../common/svg_icon';
import { ImageFile } from '@/types/post';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * 게시글 이미지 업로드 Props 인터페이스
 *
 * 이미지 업로더 컴포넌트에 전달되는 속성들을 정의합니다.
 *
 * @param images - 현재 업로드된 이미지 파일 배열 (ImageFile 타입)
 * @param onImageUpload - 새 이미지 파일 업로드 시 호출되는 콜백 함수
 * @param onImageRemove - 특정 이미지 삭제 시 호출되는 콜백 함수
 * @param onImageReorder - 이미지 순서 변경 시 호출되는 콜백 함수
 */
interface PostImageUploaderProps {
  images: ImageFile[];
  onImageUpload: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  onImageReorder: (newImages: ImageFile[]) => void;
}

/**
 * 게시글 이미지 업로드 컴포넌트
 *
 * 게시글 작성 시 이미지를 업로드하고 관리하는 종합적인 이미지 업로더입니다.
 *
 * 주요 기능:
 * 1. 최대 5장까지 이미지 업로드 (개수 제한)
 * 2. 이미지 미리보기 표시 (실시간)
 * 3. 개별 이미지 삭제 (X 버튼)
 * 4. 이미지 순서 드래그 앤 드롭 변경 (dnd-kit 라이브러리 활용)
 * 5. 다양한 이미지 형식 지원 (JPEG, PNG, GIF, BMP, WebP, HEIC)
 *
 * 기술적 특징:
 * - dnd-kit 라이브러리를 활용한 드래그 앤 드롭 기능
 * - PointerSensor를 통한 터치/마우스 이벤트 처리
 * - CSS Transform을 이용한 드래그 시 시각적 피드백
 * - 파일 입력 숨김 처리로 커스텀 UI 제공
 *
 * 사용자 경험:
 * - 직관적인 드래그 앤 드롭 인터페이스
 * - 실시간 이미지 미리보기
 * - 드래그 중 시각적 피드백 (투명도, z-index 변경)
 * - 업로드 제한 시 업로드 버튼 자동 숨김
 *
 * 성능 최적화:
 * - Next.js Image 컴포넌트 활용
 * - 드래그 시 GPU 가속 활용
 * - 불필요한 리렌더링 방지
 */
export default function PostImageUploader({
  images,
  onImageUpload,
  onImageRemove,
  onImageReorder,
}: PostImageUploaderProps) {
  // ===== dnd-kit 설정 =====

  /**
   * dnd-kit 센서 설정
   *
   * PointerSensor를 사용하여 마우스와 터치 이벤트를 모두 처리합니다.
   * 모바일과 데스크톱 환경에서 모두 드래그 앤 드롭이 가능합니다.
   */
  const sensors = useSensors(useSensor(PointerSensor));

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 드래그 종료 시 순서 변경 처리
   *
   * 드래그가 완료되면 이미지 배열의 순서를 변경하고
   * 상위 컴포넌트에 새로운 순서를 전달합니다.
   *
   * 처리 과정:
   * 1. 드래그된 요소(active)와 드롭된 위치(over) 확인
   * 2. 유효하지 않은 드롭인 경우 처리 중단
   * 3. 기존 인덱스와 새로운 인덱스 계산
   * 4. arrayMove 함수로 배열 순서 변경
   * 5. 상위 컴포넌트에 새로운 배열 전달
   *
   * @param event - dnd-kit에서 제공하는 드래그 이벤트 객체
   */
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    // ===== 유효성 검사 =====
    if (!over || active.id === over.id) return;

    // ===== 인덱스 계산 =====
    const oldIndex = images.findIndex((_, i) => String(i) === active.id);
    const newIndex = images.findIndex((_, i) => String(i) === over.id);

    // ===== 순서 변경 처리 =====
    if (oldIndex !== -1 && newIndex !== -1) {
      const newImages = arrayMove(images, oldIndex, newIndex);
      onImageReorder(newImages);
    }
  };

  /**
   * 이미지 파일 선택 처리
   *
   * 파일 입력에서 선택된 이미지들을 처리합니다.
   *
   * 처리 과정:
   * 1. 선택된 파일들 확인
   * 2. 남은 슬롯 수 계산 (최대 5장 제한)
   * 3. 제한에 맞게 파일 수 조정
   * 4. 상위 컴포넌트에 파일 전달
   *
   * @param e - 파일 입력 변경 이벤트
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // ===== 업로드 제한 확인 =====
    const remainingSlots = 5 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    onImageUpload(filesToAdd);
  };

  // ===== 메인 렌더링 =====
  return (
    <div className="space-y-2 shadow-md rounded-lg p-5 bg-grayscale-0">
      {/* ===== 헤더 영역 ===== */}
      <div className="mb-6">
        <label className="text-grayscale-100 text-lg font-medium">
          이미지 등록
        </label>
        <span className="text-xs text-grayscale-50 ml-2">
          *사진을 최대 5장까지 업로드할 수 있습니다.
        </span>
      </div>

      {/* ===== 이미지 그리드 (드래그 앤 드롭) ===== */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((_, i) => String(i))}
          strategy={rectSortingStrategy}
        >
          <div className="flex gap-4 flex-wrap">
            {/* ===== 업로드된 이미지 목록 ===== */}
            {images.map((image, index) => (
              <SortableImage
                key={index}
                id={String(index)}
                image={image}
                onRemove={() => onImageRemove(index)}
              />
            ))}

            {/* ===== 이미지 업로드 버튼 ===== */}
            {/* 
              이미지가 5장 미만일 때만 표시
              
              기능:
              - 숨겨진 파일 입력과 연결
              - 호버 효과로 사용자 피드백 제공
              - 다양한 이미지 형식 지원
              - 다중 파일 선택 가능
            */}
            {images.length < 5 && (
              <label className="w-40 h-30 button_transition flex items-center justify-center rounded-lg bg-[#D9D9D9] hover:bg-[#C4C4C4] cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp,image/heic"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <SvgIcon name="add" size={24} color="var(--grayscale-100)" />
              </label>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/**
 * 드래그 가능한 이미지 컴포넌트
 *
 * dnd-kit의 useSortable 훅을 사용하여 드래그 앤 드롭 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 드래그 시 시각적 피드백 (투명도, z-index 변경)
 * 2. 이미지 미리보기 표시
 * 3. 삭제 버튼 제공
 * 4. 터치/마우스 이벤트 처리
 *
 * Props:
 * @param id - 드래그 앤 드롭을 위한 고유 식별자
 * @param image - 표시할 이미지 파일 객체
 * @param onRemove - 삭제 버튼 클릭 시 호출되는 콜백
 */
function SortableImage({
  id,
  image,
  onRemove,
}: {
  id: string;
  image: ImageFile;
  onRemove: () => void;
}) {
  // ===== dnd-kit useSortable 훅 =====

  /**
   * dnd-kit에서 제공하는 드래그 관련 속성들
   *
   * - attributes: 드래그 가능한 요소에 필요한 HTML 속성들
   * - listeners: 마우스/터치 이벤트 리스너들
   * - setNodeRef: DOM 요소 참조 함수
   * - transform: 드래그 중 변환 정보
   * - transition: 애니메이션 전환 정보
   * - isDragging: 현재 드래그 중인지 여부
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // ===== 드래그 시 스타일 계산 =====

  /**
   * 드래그 중일 때 적용할 스타일 객체
   *
   * 스타일 속성:
   * - transform: CSS Transform 문자열로 변환
   * - transition: 부드러운 애니메이션 적용
   * - touchAction: 터치 동작 최적화
   * - zIndex: 드래그 중인 요소를 최상단에 표시
   * - opacity: 드래그 중 투명도 변경으로 시각적 피드백
   */
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'manipulation',
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  // ===== 렌더링 =====
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-40 h-30 bg-grayscale-5 flex items-center justify-center rounded-lg"
    >
      {/* ===== 이미지 미리보기 ===== */}
      <Image
        src={image.preview}
        alt="업로드 이미지"
        width={170}
        height={127}
        className="w-full h-full object-contain rounded-lg"
      />

      {/* ===== 삭제 버튼 ===== */}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3"
        /**
         * 삭제 버튼 클릭 시 이미지 제거
         *
         * 절대 위치로 우상단에 배치하여
         * 이미지와 겹치지 않도록 함
         */
      >
        <SvgIcon name="delete" size={12} color="var(--grayscale-100)" />
      </button>
    </div>
  );
}
