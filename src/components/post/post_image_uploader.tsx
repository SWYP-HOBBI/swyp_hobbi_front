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
 * @param images - 업로드된 이미지 파일 배열
 * @param onImageUpload - 이미지 업로드 처리 함수
 * @param onImageRemove - 이미지 삭제 처리 함수
 * @param onImageReorder - 이미지 순서 변경 콜백
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
 * 주요 기능
 * 1. 최대 5장까지 이미지 업로드
 * 2. 이미지 미리보기 표시
 * 3. 개별 이미지 삭제
 * 4. 이미지 순서 드래그 앤 드롭 변경
 */
export default function PostImageUploader({
  images,
  onImageUpload,
  onImageRemove,
  onImageReorder,
}: PostImageUploaderProps) {
  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // 드래그 종료 시 순서 변경 처리
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((_, i) => String(i) === active.id);
    const newIndex = images.findIndex((_, i) => String(i) === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newImages = arrayMove(images, oldIndex, newIndex);
      onImageReorder(newImages);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 5 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    onImageUpload(filesToAdd);
  };

  return (
    <div className="space-y-2 shadow-md rounded-lg p-5 bg-grayscale-0">
      {/* 헤더 */}
      <div className="mb-6">
        <label className="text-grayscale-100 text-lg font-medium">
          이미지 등록
        </label>
        <span className="text-xs text-grayscale-50 ml-2">
          *사진을 최대 5장까지 업로드할 수 있습니다.
        </span>
      </div>
      {/* 이미지 그리드 (드래그 앤 드롭) */}
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
            {images.map((image, index) => (
              <SortableImage
                key={index}
                id={String(index)}
                image={image}
                onRemove={() => onImageRemove(index)}
              />
            ))}
            {/* 이미지 업로드 버튼 (5장 미만일 때만 표시) */}
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

// 드래그 가능한 이미지 컴포넌트
function SortableImage({
  id,
  image,
  onRemove,
}: {
  id: string;
  image: ImageFile;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'manipulation',
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-40 h-30 bg-grayscale-5 flex items-center justify-center rounded-lg"
    >
      <Image
        src={image.preview}
        alt="업로드 이미지"
        width={170}
        height={127}
        className="w-full h-full object-contain rounded-lg"
      />
      <button onClick={onRemove} className="absolute top-3 right-3">
        <SvgIcon name="delete" size={12} color="var(--grayscale-100)" />
      </button>
    </div>
  );
}
