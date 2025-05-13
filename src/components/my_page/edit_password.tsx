import { useEffect, useRef, useState } from 'react';
import {
  getPasswordError,
  getPasswordConfirmError,
} from '@/utils/password_validation';
import { userService } from '@/services/api';
import Input from '../common/input';

export default function EditPassword() {
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);

  // 비밀번호 수정 창 ref
  const passwordEditRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 수정 창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        passwordEditRef.current &&
        !passwordEditRef.current.contains(event.target as Node)
      ) {
        setShowPasswordEdit(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 현재 비밀번호 확인
  const handleCheckCurrentPassword = async () => {
    try {
      setIsLoading(true);

      const response = await userService.checkCurrentPassword(currentPassword);
      if (response.success) {
        setShowPasswordEdit(true);
        setCurrentPasswordError(null);
      } else {
        setCurrentPasswordError('현재 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setCurrentPasswordError(
        '현재 비밀번호 확인에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (newPassword === '' || confirmPassword === '') {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 체크
    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // 비밀번호 확인 일치 여부 체크
    const confirmPasswordError = getPasswordConfirmError(
      newPassword,
      confirmPassword,
    );
    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }

    // 로딩 상태 설정
    setIsLoading(true);

    try {
      await userService.updatePassword({
        newPassword,
        confirmPassword,
      });

      setShowPasswordEdit(false); // 수정 창 닫기
      setNewPassword(''); // 입력 필드 초기화
      setConfirmPassword(''); // 입력 필드 초기화
      setError(null); // 오류 메시지 초기화
    } catch (err) {
      setError('비밀번호 변경 실패');
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
    <div className="w-[452px] flex flex-col">
      <span className="text-[20px] font-semibold">비밀번호</span>
      {/* 현재 비밀번호 입력 */}
      <div className="w-[452px] flex justify-between border-b border-[#D9D9D9] mt-[24px]">
        <input
          id="current-password"
          type="password"
          className="w-[250px] h-[27px] px-3 text-[18px]"
          placeholder="현재 비밀번호를 입력해주세요."
          value={currentPassword}
          onChange={handleCurrentPasswordChange}
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

      {/* 비밀번호 수정 창 */}
      {showPasswordEdit && (
        <div
          ref={passwordEditRef}
          className="w-[920px] h-[172px] bg-[#F9F9F9] border border-[#D9D9D9] rounded-[12px] flex px-[24px] mt-[12px] gap-3"
        >
          {/* 새 비밀번호 입력 */}
          <div className="flex flex-col p-[10px]">
            <label
              htmlFor="new-password"
              className="text-[14px] font-medium mb-1"
            >
              새 비밀번호
            </label>
            <Input
              id="new-password"
              type="password"
              className="w-[350px] h-[60px] border border-[var(--grayscale-80)] rounded-[8px] px-3 text-[14px]"
              placeholder="새 비밀번호를 입력하세요."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showPasswordToggle={true} // 비밀번호 보이기/숨기기 토글 활성화
              showClearButton={true} // 클리어 버튼 활성화
            />
            {/* 새 비밀번호 오류 메시지 */}
            {getPasswordError(newPassword) && (
              <div className="text-red-500 text-[14px] mt-2">
                {getPasswordError(newPassword)}
              </div>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div className="flex flex-col p-[10px]">
            <label
              htmlFor="confirm-password"
              className="text-[14px] font-medium mb-1"
            >
              새 비밀번호 확인
            </label>
            <Input
              id="confirm-password"
              type="password"
              className="w-[350px] h-[60px] border border-[var(--grayscale-80)] rounded-[8px] px-3 text-[14px]"
              placeholder="새 비밀번호를 입력하세요."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPasswordToggle={true}
              showClearButton={true}
            />
            {/* 비밀번호 확인 오류 메시지 */}
            {getPasswordConfirmError(newPassword, confirmPassword) && (
              <div className="text-red-500 text-[14px] mt-2">
                {getPasswordConfirmError(newPassword, confirmPassword)}
              </div>
            )}
          </div>

          {/* 비밀번호 변경 버튼 */}
          <div className="flex h-[60px] mt-[12px] gap-3">
            <button
              type="submit"
              className="w-[180px] h-[60px] text-[14px] px-4 py-2 rounded-[8px] bg-[var(--primary)]"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '비밀번호 변경 중..' : '비밀번호 변경'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
