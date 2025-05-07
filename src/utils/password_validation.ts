interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

export const validatePasswordLength = (
  password: string,
): PasswordValidationResult => {
  if (password.length < 8 || password.length > 20) {
    return {
      isValid: false,
      message: '비밀번호는 8자 이상 20자 이하로 입력해주세요.',
    };
  }
  return { isValid: true };
};

export const validatePasswordComplexity = (
  password: string,
): PasswordValidationResult => {
  // 공백 문자 체크를 먼저 수행
  if (/\s/.test(password)) {
    return {
      isValid: false,
      message: '비밀번호에 공백을 포함할 수 없습니다.',
    };
  }

  // 영문 대소문자와 숫자가 각각 최소 1개 이상 포함되어야 함
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    return {
      isValid: false,
      message: '비밀번호는 영문 대문자, 소문자, 숫자를 모두 포함해야 합니다.',
    };
  }

  return { isValid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): PasswordValidationResult => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: '입력한 비밀번호와 일치하지 않습니다.',
    };
  }
  return { isValid: true };
};

export const validatePassword = (
  password: string,
  confirmPassword: string,
): PasswordValidationResult => {
  const lengthValidation = validatePasswordLength(password);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }

  const complexityValidation = validatePasswordComplexity(password);
  if (!complexityValidation.isValid) {
    return complexityValidation;
  }

  return validatePasswordMatch(password, confirmPassword);
};

// 비밀번호 유효성 검사
export const getPasswordError = (password: string) => {
  if (!password) return undefined;

  const lengthCheck = validatePasswordLength(password);
  if (!lengthCheck.isValid) return lengthCheck.message;

  const complexityCheck = validatePasswordComplexity(password);
  if (!complexityCheck.isValid) return complexityCheck.message;

  return undefined;
};

// 비밀번호 확인 유효성 검사
export const getPasswordConfirmError = (
  password: string,
  passwordConfirm: string,
) => {
  if (!passwordConfirm) return undefined;

  const validation = validatePassword(password, passwordConfirm);
  return validation.message;
};
