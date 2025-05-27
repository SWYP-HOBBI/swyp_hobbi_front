import Image from 'next/image';
import SvgIcon from '../common/svg_icon';
import { ImageFile } from '@/types/post';

/**
 * 게시글 이미지 업로드 Props 인터페이스
 * @param images - 업로드된 이미지 파일 배열
 * @param onImageUpload - 이미지 업로드 처리 함수
 * @param onImageRemove - 이미지 삭제 처리 함수
 */
interface PostImageUploaderProps {
  images: ImageFile[];
  onImageUpload: (files: File[]) => void;
  onImageRemove: (index: number) => void;
}

/**
 * 게시글 이미지 업로드 컴포넌트
 *
 * 주요 기능
 * 1. 최대 5장까지 이미지 업로드
 * 2. 이미지 미리보기 표시
 * 3. 개별 이미지 삭제
 */
export default function PostImageUploader({
  images,
  onImageUpload,
  onImageRemove,
}: PostImageUploaderProps) {
  /**
   * 이미지 파일 선택 핸들러
   * - 최대 5장까지만 업로드 가능
   * - 선택된 파일들을 부모 컴포넌트로 전달
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 남은 업로드 가능 슬롯 계산
    const remainingSlots = 5 - images.length;
    // 최대 업로드 가능 개수만큼만 파일 선택
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
      {/* 이미지 그리드 */}
      <div className="flex gap-4 flex-wrap">
        {/* 업로드된 이미지 미리보기 */}
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-40 h-30 bg-grayscale-5 flex items-center justify-center rounded-lg"
          >
            <Image
              src={image.preview}
              alt={`업로드 이미지 ${index + 1}`}
              width={170}
              height={127}
              className="w-full h-full object-contain rounded-lg"
            />
            {/* 이미지 삭제 버튼 */}
            <button
              onClick={() => onImageRemove(index)}
              className="absolute top-3 right-3"
            >
              <SvgIcon name="delete" size={12} color="var(--grayscale-100)" />
            </button>
          </div>
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
    </div>
  );
}
