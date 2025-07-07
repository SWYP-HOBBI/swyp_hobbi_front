import { Gender, MBTI_OPTIONS, UserInfoFormData } from '@/types/auth';
import { useSignupStore } from '@/store/signup';
import { useEffect, useMemo, useState, useCallback } from 'react';
import HobbySelector, {
  CustomDropdownButton,
  CustomDropdownItem,
} from '@/components/common/hobby_selector';
import { useHobbyStore } from '@/store/hobby';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { authService } from '@/services/api';
import SvgIcon from '../common/svg_icon';
import { z } from 'zod';

/**
 * 회원가입 상세 정보 입력 폼 Props 인터페이스
 * @param onSubmit - 회원가입 데이터 제출 핸들러
 * @param onPrevStep - 이전 단계로 이동 핸들러
 */
interface UserInfoFormProps {
  onSubmit: (data: UserInfoFormData) => void;
  onPrevStep: () => void;
}

// zod 스키마 정의
const UserInfoSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(10, '닉네임은 10자 이하여야 합니다.')
    .regex(
      /^[^!@#$%^&*(),.?":{}|<>\s]+$/,
      '특수문자와 공백은 사용할 수 없습니다.',
    ),
  birthYear: z.number().min(1900, '올바른 년도를 선택해주세요.'),
  birthMonth: z
    .number()
    .min(1, '월을 선택해주세요.')
    .max(12, '월을 선택해주세요.'),
  birthDay: z
    .number()
    .min(1, '일을 선택해주세요.')
    .max(31, '일을 선택해주세요.'),
  gender: z.enum(['남성', '여성'], { message: '성별을 선택해주세요.' }),
  mbti: z.string().optional(),
  hobbyTags: z.array(z.string()).max(15, '최대 15개까지 선택 가능합니다.'),
});
type UserInfoFormError = Partial<Record<keyof UserInfoFormData, string>>;

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

  // zod 에러 상태
  const [formError, setFormError] = useState<UserInfoFormError>({});

  // 현재 날짜 관련 상수 추가
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
  const currentDay = today.getDate();

  /**
   * 년도 선택 옵션 생성 (1900년 ~ 현재년도)
   * useMemo를 사용하여 불필요한 재계산 방지
   */
  const years = useMemo(() => {
    return Array.from(
      { length: currentYear - 1900 + 1 },
      (_, i) => currentYear - i,
    );
  }, []);

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
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'nickname') {
        setIsNicknameVerified(false);
      }
      updateSignupData({ [name]: value });

      // 실시간 zod 유효성 검사
      if (name === 'nickname') {
        const result = UserInfoSchema.shape.nickname.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          nickname: result.success ? undefined : result.error.errors[0].message,
        }));
      }
    },
    [updateSignupData, setIsNicknameVerified],
  );

  /**
   * 닉네임 중복 검사 핸들러
   * API 호출을 통해 닉네임 중복 여부 확인
   */
  const handleNicknameCheck = useCallback(async () => {
    const result = UserInfoSchema.shape.nickname.safeParse(signupData.nickname);
    if (!result.success) {
      setIsError(true);
      setErrorMessage(result.error.errors[0].message);
      setIsNicknameVerified(false);
      return;
    }
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
  }, [
    signupData.nickname,
    setIsError,
    setErrorMessage,
    setIsNicknameVerified,
    setIsLoading,
  ]);

  /**
   * 성별 선택 핸들러
   * 선택된 성별 업데이트
   */
  const handleGenderSelect = useCallback(
    (gender: Gender) => {
      updateSignupData({ gender });
    },
    [updateSignupData],
  );

  /**
   * 폼 제출 핸들러
   * 닉네임 검증 후 회원가입 데이터 제출
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const result = UserInfoSchema.safeParse({
        ...signupData,
        hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
      });
      if (!result.success) {
        const fieldErrors: UserInfoFormError = {};
        result.error.errors.forEach((err) => {
          if (err.path[0])
            fieldErrors[err.path[0] as keyof UserInfoFormData] = err.message;
        });
        setFormError(fieldErrors);
        return;
      }
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
    },
    [signupData, selectedHobbyTags, isNicknameVerified, onSubmit],
  );

  /**
   * 폼 유효성 검사
   * - 닉네임 검증
   * - 생년월일 검증
   * - 성별 선택 검증
   */
  const isFormValid = useCallback(() => {
    const result = UserInfoSchema.safeParse({
      ...signupData,
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    });
    // 닉네임 중복확인까지 완료해야만 true
    return result.success && isNicknameVerified;
  }, [signupData, selectedHobbyTags, isNicknameVerified]);

  /**
   * 월 날짜 검증
   * 주어진 년도와 월에 대한 월의 마지막 날짜 반환
   */
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // 월 선택 제한 함수 추가
  const getAvailableMonths = () => {
    if (signupData.birthYear === currentYear) {
      return Array.from({ length: currentMonth }, (_, i) => i + 1);
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 일 선택 제한 함수 수정
  const getAvailableDays = () => {
    const daysInMonth = getDaysInMonth(
      signupData.birthYear,
      signupData.birthMonth,
    );
    let maxDay = daysInMonth;

    // 현재 년도와 월이 선택되었을 때 현재 일자까지만 선택 가능
    if (
      signupData.birthYear === currentYear &&
      signupData.birthMonth === currentMonth
    ) {
      maxDay = Math.min(daysInMonth, currentDay);
    }

    return Array.from({ length: maxDay }, (_, i) => i + 1);
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
          error={formError.nickname}
        />
        <Button
          type="button"
          onClick={() => {
            if (isNicknameVerified) {
              setIsNicknameVerified(false);
              setErrorMessage(null);
              setIsError(false);
            } else {
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

      {formError.nickname && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.nickname}
        </p>
      )}
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
                  updateSignupData({
                    birthYear: year,
                    birthMonth: 0,
                    birthDay: 0,
                  });
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
            {getAvailableMonths().map((month) => (
              <CustomDropdownItem
                key={month}
                showCheckbox
                value={String(month)}
                label={`${month}월`}
                isSelected={signupData.birthMonth === month}
                onClick={() => {
                  // 월이 변경되면 일 초기화
                  updateSignupData({
                    birthMonth: month,
                    birthDay: 0,
                  });
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
            {getAvailableDays().map((day) => (
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
      {/* 생년월일 에러 */}
      {(formError.birthYear || formError.birthMonth || formError.birthDay) && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.birthYear || formError.birthMonth || formError.birthDay}
        </p>
      )}

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
      {formError.gender && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.gender}
        </p>
      )}

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
      {formError.mbti && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.mbti}
        </p>
      )}

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
      {formError.hobbyTags && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.hobbyTags}
        </p>
      )}

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
