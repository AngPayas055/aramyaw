"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card } from "antd";

import {
  getPendingJoinRequests,
  reviewJoinRequest,
  type JoinRequestDecision,
  type PendingJoinRequest,
} from "@/services/team.service";

type Props = {
  seasonId: string;
  teamId: string;
  onApproved: (token: string) => Promise<void>;
};

export default function JoinRequestsPanel({
  seasonId,
  teamId,
  onApproved,
}: Props) {
  const [requests, setRequests] = useState<PendingJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      const token = localStorage.getItem("token");

      try {
        if (!token) throw new Error("Sign in again to view join requests.");

        const { joinRequests } = await getPendingJoinRequests(
          seasonId,
          teamId,
          token,
        );

        if (active) setRequests(joinRequests);
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error ? error.message : "Could not load join requests.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRequests();

    return () => {
      active = false;
    };
  }, [seasonId, teamId]);

  async function handleReview(requestId: string, status: JoinRequestDecision) {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Sign in again to review join requests.");
      return;
    }

    setReviewingId(requestId);
    setError("");

    try {
      await reviewJoinRequest(seasonId, teamId, requestId, token, status);
      setRequests((current) => current.filter((item) => item._id !== requestId));

      const refreshRequests = getPendingJoinRequests(seasonId, teamId, token)
        .then(({ joinRequests }) => setRequests(joinRequests));

      try {
        await Promise.all([
          refreshRequests,
          status === "approved" ? onApproved(token) : undefined,
        ]);
      } catch {
        setError("Review saved. Refresh the page to see the latest team data.");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not review the request.",
      );
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <Card title="Join requests" loading={loading} className="mb-4">
      {error && <Alert type="error" title={error} showIcon className="mb-3" />}

      {requests.length === 0 && !error && <p>No pending join requests.</p>}

      {requests.length > 0 && (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li
              key={request._id}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span>
                {request.player
                  ? `${request.player.firstName} ${request.player.lastName}`
                  : "Player account unavailable"}
              </span>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="primary"
                  disabled={reviewingId !== null || !request.player}
                  onClick={() => void handleReview(request._id, "approved")}
                >
                  Approve
                </Button>
                <Button
                  danger
                  disabled={reviewingId !== null}
                  onClick={() => void handleReview(request._id, "declined")}
                >
                  Decline
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}