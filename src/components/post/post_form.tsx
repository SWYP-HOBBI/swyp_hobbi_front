import { useState, useEffect } from 'react';
import { useHobbyStore } from '@/store/hobby';
import { ImageFile, PostDetail } from '@/types/post';
import Button from '../common/button';
import HobbySelector from '../common/hobby_selector';
import Input from '../common/input';
import PostImageUploader from './post_image_uploader';
import { motion } from 'framer-motion';

import {
  HOBBY_MAIN_CATEGORIES,
  HOBBY_SUB_CATEGORIES,
  HobbyTag,
} from '@/types/hobby';

/**
 * 게시글 작성&수정 폼 Props 인터페이스
 * @param initialData - 수정할 게시글 데이터
 * @param onSubmit - 게시글 제출 함수
 * @param submitButtonText - 게시글 제출 버튼 텍스트
 */
interface PostFormProps {
  initialData?: PostDetail;
  onSubmit: (formData: FormData) => Promise<void>;
  submitButtonText?: string;
}

/**
 * 게시글 작성&수정 폼
 *
 * 주요 기능
 * 1. 게시글 제목 입력
 * 2. 취미 태그 선택
 * 3. 이미지 업로드
 * 4. 게시글 내용 입력
 * 5. 게시글 작성 버튼 클릭
 */

export default function PostForm({
  initialData,
  onSubmit,
  submitButtonText = '게시하기',
}: PostFormProps) {
  const { selectedHobbyTags, setSelectedHobbyTags } = useHobbyStore();

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [images, setImages] = useState<ImageFile[]>(
    initialData?.postImageUrls.map((url) => ({
      file: null,
      preview: url,
    })) || [],
  );
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

  /**
   * 게시글 수정 시 기존 취미 태그 데이터 처리를 위한 useEffect
   * - 초기 데이터(initialData)의 취미 태그를 컴포넌트의 상태로 변환
   * - 서버 데이터 형식을 클라이언트 상태 형식으로 변환
   *
   * 데이터 변환 예시
   * - 서버에서 ['축구', '농구', '야구'] 형식으로 취미 태그를 받아오면
   * - 클라이언트에서는 [{ mainCategory: '스포츠', subCategory: '축구' }, { mainCategory: '스포츠', subCategory: '농구' }, { mainCategory: '스포츠', subCategory: '야구' }] 형식으로 변환
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
           * 예시 HOBBY_SUB_CATEGORIES 구조:
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
           * 예시 HOBBY_MAIN_CATEGORIES 구조:
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

  /**
   * 이미지 업로드 핸들러
   */
  const handleImageUpload = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  /**
   * 이미지 삭제 핸들러
   *
   * 1. 이미지 삭제
   */
  const handleImageRemove = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]; // 기존 이미지 배열 복사
      const removedImage = newImages[index]; // 삭제할 이미지 추출

      // 기존 이미지 URL이 있다면 삭제 목록에 추가
      if (!removedImage.file && removedImage.preview) {
        setDeletedImageUrls((prev) => [...prev, removedImage.preview]);
      }

      // 삭제된 이미지 URL이 있다면 브라우저 캐시에서 제거
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  /**
   * 게시글 데이터 유효성 검사
   *
   * 1. 제목 유효성 검사
   * 2. 내용 유효성 검사
   * 3. 취미 태그 유효성 검사
   */
  const validatePostData = () => {
    if (!title.trim()) throw new Error('제목을 입력해주세요.');
    if (!content.trim()) throw new Error('내용을 입력해주세요.');
    if (content.trim().length < 10)
      throw new Error('내용은 최소 10자 이상 입력해주세요.');
    if (selectedHobbyTags.length === 0) throw new Error('태그를 선택해주세요.');
  };

  /**
   * 게시글 데이터 생성
   *
   * 1. 게시글 데이터 생성
   * 2. 삭제된 이미지 URL 목록 추가
   */
  const createFormData = () => {
    const formData = new FormData();

    const postData = {
      title,
      content,
      hobbyTagNames: selectedHobbyTags.map((tag) => tag.subCategory),
      deletedImageUrls, // 삭제된 이미지 URL 목록 추가
    };

    const requestBlob = new Blob([JSON.stringify(postData)], {
      type: 'application/json',
    });
    formData.append('request', requestBlob);

    images.forEach((image) => {
      if (image.file) {
        formData.append('imageFiles', image.file);
      }
    });

    return formData;
  };

  /**
   * 게시글 제출 핸들러
   *
   * 1. 게시글 데이터 유효성 검사
   * 2. 게시글 데이터 생성
   * 3. 게시글 제출
   */
  const handleSubmit = async () => {
    try {
      validatePostData();
      const formData = createFormData();
      await onSubmit(formData);
    } catch (error) {
      console.error('게시글 처리 실패:', error);
      alert(
        error instanceof Error ? error.message : '게시글 처리에 실패했습니다.',
      );
    }
  };

  // 애니메이션 variants 정의
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      className="w-[960px] mx-auto my-12 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. 제목 입력 */}
      <motion.div
        className="shadow-md rounded-lg bg-grayscale-0"
        variants={itemVariants}
      >
        <Input
          placeholder="제목을 입력하세요. *최대 30자 이하"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={30}
          className="placeholder:text-lg placeholder:text-grayscale-60 placeholder:font-medium"
        />
      </motion.div>

      {/* 2. 태그 설정 */}
      <div className="space-y-2 shadow-md rounded-lg p-5 bg-grayscale-0">
        <div className="mb-6">
          <label className="text-grayscale-100 text-lg font-medium">
            태그 설정
          </label>
          <span className="text-xs text-grayscale-50 ml-2">
            *관심 취미 대그룹 추가해 보세요. 최대 5개
          </span>
        </div>

        <HobbySelector maxCount={5} />
      </div>

      {/* 3. 이미지 업로드 */}
      <motion.div variants={itemVariants}>
        <PostImageUploader
          images={images}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
        />
      </motion.div>

      {/* 4. 게시글 내용 입력*/}
      <motion.div
        className="space-y-2 shadow-md rounded-lg p-5 bg-grayscale-0"
        variants={itemVariants}
      >
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="게시글을 작성해주세요. *최소 10자~최대 2,000자 이하"
          minLength={10}
          maxLength={2000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </motion.div>

      {/* 5. 게시글 작성 버튼 */}
      <motion.div className="flex justify-end" variants={itemVariants}>
        <div className="w-1/3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              fullWidth
              className="px-6 py-2"
              onClick={handleSubmit}
              disabled={!title || !content || !selectedHobbyTags.length}
            >
              {submitButtonText}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
