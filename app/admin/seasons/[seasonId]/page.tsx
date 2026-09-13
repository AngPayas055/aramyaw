"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";

import { getSeasonById } from "@/services/season.service";
import {
  createDivision,
  getDivisions,
  updateDivision,
} from "@/services/division.service";

import type { Season } from "@/types/season";
import type {
  Division,
  TournamentFormat,
} from "@/types/division";

const { Title, Text } = Typography;

const formatOptions: {
  label: string;
  value: TournamentFormat;
}[] = [
  { label: "Single Round Robin", value: "single_round_robin" },
  { label: "Double Round Robin", value: "double_round_robin" },
  { label: "Single Elimination", value: "single_elimination" },
  { label: "Round Robin + Playoffs", value: "round_robin_playoffs" },
];

interface DivisionFormValues {
  name: string;
  description?: string;
  minAge?: number | null;
  maxAge?: number | null;
  ageCutoffDate?: Dayjs | null;
  maxTeams: number;
  minPlayers: number;
  maxPlayers: number;
  registrationFeePesos: number;
  tournamentFormat: TournamentFormat;
  playoffTeams?: number | null;
  registrationEnabled: boolean;
}

function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

export default function SeasonDivisionsPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [form] = Form.useForm<DivisionFormValues>();

  const [data, setData] = useState<{
    season: Season;
    divisions: Division[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] =
    useState<Division | null>(null);

  const tournamentFormat = Form.useWatch("tournamentFormat", form);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const token = getToken();

        const [seasonResult, divisionResult] = await Promise.all([
          getSeasonById(seasonId, token),
          getDivisions(seasonId, token),
        ]);

        if (active) {
          setData({
            season: seasonResult.season,
            divisions: divisionResult.divisions,
          });
          setError("");
        }
      } catch (error) {
        if (active) {
          setError(errorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [seasonId, revision]);

  function refresh() {
    setLoading(true);
    setRevision((value) => value + 1);
  }

  function openCreate() {
    setEditingDivision(null);
    setFormError("");
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(division: Division) {
    setEditingDivision(division);
    setFormError("");
    form.resetFields();

    form.setFieldsValue({
      name: division.name,
      description: division.description,
      minAge: division.minAge,
      maxAge: division.maxAge,
      ageCutoffDate: division.ageCutoffDate
        ? dayjs(division.ageCutoffDate)
        : null,
      maxTeams: division.maxTeams,
      minPlayers: division.minPlayers,
      maxPlayers: division.maxPlayers,
      registrationFeePesos: division.registrationFeeCentavos / 100,
      tournamentFormat: division.tournamentFormat,
      playoffTeams: division.playoffTeams,
      registrationEnabled: division.registrationEnabled,
    });

    setModalOpen(true);
  }

  async function handleSubmit(values: DivisionFormValues) {
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() ?? "",
        minAge: values.minAge ?? null,
        maxAge: values.maxAge ?? null,
        ageCutoffDate: values.ageCutoffDate?.toISOString() ?? null,
        maxTeams: values.maxTeams,
        minPlayers: values.minPlayers,
        maxPlayers: values.maxPlayers,
        registrationFeeCentavos: Math.round(
          values.registrationFeePesos * 100,
        ),
        tournamentFormat: values.tournamentFormat,
        playoffTeams:
          values.tournamentFormat === "round_robin_playoffs"
            ? values.playoffTeams
            : undefined,
        registrationEnabled: values.registrationEnabled,
      };

      const token = getToken();

      if (editingDivision) {
        await updateDivision(
          seasonId,
          editingDivision._id,
          payload,
          token,
        );
      } else {
        await createDivision(seasonId, payload, token);
      }

      setNotice(
        editingDivision
          ? "Division updated successfully."
          : "Division created successfully.",
      );

      setModalOpen(false);
      refresh();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <Link href="/admin/seasons">← Back to Seasons</Link>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <Alert
            className="mt-4"
            type="error"
            title={error || "Unable to load season."}
            showIcon
            action={
              <Button onClick={refresh}>
                Retry
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <Link href="/admin/seasons">← Back to Seasons</Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={2} className="mb-1!">
            {data.season.name}
          </Title>

          <Text type="secondary">
            Configure the divisions available in this season.
          </Text>
        </div>

        <Button type="primary" onClick={openCreate}>
          Add Division
        </Button>
      </div>

      {notice && (
        <Alert
          className="mb-4"
          type="success"
          title={notice}
          showIcon
          closable
          afterClose={() => setNotice("")}
        />
      )}

      {error && (
        <Alert
          className="mb-4"
          type="error"
          title={error}
          showIcon
          action={
            <Button size="small" onClick={refresh}>
              Retry
            </Button>
          }
        />
      )}

      <Card className="mb-6">
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          items={[
            {
              key: "status",
              label: "Status",
              children: (
                <Tag>
                  {data.season.status.replaceAll("_", " ")}
                </Tag>
              ),
            },
            {
              key: "dates",
              label: "Season Dates",
              children: `${dayjs(data.season.startDate).format(
                "MMM D, YYYY",
              )} – ${dayjs(data.season.endDate).format(
                "MMM D, YYYY",
              )}`,
            },
            {
              key: "registration",
              label: "Registration",
              children: `${dayjs(
                data.season.registrationOpensAt,
              ).format("MMM D, YYYY h:mm A")} – ${dayjs(
                data.season.registrationClosesAt,
              ).format("MMM D, YYYY h:mm A")}`,
              span: { xs: 1, sm: 2 },
            },
          ]}
        />
      </Card>

      <Card title="Divisions">
        <Table<Division>
          rowKey="_id"
          loading={loading}
          dataSource={data.divisions}
          scroll={{ x: 850 }}
          pagination={false}
          locale={{
            emptyText: "No divisions yet. Add your first division.",
          }}
          columns={[
            {
              title: "Division",
              dataIndex: "name",
            },
            {
              title: "Age",
              render: (_, division) => {
                if (
                  division.minAge == null &&
                  division.maxAge == null
                ) {
                  return "Unrestricted";
                }

                if (division.minAge == null) {
                  return `Up to ${division.maxAge}`;
                }

                if (division.maxAge == null) {
                  return `${division.minAge}+`;
                }

                return `${division.minAge}–${division.maxAge}`;
              },
            },
            {
              title: "Team Limit",
              dataIndex: "maxTeams",
            },
            {
              title: "Roster",
              render: (_, division) =>
                `${division.minPlayers}–${division.maxPlayers}`,
            },
            {
              title: "Fee",
              dataIndex: "registrationFeeCentavos",
              render: (value: number) =>
                new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(value / 100),
            },
            {
              title: "Format",
              dataIndex: "tournamentFormat",
              render: (value: TournamentFormat) =>
                formatOptions.find(
                  (option) => option.value === value,
                )?.label ?? value,
            },
            {
              title: "Registration Enabled",
              dataIndex: "registrationEnabled",
              render: (enabled: boolean) => (
                <Tag color={enabled ? "green" : "default"}>
                  {enabled ? "Yes" : "No"}
                </Tag>
              ),
            },
            {
              title: "Actions",
              render: (_, division) => (
                <Button onClick={() => openEdit(division)}>
                  Edit
                </Button>
              ),
            },
          ]}
        />

        <div className="mt-4">
          <Text type="secondary">
            Registration also requires an open season and valid
            registration dates.
          </Text>
        </div>
      </Card>

      <Modal
        title={editingDivision ? "Edit Division" : "Add Division"}
        open={modalOpen}
        onCancel={() => {
          if (!saving) setModalOpen(false);
        }}
        closable={!saving}
        mask={{ closable: !saving }}
        keyboard={!saving}
        footer={null}
        width={720}
      >
        {formError && (
          <Alert
            className="mb-4"
            type="error"
            title={formError}
            showIcon
          />
        )}

        <Form<DivisionFormValues>
          form={form}
          layout="vertical"
          disabled={saving}
          initialValues={{
            maxTeams: 8,
            minPlayers: 5,
            maxPlayers: 15,
            registrationFeePesos: 0,
            tournamentFormat: "single_round_robin",
            registrationEnabled: true,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Division Name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Enter a division name.",
              },
            ]}
          >
            <Input placeholder="Midget, Junior, or Senior" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="minAge"
              label="Minimum Age"
              rules={[{ type: "integer", min: 0 }]}
            >
              <InputNumber min={0} precision={0} className="w-full!" />
            </Form.Item>

            <Form.Item
              name="maxAge"
              label="Maximum Age"
              dependencies={["minAge"]}
              rules={[
                { type: "integer", min: 0 },
                ({ getFieldValue }) => ({
                  validator(_, value: number | null | undefined) {
                    const minAge = getFieldValue("minAge") as
                      | number
                      | null
                      | undefined;

                    if (
                      value == null ||
                      minAge == null ||
                      value >= minAge
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Maximum age cannot be below minimum age.",
                      ),
                    );
                  },
                }),
              ]}
            >
              <InputNumber min={0} precision={0} className="w-full!" />
            </Form.Item>
          </div>

          <Form.Item
            name="ageCutoffDate"
            label="Age Cutoff Date"
            dependencies={["minAge", "maxAge"]}
            extra="Leave age limits blank for an unrestricted division."
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value: Dayjs | null | undefined) {
                  const restricted =
                    getFieldValue("minAge") != null ||
                    getFieldValue("maxAge") != null;

                  if (!restricted || value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      "Select a cutoff date for age eligibility.",
                    ),
                  );
                },
              }),
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="maxTeams"
              label="Maximum Teams"
              rules={[
                { required: true, message: "Enter a team limit." },
                { type: "integer", min: 2 },
              ]}
            >
              <InputNumber min={2} precision={0} className="w-full!" />
            </Form.Item>

            <Form.Item
              name="registrationFeePesos"
              label="Registration Fee (₱)"
              rules={[
                { required: true, message: "Enter a fee, or 0." },
                { type: "number", min: 0 },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                step={100}
                className="w-full!"
              />
            </Form.Item>

            <Form.Item
              name="minPlayers"
              label="Minimum Players"
              rules={[
                { required: true },
                { type: "integer", min: 5 },
              ]}
            >
              <InputNumber min={5} precision={0} className="w-full!" />
            </Form.Item>

            <Form.Item
              name="maxPlayers"
              label="Maximum Players"
              dependencies={["minPlayers"]}
              rules={[
                { required: true },
                { type: "integer", min: 5 },
                ({ getFieldValue }) => ({
                  validator(_, value: number | null | undefined) {
                    const minPlayers = getFieldValue(
                      "minPlayers",
                    ) as number | undefined;

                    if (
                      value == null ||
                      minPlayers == null ||
                      value >= minPlayers
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Maximum players cannot be below minimum players.",
                      ),
                    );
                  },
                }),
              ]}
            >
              <InputNumber min={5} precision={0} className="w-full!" />
            </Form.Item>
          </div>

          <Form.Item
            name="tournamentFormat"
            label="Tournament Format"
            rules={[{ required: true }]}
          >
            <Select options={formatOptions} />
          </Form.Item>

          {tournamentFormat === "round_robin_playoffs" && (
            <Form.Item
              name="playoffTeams"
              label="Teams Advancing to Playoffs"
              dependencies={["maxTeams"]}
              rules={[
                { required: true },
                { type: "integer", min: 2 },
                ({ getFieldValue }) => ({
                  validator(_, value: number | null | undefined) {
                    const maxTeams = getFieldValue(
                      "maxTeams",
                    ) as number | undefined;

                    if (
                      value == null ||
                      maxTeams == null ||
                      value <= maxTeams
                    ) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Playoff teams cannot exceed the team limit.",
                      ),
                    );
                  },
                }),
              ]}
            >
              <InputNumber min={2} precision={0} className="w-full!" />
            </Form.Item>
          )}

          <Form.Item
            name="registrationEnabled"
            label="Enable Registration for This Division"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              {editingDivision ? "Save Changes" : "Add Division"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}