import { useEffect, useRef, useState } from 'react';
import { userService } from '@/services/api';

interface EditNicknameProps {
  currentNickname: string;
  onNicknameChange: (newNickname: string) => void;
  setShowNicknameEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditNickname = ({
  currentNickname,
  onNicknameChange,
}: EditNicknameProps) => {
  const [newNickname, setNewNickname] = useState('');
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);

  const editBoxRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 편집창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editBoxRef.current &&
        !editBoxRef.current.contains(event.target as Node)
      ) {
        setShowNicknameEdit(false);
        setIsError(false);
        setErrorMessage('');
        setIsNicknameVerified(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNicknameCheck = async () => {
    if (!newNickname) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await userService.validateNickname({
        nickname: newNickname,
      });

      if (response.exists) {
        setIsError(true);
        setErrorMessage(response.message);
      } else {
        setIsNicknameVerified(true);
        setErrorMessage('');
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 닉네임 변경 요청
  const handleSave = async () => {
    if (!isNicknameVerified) return;
    try {
      await userService.updateNickname({ nickname: newNickname });
      onNicknameChange(newNickname);
      setShowNicknameEdit(false);
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      setIsError(true);
      setErrorMessage('닉네임 변경에 실패했습니다.');
    }
  };

  return (
    <div className="w-[452px]">
      <span className="text-[20px] font-semibold">닉네임</span>
      <div className="flex justify-between items-center mt-[24px] border-b border-[var(--grayscale-40)]">
        <span className="text-[18px]">{currentNickname}</span>
        <button
          className="w-[59px] h-[24px] rounded-[24px] bg-[var(--primary-w80)] border border-[var(--primary-b20)] hover:bg-[var(--primary-w40)] text-[12px] mb-[9.5px]"
          onClick={() => setShowNicknameEdit(true)}
        >
          변경하기
        </button>
      </div>

      {showNicknameEdit && (
        <div
          ref={editBoxRef}
          className="w-[920px] h-[180px] bg-[#F9F9F9] border border-[#D9D9D9] rounded-[12px] flex flex-col justify-center px-[24px] mt-6"
        >
          <label
            className="text-[18px] font-semibold mb-[12px]"
            htmlFor="new-nickname"
          >
            새로운 닉네임
          </label>

          <div className="flex gap-2 items-center">
            <input
              id="new-nickname"
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-[480px] h-[60px] bg-white text-[14px] p-2 border border-[#D9D9D9] rounded-[8px]"
              placeholder="새로운 닉네임을 입력하세요.."
              disabled={isLoading || isNicknameVerified}
            />
            <button
              className="w-[180px] h-[60px] bg-white border border-[var(--primary-b60)] text-[var(--primary-b60)] text-[14px] font-semibold rounded-[12px]"
              onClick={handleNicknameCheck}
              disabled={!newNickname || isNicknameVerified || isLoading}
            >
              {isLoading
                ? '처리 중...'
                : isNicknameVerified
                  ? '인증완료'
                  : '중복확인'}
            </button>

            <button
              className={`w-[180px] h-[60px] text-[14px] px-4 py-2 rounded-[12px] bg-[var(--primary)] font-semibold cursor-pointer ${
                !isNicknameVerified ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSave}
              disabled={!isNicknameVerified}
            >
              닉네임 변경
            </button>
          </div>

          {isError && errorMessage && (
            <p className="text-[12px] text-[#eb165d] mt-2">{errorMessage}</p>
          )}

          {isNicknameVerified && (
            <p className="text-[12px] mt-2 text-green-600">
              *인증이 완료되었습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EditNickname;
