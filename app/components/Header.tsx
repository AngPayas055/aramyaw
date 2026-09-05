import Image from "next/image";
import { Button } from "antd";
import { PhoneOutlined } from "@ant-design/icons";

const phone = "09977709400";

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Aramyaw BallClub home">
        <Image
          src="/aramyaw-logo.png"
          alt="Aramyaw BallClub logo"
          width={54}
          height={54}
          priority
        />

        <span>
          <strong>ARAMYAW</strong>
          <small>BALLCLUB</small>
        </span>
      </a>

      <nav aria-label="Main navigation">
        <a href="#leagues">Leagues</a>
        <a href="#jerseys">Jerseys</a>
        <a href="#contact">Contact</a>
      </nav>

      <Button
        type="primary"
        href={`tel:${phone}`}
        icon={<PhoneOutlined />}
      >
        Call us
      </Button>
    </header>
  );
}