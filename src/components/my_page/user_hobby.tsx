import { useEffect, useState } from 'react';
import Tag from '../common/tag';
import { userService } from '@/services/api';
import { MyPageInfo } from '@/types/my_page';

interface UserHobbyProps {
  hobbyTags: string[];
}

export default function UserHobby() {
  const [hobbyTags, setHobbyTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const data: MyPageInfo = await userService.getMyPageInfo();

        setHobbyTags(data.hobbyTags || []);
      } catch (err) {
        console.error('취미 태그 로딩 실패:', err);
      }
    };

    fetchHobbies();
  }, []);

  return (
    <div>
      <div className="text-[20px] font-semibold leading-[100%] mb-[23px]">
        나의 취미
      </div>

      <div className="flex flex-wrap gap-2">
        {hobbyTags.length > 0 ? (
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
