"use client";

import Link from "next/link";
import { Button, Checkbox, Form, Input } from "antd";
import {
  LockOutlined,
  MailOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import AuthShell from "@/app/components/auth/AuthShell";
import styles from "@/app/components/auth/AuthForm.module.css";

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export default function SignUpPage() {
  const handleSubmit = async (values: SignUpValues) => {
    // Send name, email, and password to your Express registration endpoint.
    console.log(values);
  };

  return (
    <AuthShell
      eyebrow="Join the club"
      title="Create account"
      description="Register once to join leagues and stay connected with Aramyaw BallClub."
    >
      <Form<SignUpValues>
        className={styles.form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Full name"
          name="name"
          rules={[{ required: true, message: "Please enter your full name." }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Juan Dela Cruz"
            autoComplete="name"
          />
        </Form.Item>

        <Form.Item
          label="Email address"
          name="email"
          rules={[
            { required: true, message: "Please enter your email address." },
            { type: "email", message: "Please enter a valid email address." },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please create a password." },
            { min: 8, message: "Password must contain at least 8 characters." },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label="Confirm password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error("The two passwords do not match."),
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password again"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="acceptTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, checked) =>
                checked
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Please accept the terms to continue."),
                    ),
            },
          ]}
        >
          <Checkbox className={styles.terms}>
            I agree to the <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            className={styles.submitButton}
            type="primary"
            htmlType="submit"
            block
            icon={<UserAddOutlined />}
          >
            Create account
          </Button>
        </Form.Item>
      </Form>

      <p className={styles.switchText}>
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>
    </AuthShell>
  );
}

