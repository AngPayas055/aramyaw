"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  LockOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";

import { getSeasons } from "@/services/season.service";
import { getDivisions } from "@/services/division.service";
import type { Season } from "@/types/season";
import type { Division } from "@/types/division";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TeamRegistrationValues {
  divisionId: string;
  teamName: string;
  barangay: string;
  coachFirstName: string;
  coachLastName: string;
  coachEmail: string;
  coachContactNumber: string;
  assistantCoach?: string;
  notes?: string;
  acceptedTerms: boolean;
}

export default function JoinLeaguePage() {
  const router = useRouter();
  const [form] = Form.useForm<TeamRegistrationValues>();

  const [season, setSeason] = useState<Season | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRegistrationDetails() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        setAuthenticated(Boolean(token));

        if (!token) {
          return;
        }

        const seasonsResponse = await getSeasons(token, {
          page: 1,
          limit: 50,
          status: "registration_open",
        });

        const openSeasons = seasonsResponse.seasons.filter(
          (item) => item.status === "registration_open",
        );

        const activeSeason = openSeasons.sort(
          (a, b) =>
            new Date(a.registrationClosesAt).getTime() -
            new Date(b.registrationClosesAt).getTime(),
        )[0];

        if (!activeSeason) {
          setSeason(null);
          return;
        }

        setSeason(activeSeason);

        const divisionsResponse = await getDivisions(
          activeSeason._id,
          token,
        );

        setDivisions(divisionsResponse.divisions);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load league registration.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRegistrationDetails();
  }, []);

  const selectedDivisionId = Form.useWatch("divisionId", form);

  const selectedDivision = useMemo(
    () =>
      divisions.find(
        (division) => division._id === selectedDivisionId,
      ),
    [divisions, selectedDivisionId],
  );

  function handleSignIn() {
    const redirect = encodeURIComponent("/join-league");
    router.push(`/signin?redirect=${redirect}`);
  }

  async function handleSubmit(values: TeamRegistrationValues) {
    try {
      setSubmitting(true);
      setError("");

      /*
       * We will replace this with:
       *
       * await createTeamRegistration(
       *   season._id,
       *   values,
       *   token,
       * );
       */

      console.log({
        seasonId: season?._id,
        ...values,
      });

      setSubmitted(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit team registration.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="join-league-page">
        <div className="join-league-loading">
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 40 }}
                spin
              />
            }
          />

          <Text>Loading league registration...</Text>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="join-league-page">
        <div className="join-league-container">
          <Link href="/" className="join-back-link">
            <ArrowLeftOutlined />
            Back to home
          </Link>

          <Card className="join-state-card">
            <Result
              icon={<LockOutlined />}
              title="Sign in to register your team"
              subTitle="You need an Aramyaw account so you can manage your team, players, and registration status."
              extra={[
                <Button
                  key="signin"
                  type="primary"
                  size="large"
                  onClick={handleSignIn}
                >
                  Sign in to continue
                </Button>,

                <Link key="signup" href="/signup?redirect=%2Fjoin-league">
                  <Button size="large">
                    Create an account
                  </Button>
                </Link>,
              ]}
            />
          </Card>
        </div>
      </main>
    );
  }

  if (!season) {
    return (
      <main className="join-league-page">
        <div className="join-league-container">
          <Link href="/" className="join-back-link">
            <ArrowLeftOutlined />
            Back to home
          </Link>

          <Card className="join-state-card">
            <Result
              icon={<TrophyOutlined />}
              title="Registration is currently closed"
              subTitle="There is no season accepting team registrations right now. Please check again when the next league is announced."
              extra={
                <Link href="/">
                  <Button type="primary" size="large">
                    Return to home
                  </Button>
                </Link>
              }
            />
          </Card>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="join-league-page">
        <div className="join-league-container">
          <Card className="join-state-card">
            <Result
              status="info"
              title="Registration is still warming up 🏀"
              subTitle="This page is still under development. Our system is practicing its free throws before accepting official team registrations."
              extra={
                <Link href="/">
                  <Button type="primary" size="large">
                    Return to home
                  </Button>
                </Link>
              }
            />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="join-league-page">
      <div className="join-league-container">
        <Link href="/" className="join-back-link">
          <ArrowLeftOutlined />
          Back to home
        </Link>

        <header className="join-league-header">
          <div>
            <Text className="join-league-kicker">
              Team registration
            </Text>

            <Title level={1}>
              Join the next
              <br />
              <em>Aramyaw league.</em>
            </Title>

            <Paragraph>
              Submit your team information below. Players can be added
              after the initial registration has been accepted.
            </Paragraph>
          </div>

          <div className="join-league-number">
            <span>EST.</span>
            <strong>2018</strong>
            <small>TACLOBAN</small>
          </div>
        </header>

        <section className="join-season-card">
          <div className="join-season-icon">
            <TrophyOutlined />
          </div>

          <div className="join-season-details">
            <span className="join-status">
              Registration open
            </span>

            <Title level={3}>{season.name}</Title>

            {season.description && (
              <Paragraph>{season.description}</Paragraph>
            )}
          </div>

          <div className="join-season-deadline">
            <CalendarOutlined />

            <div>
              <Text>Registration deadline</Text>

              <strong>
                {dayjs(season.registrationClosesAt).format(
                  "MMMM D, YYYY",
                )}
              </strong>
            </div>
          </div>
        </section>

        {error && (
          <Alert
            className="join-error"
            type="error"
            title="Registration information"
            description={error}
            showIcon
            closable
            onClose={() => setError("")}
          />
        )}

        <Form<TeamRegistrationValues>
          form={form}
          layout="vertical"
          requiredMark="optional"
          onFinish={handleSubmit}
          scrollToFirstError
        >
          <Card className="join-form-card">
            <div className="join-form-heading">
              <span>01</span>

              <div>
                <Title level={3}>League division</Title>
                <Text>
                  Select the division your team wants to join.
                </Text>
              </div>
            </div>

            <Form.Item
              name="divisionId"
              label="Division"
              rules={[
                {
                  required: true,
                  message: "Please select a division.",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select a division"
                options={divisions.map((division) => ({
                  value: division._id,
                  label: division.name,
                }))}
                notFoundContent="No divisions are available."
              />
            </Form.Item>

            {selectedDivision && (
              <Alert
                type="info"
                showIcon
                icon={<TeamOutlined />}
                message={selectedDivision.name}
                description={
                  <Space direction="vertical" size={2}>
                    {selectedDivision.description && (
                      <Text>
                        {selectedDivision.description}
                      </Text>
                    )}

                    <Text type="secondary">
                      Roster requirement:{" "}
                      {selectedDivision.minPlayers}–
                      {selectedDivision.maxPlayers} players
                    </Text>

                    {selectedDivision.ageCutoffDate && (
                      <Text type="secondary">
                        Age cutoff:{" "}
                        {dayjs(
                          selectedDivision.ageCutoffDate,
                        ).format("MMMM D, YYYY")}
                      </Text>
                    )}
                  </Space>
                }
              />
            )}
          </Card>

          <Card className="join-form-card">
            <div className="join-form-heading">
              <span>02</span>

              <div>
                <Title level={3}>Team information</Title>
                <Text>
                  Tell us which team you are registering.
                </Text>
              </div>
            </div>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="teamName"
                  label="Team name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the team name.",
                    },
                    {
                      min: 2,
                      message:
                        "Team name must contain at least 2 characters.",
                    },
                    {
                      max: 80,
                      message:
                        "Team name cannot exceed 80 characters.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<TeamOutlined />}
                    placeholder="Example: Aramyaw Warriors"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="barangay"
                  label="Barangay or community"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please enter your barangay or community.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Example: Barangay 109-A"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="join-form-card">
            <div className="join-form-heading">
              <span>03</span>

              <div>
                <Title level={3}>Coach information</Title>
                <Text>
                  The coach will be the team&apos;s primary contact.
                </Text>
              </div>
            </div>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="coachFirstName"
                  label="First name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the first name.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="First name"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="coachLastName"
                  label="Last name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the last name.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Last name"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="coachEmail"
                  label="Email address"
                  rules={[
                    {
                      required: true,
                      message: "Please enter an email address.",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email address.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type="email"
                    placeholder="coach@example.com"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="coachContactNumber"
                  label="Contact number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter a contact number.",
                    },
                    {
                      pattern: /^(09|\+639)\d{9}$/,
                      message:
                        "Enter a valid Philippine mobile number.",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="09XXXXXXXXX"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="assistantCoach"
                  label="Assistant coach"
                >
                  <Input
                    size="large"
                    placeholder="Optional assistant coach name"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="join-form-card">
            <div className="join-form-heading">
              <span>04</span>

              <div>
                <Title level={3}>Final details</Title>
                <Text>
                  Include any information the organizers should know.
                </Text>
              </div>
            </div>

            <Form.Item name="notes" label="Additional notes">
              <TextArea
                rows={4}
                maxLength={500}
                showCount
                placeholder="Optional notes about your team..."
              />
            </Form.Item>

            <Divider />

            <Form.Item
              name="acceptedTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, checked) =>
                    checked
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "You must confirm the information before submitting.",
                          ),
                        ),
                },
              ]}
            >
              <Checkbox>
                I confirm that the information provided is correct. I
                understand that submitting this form does not
                automatically confirm the team&apos;s league entry.
              </Checkbox>
            </Form.Item>

            <div className="join-submit-row">
              <div>
                <Text strong>Ready to submit?</Text>

                <Text type="secondary">
                  Aramyaw will review your registration before approval.
                </Text>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                disabled={divisions.length === 0}
                icon={<TrophyOutlined />}
              >
                Submit team registration
              </Button>
            </div>
          </Card>
        </Form>
      </div>
    </main>
  );
}