"use client";

import Image from "next/image";
import { Button, ConfigProvider } from "antd";
import { ArrowRightOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";

const phone = "09977709400";

export default function Home() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#f15a24", borderRadius: 12, fontFamily: "var(--font-body)", controlHeight: 48 } }}>
      <main>
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Aramyaw BallClub home">
            <Image src="/aramyaw-logo.png" alt="Aramyaw BallClub logo" width={54} height={54} priority />
            <span><strong>ARAMYAW</strong><small>BALLCLUB</small></span>
          </a>
          <nav aria-label="Main navigation"><a href="#leagues">Leagues</a><a href="#jerseys">Jerseys</a><a href="#contact">Contact</a></nav>
          <Button type="primary" href={`tel:${phone}`} icon={<PhoneOutlined />}>Call us</Button>
        </header>

        <section id="top" className="hero">
          <Image className="hero-image" src="/aramyaw-community.png" alt="Aramyaw BallClub players and community gathered at the basketball court" fill sizes="100vw" priority />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow"><span /> Barangay 109-A · Tacloban City</div>
            <h1>Where the whole<br /><em>barangay plays.</em></h1>
            <p>Community basketball leagues and custom team jerseys—organized by Aramyaw BallClub since 2018.</p>
            <div className="hero-actions">
              <Button type="primary" size="large" href={`tel:${phone}`} icon={<TrophyOutlined />}>Join the next league</Button>
              <Button className="ghost-button" size="large" href="mailto:aramyawbc@gmail.com?subject=Custom%20Jersey%20Inquiry">Order team jerseys <ArrowRightOutlined /></Button>
            </div>
          </div>
          <div className="hero-stamp"><strong>EST.</strong><span>2018</span><small>TACLOBAN</small></div>
        </section>

        <section className="proof-strip" aria-label="Aramyaw highlights">
          <div><b>2018</b><span>Founded</span></div><div><b>3</b><span>Age divisions</span></div><div><b>1</b><span>Basketball community</span></div>
        </section>

        <section id="leagues" className="section leagues-section">
          <div className="section-heading">
            <div><p className="kicker">Play with your division</p><h2>League basketball<br />for every generation.</h2></div>
            <p>Aramyaw organizes community tournaments throughout the year, giving local players a place to compete, grow, and represent their teams.</p>
          </div>
          <div className="division-grid">
            <article className="division-card featured"><span>01</span><TeamOutlined /><div><h3>Midget</h3><p>Young players building confidence and learning the game.</p></div></article>
            <article className="division-card"><span>02</span><TeamOutlined /><div><h3>Junior</h3><p>Developing players ready for faster, more competitive basketball.</p></div></article>
            <article className="division-card"><span>03</span><TeamOutlined /><div><h3>Senior</h3><p>Community teams competing for pride, brotherhood, and the title.</p></div></article>
          </div>
        </section>

        <section id="jerseys" className="jersey-section">
          <div className="jersey-copy">
            <p className="kicker light">Made for your team</p><h2>Look united.<br /><em>Play united.</em></h2>
            <p>Custom basketball jerseys for leagues, barangay teams, schools, and barkada squads. Send your team name, colors, sizes, player names, and numbers—we’ll help organize your order.</p>
            <Button type="primary" size="large" href="mailto:aramyawbc@gmail.com?subject=Custom%20Jersey%20Order" icon={<MailOutlined />}>Start a jersey order</Button>
          </div>
          <div className="jersey-art" aria-hidden="true"><span className="number">09</span><div className="court-line" /><div className="ball-mark">ABC</div></div>
        </section>

        <section id="contact" className="section contact-section">
          <div><p className="kicker">Ready to play?</p><h2>Let’s talk basketball.</h2></div>
          <div className="contact-list">
            <a href={`tel:${phone}`}><PhoneOutlined /><span><small>Call or text</small>0997 770 9400</span><ArrowRightOutlined /></a>
            <a href="mailto:aramyawbc@gmail.com"><MailOutlined /><span><small>Email</small>aramyawbc@gmail.com</span><ArrowRightOutlined /></a>
            <a href="https://www.bing.com/maps?q=Brgy+109-A+V%26G+Subdivision+Tacloban+City" target="_blank" rel="noreferrer"><EnvironmentOutlined /><span><small>Visit us</small>Brgy 109-A, V&amp;G Subdivision, Tacloban City</span><ArrowRightOutlined /></a>
          </div>
        </section>

        <footer>
          <a className="brand" href="#top"><Image src="/aramyaw-logo.png" alt="" width={46} height={46} /><span><strong>ARAMYAW</strong><small>BALLCLUB</small></span></a>
          <p>Ball game is unlimited.</p><small>© {new Date().getFullYear()} Aramyaw BallClub. Est. 2018.</small>
        </footer>
      </main>
    </ConfigProvider>
  );
}
