export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  locale?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface CurrentUser {
  name: string;
  email: string;
  token: string;
  isEmailVerified: boolean;
}
