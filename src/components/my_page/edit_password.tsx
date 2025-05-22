import { useState } from 'react';
import { userService } from '@/services/api';
import Input from '../common/input';
interface EditPasswordProps {
  showPasswordEdit: boolean;
  setShowPasswordEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditPassword({
  showPasswordEdit,
  setShowPasswordEdit,
}: EditPasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);

  const handleCheckCurrentPassword = async () => {
    try {
      setIsLoading(true);

      const response = await userService.checkCurrentPassword(currentPassword);
      if (response.check) {
        setShowPasswordEdit(true);
        setCurrentPasswordError(null);
      } else {
        setCurrentPasswordError('비밀번호를 정확히 입력해주세요.');
      }
    } catch (err) {
      setCurrentPasswordError(
        '현재 비밀번호 확인에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setCurrentPassword(value);

    setIsCurrentPasswordValid(value.trim() !== '');
  };

  return (
    <div className="w-[452px] max-md:w-full h-[65px]">
      <span className="text-[20px] font-semibold">비밀번호</span>
      {/* 현재 비밀번호 입력 */}
      <div className="w-[452px] max-md:w-full h-[58px] flex justify-between items-center border-b border-[#D9D9D9]">
        <Input
          id="current-password"
          type="password"
          className="w-[250px] h-[27px] px-3 text-[18px]"
          containerClassName="border-none"
          placeholder="현재 비밀번호를 입력해주세요."
          value={currentPassword}
          onChange={handleCurrentPasswordChange}
          showPasswordToggle={true}
          showClearButton={true}
        />

        {/* 비밀번호 변경하기 버튼 활성화 */}
        <button
          className={`w-[59px] h-[24px] rounded-[24px] bg-[var(--primary-w80)] border border-[var(--primary-b20)] hover:bg-[var(--primary-w40)] text-[12px] mt-[10px] ${isCurrentPasswordValid ? '' : 'opacity-50 cursor-not-allowed'}`}
          onClick={handleCheckCurrentPassword}
          disabled={!isCurrentPasswordValid}
        >
          변경하기
        </button>
      </div>
      {currentPasswordError && (
        <p className="text-[var(--like)]">{currentPasswordError}</p>
      )}
    </div>
  );
}
