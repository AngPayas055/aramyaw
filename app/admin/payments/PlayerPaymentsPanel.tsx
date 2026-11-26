"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Modal, Select, Space, Table, Tabs } from "antd";
import type { PaymentStatus } from "@/services/payment.service";
import {
  getPendingPlayerPayments,
  reviewPlayerPayment,
  type PendingPlayerPayment,
} from "@/services/admin-payment.service";

type Selection = {
  payment: PendingPlayerPayment;
  status: "paid" | "rejected";
};

const pesos = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

const paymentDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export default function PlayerPaymentsPanel() {
  const [payments, setPayments] = useState<PendingPlayerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [reason, setReason] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<"all" | PendingPlayerPayment["method"]>("all");
  const [revision, setRevision] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPayments() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please sign in again.");

        const { payments } = await getPendingPlayerPayments(
          token,
          controller.signal,
          paymentStatus,
        );
        if (!controller.signal.aborted) setPayments(payments);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load player payments.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPayments();

    return () => controller.abort();
  }, [revision, paymentStatus]);
  
  function refreshPayments() {
    setLoadError("");
    setLoading(true);
    setRevision((current) => current + 1);
  }

  function openReview(payment: PendingPlayerPayment, status: Selection["status"]) {
    setReason("");
    setReviewError("");
    setSelection({ payment, status });
  }

  async function confirmReview() {
    if (!selection || saving) return;

    const { payment, status } = selection;
    const rejectionReason = reason.trim();

    if (status === "rejected" && !rejectionReason) return;

    setSaving(true);
    setReviewError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in again.");

      await reviewPlayerPayment(
        token,
        payment._id,
        status === "paid" ? { status } : { status, rejectionReason },
      );

      setPayments((current) => current.filter((item) => item._id !== payment._id));
      setSelection(null);
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Could not review the payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  const rejecting = selection?.status === "rejected";

  const visiblePayments =
  method === "all"
    ? payments
    : payments.filter((payment) => payment.method === method);

  return (
    <Card title="Player payments" className="mb-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          aria-label="Filter player payments by payment method"
          className="w-full sm:w-52"
          value={method}
          onChange={setMethod}
          options={[
            { value: "all", label: "All payment methods" },
            { value: "gcash", label: "GCash" },
            { value: "maya", label: "Maya" },
          ]}
        />
        <Button
          loading={loading}
          disabled={selection !== null}
          onClick={refreshPayments}
        >
          Refresh
        </Button>
        {!loading && !loadError && (
          <span className="text-sm text-gray-600">
            {visiblePayments.length} payments
          </span>
        )}
      </div>
      <Tabs 
        activeKey={paymentStatus}
        items={[
          { key: "pending", label: "For verification" },
          { key: "paid", label: "Paid" },
          { key: "rejected", label: "Rejected" },
        ]}
        onChange={(key) => {
          if (key !== "pending" && key !== "paid" && key !== "rejected") return;

          setLoadError("");
          setPayments([]);
          setLoading(true);
          setPaymentStatus(key);
        }}
      />

      {loadError && <Alert type="error" title={loadError} showIcon />}

      {!loadError && (
        <Table<PendingPlayerPayment>
          key={`${paymentStatus}:${method}`}
          rowKey="_id"
          dataSource={payments}
          loading={loading}
          scroll={{ x: 850 }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{ emptyText: "No player payments match this view." }}
          columns={[
            {
              title: "Player",
              render: (_, { player }) =>
                player ? `${player.firstName} ${player.lastName}` : "Unavailable",
            },
            {
              title: "Registration",
              render: (_, payment) =>
                [payment.season?.name, payment.division?.name, payment.team?.name]
                  .filter(Boolean)
                  .join(" · ") || "Unavailable",
            },
            {
              title: "Expected fee",
              render: (_, payment) =>
                pesos.format(payment.expectedAmountCentavos / 100),
            },
            {
              title: "Transfer",
              render: (_, payment) => (
                <div>
                  <div>{payment.method === "gcash" ? "GCash" : "Maya"}</div>
                  <div>{payment.referenceNumber}</div>
                  <div>{paymentDate.format(new Date(payment.paidAt))}</div>
                </div>
              ),
            },
            {
              title: paymentStatus === "pending" ? "Review" : "Result",
              render: (_, payment) => {
                if (payment.status === "paid") return "Paid";

                if (payment.status === "rejected") {
                  return payment.rejectionReason || "Rejected";
                }

                return (
                  <Space>
                    <Button type="primary" onClick={() => openReview(payment, "paid")}>
                      Mark paid
                    </Button>
                    <Button danger onClick={() => openReview(payment, "rejected")}>
                      Reject
                    </Button>
                  </Space>
                );
              },
            },
          ]}
        />
      )}

      <Modal
        open={selection !== null}
        title={rejecting ? "Reject player payment" : "Mark player payment as paid"}
        okText={rejecting ? "Reject payment" : "Mark paid"}
        okButtonProps={{ danger: rejecting, disabled: rejecting && !reason.trim() }}
        cancelButtonProps={{ disabled: saving }}
        confirmLoading={saving}
        onOk={() => void confirmReview()}
        onCancel={() => {
          if (!saving) setSelection(null);
        }}
      >
        {reviewError && <Alert className="mb-3" type="error" title={reviewError} showIcon />}

        {rejecting ? (
          <div>
            <label htmlFor="player-payment-reason">Rejection reason</label>
            <Input.TextArea
              id="player-payment-reason"
              className="mt-2"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              disabled={saving}
            />
          </div>
        ) : (
          selection && (
            <p>
              Confirm that you received{" "}
              {pesos.format(selection.payment.expectedAmountCentavos / 100)} for
              reference <strong>{selection.payment.referenceNumber}</strong>.
            </p>
          )
        )}
      </Modal>
    </Card>
  );
}