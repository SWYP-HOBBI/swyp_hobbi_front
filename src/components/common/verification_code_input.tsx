import React, { useRef } from 'react';

/**
 * 인증 코드 입력 컴포넌트의 Props 인터페이스
 */
interface VerificationCodeInputProps {
  value: string; // 현재 입력된 값
  onChange: (value: string) => void; // 값이 변경될 때 호출되는 콜백 함수
  length?: number; // 입력 필드의 개수 (기본값: 6)
  disabled?: boolean; // 입력 필드 비활성화 여부 (기본값: false)
}

/**
 * 인증 코드 입력 컴포넌트
 *
 * 특징:
 * - 각 자리마다 개별 input 필드 제공
 * - 숫자와 영문자만 입력 가능
 * - 자동으로 다음 필드로 포커스 이동
 * - 백스페이스로 이전 필드로 이동
 * - 복사붙여넣기 지원
 *
 * @param value - 현재 입력된 값
 * @param onChange - 값 변경 시 호출되는 콜백
 * @param length - 입력 필드 개수 (기본값: 6)
 * @param disabled - 비활성화 여부 (기본값: false)
 */
const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
}) => {
  // 각 input 필드에 대한 ref 배열 (포커스 제어용)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  /**
   * 개별 input 필드의 값 변경을 처리하는 핸들러
   *
   * 동작 방식:
   * 1. 입력된 값에서 숫자와 영문자만 추출
   * 2. 값이 비어있으면 해당 위치의 문자를 삭제
   * 3. 값이 있으면 해당 위치에 마지막 문자를 삽입
   * 4. 다음 필드로 자동 포커스 이동
   *
   * @param e - input change 이벤트
   * @param idx - 현재 input 필드의 인덱스
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    // 입력된 값에서 숫자(0-9)와 영문자(a-z, A-Z)만 허용하고 나머지는 제거
    const val = e.target.value.replace(/[^0-9a-zA-Z]/g, '');

    if (!val) {
      // 입력이 지워진 경우: 해당 위치의 문자를 빈 문자열로 교체
      const newValue = value.substring(0, idx) + '' + value.substring(idx + 1);
      onChange(newValue);
      return;
    }

    // 한 글자만 입력: 마지막 문자를 추출하여 해당 위치에 삽입
    const char = val.slice(-1);
    const newValue = value.substring(0, idx) + char + value.substring(idx + 1);
    onChange(newValue);

    // 다음 input으로 포커스 이동 (마지막 필드가 아닌 경우에만)
    if (char && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  /**
   * 키보드 이벤트를 처리하는 핸들러 (주로 백스페이스 처리)
   *
   * 동작 방식:
   * - 현재 필드가 비어있고 백스페이스를 누르면 이전 필드로 포커스 이동
   * - 이를 통해 사용자가 연속적으로 백스페이스로 이전 필드들을 지울 수 있음
   *
   * @param e - 키보드 이벤트
   * @param idx - 현재 input 필드의 인덱스
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      // 현재 칸이 비어있고 백스페이스를 누르면 이전 칸으로 포커스 이동
      inputsRef.current[idx - 1]?.focus();
    }
  };

  /**
   * 붙여넣기 이벤트를 처리하는 핸들러
   *
   * 동작 방식:
   * 1. 클립보드에서 텍스트 데이터를 가져옴
   * 2. 숫자와 영문자만 추출하고 지정된 길이만큼 자름
   * 3. 추출된 데이터로 전체 값을 업데이트
   * 4. 적절한 위치로 포커스 이동
   *
   * 예시:
   * - 붙여넣은 텍스트: "ABC123XYZ"
   * - length가 6인 경우: "ABC123"만 사용
   * - length가 8인 경우: "ABC123XY"만 사용
   *
   * @param e - 붙여넣기 이벤트
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // 기본 붙여넣기 동작을 방지 (브라우저 기본 동작 대신 커스텀 처리)
    e.preventDefault();

    // 클립보드에서 텍스트 데이터를 가져옴
    const pastedData = e.clipboardData.getData('text');

    // 숫자와 영문자만 추출하고, 지정된 길이만큼 자름
    const cleanedData = pastedData
      .replace(/[^0-9a-zA-Z]/g, '') // 숫자와 영문자가 아닌 문자 제거
      .slice(0, length); // 지정된 길이만큼만 사용

    if (cleanedData) {
      // 추출된 데이터로 전체 값을 업데이트
      onChange(cleanedData);

      // 적절한 위치로 포커스 이동
      if (cleanedData.length === length) {
        // 모든 필드가 채워진 경우: 마지막 필드로 포커스
        inputsRef.current[length - 1]?.focus();
      } else {
        // 일부만 채워진 경우: 다음 빈 필드로 포커스
        inputsRef.current[cleanedData.length]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      {/* 지정된 길이만큼 input 필드들을 생성 */}
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          // 각 input 필드를 ref 배열에 저장 (포커스 제어용)
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric" // 모바일에서 숫자 키패드 표시
          maxLength={1} // 한 글자만 입력 가능
          className="w-full h-[60px] max-md:h-12 border border-grayscale-20 rounded-lg text-center text-2xl outline-none transition-colors"
          value={value[idx] || ''} // 현재 위치의 문자 또는 빈 문자열
          onChange={(e) => handleInputChange(e, idx)} // 값 변경 핸들러
          onKeyDown={(e) => handleKeyDown(e, idx)} // 키보드 이벤트 핸들러
          onPaste={handlePaste} // 붙여넣기 핸들러
          disabled={disabled} // 비활성화 여부
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
