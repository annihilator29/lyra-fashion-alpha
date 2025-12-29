/**
 * Email System - MVP Documentation
 *
 * NOTE: Email verification is marked as OPTIONAL for MVP in Story 4.1 (line 18).
 *
 * For MVP Phase:
 * - Email templates are created but not actively used
 * - Users can sign up and authenticate without email verification
 * - Email functionality is prepared for Growth phase
 *
 * For Growth Phase:
 * - Enable email verification in Supabase settings
 * - Integrate Resend API with credentials from Story 3.4
 * - Use templates below for welcome and password reset emails
 * - Update AuthForm to check email verification status
 *
 * References:
 * - Story 4.1: docs/stories/4-1-user-registration-authentication.md
 * - Story 3.4: Configure SMTP settings (referenced in Story 4.1 task #59)
 */

import { Button } from '@react-email/components';
import { Html } from '@react-email/components';
import { Head } from '@react-email/components';
import { Body } from '@react-email/components';
import { Container } from '@react-email/components';
import { Heading } from '@react-email/components';
import { Text } from '@react-email/components';
import { Section } from '@react-email/components';

// ========================
// WELCOME EMAIL TEMPLATE
// ========================

export interface WelcomeEmailProps {
  name?: string;
  email: string;
  verificationUrl?: string;
}

export function WelcomeEmail({ name, email, verificationUrl }: WelcomeEmailProps) {
  const displayName = name || email.split('@')[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to Lyra Fashion!</Heading>

          <Text style={text}>
            Hi {displayName},
          </Text>

          <Text style={text}>
            Thank you for creating an account with Lyra Fashion. We&apos;re excited to have you join our community of fashion enthusiasts.
          </Text>

          {verificationUrl && (
            <>
              <Text style={text}>
                Please verify your email address by clicking the button below:
              </Text>

              <Section style={buttonContainer}>
                <Button
                  style={button}
                  href={verificationUrl}
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text style={text}>
                Or copy and paste this link into your browser:
              </Text>

              <Text style={link}>
                {verificationUrl}
              </Text>
            </>
          )}

          <Text style={text}>
            If you didn&apos;t create this account, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Lyra Fashion Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ========================
// PASSWORD RESET EMAIL TEMPLATE
// ========================

export interface PasswordResetEmailProps {
  name?: string;
  email: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, email, resetUrl }: PasswordResetEmailProps) {
  const displayName = name || email.split('@')[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Password Reset Request</Heading>

          <Text style={text}>
            Hi {displayName},
          </Text>

          <Text style={text}>
            We received a request to reset the password for your Lyra Fashion account. If you made this request, please click the button below to create a new password:
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={resetUrl}
            >
              Reset My Password
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>

          <Text style={link}>
            {resetUrl}
          </Text>

          <Text style={warning}>
            ⚠️ This link will expire in 1 hour for your security.
          </Text>

          <Text style={text}>
            If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Lyra Fashion Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ========================
// EMAIL VERIFICATION EMAIL TEMPLATE
// ========================

export interface EmailVerificationEmailProps {
  name?: string;
  email: string;
  verificationUrl: string;
}

export function EmailVerificationEmail({ name, email, verificationUrl }: EmailVerificationEmailProps) {
  const displayName = name || email.split('@')[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify Your Email Address</Heading>

          <Text style={text}>
            Hi {displayName},
          </Text>

          <Text style={text}>
            Please verify your email address to complete your Lyra Fashion account registration:
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={verificationUrl}
            >
              Verify Email Address
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>

          <Text style={link}>
            {verificationUrl}
          </Text>

          <Text style={warning}>
            ⚠️ This link will expire in 24 hours for your security.
          </Text>

          <Text style={text}>
            If you didn&apos;t create a Lyra Fashion account, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Lyra Fashion Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ========================
// STYLES
// ========================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px 0',
  textAlign: 'left' as const,
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none' as const,
  display: 'inline-block',
};

const link = {
  color: '#1a1a1a',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  margin: '8px 0',
};

const warning = {
  color: '#d97706',
  fontSize: '14px',
  margin: '16px 0',
  fontWeight: '500',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '32px 0 0 0',
  borderTop: '1px solid #e5e7eb',
  paddingTop: '24px',
};
