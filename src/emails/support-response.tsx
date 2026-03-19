/**
 * Support Response Email Template
 * Story 7.4b: Support Ticket System
 *
 * Generic admin → customer response email. Used for all direct emails
 * sent from the admin support interface.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface SupportResponseEmailProps {
  customerName: string;
  body: string;
}

export default function SupportResponseEmail({
  customerName,
  body,
}: SupportResponseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A message from Lyra Fashion Support</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
            width="150"
            height="50"
            alt="Lyra Fashion"
            style={{ margin: '0 auto', display: 'block' }}
          />

          <Section style={headerSection}>
            <Heading style={heading}>Hi {customerName},</Heading>
            <Text style={subheading}>
              You have a message from our support team.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={bodySection}>
            {body.split('\n').map((line, i) => (
              <Text key={i} style={bodyText}>
                {line || '\u00A0'}
              </Text>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/account`}
              style={button}
            >
              View My Account
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Questions? Reply to this email or visit our{' '}
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/contact`} style={link}>
                Help Centre
              </a>
              .
            </Text>
            <Text style={footerText}>
              Lyra Fashion · Factory-Direct, Sustainable Fashion
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9f4',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px 0',
  maxWidth: '600px',
};
const headerSection = { padding: '24px 0', textAlign: 'center' as const };
const heading = {
  color: '#4A5F4B',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};
const subheading = { color: '#718096', fontSize: '15px', margin: 0 };
const hr = { borderColor: '#e2e8f0', margin: '20px 0' };
const bodySection = { padding: '20px 40px' };
const bodyText = {
  color: '#1a202c',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};
const ctaSection = { padding: '16px 0', textAlign: 'center' as const };
const button = {
  backgroundColor: '#4A5F4B',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '4px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};
const footerSection = { padding: '12px 0', textAlign: 'center' as const };
const footerText = { color: '#718096', fontSize: '12px', margin: '0 0 6px 0' };
const link = { color: '#4A5F4B' };
