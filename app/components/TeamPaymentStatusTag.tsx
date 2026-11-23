import { Tag } from "antd";
import type { TeamPayments } from "@/services/payment.service";

const labels = {
  unpaid: "Unpaid",
  pending: "For verification",
  paid: "Paid",
  rejected: "Rejected",
  not_required: "No payment required",
};

const colors = {
  unpaid: "default",
  pending: "orange",
  paid: "green",
  rejected: "red",
  not_required: "blue",
};

export default function TeamPaymentStatusTag({
  status,
  showLabel = false,
}: {
  status: TeamPayments["paymentStatus"] | null | undefined;
  showLabel?: boolean;
}) {
  return (
    <Tag color={status ? colors[status] : "default"}>
      {showLabel && "Payment: "}
      {status ? labels[status] : "Status unavailable"}
    </Tag>
  );
}
