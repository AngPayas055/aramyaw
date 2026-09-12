"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button, Form, Input, message } from "antd";
import {
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

import AuthShell from "@/app/components/auth/AuthShell";
import styles from "@/app/components/auth/AuthForm.module.css";

import { resetPassword } from "@/services/auth.service";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      messageApi.error(
        "This password reset link is invalid or missing a token.",
      );
      return;
    }

    try {
      setLoading(true);

      const data = await resetPassword({
        token,
        password: values.password,
      });

      setPasswordReset(true);

      messageApi.success(
        data.message || "Your password has been reset successfully.",
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

  if (!token) {
    return (
      <>
        {contextHolder}

        <AuthShell
          eyebrow="Account recovery"
          title="Invalid reset link"
          description="This password reset link is invalid or incomplete."
        >
          <p className={styles.switchText}>
            Please request a new password reset link.
          </p>

          <Button
            className={styles.submitButton}
            type="primary"
            block
            onClick={() => router.push("/forgot-password")}
          >
            Request new reset link
          </Button>

          <p className={styles.switchText}>
            <Link href="/signin">Back to sign in</Link>
          </p>
        </AuthShell>
      </>
    );
  }

  if (passwordReset) {
    return (
      <>
        {contextHolder}

        <AuthShell
          eyebrow="Password updated"
          title="Password reset successful"
          description="Your password has been updated. You can now sign in using your new password."
        >
          <div className={styles.successState}>
            <CheckCircleOutlined
              className={styles.successIcon}
            />

            <p>Your new password is ready to use.</p>
          </div>

          <Button
            className={styles.submitButton}
            type="primary"
            block
            onClick={() => router.push("/signin")}
          >
            Continue to sign in
          </Button>
        </AuthShell>
      </>
    );
  }

  return (
    <>
      {contextHolder}

      <AuthShell
        eyebrow="Account recovery"
        title="Create a new password"
        description="Choose a strong password for your Aramyaw account."
      >
        <Form<ResetPasswordValues>
          className={styles.form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            label="New password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your new password.",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters.",
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="Confirm new password"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please confirm your new password.",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    getFieldValue("password") === value
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      "The passwords do not match.",
                    ),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              className={styles.submitButton}
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Reset password
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.switchText}>
          <Link href="/signin">Back to sign in</Link>
        </p>
      </AuthShell>
    </>
  );
}