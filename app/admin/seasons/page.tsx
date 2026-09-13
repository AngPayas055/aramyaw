"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

import {
  createSeason,
  getSeasons,
  updateSeason,
} from "@/services/season.service";

import type {
  Season,
  SeasonStatus,
  SeasonsResponse,
} from "@/types/season";

const { Title, Text } = Typography;

const statusOptions: {
  label: string;
  value: SeasonStatus;
}[] = [
  { label: "Draft", value: "draft" },
  { label: "Registration Open", value: "registration_open" },
  { label: "Registration Closed", value: "registration_closed" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

interface SeasonFormValues {
  name: string;
  description?: string;
  startDate: Dayjs;
  endDate: Dayjs;
  registrationOpensAt: Dayjs;
  registrationClosesAt: Dayjs;
  status?: SeasonStatus;
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

export default function SeasonsPage() {
  const [form] = Form.useForm<SeasonFormValues>();

  const [result, setResult] = useState<SeasonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getSeasons(getToken(), {
          page,
          limit: 10,
        });

        if (active) {
          setResult(data);
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
  }, [page, revision]);

  function refresh() {
    setLoading(true);
    setRevision((value) => value + 1);
  }

  function openCreate() {
    setEditingSeason(null);
    setFormError("");
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(season: Season) {
    setEditingSeason(season);
    setFormError("");
    form.resetFields();

    form.setFieldsValue({
      name: season.name,
      description: season.description,
      startDate: dayjs(season.startDate),
      endDate: dayjs(season.endDate),
      registrationOpensAt: dayjs(season.registrationOpensAt),
      registrationClosesAt: dayjs(season.registrationClosesAt),
      status: season.status,
    });

    setModalOpen(true);
  }

  async function handleSubmit(values: SeasonFormValues) {
    setSaving(true);
    setFormError("");

    try {
      const token = getToken();

      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() ?? "",
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        registrationOpensAt: values.registrationOpensAt.toISOString(),
        registrationClosesAt:
          values.registrationClosesAt.toISOString(),
      };

      if (editingSeason) {
        await updateSeason(
          editingSeason._id,
          {
            ...payload,
            status: values.status,
          },
          token,
        );
      } else {
        await createSeason(payload, token);
      }

      setNotice(
        editingSeason
          ? "Season updated successfully."
          : "Season created as a draft. Add its divisions next.",
      );

      setModalOpen(false);
      refresh();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={2} className="mb-1!">
            Seasons
          </Title>

          <Text type="secondary">
            Create seasons, configure divisions, and open registration.
          </Text>
        </div>

        <Button type="primary" onClick={openCreate}>
          Create Season
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

      <Card>
        <Table<Season>
          rowKey="_id"
          loading={loading}
          dataSource={result?.seasons ?? []}
          scroll={{ x: 850 }}
          pagination={{
            current: page,
            pageSize: 10,
            total: result?.pagination.total ?? 0,
            showSizeChanger: false,
            onChange: (nextPage) => {
              setLoading(true);
              setPage(nextPage);
            },
          }}
          columns={[
            {
              title: "Season",
              dataIndex: "name",
              render: (name: string, season) => (
                <Link href={`/admin/seasons/${season._id}`}>
                  {name}
                </Link>
              ),
            },
            {
              title: "Dates",
              render: (_, season) => (
                <span>
                  {dayjs(season.startDate).format("MMM D, YYYY")}
                  {" – "}
                  {dayjs(season.endDate).format("MMM D, YYYY")}
                </span>
              ),
            },
            {
              title: "Registration Deadline",
              dataIndex: "registrationClosesAt",
              render: (value: string) =>
                dayjs(value).format("MMM D, YYYY h:mm A"),
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: SeasonStatus) => (
                <Tag
                  color={
                    status === "registration_open"
                      ? "green"
                      : status === "ongoing"
                        ? "blue"
                        : status === "cancelled"
                          ? "red"
                          : "default"
                  }
                >
                  {statusOptions.find(
                    (option) => option.value === status,
                  )?.label ?? status}
                </Tag>
              ),
            },
            {
              title: "Actions",
              render: (_, season) => (
                <Space>
                  <Button onClick={() => openEdit(season)}>
                    Edit
                  </Button>

                  <Link href={`/admin/seasons/${season._id}`}>
                    <Button>Divisions</Button>
                  </Link>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingSeason ? "Edit Season" : "Create Season"}
        open={modalOpen}
        onCancel={() => {
          if (!saving) setModalOpen(false);
        }}
        closable={!saving}
        mask={{ closable: !saving }}
        keyboard={!saving}
        footer={null}
        width={680}
      >
        {formError && (
          <Alert
            className="mb-4"
            type="error"
            title={formError}
            showIcon
          />
        )}

        <Form<SeasonFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={saving}
        >
          <Form.Item
            name="name"
            label="Season Name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Enter a season name.",
              },
            ]}
          >
            <Input placeholder="Aramyaw 4th Quarter 2026" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Select a start date." }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="End Date"
              dependencies={["startDate"]}
              rules={[
                { required: true, message: "Select an end date." },
                ({ getFieldValue }) => ({
                  validator(_, value: Dayjs | undefined) {
                    const start = getFieldValue("startDate") as
                      | Dayjs
                      | undefined;

                    if (!value || !start || !value.isBefore(start)) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("End date cannot precede start date."),
                    );
                  },
                }),
              ]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="registrationOpensAt"
              label="Registration Opens"
              rules={[
                {
                  required: true,
                  message: "Select when registration opens.",
                },
              ]}
            >
              <DatePicker
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>

            <Form.Item
              name="registrationClosesAt"
              label="Registration Closes"
              dependencies={["registrationOpensAt"]}
              rules={[
                {
                  required: true,
                  message: "Select when registration closes.",
                },
                ({ getFieldValue }) => ({
                  validator(_, value: Dayjs | undefined) {
                    const opens = getFieldValue(
                      "registrationOpensAt",
                    ) as Dayjs | undefined;

                    if (!value || !opens || value.isAfter(opens)) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error(
                        "Closing time must be after opening time.",
                      ),
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full"
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>
          </div>

          {editingSeason ? (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select options={statusOptions} />
            </Form.Item>
          ) : (
            <Text type="secondary">
              New seasons start as drafts.
            </Text>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              {editingSeason ? "Save Changes" : "Create Season"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}