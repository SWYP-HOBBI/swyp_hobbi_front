/**
 * Date 객체나 날짜 문자열을 'YY.MM.DD' 형식으로 변환합니다.
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 'YY.MM.DD' 형식의 문자열
 * @example
 * formatDate(new Date('2025-01-01')) // '25.01.01'
 * formatDate('2025-01-01') // '25.01.01'
 */
export const formatDate = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  const year = String(targetDate?.getFullYear()).slice(-2);
  const month = String(targetDate?.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate?.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

/**
 * 현재 날짜를 'YY.MM.DD' 형식으로 반환합니다.
 * @returns 'YY.MM.DD' 형식의 문자열
 * @example
 * getCurrentDate() // '24.03.21' (현재 날짜 기준)
 */
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

// 남은 시간을 시, 분, 초로 변환
export const formatRemainingTime = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  return `${days}일 ${hours}시간 ${minutes}분 남음`;
};
