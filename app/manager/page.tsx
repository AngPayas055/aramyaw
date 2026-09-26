"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Typography } from "antd";
import { ArrowRightOutlined, LogoutOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function ManagerPage() {
  const router = useRouter();

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
          Join an open league and manage your team registration here.
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
          <Text type="secondary">
            Team registrations will appear here when registration goes live.
          </Text>
        </Card>
      </div>
    </main>
  );
}
