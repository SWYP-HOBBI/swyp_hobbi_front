import { useState, useEffect, useCallback } from 'react';
import { useHobbyStore } from '@/store/hobby';
import { ImageFile, PostDetail } from '@/types/post';
import Button from '../common/button';
import HobbySelector from '../common/hobby_selector';
import Input from '../common/input';
import PostImageUploader from './post_image_uploader';
import { motion } from 'framer-motion';
import { z } from 'zod';

import {
  HOBBY_MAIN_CATEGORIES,
  HOBBY_SUB_CATEGORIES,
  HobbyTag,
} from '@/types/hobby';

/**
 * 게시글 작성&수정 폼 Props 인터페이스
 *
 * @param initialData - 수정할 게시글 데이터 (수정 모드에서만 사용)
 * @param onSubmit - 게시글 제출 함수 (FormData를 받아서 처리)
 * @param submitButtonText - 게시글 제출 버튼 텍스트 (기본값: '게시하기')
 */
interface PostFormProps {
  initialData?: PostDetail;
  onSubmit: (formData: FormData) => Promise<void>;
  submitButtonText?: string;
}

/**
 * 게시글 작성&수정 폼 컴포넌트
 *
 * 게시글을 새로 작성하거나 기존 게시글을 수정할 수 있는 통합 폼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 게시글 제목 입력 (최대 30자)
 * 2. 취미 태그 선택 (최대 5개)
 * 3. 이미지 업로드 (최대 5장, 드래그 앤 드롭 지원)
 * 4. 게시글 내용 입력 (최소 10자, 최대 2,000자)
 * 5. 실시간 유효성 검사 (Zod 스키마 기반)
 * 6. 폼 제출 및 에러 처리
 * 7. 애니메이션 효과 (Framer Motion)
 *
 * 사용 모드:
 * - 작성 모드: initialData가 없는 경우
 * - 수정 모드: initialData가 있는 경우 (기존 데이터로 폼 초기화)
 *
 * 데이터 흐름:
 * 1. 사용자 입력 수집 (제목, 내용, 태그, 이미지)
 * 2. 실시간 유효성 검사
 * 3. 폼 제출 시 FormData 생성
 * 4. 부모 컴포넌트의 onSubmit 함수 호출
 *
 * 기술적 특징:
 * - Zod를 통한 타입 안전한 유효성 검사
 * - Zustand를 통한 취미 태그 상태 관리
 * - Framer Motion을 통한 부드러운 애니메이션
 * - 반응형 디자인 (모바일/데스크톱)
 * - 이미지 파일 관리 (업로드, 삭제, 순서 변경)
 */

// ===== Zod 스키마 정의 =====

/**
 * 게시글 폼 유효성 검사 스키마
 *
 * 각 필드별 유효성 검사 규칙:
 * - title: 1-30자 필수
 * - content: 10-2,000자 필수
 * - hobbyTags: 1-5개 필수
 */
const PostFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(30, '제목은 30자 이하로 입력해주세요.'),
  content: z
    .string()
    .min(10, '내용은 최소 10자 이상 입력해주세요.')
    .max(2000, '내용은 2,000자 이하로 입력해주세요.'),
  hobbyTags: z
    .array(z.string())
    .min(1, '태그를 선택해주세요.')
    .max(5, '태그는 최대 5개까지 선택할 수 있습니다.'),
});

/**
 * 폼 에러 타입 정의
 * 각 필드별 에러 메시지를 저장하는 객체 타입
 */
type PostFormError = Partial<Record<'title' | 'content' | 'hobbyTags', string>>;

