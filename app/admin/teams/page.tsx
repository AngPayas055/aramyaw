"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

import { getSeasons } from "@/services/season.service";
import {
  getSeasonTeams,
  reviewTeam,
  type AdminTeam,
} from "@/services/team.service";
import type { Season } from "@/types/season";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AdminTeamsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState<string>();
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState<string>();
  const [rejectingTeam, setRejectingTeam] = useState<AdminTeam | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [divisionId, setDivisionId] = useState<string>("all");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const result = await getSeasons(token, { page: 1, limit: 100 });
        setSeasons(result.seasons);
        setSeasonId(result.seasons[0]?._id);
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load seasons.",
        );
      } finally {
        setLoadingSeasons(false);
      }
    }

    void loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) return;

    async function loadTeams() {
      try {
        setLoadingTeams(true);
        setError("");
        setTeams([]);

        const token = localStorage.getItem("token");
        if (!token) return;

        const result = await getSeasonTeams(seasonId!, token);
        setTeams(result.teams);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Failed to load team registrations.",
        );
      } finally {
        setLoadingTeams(false);
      }
    }

    void loadTeams();
  }, [seasonId]);

  async function handleReview(
    team: AdminTeam,
    status: "approved" | "rejected",
    reason?: string,
  ) {
    const token = localStorage.getItem("token");

    if (!token || !seasonId) return;

    try {
      setReviewingId(team._id);

      const result = await reviewTeam(
        seasonId,
        team._id,
        { status, rejectionReason: reason },
        token,
      );

      setTeams((current) =>
        current.map((item) =>
          item._id === team._id
            ? {
                ...item,
                status: result.team.status,
                rejectionReason: result.team.rejectionReason,
              }
            : item,
        ),
      );

      messageApi.success(result.message);

      if (status === "rejected") {
        setRejectingTeam(null);
        setRejectionReason("");
      }
    } catch (cause) {
      messageApi.error(
        cause instanceof Error ? cause.message : "Review failed.",
      );
    } finally {
      setReviewingId(undefined);
    }
  }
  const divisions = Array.from(
    new Map(
      teams
        .filter(
          (team): team is AdminTeam & {
            division: { _id: string; name: string };
          } => typeof team.division !== "string",
        )
        .map((team) => [
          team.division._id,
          { value: team.division._id, label: team.division.name },
        ]),
    ).values(),
  );

  const visibleTeams =
    divisionId === "all"
      ? teams
      : teams.filter(
          (team) =>
            typeof team.division !== "string" &&
            team.division._id === divisionId,
        );

  return (
    <main className="mx-auto max-w-7xl p-6">
      {contextHolder}

      <div className="mb-6">
        <Title level={2} className="mb-1!">
          Team registrations
        </Title>
        <Text type="secondary">
          Review teams that applied to join an Aramyaw league.
        </Text>
      </div>

      {error && (
        <Alert
          className="mb-5"
          type="error"
          showIcon
          title={error}
        />
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Text strong>Season</Text>
          <Select
            className="mt-2 w-full"
            value={seasonId}
            onChange={(value) => {
              setSeasonId(value);
              setDivisionId("all");
            }}
            loading={loadingSeasons}
            placeholder="Select a season"
            options={seasons.map((season) => ({
              value: season._id,
              label: season.name,
            }))}
          />
        </div>

        <div>
          <Text strong>Division</Text>
          <Select
            className="mt-2 w-full"
            value={divisionId}
            onChange={setDivisionId}
            disabled={!seasonId || loadingTeams}
            options={[
              { value: "all", label: "All divisions" },
              ...divisions,
            ]}
          />
        </div>
      </div>

      {loadingSeasons || loadingTeams ? (
        <Spin size="large" />
      ) : visibleTeams.length === 0 ? (
        <Empty description="No team registrations in this division." />
      ) : (
        <div className="grid gap-4">
          {visibleTeams.map((team) => (
            <Card key={team._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Title level={4} className="mb-1!">
                    {team.name}
                  </Title>
                  <Text type="secondary">
                    {typeof team.division === "string"
                      ? team.division
                      : team.division.name}
                    {" · "}
                    {team.barangay}
                  </Text>
                </div>

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
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Text>
                  <strong>Coach:</strong> {team.coach.firstName}{" "}
                  {team.coach.lastName}
                </Text>
                <Text>
                  <strong>Coach contact:</strong>{" "}
                  {team.coach.contactNumber}
                </Text>
                <Text>
                  <strong>Coach email:</strong> {team.coach.email}
                </Text>
                <Text>
                  <strong>Submitted by:</strong>{" "}
                  {team.manager.firstName} {team.manager.lastName}
                </Text>
                <Text type="secondary">
                  Submitted {dayjs(team.createdAt).format("MMM D, YYYY h:mm A")}
                </Text>
              </div>

              {team.assistantCoach && (
                <Paragraph className="mb-0! mt-3!">
                  <strong>Assistant coach:</strong> {team.assistantCoach}
                </Paragraph>
              )}

              {team.notes && (
                <Paragraph className="mb-0! mt-3!">
                  <strong>Notes:</strong> {team.notes}
                </Paragraph>
              )}

              {team.rejectionReason && (
                <Alert
                  className="mt-4"
                  type="error"
                  title={`Rejection reason: ${team.rejectionReason}`}
                />
              )}

              {team.status === "pending" && (
                <Space className="mt-5" wrap>
                  <Button
                    type="primary"
                    loading={reviewingId === team._id}
                    onClick={() => void handleReview(team, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    disabled={Boolean(reviewingId)}
                    onClick={() => setRejectingTeam(team)}
                  >
                    Reject
                  </Button>
                </Space>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={`Reject ${rejectingTeam?.name ?? "team"}?`}
        open={Boolean(rejectingTeam)}
        okText="Reject registration"
        okButtonProps={{
          danger: true,
          loading: reviewingId === rejectingTeam?._id,
          disabled: !rejectionReason.trim(),
        }}
        onOk={() => {
          if (rejectingTeam) {
            void handleReview(
              rejectingTeam,
              "rejected",
              rejectionReason.trim(),
            );
          }
        }}
        onCancel={() => {
          if (reviewingId) return;
          setRejectingTeam(null);
          setRejectionReason("");
        }}
      >
        <Paragraph type="secondary">
          The manager will see this reason on their dashboard.
        </Paragraph>
        <TextArea
          rows={3}
          maxLength={500}
          showCount
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          placeholder="Explain what needs to be corrected"
        />
      </Modal>
    </main>
  );
}