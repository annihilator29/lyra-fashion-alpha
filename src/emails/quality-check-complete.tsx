/**
 * Quality Check Complete Email Template
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

interface QualityCheckEmailProps {
  customerName?: string;
  orderNumber: string;
  items: number;
  estimatedDelivery?: string;
}

export default function QualityCheckEmail({
  orderNumber,
  items,
  estimatedDelivery,
}: QualityCheckEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={headerSection}>
            <Heading style={heading}>Quality Check Complete!</Heading>
            <Text style={subtext}>
              Order #{orderNumber}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Quality Check Details */}
          <Section style={section}>
            <Heading style={sectionHeading}>Your Order Passed Quality Check</Heading>
            <Text style={text}>
              Excellent news! Your order has successfully completed our rigorous quality inspection process.
            </Text>
            <Text style={text}>
              Our quality team carefully examined each of your {items} item{items !== 1 ? 's' : ''} to ensure they meet Lyra Fashion&apos;s exacting standards for craftsmanship and materials.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* What We Checked */}
          <Section style={section}>
            <Heading style={sectionHeading}>Quality Inspections Include</Heading>
            <Text style={text}>
              ✓ Stitching and construction integrity
            </Text>
            <Text style={text}>
              ✓ Material quality and consistency
            </Text>
            <Text style={text}>
              ✓ Size accuracy and fit
            </Text>
            <Text style={text}>
              ✓ Overall finish and presentation
            </Text>
            <Text style={text}>
              ✓ Packaging for safe delivery
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Production Timeline */}
          <Section style={section}>
            <Heading style={sectionHeading}>Production Timeline</Heading>
            <Text style={text}>
              ✓ Order Received
            </Text>
            <Text style={text}>
              ✓ Production Complete
            </Text>
            <Text style={highlightText}>
              ★ Quality Check Passed
            </Text>
            <Text style={text}>
              ○ Shipping Pending
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
                  Your order will be shipped soon and you&apos;ll receive a tracking number once it&apos;s on the way.
                </Text>
              </Section>
            </>
          )}

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
