// src/services/authService.ts
import {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from '../types/auth';
import {
  ApiError,
  apiRequest,
  clearStoredAccessToken,
  setStoredAccessToken,
} from './api';

export { ApiError as AuthApiError };

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });

    if (data.accessToken) {
      setStoredAccessToken(data.accessToken, payload.rememberMe !== false);
    }

    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', skipAuth: true });
    } finally {
      clearStoredAccessToken();
    }
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const data = await apiRequest<{ user: AuthUser }>('/auth/me', {
      method: 'GET',
    });
    return data.user;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/forgot-password', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/reset-password', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },

  resendVerification: async (payload: ResendVerificationPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/resend-verification', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },
};
