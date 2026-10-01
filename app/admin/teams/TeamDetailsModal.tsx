"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Descriptions,
  Modal,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";

import {
  getAdminTeamPlayers,
  type AdminTeam,
  type Player,
} from "@/services/team.service";
import PlayerStatusBadges from "@/app/components/PlayerStatusBadges";
import PlayerStatusEditor from "./PlayerStatusEditor";

const { Title } = Typography;

type Props = {
  team: AdminTeam;
  seasonId: string;
  onClose: () => void;
};

export default function TeamDetailsModal({
  team,
  seasonId,
  onClose,
}: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please sign in again.");
        }

        const result = await getAdminTeamPlayers(
          seasonId,
          team._id,
          token,
        );

        if (!cancelled) {
          setPlayers(result.players);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Failed to load players.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPlayers();

    return () => {
      cancelled = true;
    };
  }, [seasonId, team._id]);

  const division =
    typeof team.division === "string"
      ? team.division
      : team.division.name;

  const season =
    typeof team.season === "string"
      ? team.season
      : team.season.name;

  return (
    <Modal
      title={team.name}
      open
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 2 }}
        items={[
          {
            key: "season",
            label: "Season",
            children: season,
          },
          {
            key: "division",
            label: "Division",
            children: division,
          },
          {
            key: "barangay",
            label: "Barangay",
            children: team.barangay,
          },
          {
            key: "status",
            label: "Status",
            children: (
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
            ),
          },
          {
            key: "coach",
            label: "Coach",
            children: `${team.coach.firstName} ${team.coach.lastName}`,
          },
          {
            key: "contact",
            label: "Coach contact",
            children: team.coach.contactNumber,
          },
          {
            key: "email",
            label: "Coach email",
            children: team.coach.email,
            span: 2,
          },
          {
            key: "manager",
            label: "Submitted by",
            children: `${team.manager.firstName} ${team.manager.lastName}`,
          },
          {
            key: "submitted",
            label: "Submitted",
            children: dayjs(team.createdAt).format(
              "MMM D, YYYY h:mm A",
            ),
          },
          ...(team.assistantCoach
            ? [{
                key: "assistant",
                label: "Assistant coach",
                children: team.assistantCoach,
                span: 2,
              }]
            : []),
          ...(team.notes
            ? [{
                key: "notes",
                label: "Notes",
                children: team.notes,
                span: 2,
              }]
            : []),
        ]}
      />

      {team.rejectionReason && (
        <Alert
          className="mt-4"
          type="error"
          showIcon
          title={`Rejection reason: ${team.rejectionReason}`}
        />
      )}

      <Title level={5} className="mb-3! mt-6!">
        Players{!loading && !error ? ` (${players.length})` : ""}
      </Title>

      {error ? (
        <Alert type="error" showIcon title={error} />
      ) : (
        <Table<Player>
          rowKey="_id"
          dataSource={players}
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 850 }}
          locale={{ emptyText: "No players added yet." }}
          columns={[
            {
              title: "Jersey",
              dataIndex: "jerseyNumber",
              width: 90,
              render: (number: Player["jerseyNumber"]) =>
                number != null ? `#${number}` : "—",
            },
            {
              title: "Player",
              key: "name",
              render: (_, player) =>
                `${player.firstName} ${player.lastName}`,
            },
            {
              title: "Birth date",
              dataIndex: "birthDate",
              width: 150,
              render: (date: string) =>
                dayjs(date).format("MMM D, YYYY"),
            },
            {
              title: "Status",
              key: "status",
              width: 260,
              render: (_, player) => (
                <PlayerStatusBadges
                  player={player}
                  teamApproved={team.status === "approved"}
                />
              ),
            },
            {
              title: "Action",
              key: "action",
              width: 130,
              render: (_, player) => (
                <PlayerStatusEditor
                  player={player}
                  seasonId={seasonId}
                  teamId={team._id}
                  onSaved={(updated) => {
                    setPlayers((current) =>
                      current.map((item) =>
                        item._id === updated._id ? updated : item,
                      ),
                    );
                  }}
                />
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}