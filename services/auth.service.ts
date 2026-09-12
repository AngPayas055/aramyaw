import { apiUrl } from "./api";

import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "@/types/auth";

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await fetch(apiUrl("/api/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: RegisterResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create account.");
  }

  return data;
}

export async function loginUser(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to sign in.");
  }

  return data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const response = await fetch(
    apiUrl("/api/auth/forgot-password"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data: ForgotPasswordResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send password reset email.",
    );
  }

  return data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  const response = await fetch(
    apiUrl("/api/auth/reset-password"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data: ResetPasswordResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to reset password.",
    );
  }

  return data;
}