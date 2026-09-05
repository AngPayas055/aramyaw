"use client";

import Link from "next/link";
import { Button, Form, Input } from "antd";
import {
  LockOutlined,
  LoginOutlined,
  MailOutlined,
} from "@ant-design/icons";

import AuthShell from "@/app/components/auth/AuthShell";
import styles from "@/app/components/auth/AuthForm.module.css";

type SignInValues = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const handleSubmit = async (values: SignInValues) => {
    // Connect this to your Express sign-in endpoint.
    console.log(values);
  };

  return (
    <AuthShell
      eyebrow="Member access"
      title="Welcome back"
      description="Sign in to manage your profile, leagues, and team activity."
    >
      <Form<SignInValues>
        className={styles.form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
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
          label={
            <span className={styles.passwordLabel}>
              <span>Password</span>
              <Link className={styles.forgotLink} href="/forgot-password">
                Forgot password?
              </Link>
            </span>
          }
          name="password"
          rules={[{ required: true, message: "Please enter your password." }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            className={styles.submitButton}
            type="primary"
            htmlType="submit"
            block
            icon={<LoginOutlined />}
          >
            Sign in
          </Button>
        </Form.Item>
      </Form>

      <p className={styles.switchText}>
        New to Aramyaw? <Link href="/signup">Create an account</Link>
      </p>
    </AuthShell>
  );
}

