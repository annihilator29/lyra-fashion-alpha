/**
 * Delivery Confirmation Email Template
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

interface DeliveryConfirmationEmailProps {
  customerName?: string;
  orderNumber: string;
  items: number;
  reviewUrl: string;
}

export default function DeliveryConfirmationEmail({
  customerName = 'Customer',
  orderNumber,
  items,
  reviewUrl,
}: DeliveryConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={headerSection}>
            <Heading style={heading}>Your Order Has Arrived!</Heading>
            <Text style={subtext}>
              Order #{orderNumber}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Thank You Message */}
          <Section style={section}>
            <Text style={text}>
              Great news, {customerName}! Your order with {items} item{items !== 1 ? 's' : ''}{' '}
              has been delivered to your shipping address.
            </Text>
            <Text style={highlightText}>
              We hope you love your new pieces!
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Share Your Experience */}
          <Section style={section}>
            <Heading style={sectionHeading}>Share Your Experience</Heading>
            <Text style={text}>
              Your feedback helps us improve and helps other customers make informed decisions.
            </Text>
            <Section style={buttonContainer}>
              <Button href={reviewUrl} style={button}>
                Write a Review
              </Button>
            </Section>
            <Text style={smallText}>
              Share photos of your new pieces on social media and tag us @lyrafashion
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Personalized Recommendations */}
          <Section style={section}>
            <Heading style={sectionHeading}>You Might Also Like</Heading>
            <Text style={text}>
              Based on your purchase, here are some pieces we think you&apos;ll love:
            </Text>
            <Section style={buttonContainer}>
              <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/products`} style={button}>
                Explore More Styles
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Care Instructions */}
          <Section style={highlightSection}>
            <Heading style={sectionHeading}>Care Tips</Heading>
            <Text style={text}>
              • Hand wash cold with similar colors
            </Text>
            <Text style={text}>
              • Dry flat in shade to maintain shape
            </Text>
            <Text style={text}>
              • Iron on low heat if needed
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Support */}
          <Section style={section}>
            <Text style={text}>
              Questions about your order? We&apos;re here to help.
            </Text>
            <Text style={contactText}>
              Email: support@lyrafashion.com
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing Lyra Fashion. Your support helps skilled artisans
              in Nepal continue their craft.
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

const smallText = {
  color: '#718096',
  fontSize: '14px',
  margin: '8px 0 0 0',
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

const highlightSection = {
  padding: '24px',
  backgroundColor: '#fef9f5',
  borderRadius: '8px',
};

const contactText = {
  color: '#4A5F4B',
  fontSize: '16px',
  fontWeight: '500',
  margin: '8px 0',
};

const footer = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#718096',
  fontSize: '12px',
};
