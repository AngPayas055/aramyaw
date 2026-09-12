"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Menu } from "antd";
import {
  DashboardOutlined,
  TrophyOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/signin");
  };

  const items = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/leagues",
      icon: <TrophyOutlined />,
      label: <Link href="/admin/leagues">Leagues</Link>,
    },
    {
      key: "/admin/teams",
      icon: <TeamOutlined />,
      label: <Link href="/admin/teams">Teams</Link>,
    },
    {
      key: "/admin/players",
      icon: <UserOutlined />,
      label: <Link href="/admin/players">Players</Link>,
    },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-6">
        <Link
          href="/admin"
          className="mr-8 whitespace-nowrap text-lg font-bold text-[#f15a24]"
        >
          Aramyaw Admin
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={items}
          className="min-w-0 flex-1 border-none"
        />

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}