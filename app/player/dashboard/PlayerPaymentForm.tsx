"use client";

import { useEffect, useState } from "react";
import { Alert, Button, DatePicker, Form, Input, Select, Tag } from "antd";
import type { Dayjs } from "dayjs";

import { apiUrl } from "@/services/api";

type Payment = {
  status: "pending" | "paid" | "rejected";
  expectedAmountCentavos: number;
};

type PaymentValues = {
  method: "gcash" | "maya";
  referenceNumber: string;
  paidAt: Dayjs;
};

type Props = {
  teamId: string;
  token: string;
  feeCentavos?: number | null;
};

export default function PlayerPaymentForm({
  teamId,
  token,
  feeCentavos,
}: Props) {
  const [payment, setPayment] = useState<Payment | null | undefined>();
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const url = apiUrl(
    `/api/auth/player-teams/${encodeURIComponent(teamId)}/payments`,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadPayment() {
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load your payment status.");
        }

        const data: { payment: Payment | null } = await response.json();

        if (!controller.signal.aborted) {
          setPayment(data.payment);
        }
      } catch {
        if (!controller.signal.aborted) {
          setLoadError("Could not load your payment status. Refresh to try again.");
        }
      }
    }

    void loadPayment();
    return () => controller.abort();
  }, [token, url]);

  async function submitPayment(values: PaymentValues) {
    setSaving(true);
    setSubmitError("");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: values.method,
          referenceNumber: values.referenceNumber.trim(),
          paidAt: values.paidAt.toISOString(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Could not submit your payment.");
      }

      setPayment(data.payment);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not submit your payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return <Alert className="mt-3" type="error" title={loadError} showIcon />;
  }

  if (payment === undefined) {
    return <p className="mt-3 text-sm">Loading payment status…</p>;
  }

  if (payment?.status === "pending" || payment?.status === "paid") {
    return (
      <div className="mt-3">
        {payment.status === "paid" ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="gold">Pending review</Tag>
        )}
      </div>
    );
  }

  if (feeCentavos == null || feeCentavos <= 0) return null;

  return (
    <Form<PaymentValues>
      layout="vertical"
      className="mt-4 max-w-md"
      onFinish={submitPayment}
      disabled={saving}
    >
      {payment?.status === "rejected" && (
        <Alert
          className="mb-3"
          type="warning"
          title="Your previous payment was rejected. You can submit again."
          showIcon
        />
      )}

      {submitError && (
        <Alert className="mb-3" type="error" title={submitError} showIcon />
      )}

      <Form.Item name="method" label="Payment method" rules={[{ required: true }]}>
        <Select
          options={[
            { value: "gcash", label: "GCash" },
            { value: "maya", label: "Maya" },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="referenceNumber"
        label="Reference number"
        rules={[{ required: true, whitespace: true }]}
      >
        <Input maxLength={100} />
      </Form.Item>

      <Form.Item name="paidAt" label="Payment date and time" rules={[{ required: true }]}>
        <DatePicker showTime className="w-full" />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={saving}>
        Submit payment
      </Button>
    </Form>
  );
}