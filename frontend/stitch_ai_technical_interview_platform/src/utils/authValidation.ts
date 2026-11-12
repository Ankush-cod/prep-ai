// src/utils/authValidation.ts

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

export function validatePasswordComplexity(password: string): string | undefined {
  if (!password) {
    return 'Password is required.';
  }
  const checks = getPasswordChecks(password);
  if (!checks.minLength) {
    return 'Password must be at least 8 characters long.';
  }
  if (!checks.hasUppercase || !checks.hasLowercase || !checks.hasNumber) {
    return 'Password must include uppercase, lowercase, and at least one number.';
  }
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return undefined;
}
