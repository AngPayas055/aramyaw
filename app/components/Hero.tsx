import Image from "next/image";
import { Button } from "antd";
import {
  ArrowRightOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const phone = "09977709400";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <Image
        className="hero-image"
        src="/aramyaw-community.png"
        alt="Aramyaw BallClub players and community gathered at the basketball court"
        fill
        sizes="100vw"
        priority
      />

      <div className="hero-shade" />

      <div className="hero-content">
        <div className="eyebrow">
          <span />
          Barangay 109-A · Tacloban City
        </div>

        <h1>
          Where the whole
          <br />
          <em>barangay plays.</em>
        </h1>

        <p>
          Community basketball leagues and custom team jerseys—organized by
          Aramyaw BallClub since 2018.
        </p>

        <div className="hero-actions">
          <Button
            type="primary"
            size="large"
            href={`tel:${phone}`}
            icon={<TrophyOutlined />}
          >
            Join the next league
          </Button>

          <Button
            className="ghost-button"
            size="large"
            href="mailto:aramyawbc@gmail.com?subject=Custom%20Jersey%20Inquiry"
          >
            Order team jerseys <ArrowRightOutlined />
          </Button>
        </div>
      </div>

      <div className="hero-stamp">
        <strong>EST.</strong>
        <span>2018</span>
        <small>TACLOBAN</small>
      </div>
    </section>
  );
}