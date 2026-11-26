"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Table,
  Typography,
} from "antd";

import { getSeasons } from "@/services/season.service";
import {
  getSeasonTeams,
  getAdminTeamPlayers,
  type AdminTeam,
  type Player,
  type PlayingStatus,
} from "@/services/team.service";
import type { Season } from "@/types/season";
import PlayerStatusBadges from "@/app/components/PlayerStatusBadges";
import PlayerStatusEditor from "../teams/PlayerStatusEditor";
import { apiUrl } from "@/services/api";

const { Title, Text } = Typography;

type PlayerRow = Player & {
  teamId: string;
  teamName: string;
  teamStatus: AdminTeam["status"];
  divisionId: string;
  divisionName: string;
};

function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

function errorMessage(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Failed to load players.";
}

export default function AdminPlayersPage() {
  const [total, setTotal] = useState(0);
  const [divisions, setDivisions] = useState<{ value: string; label: string }[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState<string>();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [divisionId, setDivisionId] = useState("all");
  const [playingStatus, setPlayingStatus] =
    useState<PlayingStatus | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      try {
        const token = getToken();
        const allSeasons: Season[] = [];
        let currentPage = 1;

        // Load every page so older seasons remain available.
        while (true) {
          const result = await getSeasons(token, {
            page: currentPage,
            limit: 100,
          });

          if (cancelled) return;

          allSeasons.push(...result.seasons);

          if (currentPage >= result.pagination.totalPages) {
            break;
          }

          currentPage += 1;
        }

        setSeasons(allSeasons);
        setSeasonId(allSeasons[0]?._id);
      } catch (cause) {
        if (!cancelled) {
          setError(errorMessage(cause));
        }
      } finally {
        if (!cancelled) {
          setLoadingSeasons(false);
        }
      }
    }

    void loadSeasons();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!seasonId) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });

    if (search) params.set("search", search);
    if (divisionId !== "all") params.set("divisionId", divisionId);
    if (playingStatus !== "all") params.set("playingStatus", playingStatus);

    async function loadPlayers() {
      try {
        const response = await fetch(
          apiUrl(`/api/seasons/${encodeURIComponent(seasonId!)}/players?${params}`),
          {
            headers: { Authorization: `Bearer ${getToken()}` },
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load players.");
        }

        if (controller.signal.aborted) return;

        setPlayers(data.players);
        setDivisions(data.divisions);
        setTotal(data.total);
        setError("");
      } catch (cause) {
        if (controller.signal.aborted) return;

        setPlayers([]);
        setTotal(0);
        setError(errorMessage(cause));
      } finally {
        if (!controller.signal.aborted) setLoadingPlayers(false);
      }
    }

    void loadPlayers();
    return () => controller.abort();
  }, [seasonId, divisionId, playingStatus, search, page, revision]);

  const query = search.trim().toLowerCase();

  const visiblePlayers = players.filter((player) => {
    const matchesSearch =
      !query ||
      [
        `${player.firstName} ${player.lastName}`,
        player.teamName,
        player.divisionName,
        String(player.jerseyNumber ?? ""),
      ].some((value) => value.toLowerCase().includes(query));

    const matchesDivision =
      divisionId === "all" ||
      player.divisionId === divisionId;

    const matchesStatus =
      playingStatus === "all" ||
      (player.playingStatus ?? "allowed") === playingStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  const loading =
    loadingSeasons || (Boolean(seasonId) && loadingPlayers);

  function refreshPlayers() {
    setLoadingPlayers(true);
    setPlayers([]);
    setError("");
    setPage(1);
    setRevision((current) => current + 1);
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={2} className="mb-1!">
            Players
          </Title>

          <Text type="secondary">
            View season rosters, verify players, and manage playing statuses.
          </Text>
        </div>

        <Button
          onClick={refreshPlayers}
          disabled={!seasonId || loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          title={error}
        />
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <label htmlFor="players-season" className="mb-2 block font-medium">
            Season
          </label>

          <Select
            id="players-season"
            className="w-full"
            value={seasonId}
            loading={loadingSeasons}
            placeholder="Select a season"
            options={seasons.map((season) => ({
              value: season._id,
              label: season.name,
            }))}
            onChange={(value: string) => {
              setLoadingPlayers(true);
              setPlayers([]);
              setError("");
              setSeasonId(value);
              setDivisionId("all");
              setPage(1);
            }}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="players-division" className="mb-2 block font-medium">
            Division
          </label>

          <Select
            id="players-division"
            className="w-full"
            value={divisionId}
            disabled={loading || !seasonId}
            options={[
              { value: "all", label: "All divisions" },
              ...divisions,
            ]}
            onChange={(value: string) => {
              setDivisionId(value);
              setPage(1);
            }}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="players-status" className="mb-2 block font-medium">
            Playing status
          </label>

          <Select<PlayingStatus | "all">
            id="players-status"
            className="w-full"
            value={playingStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "allowed", label: "Allowed" },
              { value: "suspended", label: "Suspended" },
              { value: "banned", label: "Banned" },
            ]}
            onChange={(value) => {
              setPlayingStatus(value);
              setPage(1);
            }}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="players-search" className="mb-2 block font-medium">
            Search
          </label>

          <Input.Search
            id="players-search"
            allowClear
            enterButton="Search"
            maxLength={100}
            placeholder="Player, team, division, or jersey"
            disabled={!seasonId}
            onSearch={(value) => {
              const nextSearch = value.trim();
              if (nextSearch === search && page === 1) return;

              setLoadingPlayers(true);
              setSearch(nextSearch);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Card
        className="min-w-0 overflow-hidden"
        styles={{ body: { padding: 12, minWidth: 0 } }}
      >
        <Text type="secondary" className="mb-3 block">
          {loading
            ? "Loading players…"
            : `${visiblePlayers.length} of ${players.length} players`}
        </Text>

        <Table<PlayerRow>
          rowKey={(player) => `${player.teamId}:${player._id}`}
          dataSource={visiblePlayers}
          loading={loading}
          tableLayout="fixed"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            showSizeChanger: false,
            onChange: (nextPage) => {
              if (nextPage === page) return;
              setLoadingPlayers(true);
              setPage(nextPage);
            },
          }}
          locale={{
            emptyText: error
              ? "Unable to load players. Please try refreshing."
              : !seasonId
                ? "No seasons available."
                : "No players match the selected filters.",
          }}
          columns={[
            {
              title: "Jersey",
              dataIndex: "jerseyNumber",
              width: 80,
              render: (number: Player["jerseyNumber"]) =>
                number != null ? `#${number}` : "—",
            },
            {
              title: "Player",
              key: "name",
              width: 200,
              render: (_, player) =>
                `${player.firstName} ${player.lastName}`,
            },
            {
              title: "Team",
              dataIndex: "teamName",
              width: 180,
            },
            {
              title: "Division",
              dataIndex: "divisionName",
              width: 150,
            },
            {
              title: "Birth date",
              dataIndex: "birthDate",
              width: 140,
              render: (date: string) =>
                dayjs(date).format("MMM D, YYYY"),
            },
            {
              title: "Status",
              key: "status",
              width: 300,
              render: (_, player) => (
                <PlayerStatusBadges
                  player={player}
                  teamApproved={player.teamStatus === "approved"}
                />
              ),
            },
            {
              title: "Action",
              key: "action",
              width: 150,
              render: (_, player) =>
                seasonId ? (
                  <PlayerStatusEditor
                    key={`${seasonId}:${player.teamId}:${player._id}`}
                    player={player}
                    seasonId={seasonId}
                    teamId={player.teamId}
                    onSaved={(updated) => {
                      setPlayers((current) =>
                        current.map((item) =>
                          item._id === updated._id &&
                          item.teamId === player.teamId
                            ? {
                                ...item,
                                ...updated,
                              }
                            : item,
                        ),
                      );
                      setPage(1);
                    }}
                  />
                ) : null,
            },
          ]}
        />
      </Card>
    </main>
  );
}