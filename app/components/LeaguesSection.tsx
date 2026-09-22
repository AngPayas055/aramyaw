"use client";

import { useEffect, useState } from "react";
import {
  CalendarOutlined,
  LoadingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { getSeasons } from "@/services/season.service";
import { getDivisions } from "@/services/division.service";
import type { Season } from "@/types/season";
import type { Division } from "@/types/division";

const seasonStatusLabels: Record<string, string> = {
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  ongoing: "Season Ongoing",
  completed: "Season Completed",
};

const seasonPriority: Record<string, number> = {
  registration_open: 1,
  ongoing: 2,
  registration_closed: 3,
  completed: 4,
};

function selectFeaturedSeason(seasons: Season[]) {
  return seasons
    .filter(
      (season) =>
        season.status !== "draft" &&
        season.status !== "cancelled",
    )
    .sort((a, b) => {
      const priorityDifference =
        (seasonPriority[a.status] ?? 99) -
        (seasonPriority[b.status] ?? 99);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return (
        new Date(b.startDate).getTime() -
        new Date(a.startDate).getTime()
      );
    })[0];
}

function getDivisionDescription(division: Division) {
  if (division.description) {
    return division.description;
  }

  if (
    division.minAge !== undefined &&
    division.maxAge !== undefined
  ) {
    return `Open to players ages ${division.minAge} to ${division.maxAge}.`;
  }

  if (division.maxAge !== undefined) {
    return `Open to players ${division.maxAge} years old and below.`;
  }

  if (division.minAge !== undefined) {
    return `Open to players ${division.minAge} years old and above.`;
  }

  return "Open division for eligible community basketball teams.";
}

export default function LeaguesSection() {
  const [season, setSeason] = useState<Season | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeague() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication is required.");
        }

        const seasonsResponse = await getSeasons(token, {
          page: 1,
          limit: 20,
        });

        // Change `seasons` if your response uses `data` or another property.
        const featuredSeason = selectFeaturedSeason(
          seasonsResponse.seasons,
        );

        if (!featuredSeason) {
          setSeason(null);
          setDivisions([]);
          return;
        }

        setSeason(featuredSeason);

        const divisionsResponse = await getDivisions(
          featuredSeason._id,
          token,
        );

        // Change `divisions` if your response uses `data`.
        setDivisions(divisionsResponse.divisions);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load league information.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadLeague();
  }, []);

  return (
    <section id="leagues" className="section leagues-section">
      <div className="section-heading">
        <div>
          <p className="kicker">Play with your division</p>

          <h2>
            League basketball
            <br />
            for every generation.
          </h2>
        </div>

        <p>
          Aramyaw organizes community tournaments throughout the year,
          giving local players a place to compete, grow, and represent
          their teams.
        </p>
      </div>

      {loading && (
        <div className="league-state">
          <LoadingOutlined spin />
          <p>Loading the current league...</p>
        </div>
      )}

      {!loading && error && (
        <div className="league-state league-state-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !season && (
        <div className="league-state">
          <TeamOutlined />
          <h3>No active season yet</h3>
          <p>Please check again for upcoming Aramyaw tournaments.</p>
        </div>
      )}

      {!loading && !error && season && (
        <>
          <div className="featured-season">
            <div>
              <span
                className={`season-status season-status-${season.status}`}
              >
                {seasonStatusLabels[season.status] ?? season.status}
              </span>

              <h3>{season.name}</h3>

              {season.description && <p>{season.description}</p>}
            </div>

            <div className="season-dates">
              <CalendarOutlined />

              <span>
                {dayjs(season.startDate).format("MMM D, YYYY")}
                {" — "}
                {dayjs(season.endDate).format("MMM D, YYYY")}
              </span>
            </div>
          </div>

          {divisions.length > 0 ? (
            <div className="division-grid">
              {divisions.map((division, index) => (
                <article
                  key={division._id}
                  className={`division-card ${
                    index === 0 ? "featured" : ""
                  }`}
                >
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <TeamOutlined />

                  <div>
                    <h3>{division.name}</h3>
                    <p>{getDivisionDescription(division)}</p>

                    <small>
                      {division.minPlayers}–{division.maxPlayers} players
                      per team
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="league-state">
              <TeamOutlined />
              <h3>Divisions coming soon</h3>
              <p>
                Divisions for {season.name} have not been announced yet.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}