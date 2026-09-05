import Image from "next/image";
import Link from "next/link";
import {
  LoginOutlined,
  PhoneOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

const phone = "09977709400";

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/#top" aria-label="Aramyaw BallClub home">
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
      </Link>

      <nav aria-label="Main navigation">
        <Link href="/#leagues">Leagues</Link>
        <Link href="/#jerseys">Jerseys</Link>
        <Link href="/#contact">Contact</Link>
      </nav>

      <div className="header-actions">
        <a
          className="phone-link"
          href={`tel:${phone}`}
          aria-label={`Call Aramyaw BallClub at ${phone}`}
        >
          <PhoneOutlined />
          <span>Call us</span>
        </a>

        <Link className="signin-link" href="/signin">
          <LoginOutlined />
          <span>Sign in</span>
        </Link>

        <Link className="signup-link" href="/signup">
          <UserAddOutlined />
          <span>Register</span>
        </Link>
      </div>
    </header>
  );
}