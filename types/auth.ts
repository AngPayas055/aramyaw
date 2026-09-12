export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  password: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  user?: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
};

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}