export default function PostForm({
  initialData,
  onSubmit,
  submitButtonText = '게시하기',
}: PostFormProps) {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * 취미 스토어에서 선택된 태그와 설정 함수 가져오기
   * 전역 상태로 관리되어 다른 컴포넌트와 공유됨
   */
  const { selectedHobbyTags, setSelectedHobbyTags } = useHobbyStore();

  // ===== 로컬 상태 관리 =====

  /**
   * 게시글 제목 상태
   * 수정 모드일 경우 기존 제목으로 초기화
   */
  const [title, setTitle] = useState(initialData?.title || '');

  /**
   * 게시글 내용 상태
   * 수정 모드일 경우 기존 내용으로 초기화
   */
  const [content, setContent] = useState(initialData?.content || '');

  /**
   * 이미지 파일 배열 상태
   * 수정 모드일 경우 기존 이미지 URL을 preview로 설정
   * 새로 업로드된 이미지는 file과 preview 모두 설정
   */
  const [images, setImages] = useState<ImageFile[]>(
    initialData?.postImageUrls.map((url) => ({
      file: null, // 기존 이미지는 file이 null
      preview: url, // 기존 이미지 URL을 preview로 사용
    })) || [],
  );

  /**
   * 삭제된 이미지 URL 목록
   * 수정 모드에서 기존 이미지를 삭제할 때 서버에 전송할 URL 목록
   */
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

  /**
   * 폼 유효성 검사 에러 상태
   * 각 필드별 에러 메시지를 저장
   */
  const [formError, setFormError] = useState<PostFormError>({});

  // ===== 사이드 이펙트 =====

  /**
   * 게시글 수정 시 기존 취미 태그 데이터 처리
   *
   * 목적:
   * - 초기 데이터(initialData)의 취미 태그를 컴포넌트의 상태로 변환
   * - 서버 데이터 형식을 클라이언트 상태 형식으로 변환
   *
   * 데이터 변환 과정:
   * 1. 서버에서 받은 태그 배열: ['축구', '농구', '야구']
   * 2. HOBBY_SUB_CATEGORIES에서 각 태그의 메인 카테고리 찾기
   * 3. 클라이언트 상태 형식으로 변환:
   *    [{ mainCategory: '스포츠', subCategory: '축구' }, ...]
   *
   * @example
   * 서버 데이터: ['축구', '농구', '야구']
   * 변환 결과: [
   *   { mainCategory: '스포츠', subCategory: '축구' },
   *   { mainCategory: '스포츠', subCategory: '농구' },
   *   { mainCategory: '스포츠', subCategory: '야구' }
   * ]
   */
  useEffect(() => {
    // initialData가 있고 취미 태그가 있는 경우에만 실행
    if (initialData?.postHobbyTags) {
      // 서버에서 받은 태그 배열을 HobbyTag 형식으로 변환
      const convertedTags = initialData.postHobbyTags
        .map((subCategory) => {
          /**
           * HOBBY_SUB_CATEGORIES 객체에서 현재 subCategory가 속한 mainCategory 찾기
           *
           * HOBBY_SUB_CATEGORIES 구조 예시:
           * {
           *   'SPORTS': ['축구', '농구', '야구'],
           *   'ART': ['그림', '음악', '댄스'],
           *   ...
           * }
           *
           * Object.entries() 사용하여 [키, 값] 쌍의 배열로 변환 후
           * find()로 subCategory를 포함하는 카테고리 찾기
           */
          const mainCategoryEntry = Object.entries(HOBBY_SUB_CATEGORIES).find(
            ([, subCategories]) => subCategories.includes(subCategory),
          );

          // 메인 카테고리를 찾지 못한 경우 null 반환
          if (!mainCategoryEntry) {
            return null;
          }

          /**
           * mainCategoryEntry에서 메인 카테고리 키 추출
           * 예: ['SPORTS', ['축구', '농구', '야구']] => 'SPORTS'
           */
          const [mainCategoryKey] = mainCategoryEntry;

          /**
           * HOBBY_MAIN_CATEGORIES에서 실제 표시될 메인 카테고리 이름 가져오기
           *
           * HOBBY_MAIN_CATEGORIES 구조 예시:
           * {
           *   'SPORTS': '스포츠',
           *   'ART': '예술',
           *   ...
           * }
           */
          const mainCategory =
            HOBBY_MAIN_CATEGORIES[
              mainCategoryKey as keyof typeof HOBBY_MAIN_CATEGORIES
            ];

          // HobbyTag 객체 형식으로 반환
          return {
            mainCategory, // 예: '스포츠'
            subCategory, // 예: '축구'
          } as HobbyTag;
        })
        // null 값 필터링 및 타입 가드 적용
        .filter((tag): tag is HobbyTag => tag !== null);

      // 변환된 태그 배열을 상태로 설정
      setSelectedHobbyTags(convertedTags);
    }
  }, [initialData?.postHobbyTags, setSelectedHobbyTags]);

  // ===== 실시간 유효성 검사 핸들러 =====

  /**
   * 제목 입력 변경 핸들러
   *
   * 기능:
   * 1. 제목 상태 업데이트
   * 2. Zod 스키마를 통한 실시간 유효성 검사
   * 3. 에러 메시지 상태 업데이트
   *
   * @param e - 입력 이벤트 객체
   */
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      const result = PostFormSchema.shape.title.safeParse(e.target.value);
      setFormError((prev) => ({
        ...prev,
        title: result.success ? undefined : result.error.errors[0].message,
      }));
    },
    [],
  );

  /**
   * 내용 입력 변경 핸들러
   *
   * 기능:
   * 1. 내용 상태 업데이트
   * 2. Zod 스키마를 통한 실시간 유효성 검사
   * 3. 에러 메시지 상태 업데이트
   *
   * @param e - 텍스트 영역 변경 이벤트 객체
   */
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      const result = PostFormSchema.shape.content.safeParse(e.target.value);
      setFormError((prev) => ({
        ...prev,
        content: result.success ? undefined : result.error.errors[0].message,
      }));
    },
    [],
  );

  /**
   * 취미 태그 변경 시 유효성 검사
   *
   * selectedHobbyTags가 변경될 때마다 실행되어
   * 태그 개수에 대한 유효성을 검사합니다.
   */
  useEffect(() => {
    const result = PostFormSchema.shape.hobbyTags.safeParse(
      selectedHobbyTags.map((tag) => tag.subCategory),
    );
    setFormError((prev) => ({
      ...prev,
      hobbyTags: result.success ? undefined : result.error.errors[0].message,
    }));
  }, [selectedHobbyTags]);

  // ===== 이미지 관리 핸들러 =====

  /**
   * 이미지 업로드 핸들러
   *
   * 기능:
   * 1. 선택된 파일들을 ImageFile 형식으로 변환
   * 2. 각 파일에 대해 미리보기 URL 생성
   * 3. 기존 이미지 배열에 새 이미지들 추가
   *
   * @param files - 업로드할 파일 배열
   */
  const handleImageUpload = useCallback((files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file), // 브라우저에서 미리보기 URL 생성
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  /**
   * 이미지 삭제 핸들러
   *
   * 기능:
   * 1. 지정된 인덱스의 이미지 제거
   * 2. 기존 이미지 URL인 경우 삭제 목록에 추가
   * 3. 새로 업로드된 이미지인 경우 브라우저 캐시에서 제거
   *
   * @param index - 삭제할 이미지의 인덱스
   */
  const handleImageRemove = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev]; // 기존 이미지 배열 복사
      const removedImage = newImages[index]; // 삭제할 이미지 추출

      // 기존 이미지 URL이 있다면 삭제 목록에 추가
      // (수정 모드에서 기존 이미지를 삭제한 경우)
      if (!removedImage.file && removedImage.preview) {
        setDeletedImageUrls((prev) => [...prev, removedImage.preview]);
      }

      // 새로 업로드된 이미지인 경우 브라우저 캐시에서 제거
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // ===== 폼 데이터 생성 =====

  /**
   * 서버 전송용 FormData 생성
   *
   * 기능:
   * 1. 게시글 메타데이터를 JSON으로 직렬화
   * 2. 이미지 파일들을 FormData에 추가
   * 3. 삭제된 이미지 URL 목록 포함
   *
   * @returns 서버에 전송할 FormData 객체
   */
  const createFormData = () => {
    const formData = new FormData();

    // 게시글 메타데이터 (JSON 형태로 직렬화)
    const postData = {
      title,
      content,
      hobbyTagNames: selectedHobbyTags.map((tag) => tag.subCategory),
      deletedImageUrls, // 삭제된 이미지 URL 목록 추가
    };

    // JSON을 Blob으로 변환하여 FormData에 추가
    const requestBlob = new Blob([JSON.stringify(postData)], {
      type: 'application/json',
    });
    formData.append('request', requestBlob);

    // 새로 업로드된 이미지 파일들을 FormData에 추가
    images.forEach((image) => {
      if (image.file) {
        formData.append('imageFiles', image.file);
      }
    });

    return formData;
  };

  // ===== 폼 제출 핸들러 =====

  /**
   * 게시글 제출 핸들러
   *
   * 처리 과정:
   * 1. 전체 폼 데이터 유효성 검사 (Zod 스키마)
   * 2. 유효성 검사 실패 시 에러 메시지 표시
   * 3. 유효성 검사 성공 시 FormData 생성
   * 4. 부모 컴포넌트의 onSubmit 함수 호출
   * 5. 에러 발생 시 사용자에게 알림
   */
  const handleSubmit = useCallback(async () => {
    // 전체 폼 데이터 유효성 검사
    const result = PostFormSchema.safeParse({
      title,
      content,
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    });

    if (!result.success) {
      // 유효성 검사 실패 시 에러 메시지 설정
      const fieldErrors: PostFormError = {};
      result.error.errors.forEach((err) => {
        if (err.path[0])
          fieldErrors[err.path[0] as keyof PostFormError] = err.message;
      });
      setFormError(fieldErrors);
      return;
    }

    try {
      // FormData 생성 및 제출
      const formData = createFormData();
      await onSubmit(formData);
    } catch (error) {
      console.error('게시글 처리 실패:', error);
      alert(
        error instanceof Error ? error.message : '게시글 처리에 실패했습니다.',
      );
    }
  }, [title, content, selectedHobbyTags, images, deletedImageUrls, onSubmit]);

  // ===== 애니메이션 설정 =====

  /**
   * 컨테이너 애니메이션 variants
   * 전체 폼의 등장 애니메이션을 정의
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // 자식 요소들이 0.2초 간격으로 순차 등장
      },
    },
  };

  /**
   * 개별 요소 애니메이션 variants
   * 각 폼 요소의 등장 애니메이션을 정의
   */
  const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // 초기 상태: 투명하고 아래에서 시작
    visible: {
      opacity: 1,
      y: 0, // 최종 상태: 완전히 보이고 원래 위치
      transition: {
        type: 'spring' as const,
        stiffness: 300, // 스프링 강도
        damping: 30, // 감쇠
      },
    },
  };

  // ===== 메인 렌더링 =====
  return (
    <motion.div
      className="w-[960px] mx-auto my-12 space-y-6 max-md:w-full max-md:mt-6 max-md:mb-[93px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ===== 1. 제목 입력 섹션 ===== */}
      <motion.div
        className="shadow-md rounded-lg bg-grayscale-0"
        variants={itemVariants}
      >
        <Input
          placeholder="제목을 입력하세요. *최대 30자 이하"
          value={title}
          onChange={handleTitleChange}
          maxLength={30}
          className="placeholder:text-lg placeholder:text-grayscale-60 placeholder:font-medium border-none"
        />
      </motion.div>

      {/* ===== 2. 태그 설정 섹션 ===== */}
      <div className="space-y-2 shadow-md rounded-lg p-5 bg-grayscale-0">
        <div className="mb-6">
          <label className="text-grayscale-100 text-lg font-medium">
            태그 설정
          </label>
          <span className="text-xs text-grayscale-50 ml-2">
            *관심 취미 대그룹 추가해 보세요. 최대 5개
          </span>
        </div>
        <div className="max-sm:w-[350px]">
          <HobbySelector maxCount={5} />
        </div>
      </div>

      {/* ===== 3. 이미지 업로드 섹션 ===== */}
      <motion.div variants={itemVariants}>
        <PostImageUploader
          images={images}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          onImageReorder={setImages}
        />
      </motion.div>

      {/* ===== 4. 게시글 내용 입력 섹션 ===== */}
      <motion.div
        className="space-y-2 shadow-md rounded-lg p-5 bg-grayscale-0"
        variants={itemVariants}
      >
        <textarea
          className="w-full h-64 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="게시글을 작성해주세요. *최소 10자~최대 2,000자 이하"
          minLength={10}
          maxLength={2000}
          value={content}
          onChange={handleContentChange}
        />
      </motion.div>

      {/* ===== 5. 게시글 작성 버튼 섹션 ===== */}
      <motion.div className="flex justify-end" variants={itemVariants}>
        <div className="w-1/3 max-md:w-full max-md:px-5">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              fullWidth
              className="px-6 py-2 max-md:h-[60px]"
              onClick={handleSubmit}
              disabled={Boolean(
                formError.title || formError.content || formError.hobbyTags,
              )}
            >
              {submitButtonText}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
