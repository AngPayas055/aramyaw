"use client";

import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <Title level={2} className="!mb-1">
          Admin Dashboard
        </Title>

        <Text type="secondary">
          Manage Aramyaw BallClub leagues, teams, players, and registrations.
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Leagues"
              value={0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Registered Teams"
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Players"
              value={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Registrations"
              value={0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}