import { apiUrl } from "./api";

import type {
  RegisterPayload,
  RegisterResponse,
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