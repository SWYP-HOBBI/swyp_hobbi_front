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

/**
 * 회원가입 상세 정보 입력 폼 Props 인터페이스
 * @param onSubmit - 회원가입 데이터 제출 핸들러
 * @param onPrevStep - 이전 단계로 이동 핸들러
 */
interface UserInfoFormProps {
  onSubmit: (data: UserInfoFormData) => void;
  onPrevStep: () => void;
}

/**
 * 회원가입 상세 정보 입력 폼 컴포넌트
 *
 * 주요 기능
 * 1. 닉네임 입력 및 중복 검사
 * 2. 생년월일 선택
 * 3. 성별 선택
 * 4. MBTI 선택
 * 5. 취미 선택 (최대 15개)
 * 6. 회원가입 완료 버튼
 */
export default function UserInfoForm({
  onSubmit,
  onPrevStep,
}: UserInfoFormProps) {
  const {
    signupData, // 회원가입 데이터
    updateSignupData, // 회원가입 데이터 업데이트
    isNicknameVerified, // 닉네임 인증 상태
    setIsNicknameVerified, // 닉네임 인증 상태 설정
    isLoading, // 로딩 상태
    setIsLoading, // 로딩 상태 설정
    isError, // 에러 상태
    setIsError, // 에러 상태 설정
    errorMessage, // 에러 메시지
    setErrorMessage, // 에러 메시지 설정
  } = useSignupStore();

  const { selectedHobbyTags } = useHobbyStore(); // 선택된 취미 태그 상태
  const [isYearOpen, setIsYearOpen] = useState(false); // 년도 선택 상태
  const [isMonthOpen, setIsMonthOpen] = useState(false); // 월 선택 상태
  const [isDayOpen, setIsDayOpen] = useState(false); // 일 선택 상태
  const [isMbtiOpen, setIsMbtiOpen] = useState(false); // MBTI 선택 상태

  /**
   * 년도 선택 옵션 생성 (1900년 ~ 현재년도)
   * useMemo를 사용하여 불필요한 재계산 방지
   */
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 1900 + 1 },
      (_, i) => currentYear - i,
    );
  }, []);

  // // 컴포넌트가 언마운트될 때 선택된 취미들을 초기화
  // useEffect(() => {
  //   return () => {
  //     resetSelections();
  //   };
  // }, [resetSelections]);

  /**
   * 선택된 취미 태그가 변경될 때마다 signupData 업데이트
   */
  useEffect(() => {
    updateSignupData({
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    });
  }, [selectedHobbyTags, updateSignupData]);

  /**
   * 입력 필드 변경 핸들러
   * 닉네임 입력 시 검증 상태 초기화
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'nickname') {
      setIsNicknameVerified(false);
    }
    updateSignupData({ [name]: value });
  };

  /**
   * 닉네임 중복 검사 핸들러
   * API 호출을 통해 닉네임 중복 여부 확인
   */
  const handleNicknameCheck = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      const response = await authService.checkNicknameDuplicate(
        signupData.nickname,
      );

      if (
        response &&
        typeof response === 'object' &&
        'isDuplicate' in response &&
        response.isDuplicate
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

  /**
   * 성별 선택 핸들러
   * 선택된 성별 업데이트
   */
  const handleGenderSelect = (gender: Gender) => {
    updateSignupData({ gender });
  };

  /**
   * 폼 제출 핸들러
   * 닉네임 검증 후 회원가입 데이터 제출
   */
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

  /**
   * 폼 유효성 검사
   * - 닉네임 검증
   * - 생년월일 검증
   * - 성별 선택 검증
   */
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

  /**
   * 월 날짜 검증
   * 주어진 년도와 월에 대한 월의 마지막 날짜 반환
   */
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* 헤더 */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0" onClick={onPrevStep}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer max-md:w-[20px] max-md:h-[20px] w-[40px] h-[40px]"
            color="var(--grayscale-60)"
          />
        </div>
        <h1 className="text-[32px] font-bold max-md:text-lg">나의 정보</h1>
      </div>

      {/* 닉네임 입력 */}
      <div className="mt-6 mb-3 max-md:mb-2">
        <label
          htmlFor="nickname"
          className="text-grayscale-100 font-semibold max-md:text-sm"
        >
          닉네임
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex gap-2 items-center">
        <Input
          id="nickname"
          name="nickname"
          type="text"
          value={signupData.nickname}
          onChange={handleChange}
          disabled={isLoading}
          containerClassName="w-[60%]"
          placeholder="닉네임을 입력해주세요."
          showClearButton
          required
        />
        <Button
          type="button"
          onClick={() => {
            if (isNicknameVerified) {
              // 인증 완료 상태에서는 수정 모드로 전환
              setIsNicknameVerified(false);
              setErrorMessage(null);
              setIsError(false);
            } else {
              // 미인증 상태에서는 중복 확인 실행
              handleNicknameCheck();
            }
          }}
          disabled={!signupData.nickname || isLoading}
          variant={isNicknameVerified ? 'secondary' : 'primary'}
          size="md"
          className="w-[40%]"
        >
          {isLoading
            ? '처리 중...'
            : isNicknameVerified
              ? '중복확인'
              : '중복확인'}
        </Button>
      </div>

      {isError && errorMessage && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{errorMessage}
        </p>
      )}

      {isNicknameVerified && (
        <p className="text-xs text-grayscale-80 mt-2 max-md:text-[8px]">
          *사용 가능한 닉네임입니다.
        </p>
      )}

      {/* 생년월일 입력 */}
      <div className="mt-6 mb-3 max-md:mb-2">
        <label
          className="text-grayscale-100 font-semibold max-md:text-sm"
          htmlFor="birthYear"
        >
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
                showCheckbox
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
                showCheckbox
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
                showCheckbox
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
      <div className="mt-6 mb-3 max-md:mb-2">
        <label
          className="text-grayscale-100 font-semibold max-md:text-sm"
          htmlFor="gender"
        >
          성별
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex gap-2 items-center">
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
      <div className="mt-6 mb-3 max-md:mb-2">
        <label
          className="text-grayscale-100 font-semibold max-md:text-sm"
          htmlFor="mbti"
        >
          MBTI
        </label>
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
              showCheckbox
              onClick={() => {
                updateSignupData({ mbti });
                setIsMbtiOpen(false);
              }}
            />
          ))}
        </CustomDropdownButton>
      </div>

      {/* 취미 선택 */}
      <div className="mt-6 mb-3 max-md:mb-2">
        <label
          className="text-grayscale-100 font-semibold max-md:text-sm"
          htmlFor="hobby"
        >
          취미선택
          <span className="text-grayscale-60 text-sm ml-2 max-md:text-[8px]">
            *관심 취미 태그를 추가해 보세요. (최대 15개)
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
        className="mt-12 max-md:text-sm max-md:mt-6"
      >
        {isLoading ? '처리 중...' : '회원가입 완료'}
      </Button>
    </form>
  );
}
