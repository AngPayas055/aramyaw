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