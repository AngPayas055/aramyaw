"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import TeamPaymentStatusTag from "./TeamPaymentStatusTag";
import { PAYMENTS_CHANGED } from "@/services/admin-payment.service";
import {
  getTeamPayments,
  submitTeamPayment,
  reviewPayment,
  type PaymentMethod,
  type TeamPayments,
} from "@/services/payment.service";

const { Text } = Typography;

type Props = {
  seasonId: string;
  teamId: string;
  teamStatus: "pending" | "approved" | "rejected";
  admin?: boolean;
  onPaymentReviewed?: (status: "paid" | "rejected") => void;
};

type PaymentFormValues = {
  method: PaymentMethod;
  referenceNumber: string;
  paidAt: string;
};

function money(centavos: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(centavos / 100);
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
}

function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

function errorMessage(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Could not process payment.";
}

// Reset payment state when switching between teams.
export default function TeamPaymentPanel(props: Props) {
  return (
    <PaymentPanelContent
      key={`${props.seasonId}:${props.teamId}:${Boolean(props.admin)}`}
      {...props}
    />
  );
}

function PaymentPanelContent({
  seasonId,
  teamId,
  teamStatus,
  admin = false,
  onPaymentReviewed,
}: Props) {
  const [form] = Form.useForm<PaymentFormValues>();

  const [data, setData] = useState<TeamPayments | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [revision, setRevision] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const result = await getTeamPayments(
          seasonId,
          teamId,
          getToken(),
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [seasonId, teamId, revision]);

  function refresh() {
    setLoading(true);
    setData(null);
    setError("");
    setSuccess("");
    setRevision((current) => current + 1);
  }

  async function submit(values: PaymentFormValues) {
    if (!data || saving) return;

    const paidAt = new Date(values.paidAt);

    if (
      Number.isNaN(paidAt.getTime()) ||
      paidAt.getTime() > Date.now()
    ) {
      setError("Enter a valid payment date that is not in the future.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await submitTeamPayment(
        seasonId,
        teamId,
        getToken(),
        {
          method: values.method,
          referenceNumber: values.referenceNumber.trim(),
          amountCentavos: data.amountDueCentavos,
          paidAt: paidAt.toISOString(),
        },
      );

      setData((current) =>
        current
          ? {
              ...current,
              paymentStatus: "pending",
              payments: [result.payment, ...current.payments],
            }
          : current,
      );

      form.resetFields();
      setSuccess(result.message);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function review(status: "paid" | "rejected") {
    const pending = data?.payments.find(
      (payment) => payment.status === "pending",
    );

    if (!pending || saving) return;

    const reason = rejectionReason.trim();

    if (status === "rejected" && !reason) {
      setError("Enter a rejection reason.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await reviewPayment(
        seasonId,
        teamId,
        pending._id,
        getToken(),
        {
          status,
          ...(status === "rejected"
            ? { rejectionReason: reason }
            : {}),
        },
      );

      setData((current) =>
        current
          ? {
              ...current,
              paymentStatus: status,
              payments: current.payments.map((payment) =>
                payment._id === result.payment._id
                  ? result.payment
                  : payment,
              ),
            }
          : current,
      );

      setRejectionReason("");
      setSuccess(result.message);

      onPaymentReviewed?.(status);
      window.dispatchEvent(new Event(PAYMENTS_CHANGED));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    !admin &&
    teamStatus !== "rejected" &&
    data != null &&
    data.amountDueCentavos > 0 &&
    (data.paymentStatus === "unpaid" ||
      data.paymentStatus === "rejected");

  const pendingPayment = data?.payments.find(
    (payment) => payment.status === "pending",
  );

  return (
    <Card
      title="Registration payment"
      className="mb-4 mt-4"
      extra={
        <Button
          size="small"
          onClick={refresh}
          disabled={loading || saving}
        >
          Refresh
        </Button>
      }
    >
      <Space orientation="vertical" size="middle" className="w-full">
        {error && <Alert type="error" showIcon title={error} />}
        {success && <Alert type="success" showIcon title={success} />}

        {loading ? (
          <Spin />
        ) : data ? (
          <>
            <div>
              <Text strong>
                Registration fee: {money(data.amountDueCentavos)}
              </Text>
              <div className="mt-2">
                <TeamPaymentStatusTag status={data.paymentStatus} />
              </div>
            </div>

            {!admin && teamStatus === "rejected" && (
              <Alert
                type="warning"
                showIcon
                title="Payment submission is unavailable for a rejected team."
              />
            )}

            {!admin && data.paymentStatus === "pending" && (
              <Alert
                type="info"
                showIcon
                title="Your payment is awaiting verification."
                description="Please do not send another payment while this submission is being checked."
              />
            )}

            {canSubmit && (
              <>
                <Alert
                  type="info"
                  showIcon
                  title={`Send exactly ${money(data.amountDueCentavos)} to one account below.`}
                  description="After transferring through GCash or Maya, submit the transaction details here."
                />

                {data.accounts.map((account) => (
                  <div
                    key={account.method}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <Text strong>
                      {account.method === "gcash" ? "GCash" : "Maya"}
                    </Text>
                    <div>{account.accountName}</div>
                    <Text copyable={{ text: account.accountNumber }}>
                      {account.accountNumber}
                    </Text>
                  </div>
                ))}

                <Form<PaymentFormValues>
                  form={form}
                  layout="vertical"
                  onFinish={submit}
                  disabled={saving}
                >
                  <Form.Item
                    label="Payment method"
                    name="method"
                    rules={[
                      { required: true, message: "Select a payment method." },
                    ]}
                  >
                    <Select
                      placeholder="Select GCash or Maya"
                      options={[
                        { label: "GCash", value: "gcash" },
                        { label: "Maya", value: "maya" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Reference number"
                    name="referenceNumber"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Enter the transaction reference number.",
                      },
                      {
                        pattern: /^[A-Za-z0-9-]{6,100}$/,
                        message:
                          "Use 6–100 letters, numbers or hyphens.",
                        transform: (value: string) => value?.trim(),
                      },
                    ]}
                  >
                    <Input
                      maxLength={100}
                      placeholder="Reference from your transaction"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Date and time paid"
                    name="paidAt"
                    extra="Enter the time shown on your receipt, using your device's local time."
                    rules={[
                      {
                        required: true,
                        message: "Enter the payment date and time.",
                      },
                    ]}
                  >
                    <Input type="datetime-local" />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" loading={saving}>
                    Submit payment details
                  </Button>
                </Form>
              </>
            )}

            {admin && pendingPayment && (
              <div className="rounded-lg border border-gray-200 p-4">
                <Alert
                  type="warning"
                  showIcon
                  title="Check the receiving account before confirming."
                  description="Match the reference number, amount and payment date to the actual transaction."
                />

                <div className="mt-3">
                  <label htmlFor={`payment-rejection-${teamId}`}>
                    Rejection reason
                  </label>
                  <Input.TextArea
                    id={`payment-rejection-${teamId}`}
                    className="mt-1"
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(event.target.value)
                    }
                    maxLength={500}
                    rows={2}
                    disabled={saving}
                    placeholder="Required when rejecting"
                  />
                </div>

                <Space wrap className="mt-3">
                  <Popconfirm
                    title="Confirm payment received?"
                    description="Confirm only after checking the receiving account."
                    onConfirm={() => review("paid")}
                    disabled={saving}
                  >
                    <Button type="primary" loading={saving}>
                      Confirm payment
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Reject this submission?"
                    onConfirm={() => review("rejected")}
                    disabled={saving || !rejectionReason.trim()}
                  >
                    <Button
                      danger
                      disabled={saving || !rejectionReason.trim()}
                    >
                      Reject
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            )}

            {data.payments.length > 0 && (
              <div>
                <Text strong>Payment history</Text>

                {data.payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="mt-3 rounded-lg border border-gray-200 p-3"
                  >
                    <TeamPaymentStatusTag status={payment.status} />

                    <Descriptions
                      size="small"
                      column={1}
                      className="mt-2"
                      items={[
                        {
                          key: "method",
                          label: "Method",
                          children:
                            payment.method === "gcash" ? "GCash" : "Maya",
                        },
                        {
                          key: "reference",
                          label: "Reference",
                          children: (
                            <Text
                              copyable
                              style={{ overflowWrap: "anywhere" }}
                            >
                              {payment.referenceNumber}
                            </Text>
                          ),
                        },
                        {
                          key: "amount",
                          label: "Amount",
                          children: money(payment.amountCentavos),
                        },
                        {
                          key: "paid",
                          label: "Paid at (PH time)",
                          children: dateTime(payment.paidAt),
                        },
                        {
                          key: "submitted",
                          label: "Submitted (PH time)",
                          children: dateTime(payment.createdAt),
                        },
                      ]}
                    />

                    {payment.rejectionReason && (
                      <Alert
                        type="error"
                        showIcon
                        title={payment.rejectionReason}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </Space>
    </Card>
  );
}