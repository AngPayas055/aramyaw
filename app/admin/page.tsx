"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  ReloadOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  getAdminDashboard,
  type AdminDashboardData,
} from "@/services/admin.service";
import type { AdminTeam } from "@/services/team.service";
import type { SeasonStatus } from "@/types/season";
import TeamDetailsModal from "./teams/TeamDetailsModal";

const { Title, Text } = Typography;

const seasonLabels: Record<SeasonStatus, string> = {
  draft: "Draft",
  registration_open: "Registration open",
  registration_closed: "Registration closed",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusColor(status: AdminTeam["status"]) {
  return status === "approved"
    ? "green"
    : status === "rejected"
      ? "red"
      : "orange";
}

function seasonIdOf(team: AdminTeam) {
  return typeof team.season === "string"
    ? team.season
    : team.season._id;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTeam, setSelectedTeam] =
    useState<AdminTeam | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please sign in again.");
        }

        const result = await getAdminDashboard(
          token,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Failed to load the dashboard.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [refreshKey]);

  function refreshDashboard() {
    setLoading(true);
    setError("");
    setRefreshKey((current) => current + 1);
  }

  const stats = [
    {
      title: "Active Seasons",
      value: data?.stats.activeSeasons,
      icon: <TrophyOutlined />,
      description: "Registration or competition in progress",
    },
    {
      title: "Registered Teams",
      value: data?.stats.registeredTeams,
      icon: <TeamOutlined />,
      description: "Approved team registrations",
    },
    {
      title: "Players",
      value: data?.stats.players,
      icon: <UserOutlined />,
      description: "Roster entries across all seasons",
    },
    {
      title: "Pending Registrations",
      value: data?.stats.pendingRegistrations,
      icon: <FileTextOutlined />,
      description: "Teams awaiting your review",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Text className="font-semibold! text-[#f15a24]!">
              ARAMYAW BALLCLUB
            </Text>

            <Title level={2} className="mb-1! mt-2!">
              Admin Dashboard
            </Title>

            <Text type="secondary">
              Keep track of your seasons, registrations, and players.
            </Text>
          </div>

          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={refreshDashboard}
          >
            Refresh
          </Button>
        </header>

        {error && (
          <Alert
            className="mb-5"
            type="error"
            showIcon
            title={error}
            description={
              data
                ? "Showing the last successfully loaded data."
                : "Use Refresh to try again."
            }
          />
        )}

        <Row gutter={[16, 16]}>
          {stats.map((stat) => (
            <Col key={stat.title} xs={24} sm={12} lg={6}>
              <Card className="h-full">
                {loading ? (
                  <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                  <>
                    <Statistic
                      title={stat.title}
                      value={stat.value ?? "—"}
                      prefix={stat.icon}
                    />

                    <Text
                      type="secondary"
                      className="mt-3 block text-xs!"
                    >
                      {stat.description}
                    </Text>
                  </>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {!loading &&
          !error &&
          data &&
          data.stats.pendingRegistrations > 0 && (
            <Alert
              className="mt-5"
              type="warning"
              showIcon
              title={`${data.stats.pendingRegistrations} team registration${
                data.stats.pendingRegistrations === 1 ? "" : "s"
              } awaiting review`}
              action={
                <Link href="/admin/teams">
                  <Button size="small">Review teams</Button>
                </Link>
              }
            />
          )}

        <div className="my-6 flex flex-wrap gap-3">
          <Link href="/admin/seasons">
            <Button type="primary" icon={<TrophyOutlined />}>
              Manage seasons
            </Button>
          </Link>

          <Link href="/admin/teams">
            <Button icon={<TeamOutlined />}>
              Manage teams
            </Button>
          </Link>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} xl={16}>
            <Card
              title="Recent registrations"
              extra={<Link href="/admin/teams">View all</Link>}
            >
              <Table<AdminTeam>
                rowKey="_id"
                dataSource={data?.recentTeams ?? []}
                loading={loading}
                pagination={false}
                size="small"
                scroll={{ x: 650 }}
                locale={{
                  emptyText: error
                    ? "Registration data is unavailable."
                    : "No team registrations yet.",
                }}
                columns={[
                  {
                    title: "Team",
                    key: "team",
                    render: (_, team) => (
                      <button
                        type="button"
                        className="cursor-pointer text-left font-semibold text-[#f15a24] hover:underline"
                        onClick={() => setSelectedTeam(team)}
                      >
                        {team.name}
                      </button>
                    ),
                  },
                  {
                    title: "Season",
                    key: "season",
                    render: (_, team) =>
                      typeof team.season === "string"
                        ? team.season
                        : team.season?.name ?? "Unavailable",
                  },
                  {
                    title: "Division",
                    key: "division",
                    render: (_, team) =>
                      typeof team.division === "string"
                        ? team.division
                        : team.division?.name ?? "Unavailable",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (status: AdminTeam["status"]) => (
                      <Tag color={statusColor(status)}>
                        {status.toUpperCase()}
                      </Tag>
                    ),
                  },
                  {
                    title: "Submitted",
                    dataIndex: "createdAt",
                    render: (date: string) =>
                      dayjs(date).format("MMM D, YYYY"),
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card
              title="Active seasons"
              extra={<Link href="/admin/seasons">View all</Link>}
            >
              {loading ? (
                <Skeleton active />
              ) : !data?.activeSeasons.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    error
                      ? "Season data is unavailable."
                      : "No active seasons yet."
                  }
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {data.activeSeasons.map((season) => (
                    <div
                      key={season._id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <Text strong className="mb-2 block">
                        {season.name}
                      </Text>

                      <Tag
                        color={
                          season.status === "ongoing"
                            ? "green"
                            : season.status === "registration_open"
                              ? "blue"
                              : "orange"
                        }
                      >
                        {seasonLabels[season.status]}
                      </Tag>

                      <Text
                        type="secondary"
                        className="mt-3 block text-xs!"
                      >
                        {dayjs(season.startDate).format("MMM D, YYYY")}
                        {" – "}
                        {dayjs(season.endDate).format("MMM D, YYYY")}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {selectedTeam && (
          <TeamDetailsModal
            key={selectedTeam._id}
            team={selectedTeam}
            seasonId={seasonIdOf(selectedTeam)}
            onClose={() => setSelectedTeam(null)}
          />
        )}
      </div>
    </main>
  );
}