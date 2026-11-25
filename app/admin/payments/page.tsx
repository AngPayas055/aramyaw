"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Modal, Select, Space, Table, Tabs, Tag, Typography } from "antd";
import TeamPaymentPanel from "@/app/components/TeamPaymentPanel";
import { getSeasons } from "@/services/season.service";
import { getAdminPayments, PAYMENTS_CHANGED, type AdminPayment, type AdminPaymentsResult } from "@/services/admin-payment.service";
import type { PaymentStatus } from "@/services/payment.service";
import PlayerPaymentsPanel from "./PlayerPaymentsPanel";

const labels = { pending: "For verification", paid: "Paid", rejected: "Rejected" };
const colors = { pending: "orange", paid: "green", rejected: "red" };

export default function AdminPaymentsPage() {
  const [seasons, setSeasons] = useState<{ _id: string; name: string }[]>([]);
  const [seasonError, setSeasonError] = useState("");
  const [seasonId, setSeasonId] = useState<string>();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<AdminPayment | null>(null);

  useEffect(() => {
    let disposed = false;
    async function loadSeasons() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please sign in again.");
        const result = await getSeasons(token, { page: 1, limit: 100 });
        if (!disposed) setSeasons(result.seasons);
      } catch (cause) {
        if (!disposed) setSeasonError(cause instanceof Error ? cause.message : "Unable to load seasons.");
      }
    }
    void loadSeasons();
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    function reload() { setRevision((value) => value + 1); }
    window.addEventListener(PAYMENTS_CHANGED, reload);
    return () => window.removeEventListener(PAYMENTS_CHANGED, reload);
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl p-6">
      <Typography.Title level={2}>Payments</Typography.Title>
      <Typography.Title level={2}>Payments</Typography.Title>
      <PlayerPaymentsPanel />
      <Typography.Paragraph type="secondary">
        Review registration payments across teams. Dates are shown in Philippine time.
      </Typography.Paragraph>
      {seasonError && <Alert className="mb-4" type="error" showIcon title={seasonError} />}
      <Space wrap className="mb-4">
        <Select
          aria-label="Filter payments by season"
          style={{ minWidth: 240 }}
          value={seasonId ?? "all"}
          onChange={(value) => { setSeasonId(value === "all" ? undefined : value); setPage(1); }}
          options={[{ value: "all", label: "All seasons" }, ...seasons.map((season) => ({ value: season._id, label: season.name }))]}
        />
        <Button onClick={() => window.dispatchEvent(new Event(PAYMENTS_CHANGED))}>Refresh</Button>
      </Space>
      <Tabs
        activeKey={status}
        onChange={(value) => { setStatus(value as PaymentStatus); setPage(1); }}
        items={(Object.keys(labels) as PaymentStatus[]).map((key) => ({ key, label: labels[key] }))}
      />
      <PaymentResults
        key={`${seasonId ?? "all"}:${status}:${page}:${revision}`}
        seasonId={seasonId}
        status={status}
        page={page}
        onPageChange={setPage}
        onSelect={setSelected}
      />
      {selected?.team && selected.season && (
        <Modal title={`${selected.team.name} — payment`} open footer={null} width={760} onCancel={() => setSelected(null)}>
          <TeamPaymentPanel seasonId={selected.season._id} teamId={selected.team._id} teamStatus={selected.team.status} admin />
        </Modal>
      )}
    </main>
  );
}

function PaymentResults({ seasonId, status, page, onPageChange, onSelect }: {
  seasonId?: string;
  status: PaymentStatus;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (payment: AdminPayment) => void;
}) {
  const [data, setData] = useState<AdminPaymentsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please sign in again.");
        const result = await getAdminPayments(token, { seasonId, status, page, limit: 20 }, controller.signal);
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, Math.ceil(result.total / 20));
        if (page > lastPage) { onPageChange(lastPage); return; }
        setData(result);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load payments.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [seasonId, status, page, onPageChange]);

  return (
    <>
      {error && <Alert type="error" showIcon title={error} className="mb-4" />}
      {data && <Typography.Paragraph type="secondary">For verification: {data.counts.pending} · Paid: {data.counts.paid} · Rejected: {data.counts.rejected}</Typography.Paragraph>}
      <Table<AdminPayment>
        rowKey="_id"
        loading={loading}
        dataSource={data?.payments ?? []}
        scroll={{ x: 1050 }}
        pagination={{ current: page, pageSize: 20, total: data?.total ?? 0, showSizeChanger: false, onChange: onPageChange }}
        locale={{ emptyText: error ? "Payments could not be loaded." : "No payments in this category." }}
        columns={[
          { title: "Team", key: "team", render: (_, row) => <><strong>{row.team?.name ?? "Team unavailable"}</strong><br /><Typography.Text type="secondary">{row.season?.name ?? "Season unavailable"}</Typography.Text></> },
          { title: "Division", key: "division", render: (_, row) => row.team?.division?.name ?? "—" },
          { title: "Method", dataIndex: "method", render: (value: string) => value === "gcash" ? "GCash" : "Maya" },
          { title: "Amount", dataIndex: "amountCentavos", render: (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value / 100) },
          { title: "Reference", dataIndex: "referenceNumber", render: (value: string) => <Typography.Text copyable style={{ overflowWrap: "anywhere" }}>{value}</Typography.Text> },
          { title: "Date paid", dataIndex: "paidAt", render: (value: string) => new Date(value).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }) },
          { title: "Status", dataIndex: "status", render: (value: PaymentStatus) => <Tag color={colors[value]}>{labels[value]}</Tag> },
          { title: "Action", key: "action", render: (_, row) => <Button disabled={!row.team || !row.season} onClick={() => onSelect(row)}>{row.status === "pending" ? "Review" : "View"}</Button> },
        ]}
      />
    </>
  );
}
