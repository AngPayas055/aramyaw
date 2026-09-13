// Copy your existing apiUrl import from auth.service.ts.

import type {
  CreateSeasonPayload,
  GetSeasonsParams,
  SeasonResponse,
  SeasonsResponse,
  UpdateSeasonPayload,
} from "@/types/season";
import { apiUrl } from "./api";

export async function createSeason(
  payload: CreateSeasonPayload,
  token: string,
): Promise<SeasonResponse> {
  const response = await fetch(apiUrl("/api/seasons"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data: SeasonResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create season.");
  }

  return data;
}

export async function getSeasons(
  token: string,
  params: GetSeasonsParams = {},
): Promise<SeasonsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }

  if (params.status !== undefined) {
    query.set("status", params.status);
  }

  const queryString = query.toString();

  const response = await fetch(
    apiUrl(`/api/seasons${queryString ? `?${queryString}` : ""}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data: SeasonsResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch seasons.");
  }

  return data;
}

export async function getSeasonById(
  seasonId: string,
  token: string,
): Promise<SeasonResponse> {
  const response = await fetch(
    apiUrl(`/api/seasons/${encodeURIComponent(seasonId)}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data: SeasonResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch season.");
  }

  return data;
}

export async function updateSeason(
  seasonId: string,
  payload: UpdateSeasonPayload,
  token: string,
): Promise<SeasonResponse> {
  const response = await fetch(
    apiUrl(`/api/seasons/${encodeURIComponent(seasonId)}`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data: SeasonResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update season.");
  }

  return data;
}