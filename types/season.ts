export type SeasonStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Season {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  status: SeasonStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeasonPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
}

export type UpdateSeasonPayload = Partial<
  CreateSeasonPayload & { status: SeasonStatus }
>;

export interface SeasonResponse {
  message?: string;
  season: Season;
}

export interface SeasonsResponse {
  message?: string;
  seasons: Season[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetSeasonsParams {
  page?: number;
  limit?: number;
  status?: SeasonStatus;
}