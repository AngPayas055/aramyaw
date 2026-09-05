import { Button } from "antd";
import { MailOutlined } from "@ant-design/icons";

export default function JerseySection() {
  return (
    <section id="jerseys" className="jersey-section">
      <div className="jersey-copy">
        <p className="kicker light">Made for your team</p>

        <h2>
          Look united.
          <br />
          <em>Play united.</em>
        </h2>

        <p>
          Custom basketball jerseys for leagues, barangay teams, schools, and
          barkada squads. Send your team name, colors, sizes, player names, and
          numbers—we’ll help organize your order.
        </p>

        <Button
          type="primary"
          size="large"
          href="mailto:aramyawbc@gmail.com?subject=Custom%20Jersey%20Order"
          icon={<MailOutlined />}
        >
          Start a jersey order
        </Button>
      </div>

      <div className="jersey-art" aria-hidden="true">
        <span className="number">09</span>
        <div className="court-line" />
        <div className="ball-mark">ABC</div>
      </div>
    </section>
  );
}