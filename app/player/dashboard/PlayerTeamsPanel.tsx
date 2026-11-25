"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Spin } from "antd";

import { apiUrl } from "@/services/api";
import FindTeamPanel from "./FindTeamPanel";

type PlayerTeam = {
  _id: string;
  name: string;
  barangay: string;
  season: { name: string } | null;
  division: { name: string } | null;
  manager: { firstName: string; lastName: string } | null;
  players: {
    _id: string;
    firstName: string;
    lastName: string;
    jerseyNumber?: number | null;
  }[];
};

export default function PlayerTeamsPanel({ token }: { token: string }) {
  const [teams, setTeams] = useState<PlayerTeam[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTeams() {
      try {
        const response = await fetch(apiUrl("/api/auth/player-teams"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load your teams. Refresh to try again.");
        }

        const data: { teams: PlayerTeam[] } = await response.json();

        if (!controller.signal.aborted) {
          setTeams(data.teams);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error ? error.message : "Could not load your teams.",
          );
        }
      }
    }

    void loadTeams();
    return () => controller.abort();
  }, [token]);

  if (error) {
    return <Alert className="mt-6" type="error" title={error} showIcon />;
  }

  if (teams === null) {
    return <Spin className="mt-6" />;
  }

  if (teams.length === 0) {
    return <FindTeamPanel token={token} />;
  }

  return (
    <Card title={teams.length === 1 ? "My team" : "My teams"} className="mt-6">
      <ul className="space-y-4">
        {teams.map((team) => (
          <li key={team._id}>
            <p className="font-semibold">{team.name}</p>
            <p className="text-sm">
              {[team.season?.name, team.division?.name, team.barangay]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-3 text-sm">
              <span className="font-medium">Manager:</span>{" "}
              {team.manager
                ? `${team.manager.firstName} ${team.manager.lastName}`
                : "Unavailable"}
            </p>

            <h3 className="mt-4 font-medium">Players ({team.players.length})</h3>

            <ul className="mt-2 divide-y">
              {team.players.map((player) => (
                <li key={player._id} className="flex items-center gap-2 py-2 text-sm">
                  {player.jerseyNumber != null && (
                    <span className="font-medium">#{player.jerseyNumber}</span>
                  )}
                  <span>
                    {player.firstName} {player.lastName}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}