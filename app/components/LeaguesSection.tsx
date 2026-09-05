import { TeamOutlined } from "@ant-design/icons";

const divisions = [
  {
    number: "01",
    name: "Midget",
    description:
      "Young players building confidence and learning the game.",
    featured: true,
  },
  {
    number: "02",
    name: "Junior",
    description:
      "Developing players ready for faster, more competitive basketball.",
  },
  {
    number: "03",
    name: "Senior",
    description:
      "Community teams competing for pride, brotherhood, and the title.",
  },
];

export default function LeaguesSection() {
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
          Aramyaw organizes community tournaments throughout the year, giving
          local players a place to compete, grow, and represent their teams.
        </p>
      </div>

      <div className="division-grid">
        {divisions.map((division) => (
          <article
            key={division.name}
            className={`division-card ${
              division.featured ? "featured" : ""
            }`}
          >
            <span>{division.number}</span>

            <TeamOutlined />

            <div>
              <h3>{division.name}</h3>
              <p>{division.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}