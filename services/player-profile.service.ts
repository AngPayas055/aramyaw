import { apiUrl } from "./api";

export type PlayerProfile = {
  firstName: string;
  lastName: string;
  birthDate: string | null;
};

export async function requestPlayerProfile(
  token: string,
  options: RequestInit = {},
): Promise<PlayerProfile> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl("/api/auth/player-profile"), {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Sign in with your player account to use your profile.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Could not load or save your profile.");
  }

  return data.profile;
}