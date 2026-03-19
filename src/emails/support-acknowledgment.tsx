/**
 * Support Acknowledgment Email Template
 * Story 7.4b: Support Ticket System
 *
 * Sent to customer when a support ticket is created, confirming receipt.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface SupportAcknowledgmentEmailProps {
  customerName: string;
  ticketNumber: string;
  ticketSubject: string;
}

export default function SupportAcknowledgmentEmail({
  customerName,
  ticketNumber,
  ticketSubject,
}: SupportAcknowledgmentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your support request — {ticketNumber}</Preview>
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
            <Heading style={heading}>We&#39;re on it, {customerName}!</Heading>
            <Text style={subheading}>
              Your support request has been received and our team will be in touch shortly.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={detailSection}>
            <Text style={labelText}>Ticket Number</Text>
            <Text style={valueText}>{ticketNumber}</Text>

            <Text style={labelText}>Subject</Text>
            <Text style={valueText}>{ticketSubject}</Text>

            <Text style={labelText}>Expected Response Time</Text>
            <Text style={valueText}>Within 1–2 business days</Text>
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
              Reply to this email if you have additional information to add.
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
const detailSection = { padding: '16px 40px' };
const labelText = {
  color: '#718096',
  fontSize: '12px',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '12px 0 2px 0',
};
const valueText = {
  color: '#1a202c',
  fontSize: '15px',
  fontWeight: '600' as const,
  margin: 0,
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
