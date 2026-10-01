import { Tag, Typography } from "antd";

import type { Player } from "@/services/team.service";

const { Text } = Typography;

type Props = {
  player: Player;
  teamApproved: boolean;
};

export default function PlayerStatusBadges({
  player,
  teamApproved,
}: Props) {
  const verified = player.verificationStatus === "verified";
  const status = player.playingStatus ?? "allowed";
  const eligible = verified && status === "allowed" && teamApproved;

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        <Tag color={verified ? "blue" : "default"}>
          {verified ? "Verified" : "Unverified"}
        </Tag>

        <Tag
          color={
            status === "banned"
              ? "red"
              : status === "suspended"
                ? "orange"
                : "green"
          }
        >
          {status === "banned"
            ? "Banned"
            : status === "suspended"
              ? "Suspended"
              : "Allowed"}
        </Tag>

        <Tag color={eligible ? "green" : "default"}>
          {eligible ? "Eligible to play" : "Not cleared to play"}
        </Tag>
      </div>

      {status !== "allowed" && player.statusReason && (
        <Text className="mt-2 block text-xs!" type="secondary">
          Reason: {player.statusReason}
        </Text>
      )}

      {status === "suspended" && player.suspensionUntil && (
        <Text className="mt-1 block text-xs!" type="secondary">
          Suspension end: {player.suspensionUntil}
          {" · Admin clearance required"}
        </Text>
      )}
    </div>
  );
}