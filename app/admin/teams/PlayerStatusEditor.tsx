"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Input,
  Modal,
  Select,
  Typography,
} from "antd";

import {
  updatePlayerStatus,
  type Player,
  type PlayingStatus,
  type VerificationStatus,
} from "@/services/team.service";

const { Text } = Typography;

type Props = {
  player: Player;
  seasonId: string;
  teamId: string;
  onSaved: (player: Player) => void;
};

export default function PlayerStatusEditor({
  player,
  seasonId,
  teamId,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] =
    useState<VerificationStatus>("unverified");
  const [status, setStatus] = useState<PlayingStatus>("allowed");
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");

  function openEditor() {
    setVerification(player.verificationStatus ?? "unverified");
    setStatus(player.playingStatus ?? "allowed");
    setReason(player.statusReason ?? "");
    setUntil(player.suspensionUntil ?? "");
    setError("");
    setOpen(true);
  }

  async function saveStatus() {
    if (saving) return;

    if (status !== "allowed" && !reason.trim()) {
      setError("Please provide a reason for the restriction.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please sign in again.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await updatePlayerStatus(
        seasonId,
        teamId,
        player._id,
        token,
        {
          verificationStatus: verification,
          playingStatus: status,
          statusReason:
            status === "allowed" ? undefined : reason.trim(),
          suspensionUntil:
            status === "suspended" && until ? until : undefined,
        },
      );

      onSaved(result.player);
      setOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to update player status.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button size="small" onClick={openEditor}>
        Update status
      </Button>

      <Modal
        title={`${player.firstName} ${player.lastName}`}
        open={open}
        okText="Save status"
        confirmLoading={saving}
        cancelButtonProps={{ disabled: saving }}
        closable={!saving}
        maskClosable={!saving}
        keyboard={!saving}
        onOk={() => void saveStatus()}
        onCancel={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            title={error}
          />
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor={`verification-${player._id}`}
              className="mb-2 block font-medium"
            >
              Verification
            </label>

            <Select<VerificationStatus>
              id={`verification-${player._id}`}
              className="w-full"
              value={verification}
              onChange={setVerification}
              disabled={saving}
              options={[
                { value: "unverified", label: "Unverified" },
                { value: "verified", label: "Verified" },
              ]}
            />
          </div>

          <div>
            <label
              htmlFor={`playing-${player._id}`}
              className="mb-2 block font-medium"
            >
              Playing status
            </label>

            <Select<PlayingStatus>
              id={`playing-${player._id}`}
              className="w-full"
              value={status}
              onChange={setStatus}
              disabled={saving}
              options={[
                { value: "allowed", label: "Allowed" },
                { value: "suspended", label: "Suspended" },
                { value: "banned", label: "Banned" },
              ]}
            />
          </div>

          {status !== "allowed" && (
            <div>
              <label
                htmlFor={`reason-${player._id}`}
                className="mb-2 block font-medium"
              >
                Reason
              </label>

              <Input.TextArea
                id={`reason-${player._id}`}
                rows={3}
                maxLength={500}
                showCount
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={saving}
                placeholder="Explain why this player cannot play"
              />

              <Text type="secondary" className="mt-2 block text-xs!">
                The team manager can see this reason.
              </Text>
            </div>
          )}

          {status === "suspended" && (
            <div>
              <label
                htmlFor={`until-${player._id}`}
                className="mb-2 block font-medium"
              >
                Suspension end date (optional)
              </label>

              <Input
                id={`until-${player._id}`}
                type="date"
                value={until}
                onChange={(event) => setUntil(event.target.value)}
                disabled={saving}
              />

              <Text type="secondary" className="mt-2 block text-xs!">
                An admin must change the status to Allowed to clear
                the suspension.
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}