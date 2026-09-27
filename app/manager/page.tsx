"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Empty, Spin, Tag, Typography } from "antd";
import {
  ArrowRightOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { getSeasons } from "@/services/season.service";
import { getMyTeams, type Team } from "@/services/team.service";

const { Title, Text, Paragraph } = Typography;

function label(value: Team["season"] | Team["division"]): string {
  return typeof value === "string" ? value : value.name;
}

type DivisionDetails = {
  name: string;
  minAge?: number;
  maxAge?: number;
  minPlayers?: number;
  maxPlayers?: number;
};

function getDivisionDetails(
  division: Team["division"],
): DivisionDetails | null {
  return typeof division === "string"
    ? null
    : (division as DivisionDetails);
}

export default function ManagerPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeams() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        const seasonsResponse = await getSeasons(token, {
          page: 1,
          limit: 100,
        });

        const results = await Promise.all(
          seasonsResponse.seasons.map((season) =>
            getMyTeams(season._id, token),
          ),
        );

        setTeams(
          results
            .flatMap((result) => result.teams)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
        );
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load your teams.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTeams();
  }, [router]);

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/signin");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-[#f15a24]">
            ARAMYAW BALLCLUB
          </Link>
          <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
            Sign out
          </Button>
        </header>

        <Title level={2}>Manager dashboard</Title>
        <Paragraph type="secondary">
          Join an open league and manage your team registrations here.
        </Paragraph>

        <Card className="mt-8">
          <div className="flex flex-col items-start gap-4">
            <TeamOutlined className="text-3xl text-[#f15a24]" />
            <div>
              <Title level={4}>Ready to join a league?</Title>
              <Text type="secondary">
                Choose a division and enter your team details.
              </Text>
            </div>
            <Link href="/join-league">
              <Button type="primary" icon={<ArrowRightOutlined />}>
                Join a League
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="mt-4" title="My teams">
          {loading ? (
            <Spin />
          ) : error ? (
            <Alert type="error" showIcon title={error} />
          ) : teams.length === 0 ? (
            <Empty description="You haven't registered a team yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {teams.map((team) => {
                const division = getDivisionDetails(team.division);

                return (
                  <Card key={team._id} size="small">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Text strong className="block">
                          {team.name}
                        </Text>
                        <Text type="secondary">
                          {label(team.season)} · {label(team.division)} · {team.barangay}
                        </Text>

                        {division && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {division.minAge != null && division.maxAge != null && (
                              <Tag>
                                Ages {division.minAge}–{division.maxAge}
                              </Tag>
                            )}
                            {division.minPlayers != null &&
                              division.maxPlayers != null && (
                                <Tag>
                                  {division.minPlayers}–{division.maxPlayers} players
                                </Tag>
                              )}
                          </div>
                        )}
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

                    {team.status === "rejected" && team.rejectionReason && (
                      <Paragraph className="mb-0 mt-3" type="danger">
                        Reason: {team.rejectionReason}
                      </Paragraph>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}