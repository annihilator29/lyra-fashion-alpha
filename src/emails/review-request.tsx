/**
 * Review Request Email Template
 * Story 5.4: Reviews - Post-Purchase Email Workflow (AC #5)
 * 
 * 7-day review request email sent after order delivery
 * Warm terracotta (#C87E6C) CTA button encouraging customers to help others
 */

import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface ReviewRequestEmailProps {
  customerName: string;
  productName: string;
  productImage: string;
  reviewUrl: string;
  orderDate: string;
}

export default function ReviewRequestEmail({
  customerName,
  productName,
  productImage,
  reviewUrl,
  orderDate,
}: ReviewRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>How&apos;s your {productName}? Share your experience with us</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Img
            src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
            width="150"
            height="50"
            alt="Lyra Fashion"
            style={{ margin: '0 auto', display: 'block' }}
          />

          {/* Header */}
          <Section style={headerSection}>
            <Heading style={heading}>
              How&apos;s Your New {productName}?
            </Heading>
            <Text style={subtext}>
              Purchased on {new Date(orderDate).toLocaleDateString()}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Product Image */}
          <Section style={productSection}>
            <Row>
              <Column>
                <Img
                  src={productImage || `${process.env.NEXT_PUBLIC_APP_URL}/images/placeholder.jpg`}
                  width="200"
                  height="200"
                  alt={productName}
                  style={productImageStyle}
                />
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Main Message */}
          <Section style={section}>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              It&apos;s been a week since your order was delivered, and we hope you&apos;re loving your new {productName}!
            </Text>
            <Text style={highlightText}>
              Your experience matters to us and to future customers.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Helping Others Section */}
          <Section style={section}>
            <Heading style={sectionHeading}>Help Other Customers</Heading>
            <Text style={text}>
              By sharing your honest review, you&apos;ll help other shoppers:
            </Text>
            <Text style={bulletPoint}>
              • Make informed purchasing decisions
            </Text>
            <Text style={bulletPoint}>
              • Understand fit and sizing
            </Text>
            <Text style={bulletPoint}>
              • Learn about quality and craftsmanship
            </Text>
            <Text style={bulletPoint}>
              • Discover styling tips
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA Section with Terracotta Button */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              It only takes a minute to share your thoughts!
            </Text>
            <Button href={reviewUrl} style={button}>
              Write a Review
            </Button>
            <Text style={smallText}>
              Click the button above or copy and paste this link: {reviewUrl}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Trust & Safety */}
          <Section style={trustSection}>
            <Text style={trustText}>
              Your review will be moderated to ensure authenticity and helpfulness. 
              We value your honest feedback—whether it&apos;s positive or constructive.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Support */}
          <Section style={section}>
            <Text style={text}>
              Have questions about your order or need assistance?
            </Text>
            <Text style={contactText}>
              Email us at support@lyrafashion.com
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer with Expiry Notice */}
          <Section style={footerSection}>
            <Text style={footerExpiryNotice}>
              This review link expires in 30 days
            </Text>
            <Text style={footerText}>
              You received this email because you recently purchased from Lyra Fashion.
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

// Styles - Organic Modern Design System
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

const headerSection = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const heading = {
  color: '#4A5F4B',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
};

const subtext = {
  color: '#718096',
  fontSize: '14px',
  margin: '0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const productSection = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const productImageStyle = {
  borderRadius: '8px',
  display: 'block',
  margin: '0 auto',
  objectFit: 'cover' as const,
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
  margin: '0 0 16px 0',
};

const highlightText = {
  color: '#C87E6C',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
  lineHeight: '1.4',
};

const bulletPoint = {
  color: '#4a4a4a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
  paddingLeft: '8px',
};

const ctaSection = {
  padding: '24px 0',
  textAlign: 'center' as const,
  backgroundColor: '#fef9f5',
  borderRadius: '8px',
  margin: '20px 0',
};

const ctaText = {
  color: '#4a4a4a',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 20px 0',
};

const button = {
  backgroundColor: '#C87E6C',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 0 12px 0',
};

const smallText = {
  color: '#718096',
  fontSize: '12px',
  margin: '12px 0 0 0',
  wordBreak: 'break-all' as const,
};

const trustSection = {
  padding: '20px',
  backgroundColor: '#f8faf7',
  borderRadius: '8px',
};

const trustText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic',
};

const contactText = {
  color: '#4A5F4B',
  fontSize: '16px',
  fontWeight: '500',
  margin: '8px 0',
  textAlign: 'center' as const,
};

const footerSection = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const footerExpiryNotice = {
  color: '#C87E6C',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const footerText = {
  color: '#718096',
  fontSize: '12px',
  margin: '0 0 8px 0',
};
