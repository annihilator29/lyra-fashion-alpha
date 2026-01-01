/**
 * Shipment Notification Email Template
 * Story 4.5: Email Notifications & Marketing Preferences
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface ShipmentNotificationEmailProps {
  customerName?: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  estimatedDelivery: string;
  items: number;
}

export default function ShipmentNotificationEmail({
  customerName = 'Customer',
  orderNumber,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery,
  items,
}: ShipmentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={headerSection}>
            <Heading style={heading}>Your Order Has Shipped!</Heading>
            <Text style={subtext}>
              Order #{orderNumber}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Tracking Information */}
          <Section style={section}>
            <Heading style={sectionHeading}>Shipment Details</Heading>
            <Text style={text}>
              Your order with {items} item{items !== 1 ? 's' : ''} has been shipped via {carrier}.
            </Text>
            <Text style={text}>
              Tracking Number:{' '}
              <strong>{trackingNumber}</strong>
            </Text>
            <Section style={buttonContainer}>
              <Button href={trackingUrl} style={button}>
                Track Your Package
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Delivery Estimate */}
          <Section style={section}>
            <Heading style={sectionHeading}>Estimated Delivery</Heading>
            <Text style={highlightText}>
              {estimatedDelivery}
            </Text>
            <Text style={text}>
              Delivery times may vary based on your location and shipping carrier schedules.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* What to Expect */}
          <Section style={section}>
            <Heading style={sectionHeading}>What to Expect</Heading>
            <Text style={text}>
              • Package is in transit to your shipping address
            </Text>
            <Text style={text}>
              • You&apos;ll receive delivery confirmation once it arrives
            </Text>
            <Text style={text}>
              • Need help? Contact us at support@lyrafashion.com
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Lyra Fashion • Factory-Direct, Sustainable Fashion
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px 0',
  maxWidth: '600px',
};

const headerSection = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const subtext = {
  color: '#718096',
  fontSize: '16px',
  margin: '0 0 8px 0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const section = {
  padding: '20px 0',
};

const sectionHeading = {
  color: '#4A5F4B',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

const highlightText = {
  color: '#4A5F4B',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4A5F4B',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const footer = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#718096',
  fontSize: '12px',
};
