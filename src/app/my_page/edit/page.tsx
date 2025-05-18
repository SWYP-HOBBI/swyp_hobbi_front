'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import HobbySelector from '@/components/common/hobby_selector';
import MyProfile from '@/components/common/my_profile';
import EditNickname from '@/components/my_page/edit_nickname';
import EditPassword from '@/components/my_page/edit_password';
import { userService } from '@/services/api'; // API 서비스 호출
import { useHobbyStore } from '@/store/hobby';
import { MyPageModify, UpdateUserInfo } from '@/types/my_page';
import {
  HOBBY_MAIN_CATEGORIES,
  HOBBY_SUB_CATEGORIES,
  HobbyTag,
} from '@/types/hobby';
import Input from '@/components/common/input';
import {
  getPasswordConfirmError,
  getPasswordError,
} from '@/utils/password_validation';

export default function EditMyPage() {
  const router = useRouter();
  const { selectedHobbyTags, setSelectedHobbyTags } = useHobbyStore(); // 선택된 취미 태그 상태

  // 상태 변수 설정
  const [userInfo, setUserInfo] = useState<MyPageModify | null>(null);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [mbti, setMbti] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 닉네임 수정 폼 상태
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [currentNickname, setCurrentNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 비밀번호 수정 창 ref
  const passwordEditRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  // 비밀번호 수정 폼 상태
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  const handlePasswordSave = async () => {
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

      setShowPasswordEdit(false);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    } catch (err) {
      setError('비밀번호 변경 실패');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await userService.getMyModifyPage();
        setUserInfo(data);
        setUsername(data.username);
        setCurrentNickname(data.nickname);
        setGender(data.gender);
        setBirthYear(data.birthYear.toString());
        setBirthMonth(String(data.birthMonth).padStart(2, '0'));
        setBirthDay(String(data.birthDay).padStart(2, '0'));
        setMbti(data.mbti);

        // 서버에서 받은 취미 태그를 상태로 설정
        const convertedTags = data.hobbyTags
          .map((subCategory) => {
            const mainCategoryEntry = Object.entries(HOBBY_SUB_CATEGORIES).find(
              ([, subCategories]) => subCategories.includes(subCategory),
            );

            if (!mainCategoryEntry) return null;

            const [mainCategoryKey] = mainCategoryEntry;
            const mainCategory =
              HOBBY_MAIN_CATEGORIES[
                mainCategoryKey as keyof typeof HOBBY_MAIN_CATEGORIES
              ];

            return { mainCategory, subCategory } as HobbyTag;
          })
          .filter((tag): tag is HobbyTag => tag !== null);

        // 선택된 취미 태그를 상태로 설정
        setSelectedHobbyTags(convertedTags);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [setSelectedHobbyTags]);

  // 정보 수정 요청
  const handleSave = async () => {
    const updatedUserInfo: UpdateUserInfo = {
      username,
      gender,
      birthYear: parseInt(birthYear),
      birthMonth: parseInt(birthMonth),
      birthDay: parseInt(birthDay),
      mbti,
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    };

    setIsLoading(true);
    try {
      await userService.updateUserInfo(updatedUserInfo);
      alert('정보가 성공적으로 수정되었습니다!');
      router.push('/my_page');
    } catch (error) {
      console.error('Error saving user info:', error);
      alert('정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이면 저장 버튼 비활성화
  if (!userInfo) return <div>로딩 중</div>;

  return (
    <main className="w-full min-h-screen bg-gray-100 flex justify-center">
      <div>
        <div className="w-[960px] bg-white rounded-[24px] mt-[48px] flex flex-col items-center px-[20px] pb-[48px]">
          <div className="text-[32px] font-bold pt-[48px] pb-[48px]">
            개인정보 수정
          </div>

          <MyProfile imageUrl={userInfo.userImageUrl} editable={true} />
          <div className="text-[20px] font-semibold">{userInfo.nickname}</div>
          <div className="text-[16px] text-[var(--grayscale-60)] pt-[12px] pb-[48px]">
            {userInfo.email}
          </div>

          <div className="flex flex-col gap-[48px] w-full">
            <div className="border-b border-[#D9D9D9] pb-[4px]">
              <span className="text-[20px] font-semibold block mb-4">이름</span>
              <input
                type="text"
                className="w-[300px]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex gap-[21px]">
              <EditNickname
                currentNickname={currentNickname}
                onNicknameChange={setCurrentNickname}
                setShowNicknameEdit={setShowNicknameEdit}
              />
              <EditPassword
                showPasswordEdit={showPasswordEdit}
                setShowPasswordEdit={setShowPasswordEdit}
              />
            </div>
            {/* 비밀번호 수정 창 */}
            {showPasswordEdit && (
              <div
                ref={passwordEditRef}
                className="w-[920px] h-[172px] relative bg-[#F9F9F9] border border-[#D9D9D9] rounded-[12px] flex items-center justify-between px-[10px]"
              >
                {/* 새 비밀번호 입력 */}
                <div className="flex flex-col">
                  <label
                    htmlFor="new-password"
                    className="text-[14px] font-medium mb-1"
                  >
                    새 비밀번호
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    className="!w-[350px] !h-[60px] border border-[var(--grayscale-80)] rounded-[8px] px-3 text-[14px]"
                    placeholder="새 비밀번호를 입력하세요."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    showPasswordToggle={true}
                    showClearButton={true}
                  />
                  {/* 새 비밀번호 오류 메시지 */}
                  {getPasswordError(newPassword) && (
                    <div className="text-red-500 text-[14px] mt-2">
                      {getPasswordError(newPassword)}
                    </div>
                  )}
                </div>

                {/* 비밀번호 확인 입력 */}
                <div className="flex flex-col">
                  <label
                    htmlFor="confirm-password"
                    className="text-[14px] font-medium mb-1"
                  >
                    새 비밀번호 확인
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="!w-[350px] !h-[60px] border border-[var(--grayscale-80)] rounded-[8px] px-3 text-[14px]"
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
                <div className="flex h-[60px] mt-[25px] gap-3">
                  <button
                    type="button"
                    className="w-[180px] h-[60px] text-[14px] px-4 py-2 rounded-[8px] bg-[var(--primary)]"
                    onClick={handlePasswordSave}
                    disabled={isLoading}
                  >
                    {isLoading ? '비밀번호 변경 중..' : '비밀번호 변경'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex w-full gap-[20px]">
              {/* 생년월일 */}
              <div className="flex flex-col gap-2 w-1/2">
                <span className="text-[20px] font-semibold pb-[8px]">
                  생년월일
                </span>
                <div className="flex gap-2">
                  <select
                    className="w-[184px] h-[60px] border border-[#D9D9D9] rounded-[8px] px-2"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                  >
                    <option value="">년</option>
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    className="w-[122px] h-[60px] border border-[#D9D9D9] rounded-[8px] px-2"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                  >
                    <option value="">월</option>
                    {[...Array(12)].map((_, i) => (
                      <option
                        key={i + 1}
                        value={String(i + 1).padStart(2, '0')}
                      >
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-[122px] h-[60px] border border-[#D9D9D9] rounded-[8px] px-2"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                  >
                    <option value="">일</option>
                    {[...Array(31)].map((_, i) => (
                      <option
                        key={i + 1}
                        value={String(i + 1).padStart(2, '0')}
                      >
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MBTI */}
              <div className="flex flex-col gap-2 w-1/2">
                <span className="text-[20px] font-semibold pb-[8px]">MBTI</span>
                <select
                  className="w-[448px] h-[60px] border border-[#D9D9D9] rounded-[8px] px-2"
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value)}
                >
                  <option value="">선택</option>
                  {[
                    'ENFP',
                    'INFP',
                    'INTJ',
                    'ENTJ',
                    'ESFP',
                    'ISFP',
                    'ISTJ',
                    'ESTJ',
                    'ENTP',
                    'INTP',
                    'ISFJ',
                    'ESFJ',
                    'ENFJ',
                    'INFJ',
                    'ESTP',
                    'ISTP',
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full pb-[48px]">
              <div className="flex items-center mb-[24px]">
                <span className="text-[24px] font-semibold">내 취미</span>
                <span className="text-sm ml-2 text-[var(--grayscale-60)]">
                  *최대 15개까지 선택 가능합니다.
                </span>
              </div>
              <HobbySelector maxCount={15} />
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end gap-[11px] pt-[12px]">
          <button
            className="w-[234px] h-[60px] rounded-[12px] bg-white border border-[var(--primary-b60)] text-[14px] text-[var(--primary-b60)]"
            onClick={() => router.push('/my_page')}
          >
            수정취소
          </button>
          <button
            className="w-[234px] h-[60px] rounded-[12px] bg-[var(--primary)] text-[14px] text-[var(--grayscale-50)]"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>

        <div
          className="cursor-pointer text-[#00000080] flex justify-end my-4 w-full"
          onClick={() => router.push('/my_page/delete_account')}
        >
          회원탈퇴 &gt;
        </div>
      </div>
    </main>
  );
}
