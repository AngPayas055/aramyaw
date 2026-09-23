import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <a className="brand" href="#top">
        <Image
          src="/aramyaw-logo.png"
          alt="Aramyaw BallClub logo"
          width={46}
          height={46}
        />

        <span>
          <strong>ARAMYAW</strong>
          <small>BALLCLUB</small>
        </span>
      </a>

      <p>Ball game is unlimited.</p>

      <small>© {new Date().getFullYear()} Aramyaw BallClub. Est. 2018.</small>

      <p className="developer-credit">
        Designed & developed by{" "}
        <a
          href="https://jmendiola.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <br />
          Jhon Rey Mendiola ↗
        </a>
      </p>
    </footer>
  );
}