"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button, Checkbox, Form, Input, message } from "antd";
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import AuthShell from "@/app/components/auth/AuthShell";
import styles from "@/app/components/auth/AuthForm.module.css";

type SignUpValues = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type RegisterResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    role: string;
  };
};

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: SignUpValues) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
            contactNumber: values.contactNumber.trim(),
            password: values.password,
          }),
        },
      );

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      messageApi.success(data.message || "Account created successfully.");

      setTimeout(() => {
        router.push("/signin");
      }, 1000);
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
        eyebrow="Join the club"
        title="Create account"
        description="Register once to join leagues and stay connected with Aramyaw BallClub."
      >
        <Form<SignUpValues>
          className={styles.form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            label="First name"
            name="firstName"
            rules={[
              {
                required: true,
                message: "Please enter your first name.",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Juan"
              autoComplete="given-name"
            />
          </Form.Item>

          <Form.Item
            label="Last name"
            name="lastName"
            rules={[
              {
                required: true,
                message: "Please enter your last name.",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Dela Cruz"
              autoComplete="family-name"
            />
          </Form.Item>

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
            label="Contact number"
            name="contactNumber"
            rules={[
              {
                required: true,
                message: "Please enter your contact number.",
              },
              {
                pattern: /^09\d{9}$/,
                message: "Please enter a valid Philippine mobile number.",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="09XXXXXXXXX"
              autoComplete="tel"
              maxLength={11}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please create a password.",
              },
              {
                min: 8,
                message: "Password must contain at least 8 characters.",
              },
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
              {
                required: true,
                message: "Please confirm your password.",
              },
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
              loading={loading}
              icon={!loading ? <UserAddOutlined /> : undefined}
            >
              Create account
            </Button>
          </Form.Item>
        </Form>

        <p className={styles.switchText}>
          Already have an account? <Link href="/signin">Sign in</Link>
        </p>
      </AuthShell>
    </>
  );
}