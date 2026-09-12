"use client";

import { useState } from "react";
import Link from "next/link";

import { Button, Form, Input, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MailOutlined,
  SendOutlined,
} from "@ant-design/icons";

import AuthShell from "@/app/components/auth/AuthShell";
import styles from "@/app/components/auth/AuthForm.module.css";

import { forgotPassword } from "@/services/auth.service";

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: ForgotPasswordValues) => {
    const email = values.email.trim().toLowerCase();

    try {
      setLoading(true);

      const data = await forgotPassword({
        email,
      });

      setSubmittedEmail(email);
      setEmailSent(true);

      messageApi.success(
        data.message || "Password reset email sent successfully.",
      );
    } catch (error) {
      messageApi.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <AuthShell
        eyebrow="Account recovery"
        title={emailSent ? "Check your email" : "Forgot your password?"}
        description={
          emailSent
            ? `We've sent password reset instructions to ${submittedEmail}.`
            : "Enter your email address and we'll send you instructions to reset your password."
        }
      >
        {emailSent ? (
          <>
            <div className={styles.successState}>
              <CheckCircleOutlined className={styles.successIcon} />

              <p>
                Check your inbox and follow the link in the email to create a
                new password.
              </p>

              <p>
                Didn&apos;t receive the email? Check your spam folder or try
                submitting your email again.
              </p>
            </div>

            <Button
              className={styles.submitButton}
              type="primary"
              block
              onClick={() => setEmailSent(false)}
            >
              Try another email
            </Button>

            <p className={styles.switchText}>
              <Link href="/signin">
                <ArrowLeftOutlined /> Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <Form<ForgotPasswordValues>
              className={styles.form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleSubmit}
              disabled={loading}
            >
              <Form.Item
                label="Email address"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email address.",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address.",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </Form.Item>

              <Form.Item>
                <Button
                  className={styles.submitButton}
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  icon={!loading ? <SendOutlined /> : undefined}
                >
                  Send reset link
                </Button>
              </Form.Item>
            </Form>

            <p className={styles.switchText}>
              Remember your password?{" "}
              <Link href="/signin">Sign in</Link>
            </p>
          </>
        )}
      </AuthShell>
    </>
  );
}