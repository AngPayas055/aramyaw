"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "antd";
import { getAdminPayments, PAYMENTS_CHANGED } from "@/services/admin-payment.service";

export default function PaymentNavLabel() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let controller: AbortController | undefined;
    async function load() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const result = await getAdminPayments(token, { status: "pending", limit: 1 }, request.signal);
        if (!disposed && !request.signal.aborted) setCount(result.total);
      } catch {
        if (!disposed && !request.signal.aborted) setCount(null);
      }
    }
    void load();
    window.addEventListener(PAYMENTS_CHANGED, load);
    window.addEventListener("focus", load);
    return () => {
      disposed = true;
      controller?.abort();
      window.removeEventListener(PAYMENTS_CHANGED, load);
      window.removeEventListener("focus", load);
    };
  }, [pathname]);

  return (
    <Link href="/admin/payments">
      Payments {count !== null && <Badge count={count} overflowCount={99} />}
    </Link>
  );
}