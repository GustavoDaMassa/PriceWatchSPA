export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface DeleteAccountRequest {
  password: string;
}
