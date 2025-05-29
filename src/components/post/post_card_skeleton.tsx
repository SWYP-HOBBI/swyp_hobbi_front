import { motion } from 'framer-motion';

export default function PostCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-grayscale-0 rounded-xl shadow-md p-5 animate-pulse"
    >
      {/* 작성자 정보 */}
      <div className="flex items-center mb-6 max-md:px-0 max-md:mb-2">
        <div className="flex items-center">
          {/* 프로필 이미지 스켈레톤 */}
          <div className="w-12 h-12 bg-grayscale-10 rounded-full flex-shrink-0" />
          <div className="ml-3">
            {/* 닉네임 스켈레톤 */}
            <div className="h-5 bg-grayscale-10 rounded w-20" />
          </div>
        </div>
        {/* 날짜 스켈레톤 */}
        <div className="text-grayscale-60 text-xs ml-3">
          <div className="h-3 bg-grayscale-10 rounded w-16" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 max-md:gap-0">
        {/* 이미지 영역 스켈레톤 */}
        <div className="w-full md:w-[400px] h-[262.5px] md:h-[300px] flex-shrink-0 bg-grayscale-10 rounded-lg" />

        {/* 게시글 제목 및 내용 */}
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden mt-4 md:mt-0">
          <div className="flex-1">
            {/* 태그 영역 */}
            <div className="flex gap-2">
              <div className="h-7 bg-grayscale-10 rounded-full w-10" />
              <div className="h-7 bg-grayscale-10 rounded-full w-10" />
            </div>

            {/* 제목 스켈레톤 */}
            <div className="h-8 bg-grayscale-10 rounded w-3/4 mt-3 max-md:h-6 max-md:mt-2" />

            {/* 본문 스켈레톤 */}
            <div className="space-y-2 mt-3">
              <div className="h-4 bg-grayscale-10 rounded w-full" />
              <div className="h-4 bg-grayscale-10 rounded w-full" />
              <div className="h-4 bg-grayscale-10 rounded w-5/6" />
              <div className="h-4 bg-grayscale-10 rounded w-4/5" />
            </div>
          </div>

          {/* 좋아요, 댓글 카운트 */}
          <div className="flex items-center space-x-4 justify-end">
            {/* 좋아요 영역 */}
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-grayscale-10 rounded-full" />
              <div className="h-4 bg-grayscale-10 rounded w-4" />
            </div>
            {/* 댓글 영역 */}
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-grayscale-10 rounded-full" />
              <div className="h-4 bg-grayscale-10 rounded w-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
