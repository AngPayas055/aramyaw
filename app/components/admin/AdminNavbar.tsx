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

const items = [
  {
    key: "/admin",
    icon: <DashboardOutlined />,
    label: <Link href="/admin">Dashboard</Link>,
  },
  {
    key: "/admin/seasons",
    icon: <TrophyOutlined />,
    label: <Link href="/admin/seasons">Seasons</Link>,
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

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = items.find(
    ({ key }) =>
      key === pathname ||
      (key !== "/admin" && pathname.startsWith(`${key}/`)),
  )?.key;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/signin");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 py-2 sm:px-6">
        <Link
          href="/admin"
          className="whitespace-nowrap text-lg font-bold text-[#f15a24]"
        >
          Aramyaw Admin
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={items}
          className="order-3 w-full min-w-0 border-b-0! sm:order-0 sm:w-auto sm:flex-1"
        />

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="ml-auto"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}