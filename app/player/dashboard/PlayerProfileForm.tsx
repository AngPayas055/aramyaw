"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Card, Input } from "antd";

import {
  requestPlayerProfile,
  type PlayerProfile,
} from "@/services/player-profile.service";

const manilaDateFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getAgeToday(birthDate: string): number {
  const today = manilaDateFormat.format(new Date());
  const yearDifference = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  const birthdayHasPassed = today.slice(5) >= birthDate.slice(5);

  return birthdayHasPassed ? yearDifference : yearDifference - 1;
}

export default function PlayerProfileForm({ token }: { token: string }) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    requestPlayerProfile(token, { signal: controller.signal })
      .then((profile) => {
        setProfile(profile);
        setBirthDate(profile.birthDate ?? "");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Could not load your profile. Refresh the page to try again.");
        }
      });

    return () => controller.abort();
  }, [token]);

  async function saveBirthDate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || profile.identityLocked) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const updatedProfile = await requestPlayerProfile(token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate }),
      });

      setProfile(updatedProfile);
      setBirthDate(updatedProfile.birthDate ?? "");
      setSaved(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not save your birthdate.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Player profile"
      style={{ borderTop: "3px solid #ea580c" }}
    >
      {error && <Alert type="error" title={error} showIcon />}
      {!profile && !error && <p role="status">Loading your profile…</p>}
      
      {profile && (
        <form onSubmit={saveBirthDate} className="flex flex-col gap-4">
          <p className="font-medium">
            {profile.firstName} {profile.lastName}
          </p>
          {profile.identityLocked && (
            <Alert
              type="info"
              showIcon
              title="This player is verified. Only admins can edit the first name, last name, and birthdate."
            />
          )}
          <div>
            <label htmlFor="player-birthdate" className="mb-1 block">
              Birthdate
            </label>
            <Input
              id="player-birthdate"
              type="date"
              value={birthDate}
              min="0001-01-01"
              required
              disabled={saving || profile.identityLocked}
              onChange={(event) => {
                setBirthDate(event.target.value);
                setSaved(false);
                setError("");
              }}
            />
            {profile.birthDate && (
              <p className="mt-1 text-sm">
                Age today: {getAgeToday(profile.birthDate)}
              </p>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            disabled={profile.identityLocked || !birthDate || birthDate === profile.birthDate}
            className="self-start"
          >
            Save birthdate
          </Button>

          {saved && <Alert type="success" title="Birthdate saved." showIcon />}
        </form>
      )}
    </Card>
  );
}