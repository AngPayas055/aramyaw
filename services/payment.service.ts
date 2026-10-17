import { apiUrl } from "./api";

export type PaymentMethod = "gcash" | "maya";
export type PaymentStatus = "pending" | "paid" | "rejected";

export interface Payment {
  _id: string;
  method: PaymentMethod;
  referenceNumber: string;
  amountCentavos: number;
  expectedAmountCentavos: number;
  paidAt: string;
  status: PaymentStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface TeamPayments {
  amountDueCentavos: number;
  currency: "PHP";
  paymentStatus: PaymentStatus | "unpaid" | "not_required";
  accounts: {
    method: PaymentMethod;
    accountNumber: string;
    accountName: string;
  }[];
  payments: Payment[];
}

export interface SubmitPaymentInput {
  method: PaymentMethod;
  referenceNumber: string;
  amountCentavos: number;
  paidAt: string;
}

function paymentPath(seasonId: string, teamId: string) {
  return `/api/seasons/${encodeURIComponent(seasonId)}/teams/${encodeURIComponent(teamId)}/payments`;
}

async function paymentRequest<T>(
  path: string,
  token: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message ||
        (response.status === 401 || response.status === 403
          ? "Your session expired or you do not have access."
          : "Could not process payment."),
    );
  }

  return response.json();
}

export function getTeamPayments(
  seasonId: string,
  teamId: string,
  token: string,
  signal?: AbortSignal,
) {
  return paymentRequest<TeamPayments>(
    paymentPath(seasonId, teamId),
    token,
    "GET",
    undefined,
    signal,
  );
}

export function submitTeamPayment(
  seasonId: string,
  teamId: string,
  token: string,
  input: SubmitPaymentInput,
) {
  return paymentRequest<{ message: string; payment: Payment }>(
    paymentPath(seasonId, teamId),
    token,
    "POST",
    input,
  );
}

export function reviewPayment(
  seasonId: string,
  teamId: string,
  paymentId: string,
  token: string,
  input: {
    status: "paid" | "rejected";
    rejectionReason?: string;
  },
) {
  return paymentRequest<{ message: string; payment: Payment }>(
    `${paymentPath(seasonId, teamId)}/${encodeURIComponent(paymentId)}/review`,
    token,
    "PATCH",
    input,
  );
}