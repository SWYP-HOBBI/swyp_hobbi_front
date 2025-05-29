import { motion } from 'framer-motion';

export default function SearchCardSkeleton() {
  return (
    <>
      {/* 데스크탑 스켈레톤 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex gap-6 items-center w-full bg-grayscale-0 rounded-xl shadow-md p-5"
      >
        {/* 프로필 스켈레톤 */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-grayscale-10 animate-pulse" />
          <div className="w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
        </div>

        <div className="flex items-center flex-1">
          {/* 이미지 스켈레톤 */}
          <div className="w-[195px] h-[146px] flex-shrink-0 mr-6 bg-grayscale-10 rounded-lg animate-pulse" />

          <div className="flex-1 space-y-3">
            {/* 태그 스켈레톤 */}
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-16 h-6 bg-grayscale-10 rounded-full animate-pulse"
                />
              ))}
              <div className="ml-auto w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
            </div>

            {/* 제목 스켈레톤 */}
            <div className="w-3/4 h-8 bg-grayscale-10 rounded animate-pulse" />

            {/* 내용 스켈레톤 */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-grayscale-10 rounded animate-pulse" />
              <div className="w-2/3 h-4 bg-grayscale-10 rounded animate-pulse" />
            </div>

            {/* 좋아요/댓글 카운트 스켈레톤 */}
            <div className="flex justify-end gap-4">
              <div className="w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
              <div className="w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 모바일 스켈레톤 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:hidden w-full flex flex-col gap-3 bg-grayscale-0 rounded-xl shadow-md p-4"
      >
        {/* 프로필 및 날짜 스켈레톤 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-grayscale-10 animate-pulse" />
          <div className="w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
          <div className="ml-auto w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
        </div>

        {/* 이미지 스켈레톤 */}
        <div className="w-full h-[260px] bg-grayscale-10 rounded-lg animate-pulse" />

        {/* 태그 스켈레톤 */}
        <div className="flex gap-2 mt-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-16 h-6 bg-grayscale-10 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* 제목 스켈레톤 */}
        <div className="w-3/4 h-6 bg-grayscale-10 rounded animate-pulse mt-2" />

        {/* 내용 스켈레톤 */}
        <div className="space-y-2 mt-3">
          <div className="w-full h-4 bg-grayscale-10 rounded animate-pulse" />
          <div className="w-full h-4 bg-grayscale-10 rounded animate-pulse" />
          <div className="w-2/3 h-4 bg-grayscale-10 rounded animate-pulse" />
        </div>

        {/* 좋아요/댓글 카운트 스켈레톤 */}
        <div className="flex justify-end gap-4 mt-2">
          <div className="w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
          <div className="w-20 h-4 bg-grayscale-10 rounded animate-pulse" />
        </div>
      </motion.div>
    </>
  );
}
