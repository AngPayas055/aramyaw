import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const phone = "09977709400";

export default function ContactSection() {
  return (
    <section id="contact" className="section contact-section">
      <div>
        <p className="kicker">Ready to play?</p>
        <h2>Let’s talk basketball.</h2>
      </div>

      <div className="contact-list">
        <a href={`tel:${phone}`}>
          <PhoneOutlined />

          <span>
            <small>Call or text</small>
            0997 770 9400
          </span>

          <ArrowRightOutlined />
        </a>

        <a href="mailto:aramyawbc@gmail.com">
          <MailOutlined />

          <span>
            <small>Email</small>
            aramyawbc@gmail.com
          </span>

          <ArrowRightOutlined />
        </a>

        <a
          href="https://www.bing.com/maps?q=Brgy+109-A+V%26G+Subdivision+Tacloban+City"
          target="_blank"
          rel="noreferrer"
        >
          <EnvironmentOutlined />

          <span>
            <small>Visit us</small>
            Brgy 109-A, V&amp;G Subdivision, Tacloban City
          </span>

          <ArrowRightOutlined />
        </a>
      </div>
    </section>
  );
}