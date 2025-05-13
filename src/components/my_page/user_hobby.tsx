import Tag from '../common/tag';

interface UserHobbyProps {
  hobbyTags: string[];
}

export default function UserHobby({ hobbyTags }: UserHobbyProps) {
  return (
    <div>
      <div className="text-[20px] font-semibold leading-[100%] mb-[23px]">
        나의 취미
      </div>

      <div className="flex flex-wrap gap-2">
        {hobbyTags && hobbyTags.length > 0 ? (
          hobbyTags.map((tag, index) => (
            <Tag key={index} label={tag} variant="white" />
          ))
        ) : (
          <div className="text-sm text-gray-400">취미 태그가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
