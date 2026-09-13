export type TournamentFormat =
  | "single_round_robin"
  | "double_round_robin"
  | "single_elimination"
  | "round_robin_playoffs";

export interface Division {
  _id: string;
  season: string;
  name: string;
  description: string;
  minAge?: number | null;
  maxAge?: number | null;
  ageCutoffDate?: string | null;
  maxTeams: number;
  minPlayers: number;
  maxPlayers: number;
  registrationFeeCentavos: number;
  tournamentFormat: TournamentFormat;
  playoffTeams?: number | null;
  registrationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDivisionPayload {
  name: string;
  description?: string;
  minAge?: number | null;
  maxAge?: number | null;
  ageCutoffDate?: string | null;
  maxTeams: number;
  minPlayers?: number;
  maxPlayers?: number;
  registrationFeeCentavos?: number;
  tournamentFormat?: TournamentFormat;
  playoffTeams?: number | null;
  registrationEnabled?: boolean;
}

export type UpdateDivisionPayload = Partial<CreateDivisionPayload>;

export interface DivisionResponse {
  message?: string;
  division: Division;
}

export interface DivisionsResponse {
  message?: string;
  divisions: Division[];
}