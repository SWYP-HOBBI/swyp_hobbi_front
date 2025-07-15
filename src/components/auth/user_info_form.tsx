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
 *
 * @param onSubmit - 회원가입 상세 정보가 유효성 검사를 통과했을 때 호출되는 콜백 함수
 *                   부모 컴포넌트에서 최종 회원가입 처리를 담당
 * @param onPrevStep - 이전 단계로 이동할 때 호출되는 콜백 함수
 *                       회원가입 프로세스에서 뒤로 가기 기능을 제공
 */
interface UserInfoFormProps {
  onSubmit: (data: UserInfoFormData) => void;
  onPrevStep: () => void;
}

// ===== ZOD 스키마 정의 =====

/**
 * 회원가입 상세 정보 유효성 검사를 위한 Zod 스키마
 *
 * 각 필드별 검증 규칙:
 * - nickname: 2-10자, 특수문자/공백 제외
 * - birthYear: 1900년 이상
 * - birthMonth: 1-12월
 * - birthDay: 1-31일
 * - gender: '남성' 또는 '여성' 중 선택
 * - mbti: 선택사항 (optional)
 * - hobbyTags: 최대 15개까지 선택 가능
 */
const UserInfoSchema = z.object({
  nickname: z
    .string()
    .min(2, '* 닉네임은 2자 이상이어야 합니다.')
    .max(10, '* 닉네임은 10자 이하여야 합니다.')
    .regex(
      /^[^!@#$%^&*(),.?":{}|<>\s]+$/,
      '* 특수문자와 공백은 사용할 수 없습니다.',
    ),
  birthYear: z.number().min(1900, '* 올바른 년도를 선택해주세요.'),
  birthMonth: z
    .number()
    .min(1, '* 월을 선택해주세요.')
    .max(12, '* 월을 선택해주세요.'),
  birthDay: z
    .number()
    .min(1, '* 일을 선택해주세요.')
    .max(31, '* 일을 선택해주세요.'),
  gender: z.enum(['남성', '여성'], { message: '* 성별을 선택해주세요.' }),
  mbti: z.string().optional(), // 선택사항
  hobbyTags: z.array(z.string()).max(15, '* 최대 15개까지 선택 가능합니다.'),
});

/**
 * 폼 에러 타입 정의
 * 각 필드별 에러 메시지를 저장하는 객체 타입
 */
type UserInfoFormError = Partial<Record<keyof UserInfoFormData, string>>;

/**
 * 회원가입 상세 정보 입력 폼 메인 컴포넌트
 *
 * 사용자의 상세 정보를 수집하고 유효성을 검사하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 닉네임 입력 및 실시간 중복 검사
 * 2. 생년월일 선택 (년/월/일 드롭다운)
 * 3. 성별 선택 (남성/여성 버튼)
 * 4. MBTI 선택 (선택사항)
 * 5. 취미 선택 (최대 15개, 다중 선택)
 * 6. 실시간 유효성 검사 및 에러 피드백
 *
 * 기술적 특징:
 * - Zod를 사용한 강력한 유효성 검사
 * - Zustand를 통한 전역 상태 관리
 * - 커스텀 드롭다운 컴포넌트 사용
 * - API를 통한 닉네임 중복 검사
 * - 생년월일의 논리적 제약 조건 처리
 * - 반응형 디자인 (모바일/데스크톱)
 */
export default function UserInfoForm({
  onSubmit,
  onPrevStep,
}: UserInfoFormProps) {
  // ===== 스토어 및 훅 초기화 =====

  /**
   * 회원가입 관련 상태와 액션을 가져오는 스토어
   */
  const {
    signupData, // 회원가입 데이터
    updateSignupData, // 회원가입 데이터 업데이트 함수
    isNicknameVerified, // 닉네임 중복 검사 완료 여부
    setIsNicknameVerified, // 닉네임 인증 상태 설정 함수
    isLoading, // 로딩 상태
    setIsLoading, // 로딩 상태 설정 함수
    isError, // 에러 발생 여부
    setIsError, // 에러 상태 설정 함수
    errorMessage, // 에러 메시지
    setErrorMessage, // 에러 메시지 설정 함수
  } = useSignupStore();

  /**
   * 선택된 취미 태그 상태를 가져오는 스토어
   */
  const { selectedHobbyTags } = useHobbyStore();

  // ===== 로컬 상태 관리 =====

  /**
   * 드롭다운 메뉴들의 열림/닫힘 상태 관리
   */
  const [isYearOpen, setIsYearOpen] = useState(false); // 년도 선택 드롭다운
  const [isMonthOpen, setIsMonthOpen] = useState(false); // 월 선택 드롭다운
  const [isDayOpen, setIsDayOpen] = useState(false); // 일 선택 드롭다운
  const [isMbtiOpen, setIsMbtiOpen] = useState(false); // MBTI 선택 드롭다운

  /**
   * Zod 유효성 검사 에러 상태
   * 각 필드별 실시간 유효성 검사 결과를 저장
   */
  const [formError, setFormError] = useState<UserInfoFormError>({});

  // ===== 날짜 관련 상수 및 유틸리티 =====

  /**
   * 현재 날짜 정보를 가져오는 상수들
   * 생년월일 선택 시 논리적 제약 조건을 위해 사용
   */
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
  const currentDay = today.getDate();

  /**
   * 년도 선택 옵션 생성 (1900년 ~ 현재년도)
   * useMemo를 사용하여 불필요한 재계산 방지
   * 내림차순으로 정렬 (최신년도부터 표시)
   */
  const years = useMemo(() => {
    return Array.from(
      { length: currentYear - 1900 + 1 },
      (_, i) => currentYear - i,
    );
  }, []);

  // ===== 사이드 이펙트 =====

  /**
   * 선택된 취미 태그가 변경될 때마다 signupData 업데이트
   * HobbySelector 컴포넌트와 상태 동기화
   */
  useEffect(() => {
    updateSignupData({
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    });
  }, [selectedHobbyTags, updateSignupData]);

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 입력 필드 변경 핸들러
   *
   * 닉네임 입력 시 중복 검사 상태를 초기화하고 실시간 유효성 검사를 수행합니다.
   *
   * @param e - 입력 이벤트 객체
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      // 닉네임이 변경되면 중복 검사 상태 초기화
      if (name === 'nickname') {
        setIsNicknameVerified(false);
      }

      // 스토어의 폼 데이터 업데이트
      updateSignupData({ [name]: value });

      // ===== 실시간 Zod 유효성 검사 =====
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
   *
   * API 호출을 통해 닉네임 중복 여부를 확인합니다.
   * 검증 과정:
   * 1. Zod 스키마를 통한 기본 유효성 검사
   * 2. API 호출을 통한 서버 측 중복 검사
   * 3. 결과에 따른 상태 업데이트
   */
  const handleNicknameCheck = useCallback(async () => {
    // ===== 기본 유효성 검사 =====
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

      // ===== API 호출을 통한 중복 검사 =====
      const response = await authService.checkNicknameDuplicate(
        signupData.nickname,
      );

      // ===== 응답 검증 및 처리 =====
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

      // 중복되지 않은 경우 인증 완료
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
   *
   * 선택된 성별을 스토어에 업데이트합니다.
   *
   * @param gender - 선택된 성별 ('남성' | '여성')
   */
  const handleGenderSelect = useCallback(
    (gender: Gender) => {
      updateSignupData({ gender });
    },
    [updateSignupData],
  );

  /**
   * 폼 제출 핸들러
   *
   * 모든 필드의 유효성을 검사하고 닉네임 중복 검사 완료 여부를 확인한 후
   * 부모 컴포넌트에 데이터를 전달합니다.
   *
   * 검증 단계:
   * 1. Zod 스키마를 통한 전체 데이터 유효성 검사
   * 2. 닉네임 중복 검사 완료 여부 확인
   * 3. 검증 통과 시 부모 컴포넌트에 데이터 전달
   *
   * @param e - 폼 제출 이벤트 객체
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault(); // 기본 폼 제출 동작 방지

      // ===== Zod 전체 폼 유효성 검사 =====
      const result = UserInfoSchema.safeParse({
        ...signupData,
        hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
      });

      if (!result.success) {
        // 유효성 검사 실패 시 필드별 에러 메시지 설정
        const fieldErrors: UserInfoFormError = {};
        result.error.errors.forEach((err) => {
          if (err.path[0])
            fieldErrors[err.path[0] as keyof UserInfoFormData] = err.message;
        });
        setFormError(fieldErrors);
        return;
      }

      // ===== 닉네임 중복 검사 확인 =====
      if (!isNicknameVerified) {
        alert('닉네임 중복 확인이 필요합니다.');
        return;
      }

      // ===== 검증 통과 시 부모 컴포넌트에 데이터 전달 =====
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
   * 폼 전체 유효성 검사 함수
   *
   * 제출 버튼 활성화 여부를 결정하는 데 사용됩니다.
   *
   * @returns {boolean} 폼이 유효하고 닉네임 중복 검사가 완료되었는지 여부
   */
  const isFormValid = useCallback(() => {
    const result = UserInfoSchema.safeParse({
      ...signupData,
      hobbyTags: selectedHobbyTags.map((tag) => tag.subCategory),
    });
    // 모든 검증 통과 + 닉네임 중복 검사 완료
    return result.success && isNicknameVerified;
  }, [signupData, selectedHobbyTags, isNicknameVerified]);

  // ===== 날짜 관련 유틸리티 함수들 =====

  /**
   * 월 날짜 검증 함수
   *
   * 주어진 년도와 월에 대한 해당 월의 마지막 날짜를 반환합니다.
   * 윤년과 각 월의 일수를 고려합니다.
   *
   * @param year - 년도
   * @param month - 월
   * @returns {number} 해당 월의 마지막 날짜
   */
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  /**
   * 선택 가능한 월 목록 반환 함수
   *
   * 현재 년도가 선택된 경우 현재 월까지만 선택 가능하도록 제한합니다.
   *
   * @returns {number[]} 선택 가능한 월 배열
   */
  const getAvailableMonths = () => {
    if (signupData.birthYear === currentYear) {
      return Array.from({ length: currentMonth }, (_, i) => i + 1);
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  /**
   * 선택 가능한 일 목록 반환 함수
   *
   * 선택된 년도와 월에 따라 해당 월의 일수를 계산하고,
   * 현재 년도와 월이 선택된 경우 현재 일자까지만 선택 가능하도록 제한합니다.
   *
   * @returns {number[]} 선택 가능한 일 배열
   */
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

  // ===== JSX 렌더링 =====
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* ===== 헤더 섹션 ===== */}
      <div className="relative flex items-center justify-center mb-8">
        {/* 뒤로 가기 버튼 */}
        <div className="absolute left-0" onClick={onPrevStep}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer max-md:w-[20px] max-md:h-[20px] w-[40px] h-[40px]"
            color="var(--grayscale-60)"
          />
        </div>
        {/* 제목 */}
        <h1 className="text-[32px] font-bold max-md:text-lg">나의 정보</h1>
      </div>

      {/* ===== 닉네임 입력 섹션 ===== */}
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
        {/* 닉네임 입력 필드 */}
        <Input
          id="nickname"
          name="nickname"
          type="text"
          value={signupData.nickname}
          onChange={handleChange}
          disabled={isLoading} // 로딩 중일 때 비활성화
          containerClassName="w-[60%]" // 컨테이너 너비 설정
          placeholder="닉네임을 입력해주세요."
          showClearButton
          required
          error={formError.nickname}
        />

        {/* 닉네임 중복 검사 버튼 */}
        <Button
          type="button"
          onClick={() => {
            if (isNicknameVerified) {
              // 이미 인증된 경우 재검사
              setIsNicknameVerified(false);
              setErrorMessage(null);
              setIsError(false);
            } else {
              // 중복 검사 실행
              handleNicknameCheck();
            }
          }}
          disabled={!signupData.nickname || isLoading} // 닉네임이 없거나 로딩 중일 때 비활성화
          variant={isNicknameVerified ? 'secondary' : 'primary'} // 인증 완료 시 보조 스타일
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

      {/* ===== 닉네임 상태 메시지들 ===== */}

      {/* 닉네임 유효성 검사 에러 */}
      {formError.nickname && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.nickname}
        </p>
      )}

      {/* 닉네임 중복 검사 에러 */}
      {isError && errorMessage && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{errorMessage}
        </p>
      )}

      {/* 닉네임 중복 검사 완료 */}
      {isNicknameVerified && (
        <p className="text-xs text-grayscale-80 mt-2 max-md:text-[8px]">
          *사용 가능한 닉네임입니다.
        </p>
      )}

      {/* ===== 생년월일 입력 섹션 ===== */}
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
        {/* 년도 선택 드롭다운 */}
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
                  // 년도가 변경되면 월과 일 초기화
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

        {/* 월 선택 드롭다운 */}
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

        {/* 일 선택 드롭다운 */}
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

      {/* 생년월일 에러 메시지 */}
      {(formError.birthYear || formError.birthMonth || formError.birthDay) && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.birthYear || formError.birthMonth || formError.birthDay}
        </p>
      )}

      {/* ===== 성별 선택 섹션 ===== */}
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
        {/* 남성 선택 버튼 */}
        <Button
          type="button"
          onClick={() => handleGenderSelect('남성')}
          variant={signupData.gender === '남성' ? 'primary' : 'outline'}
          size="sm"
          fullWidth
        >
          남자
        </Button>

        {/* 여성 선택 버튼 */}
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

      {/* 성별 에러 메시지 */}
      {formError.gender && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.gender}
        </p>
      )}

      {/* ===== MBTI 선택 섹션 (선택사항) ===== */}
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

      {/* MBTI 에러 메시지 */}
      {formError.mbti && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.mbti}
        </p>
      )}

      {/* ===== 취미 선택 섹션 ===== */}
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

      {/* 취미 선택 컴포넌트 */}
      <HobbySelector maxCount={15} />

      {/* 취미 선택 에러 메시지 */}
      {formError.hobbyTags && (
        <p className="text-xs text-like mt-2 max-md:text-[8px]">
          *{formError.hobbyTags}
        </p>
      )}

      {/* ===== 제출 버튼 섹션 ===== */}
      <Button
        type="submit"
        disabled={!isFormValid() || isLoading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
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
