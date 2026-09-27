"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Spin,
  Tag,
  Typography,
} from "antd";

import { getSeasons } from "@/services/season.service";
import {
  addPlayer,
  editPlayer,
  getMyTeams,
  getPlayers,
  removePlayer,
  type Player,
  type PlayerInput,
  type Team,
} from "@/services/team.service";

const { Title, Text } = Typography;

function idOf(value: Team["season"] | Team["division"]) {
  return typeof value === "string" ? value : value._id;
}

function nameOf(value: Team["season"] | Team["division"]) {
  return typeof value === "string" ? value : value.name;
}

export default function TeamDetailsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const router = useRouter();
  const [form] = Form.useForm<PlayerInput>();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Player | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        const { seasons } = await getSeasons(token, {
          page: 1,
          limit: 100,
        });

        const results = await Promise.all(
          seasons.map((season) => getMyTeams(season._id, token)),
        );

        const found = results
          .flatMap((result) => result.teams)
          .find((item) => item._id === teamId);

        if (!found) {
          if (!cancelled) {
            setError("Team not found in your registrations.");
          }
          return;
        }

        const response = await getPlayers(
          idOf(found.season),
          teamId,
          token,
        );

        if (!cancelled) {
          setTeam(found);
          setPlayers(response.players);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load team.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTeam();

    return () => {
      cancelled = true;
    };
  }, [teamId, router]);

  const division =
    team && typeof team.division !== "string"
      ? team.division
      : null;

  const seasonId = team ? idOf(team.season) : "";
  const maxPlayers = division?.maxPlayers;

  function openPlayerForm(player: Player | null) {
    setEditing(player);
    setError("");

    form.setFieldsValue(
      player
        ? {
            firstName: player.firstName,
            lastName: player.lastName,
            birthDate: player.birthDate,
            jerseyNumber: player.jerseyNumber,
          }
        : {
            firstName: "",
            lastName: "",
            birthDate: "",
            jerseyNumber: undefined,
          },
    );

    setModalOpen(true);
  }

  async function savePlayer(values: PlayerInput) {
    if (!team) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = editing
        ? await editPlayer(
            seasonId,
            teamId,
            editing._id,
            token,
            values,
          )
        : await addPlayer(seasonId, teamId, token, values);

      setPlayers((current) =>
        editing
          ? current.map((player) =>
              player._id === editing._id ? result.player : player,
            )
          : [...current, result.player],
      );

      setModalOpen(false);
      form.resetFields();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save player.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePlayer(playerId: string) {
    if (!team) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    try {
      await removePlayer(seasonId, teamId, playerId, token);

      setPlayers((current) =>
        current.filter((player) => player._id !== playerId),
      );
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not remove player.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/manager" className="text-[#f15a24]">
          ← Manager dashboard
        </Link>

        {loading ? (
          <div className="mt-8">
            <Spin />
          </div>
        ) : !team ? (
          <Alert
            className="mt-6"
            showIcon
            type="error"
            title={error || "Team not found."}
          />
        ) : (
          <>
            <header className="mb-6 mt-6">
              <Title level={2}>{team.name}</Title>
              <Text type="secondary">
                {nameOf(team.season)} · {nameOf(team.division)} ·{" "}
                {team.barangay}
              </Text>
            </header>

            {!modalOpen && error && (
              <Alert
                className="mb-4"
                type="error"
                showIcon
                title={error}
                closable
                onClose={() => setError("")}
              />
            )}

            <Card title="Registration status" className="mb-4">
              <Tag
                color={
                  team.status === "approved"
                    ? "green"
                    : team.status === "rejected"
                      ? "red"
                      : "orange"
                }
              >
                {team.status.toUpperCase()}
              </Tag>

              <Text>
                {team.status === "pending"
                  ? "Awaiting review by Aramyaw BallClub."
                  : team.status === "approved"
                    ? "Your team registration is approved."
                    : "Your registration was rejected."}
              </Text>

              {team.rejectionReason && (
                <p className="mt-2 text-red-600">
                  Reason: {team.rejectionReason}
                </p>
              )}
            </Card>

            <Card title="Division rules" className="mb-4">
              <div className="flex flex-wrap gap-2">
                {division?.minAge != null ||
                division?.maxAge != null ? (
                  <Tag>
                    Ages {division?.minAge ?? 0}–
                    {division?.maxAge ?? "above"}
                  </Tag>
                ) : (
                  <Tag>No age limit</Tag>
                )}

                {division?.minPlayers != null &&
                  division?.maxPlayers != null && (
                    <Tag>
                      {division.minPlayers}–{division.maxPlayers} players
                    </Tag>
                  )}

                {division?.ageCutoffDate && (
                  <Tag>
                    Age cutoff:{" "}
                    {division.ageCutoffDate.slice(0, 10)}
                  </Tag>
                )}

                {division?.registrationFeeCentavos != null && (
                  <Tag>
                    Fee: ₱
                    {(
                      division.registrationFeeCentavos / 100
                    ).toLocaleString()}
                  </Tag>
                )}
              </div>

              {division?.description && (
                <p className="mt-3">{division.description}</p>
              )}
            </Card>

            <Card
              title={`Players (${players.length}${
                maxPlayers ? `/${maxPlayers}` : ""
              })`}
              extra={
                <Button
                  type="primary"
                  disabled={
                    maxPlayers != null &&
                    players.length >= maxPlayers
                  }
                  onClick={() => openPlayerForm(null)}
                >
                  Add player
                </Button>
              }
            >
              {division?.minPlayers != null &&
                players.length < division.minPlayers && (
                  <Alert
                    className="mb-4"
                    type="info"
                    showIcon
                    title={`Add ${
                      division.minPlayers - players.length
                    } more player${
                      division.minPlayers - players.length === 1
                        ? ""
                        : "s"
                    } to reach the minimum roster size.`}
                  />
                )}

              {players.length === 0 ? (
                <Empty description="No players added yet." />
              ) : (
                <div className="flex flex-col gap-3">
                  {players.map((player) => (
                    <div
                      key={player._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 p-3"
                    >
                      <div>
                        <Text strong>
                          {player.firstName} {player.lastName}
                        </Text>
                        <br />
                        <Text type="secondary">
                          Born {player.birthDate}
                          {player.jerseyNumber != null
                            ? ` · #${player.jerseyNumber}`
                            : ""}
                        </Text>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => openPlayerForm(player)}
                        >
                          Edit
                        </Button>

                        <Popconfirm
                          title="Remove this player?"
                          onConfirm={() =>
                            void deletePlayer(player._id)
                          }
                        >
                          <Button size="small" danger>
                            Remove
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Modal
              title={editing ? "Edit player" : "Add player"}
              open={modalOpen}
              onCancel={() => {
                setModalOpen(false);
                setError("");
              }}
              onOk={() => void form.submit()}
              confirmLoading={saving}
              okText={editing ? "Save changes" : "Add player"}
            >
              {error && (
                <Alert
                  className="mb-4"
                  type="error"
                  showIcon
                  title={error}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={(values) => void savePlayer(values)}
              >
                <Form.Item
                  label="First name"
                  name="firstName"
                  rules={[{ required: true, whitespace: true }]}
                >
                  <Input maxLength={80} />
                </Form.Item>

                <Form.Item
                  label="Last name"
                  name="lastName"
                  rules={[{ required: true, whitespace: true }]}
                >
                  <Input maxLength={80} />
                </Form.Item>

                <Form.Item
                  label="Birth date"
                  name="birthDate"
                  rules={[
                    {
                      required: true,
                      message: "Enter a birth date.",
                    },
                  ]}
                >
                  <Input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Form.Item>

                <Form.Item
                  label="Jersey number (optional)"
                  name="jerseyNumber"
                >
                  <InputNumber
                    min={0}
                    max={99}
                    className="w-full"
                  />
                </Form.Item>
              </Form>
            </Modal>
          </>
        )}
      </div>
    </main>
  );
}