"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Select, Spin, Tag } from "antd";

import { getSeasons } from "@/services/season.service";
import {
  getJoinableTeams,
  sendTeamJoinRequest,
  type JoinableTeam,
} from "@/services/team.service";
import type { Season } from "@/types/season";

export default function FindTeamPanel({ token }: { token: string }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState("");
  const [teams, setTeams] = useState<JoinableTeam[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [seasonError, setSeasonError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentTeamIds, setSentTeamIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function loadSeasons() {
      try {
        const firstPage = await getSeasons(token, { limit: 100 });
        const remainingPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.pagination.totalPages - 1) },
            (_, index) => getSeasons(token, { page: index + 2, limit: 100 }),
          ),
        );

        if (active) {
          setSeasons([
            ...firstPage.seasons,
            ...remainingPages.flatMap((page) => page.seasons),
          ]);
        }
      } catch (error) {
        if (active) {
          setSeasonError(
            error instanceof Error ? error.message : "Could not load seasons.",
          );
        }
      } finally {
        if (active) setLoadingSeasons(false);
      }
    }

    void loadSeasons();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!seasonId) return;

    let active = true;

    getJoinableTeams(seasonId, token)
      .then(({ teams }) => {
        if (active) setTeams(teams);
      })
      .catch((error: unknown) => {
        if (active) {
          setTeamError(
            error instanceof Error ? error.message : "Could not load teams.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingTeams(false);
      });

    return () => {
      active = false;
    };
  }, [seasonId, token]);

  function selectSeason(id: string) {
    if (id === seasonId) return;

    setTeams([]);
    setTeamError("");
    setRequestError("");
    setLoadingTeams(true);
    setSeasonId(id);
  }

  async function requestToJoin(teamId: string) {
    setSendingId(teamId);
    setRequestError("");

    try {
      await sendTeamJoinRequest(seasonId, teamId, token);
      setSentTeamIds((current) => [...current, teamId]);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Could not send your request.",
      );
    } finally {
      setSendingId(null);
    }
  }

  const error = seasonError || teamError || requestError;

  return (
    <Card
      title="Player profile"
      style={{ borderTop: "3px solid #ea580c" }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="find-team-season" className="mb-1 block">
            Season
          </label>
          <Select
            id="find-team-season"
            className="w-full sm:max-w-sm"
            placeholder="Select a season"
            value={seasonId || undefined}
            loading={loadingSeasons}
            disabled={loadingSeasons || sendingId !== null}
            onChange={selectSeason}
            options={seasons.map((season) => ({
              value: season._id,
              label: season.name,
            }))}
          />
        </div>

        {error && <Alert type="error" title={error} showIcon />}
        {loadingTeams && <Spin />}

        {seasonId && !loadingTeams && !teamError && teams.length === 0 && (
          <p>No approved teams in this season yet.</p>
        )}

        {teams.length > 0 && (
          <ul className="divide-y">
            {teams.map((team) => (
              <li
                key={team._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm">
                    {[team.division?.name, team.barangay].filter(Boolean).join(" · ")}
                  </p>
                </div>

                {sentTeamIds.includes(team._id) ? (
                  <Tag color="gold">Request sent</Tag>
                ) : (
                  <Button
                    type="primary"
                    loading={sendingId === team._id}
                    disabled={sendingId !== null}
                    onClick={() => void requestToJoin(team._id)}
                  >
                    Request to join
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}