/**
 * Production Started Email Template
 * Story 6.1: Order Status Tracking System
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components';

interface ProductionStartedEmailProps {
  customerName?: string;
  orderNumber: string;
  items: number;
  estimatedDelivery?: string;
}

export default function ProductionStartedEmail({
  orderNumber,
  items,
  estimatedDelivery,
}: ProductionStartedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={headerSection}>
            <Heading style={heading}>Your Order is in Production!</Heading>
            <Text style={subtext}>
              Order #{orderNumber}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Production Details */}
          <Section style={section}>
            <Heading style={sectionHeading}>Production Status</Heading>
            <Text style={text}>
              Great news! Your order with {items} item{items !== 1 ? 's' : ''} has entered our production phase.
            </Text>
            <Text style={text}>
              Our skilled artisans are now crafting your {items === 1 ? 'item' : 'items'} with the care and attention to detail that defines Lyra Fashion.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Production Process */}
          <Section style={section}>
            <Heading style={sectionHeading}>What Happens Next</Heading>
            <Text style={text}>
              <strong>Production:</strong> Our expert craftspeople create your garments using sustainable materials and ethical practices.
            </Text>
            <Text style={text}>
              <strong>Quality Check:</strong> Each item undergoes rigorous inspection to ensure it meets our high standards.
            </Text>
            <Text style={text}>
              <strong>Shipping:</strong> Your order will be carefully packaged and shipped to your address.
            </Text>
          </Section>

          {estimatedDelivery && (
            <>
              <Hr style={hr} />
              <Section style={section}>
                <Heading style={sectionHeading}>Estimated Delivery</Heading>
                <Text style={highlightText}>
                  {estimatedDelivery}
                </Text>
                <Text style={text}>
                  We&apos;ll keep you updated as your order progresses through each stage.
                </Text>
              </Section>
            </>
          )}

          <Hr style={hr} />

          {/* Production Timeline */}
          <Section style={section}>
            <Heading style={sectionHeading}>Production Timeline</Heading>
            <Text style={text}>
              ✓ Order Received
            </Text>
            <Text style={highlightText}>
              ★ Production In Progress
            </Text>
            <Text style={text}>
              ○ Quality Check Pending
            </Text>
            <Text style={text}>
              ○ Shipping Pending
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order? Contact us at support@lyrafashion.com
            </Text>
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
  margin: '0',
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

const footer = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#718096',
  fontSize: '12px',
  margin: '0 0 8px 0',
};
