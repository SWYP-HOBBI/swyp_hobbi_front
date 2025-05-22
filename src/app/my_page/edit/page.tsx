'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import HobbySelector, {
  CustomDropdownButton,
  CustomDropdownItem,
} from '@/components/common/hobby_selector';
import MyProfile from '@/components/common/my_profile';
import EditNickname from '@/components/my_page/edit_nickname';
import EditPassword from '@/components/my_page/edit_password';
import { userService } from '@/services/api';
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
import Loader from '@/components/common/loader';
import { MBTI_OPTIONS } from '@/types/auth';
import { useModalStore } from '@/store/modal';

export default function EditMyPage() {
  const router = useRouter();
  const { openModal } = useModalStore();
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
  const [isMbtiOpen, setIsMbtiOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
      openModal({
        title: '개인정보가 수정되었습니다.',
        message: '마이페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          router.push('/my_page');
        },
      });
    } catch (error) {
      alert('개인정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (
      username !== userInfo?.username ||
      birthYear !== userInfo?.birthYear.toString() ||
      birthMonth !== String(userInfo?.birthMonth).padStart(2, '0') ||
      birthDay !== String(userInfo?.birthDay).padStart(2, '0') ||
      mbti !== userInfo?.mbti ||
      selectedHobbyTags.some(
        (tag) => !userInfo?.hobbyTags.includes(tag.subCategory),
      )
    ) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [
    username,
    birthYear,
    birthMonth,
    birthDay,
    mbti,
    selectedHobbyTags,
    userInfo,
  ]);

  if (!userInfo) return <Loader />;

  return (
    <main className="w-full pb-[100px] max-md:pt-6 min-h-screen bg-grayscale-1 flex justify-center">
      <div>
        <div className="w-[960px] max-md:w-[390px] max-md:mb-3 bg-grayscale-0 rounded-[24px] mt-12 flex flex-col items-center px-5 pb-12">
          <div className="text-[32px] max-md:hidden font-bold pt-12 pb-12">
            개인정보 수정
          </div>
          <div className="max-md:mt-5">
            <MyProfile imageUrl={userInfo.userImageUrl} editable={true} />
          </div>
          <div className="text-[20px] font-semibold">{userInfo.nickname}</div>
          <div className="text-[16px] text-grayscale-60 pt-3 pb-12">
            {userInfo.email}
          </div>

          <div className="flex flex-col gap-12 w-full">
            <div className="border-b border-grayscale-40 pb-1">
              <span className="text-[20px] font-semibold block mb-4">이름</span>
              <input
                type="text"
                className="w-[300px]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex max-md:flex-col gap-[21px]">
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
                className="w-[920px] max-md:w-full max-md:flex-col h-[172px] max-md:h-full relative bg-[#F9F9F9] rounded-[24px] flex items-center justify-between px-[10px]"
              >
                {/* 새 비밀번호 입력 */}
                <div className="flex flex-col max-md:w-[330px] max-md:mt-2">
                  <label
                    htmlFor="new-password"
                    className="text-[14px] font-medium mb-1"
                  >
                    새 비밀번호
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    className="!w-[350px] !h-[60px] border border-grayscale-80 rounded-[8px] px-3 text-[14px]"
                    placeholder="새 비밀번호를 입력하세요."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    showPasswordToggle={true}
                    showClearButton={true}
                  />
                  {/* 새 비밀번호 오류 메시지 */}
                  {getPasswordError(newPassword) && (
                    <div className="text-like text-[14px] mt-2">
                      {getPasswordError(newPassword)}
                    </div>
                  )}
                </div>

                {/* 비밀번호 확인 입력 */}
                <div className="flex flex-col max-md:w-[330px] max-md:mt-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-[14px] font-medium mb-1"
                  >
                    새 비밀번호 확인
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="!w-[350px] !h-[60px] border border-grayscale-80 rounded-[8px] px-3 text-[14px]"
                    placeholder="새 비밀번호를 입력하세요."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    showPasswordToggle={true}
                    showClearButton={true}
                  />
                  {/* 비밀번호 확인 오류 메시지 */}
                  {getPasswordConfirmError(newPassword, confirmPassword) && (
                    <div className="text-like text-[14px] mt-2">
                      {getPasswordConfirmError(newPassword, confirmPassword)}
                    </div>
                  )}
                </div>

                {/* 비밀번호 변경 버튼 */}
                <div className="flex max-md:w-full h-[60px] mt-[25px] gap-3  max-md:mb-2">
                  <button
                    type="button"
                    className="w-[180px] max-md:w-full h-[60px] text-[14px] px-4 py-2 rounded-[8px] bg-primary"
                    onClick={handlePasswordSave}
                    disabled={isLoading}
                  >
                    {isLoading ? '비밀번호 변경 중..' : '비밀번호 변경'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex max-md:flex-col w-full gap-5">
              {/* 생년월일 */}
              <div className="flex max-md:w-full flex-col gap-2 w-full">
                <span className="text-[20px] font-semibold pb-2">생년월일</span>
                <div className="flex gap-2">
                  {/* 년 */}
                  <div className="w-[184px]">
                    <CustomDropdownButton
                      value={birthYear}
                      placeholder="년"
                      isOpen={isYearOpen}
                      onToggle={() => setIsYearOpen(!isYearOpen)}
                    >
                      {years.map((year) => (
                        <CustomDropdownItem
                          key={year}
                          value={year.toString()}
                          label={year.toString()}
                          isSelected={birthYear === year.toString()}
                          onClick={() => {
                            setBirthYear(year.toString());
                            setIsYearOpen(false);
                          }}
                        />
                      ))}
                    </CustomDropdownButton>
                  </div>

                  {/* 월 */}
                  <div className="w-[122px]">
                    <CustomDropdownButton
                      value={birthMonth}
                      placeholder="월"
                      isOpen={isMonthOpen}
                      onToggle={() => setIsMonthOpen(!isMonthOpen)}
                    >
                      {months.map((month) => (
                        <CustomDropdownItem
                          key={month}
                          value={String(month).padStart(2, '0')}
                          label={month.toString()}
                          isSelected={
                            birthMonth === String(month).padStart(2, '0')
                          }
                          onClick={() => {
                            setBirthMonth(String(month).padStart(2, '0'));
                            setIsMonthOpen(false);
                          }}
                        />
                      ))}
                    </CustomDropdownButton>
                  </div>

                  {/* 일 */}
                  <div className="w-[122px]">
                    <CustomDropdownButton
                      value={birthDay}
                      placeholder="일"
                      isOpen={isDayOpen}
                      onToggle={() => setIsDayOpen(!isDayOpen)}
                    >
                      {days.map((day) => (
                        <CustomDropdownItem
                          key={day}
                          value={String(day).padStart(2, '0')}
                          label={day.toString()}
                          isSelected={birthDay === String(day).padStart(2, '0')}
                          onClick={() => {
                            setBirthDay(String(day).padStart(2, '0'));
                            setIsDayOpen(false);
                          }}
                        />
                      ))}
                    </CustomDropdownButton>
                  </div>
                </div>
              </div>

              {/* MBTI */}
              <div className="flex flex-col gap-2 w-full">
                <span className="text-[20px] font-semibold pb-2">MBTI</span>
                <div className="w-full">
                  <CustomDropdownButton
                    value={mbti}
                    placeholder="선택해주세요"
                    isOpen={isMbtiOpen}
                    onToggle={() => setIsMbtiOpen(!isMbtiOpen)}
                  >
                    {MBTI_OPTIONS.map((mbtiOption) => (
                      <CustomDropdownItem
                        key={mbtiOption}
                        value={mbtiOption}
                        label={mbtiOption}
                        isSelected={mbti === mbtiOption}
                        showCheckbox
                        onClick={() => {
                          setMbti(mbtiOption);
                          setIsMbtiOpen(false);
                        }}
                      />
                    ))}
                  </CustomDropdownButton>
                </div>
              </div>
            </div>

            <div className="w-full pb-12">
              <div className="flex items-center mb-6">
                <span className="text-[24px] font-semibold">내 취미</span>
                <span className="text-sm ml-2 text-grayscale-60">
                  *최대 15개까지 선택 가능합니다.
                </span>
              </div>
              <HobbySelector maxCount={15} />
            </div>
          </div>
        </div>
        <div className="w-full max-md:w-[390px] flex justify-end gap-[11px] pt-3">
          <button
            className="w-[234px] h-[60px] max-md:hidden rounded-[12px] bg-grayscale-0 border border-primary-b60 text-[14px] text-primary-b60"
            onClick={() => router.push('/my_page')}
          >
            수정취소
          </button>
          <button
            className={`w-[234px] h-[60px] max-md:w-full rounded-[12px] ${
              isModified
                ? 'bg-primary text-primary-b80'
                : 'bg-grayscale-10 text-grayscale-50'
            }`}
            onClick={handleSave}
            disabled={!isModified || isLoading}
          >
            {isLoading ? '저장 중' : '저장하기'}
          </button>
        </div>

        <div
          className="cursor-pointer text-grayscale-60 flex justify-end my-4 w-full"
          onClick={() => router.push('/my_page/delete_account')}
        >
          회원탈퇴 &gt;
        </div>
      </div>
    </main>
  );
}
