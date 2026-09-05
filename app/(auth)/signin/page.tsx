"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button, Form, Input, message } from "antd";
import {
  LockOutlined,
  LoginOutlined,
  MailOutlined,
} from "@ant-design/icons";

import AuthShell from "@/app/components/auth/AuthShell";
import styles from "@/app/components/auth/AuthForm.module.css";

import { loginUser } from "@/services/auth.service";

type SignInValues = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: SignInValues) => {
    try {
      setLoading(true);

      const data = await loginUser({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      messageApi.success(
        data.message || "Signed in successfully.",
      );

      router.push("/");
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
        eyebrow="Member access"
        title="Welcome back"
        description="Sign in to manage your profile, leagues, and team activity."
      >
        <Form<SignInValues>
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
            />
          </Form.Item>

          <Form.Item
            label={
              <span className={styles.passwordLabel}>
                <span>Password</span>

                <Link
                  className={styles.forgotLink}
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </span>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password.",
              },
            ]}
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
              loading={loading}
              icon={!loading ? <LoginOutlined /> : undefined}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.switchText}>
          New to Aramyaw?{" "}
          <Link href="/signup">Create an account</Link>
        </p>
      </AuthShell>
    </>
  );
}