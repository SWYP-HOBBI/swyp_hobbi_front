import { Gender, MBTI_OPTIONS, UserInfoFormData } from '@/types/auth';
import { useSignupStore } from '@/store/signup';
import { useEffect, useMemo, useState } from 'react';
import HobbySelector, {
  CustomDropdownButton,
  CustomDropdownItem,
} from '@/components/common/hobby_selector';
import { useHobbyStore } from '@/store/hobby';
import Input from '@/components/common/input';
import Button from '@/components/common/button';

import { authService } from '@/services/api';
import SvgIcon from '../common/svg_icon';

interface UserInfoFormProps {
  onSubmit: (data: UserInfoFormData) => void;
  onPrevStep: () => void;
}

export default function UserInfoForm({
  onSubmit,
  onPrevStep,
}: UserInfoFormProps) {
  const {
    signupData,
    updateSignupData,
    isNicknameVerified,
    setIsNicknameVerified,
    isLoading,
    setIsLoading,
    isError,
    setIsError,
    errorMessage,
    setErrorMessage,
  } = useSignupStore();

  const { selectedHobbyTags, resetSelections } = useHobbyStore();
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [isMbtiOpen, setIsMbtiOpen] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 1900 + 1 },
      (_, i) => currentYear - i,
    );
  }, []);

  // 컴포넌트가 언마운트될 때 선택된 취미들을 초기화
  useEffect(() => {
    return () => {
      resetSelections();
    };
  }, [resetSelections]);

  // 선택된 취미 태그가 변경될 때마다 signupData 업데이트
  useEffect(() => {
    updateSignupData({
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    });
  }, [selectedHobbyTags, updateSignupData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'nickname') {
      setIsNicknameVerified(false);
    }
    updateSignupData({ [name]: value });
  };

  // 닉네임 중복 확인
  const handleNicknameCheck = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      const response = await authService.checkNicknameDuplicate(
        signupData.nickname,
      );

      // 서버 응답이 중복 여부를 포함하는 경우 처리
      if (
        response &&
        typeof response === 'object' &&
        'duplicate' in response &&
        response.duplicate
      ) {
        setIsError(true);
        setErrorMessage('이미 사용 중인 닉네임입니다.');
        setIsNicknameVerified(false);
        return;
      }

      setIsNicknameVerified(true);
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '닉네임 중복 확인 중 오류가 발생했습니다.',
      );
      setIsNicknameVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 성별 선택
  const handleGenderSelect = (gender: Gender) => {
    updateSignupData({ gender });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNicknameVerified) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    onSubmit({
      birthYear: signupData.birthYear,
      birthMonth: signupData.birthMonth,
      birthDay: signupData.birthDay,
      gender: signupData.gender,
      nickname: signupData.nickname,
      mbti: signupData.mbti,
      hobbyTags: signupData.hobbyTags,
    });
  };

  // 폼 유효성 검사 함수 추가
  const isFormValid = () => {
    // 닉네임 검증 (닉네임 입력 및 중복확인 완료)
    const isNicknameValid =
      signupData.nickname.trim() !== '' && isNicknameVerified;

    // 생년월일 검증
    const isBirthValid =
      signupData.birthYear > 1900 &&
      signupData.birthYear <= new Date().getFullYear() &&
      signupData.birthMonth >= 1 &&
      signupData.birthMonth <= 12 &&
      signupData.birthDay >= 1 &&
      signupData.birthDay <= 31;

    // 성별 검증
    const isGenderValid =
      signupData.gender === '남성' || signupData.gender === '여성';

    return isNicknameValid && isBirthValid && isGenderValid;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0" onClick={onPrevStep}>
          <SvgIcon
            name="arrow_left"
            size={40}
            className="cursor-pointer"
            color="var(--grayscale-60)"
          />
        </div>
        <h1 className="text-[32px] font-bold">나의 정보</h1>
      </div>

      {/* 닉네임 입력 */}
      <div className="mt-6 mb-3">
        <label htmlFor="nickname" className="text-grayscale-100 font-semibold">
          닉네임
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Input
          id="nickname"
          name="nickname"
          type="text"
          value={signupData.nickname}
          onChange={handleChange}
          disabled={isLoading || isNicknameVerified}
          containerClassName="w-[60%]"
          placeholder={
            isNicknameVerified
              ? '인증이 완료되었습니다.'
              : '닉네임을 입력해주세요.'
          }
          showClearButton
          required
        />
        <Button
          type="button"
          onClick={handleNicknameCheck}
          disabled={!signupData.nickname || isNicknameVerified || isLoading}
          variant={isNicknameVerified ? 'secondary' : 'primary'}
          size="md"
          className="w-[40%]"
        >
          {isLoading
            ? '처리 중...'
            : isNicknameVerified
              ? '인증완료'
              : '중복확인'}
        </Button>
      </div>

      {isError && errorMessage && (
        <p className="text-xs text-like mt-2">*{errorMessage}</p>
      )}

      {isNicknameVerified && (
        <p className="text-xs text-primary mt-2">*인증이 완료되었습니다.</p>
      )}

      {/* 생년월일 입력 */}
      <div className="mt-6 mb-3">
        <label className="text-grayscale-100 font-semibold">
          생년월일
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <CustomDropdownButton
            value={signupData.birthYear ? String(signupData.birthYear) : ''}
            placeholder="년"
            isOpen={isYearOpen}
            onToggle={() => setIsYearOpen(!isYearOpen)}
          >
            {years.map((year) => (
              <CustomDropdownItem
                key={year}
                value={String(year)}
                label={`${year}년`}
                isSelected={signupData.birthYear === year}
                onClick={() => {
                  updateSignupData({ birthYear: year });
                  setIsYearOpen(false);
                }}
              />
            ))}
          </CustomDropdownButton>
        </div>

        <div className="flex-1">
          <CustomDropdownButton
            value={signupData.birthMonth ? String(signupData.birthMonth) : ''}
            placeholder="월"
            isOpen={isMonthOpen}
            onToggle={() => setIsMonthOpen(!isMonthOpen)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <CustomDropdownItem
                key={month}
                value={String(month)}
                label={`${month}월`}
                isSelected={signupData.birthMonth === month}
                onClick={() => {
                  updateSignupData({ birthMonth: month });
                  setIsMonthOpen(false);
                }}
              />
            ))}
          </CustomDropdownButton>
        </div>

        <div className="flex-1">
          <CustomDropdownButton
            value={signupData.birthDay ? String(signupData.birthDay) : ''}
            placeholder="일"
            isOpen={isDayOpen}
            onToggle={() => setIsDayOpen(!isDayOpen)}
          >
            {Array.from(
              {
                length: getDaysInMonth(
                  signupData.birthYear,
                  signupData.birthMonth,
                ),
              },
              (_, i) => i + 1,
            ).map((day) => (
              <CustomDropdownItem
                key={day}
                value={String(day)}
                label={`${day}일`}
                isSelected={signupData.birthDay === day}
                onClick={() => {
                  updateSignupData({ birthDay: day });
                  setIsDayOpen(false);
                }}
              />
            ))}
          </CustomDropdownButton>
        </div>
      </div>

      {/* 성별 선택 */}
      <div className="mt-6 mb-3">
        <label className="text-grayscale-100 font-semibold">
          성별
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => handleGenderSelect('남성')}
          variant={signupData.gender === '남성' ? 'primary' : 'outline'}
          size="sm"
          fullWidth
        >
          남자
        </Button>
        <Button
          type="button"
          onClick={() => handleGenderSelect('여성')}
          variant={signupData.gender === '여성' ? 'primary' : 'outline'}
          size="sm"
          fullWidth
        >
          여자
        </Button>
      </div>

      {/* MBTI 선택 */}
      <div className="mt-6 mb-3">
        <label className="text-grayscale-100 font-semibold">MBTI</label>
      </div>

      <div className="w-full">
        <CustomDropdownButton
          value={signupData.mbti}
          placeholder="선택해주세요"
          isOpen={isMbtiOpen}
          onToggle={() => setIsMbtiOpen(!isMbtiOpen)}
        >
          {MBTI_OPTIONS.map((mbti) => (
            <CustomDropdownItem
              key={mbti}
              value={mbti}
              label={mbti}
              isSelected={signupData.mbti === mbti}
              onClick={() => {
                updateSignupData({ mbti });
                setIsMbtiOpen(false);
              }}
            />
          ))}
        </CustomDropdownButton>
      </div>

      {/* 취미 선택 */}
      <div className="mt-6 mb-3">
        <label className="text-grayscale-100 font-semibold">
          취미선택
          <span className="text-grayscale-60 text-sm ml-2">
            *최대 15개까지 선택 가능합니다.
          </span>
        </label>
      </div>
      <HobbySelector maxCount={15} />

      <Button
        type="submit"
        disabled={!isFormValid() || isLoading}
        variant="primary"
        size="lg"
        fullWidth
        className="mt-12"
      >
        {isLoading ? '처리 중...' : '회원가입 완료'}
      </Button>
    </form>
  );
}
