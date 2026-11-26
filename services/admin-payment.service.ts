import { apiUrl } from "./api";
import type { Payment, PaymentStatus } from "./payment.service";

export const PAYMENTS_CHANGED = "aramyaw:payments-changed";

export interface AdminPayment extends Payment {
  team: {
    _id: string;
    name: string;
    status: "pending" | "approved" | "rejected";
    division: { _id: string; name: string } | null;
  } | null;
  season: { _id: string; name: string } | null;
}

export interface AdminPaymentsResult {
  payments: AdminPayment[];
  total: number;
  page: number;
  limit: number;
  counts: Record<PaymentStatus, number>;
}

export async function getAdminPayments(
  token: string,
  options: { seasonId?: string; status?: PaymentStatus; page?: number; limit?: number } = {},
  signal?: AbortSignal,
): Promise<AdminPaymentsResult> {
  const query = new URLSearchParams();
  if (options.seasonId) query.set("seasonId", options.seasonId);
  if (options.status) query.set("status", options.status);
  query.set("page", String(options.page ?? 1));
  query.set("limit", String(options.limit ?? 20));

  const response = await fetch(apiUrl(`/api/admin/payments?${query}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Unable to load payments.");
  }
  return response.json();
}

export type PendingPlayerPayment = {
  _id: string;
  player: { firstName: string; lastName: string } | null;
  team: { name: string } | null;
  season: { name: string } | null;
  division: { name: string } | null;
  method: "gcash" | "maya";
  referenceNumber: string;
  expectedAmountCentavos: number;
  paidAt: string;
  status: PaymentStatus;
  reviewedAt?: string;
  rejectionReason?: string;
};

export async function getPendingPlayerPayments(
  token: string,
  signal?: AbortSignal,
  status: PaymentStatus = "pending",
): Promise<{ payments: PendingPlayerPayment[] }> {
  const query = new URLSearchParams({ status });
  const response = await fetch(apiUrl(`/api/admin/player-payments?${query}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Could not load player payments.");
  }

  return response.json();
}

export async function reviewPlayerPayment(
  token: string,
  paymentId: string,
  review: { status: "paid" } | { status: "rejected"; rejectionReason: string },
): Promise<void> {
  const response = await fetch(
    apiUrl(`/api/admin/player-payments/${encodeURIComponent(paymentId)}/review`),
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Could not review the payment.");
  }
}