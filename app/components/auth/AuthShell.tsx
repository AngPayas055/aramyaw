import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftOutlined, TrophyOutlined } from "@ant-design/icons";

import styles from "./AuthShell.module.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-label="Aramyaw BallClub">
        <div className={styles.pattern} />

        <Link className={styles.brand} href="/">
          <Image
            src="/aramyaw-logo.png"
            alt="Aramyaw BallClub logo"
            width={58}
            height={58}
            priority
          />

          <span>
            <strong>ARAMYAW</strong>
            <small>BALLCLUB</small>
          </span>
        </Link>

        <div className={styles.brandMessage}>
          <span className={styles.badge}>
            <TrophyOutlined /> Community basketball
          </span>
          <h2>
            Play hard.
            <br />
            Grow <em>together.</em>
          </h2>
          <p>
            Join the Aramyaw community, enter local leagues, and stay connected
            with your team.
          </p>
        </div>

        <small className={styles.location}>Tacloban City, Philippines</small>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formContainer}>
          <Link className={styles.backLink} href="/">
            <ArrowLeftOutlined /> Back to home
          </Link>

          <div className={styles.mobileBrand}>
            <Image
              src="/aramyaw-logo.png"
              alt="Aramyaw BallClub logo"
              width={52}
              height={52}
              priority
            />
            <strong>ARAMYAW</strong>
          </div>

          <header className={styles.heading}>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>

          {children}
        </div>
      </section>
    </main>
  );
}

