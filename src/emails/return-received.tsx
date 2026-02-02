/**
 * Return Received Email Template
 * Story 6.4: Returns & Refunds Processing
 * Sent when return package arrives at warehouse
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

interface ReturnReceivedEmailProps {
  returnData: {
    rma_number: string;
    received_at: string;
  };
  order: {
    id: string;
    order_number: string;
  };
}

export default function ReturnReceivedEmail({ returnData, order }: ReturnReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Return Received - Now Being Inspected</Preview>
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
            <Heading style={heading}>Return Package Received 📦</Heading>
            <Text style={subheading}>
              We&apos;ve received your return and it&apos;s now being inspected.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={text}>
              Your return package for order #{order.order_number} arrived at our facility on{' '}
              {new Date(returnData.received_at).toLocaleDateString()}. 
              Our quality team is now inspecting the items to ensure they meet our return criteria.
            </Text>

            <div style={detailsBox}>
              <Text style={detailsHeading}>Return Status:</Text>
              <Text style={detailsText}>
                <strong>RMA Number:</strong> {returnData.rma_number}
              </Text>
              <Text style={detailsText}>
                <strong>Received On:</strong> {new Date(returnData.received_at).toLocaleDateString()}
              </Text>
              <Text style={detailsText}>
                <strong>Current Status:</strong> Inspecting Items
              </Text>
            </div>
          </Section>

          <Section style={section}>
            <Text style={text}>
              <strong>What happens next?</strong>
            </Text>
            <ul style={list}>
              <li>Our team inspects items for condition (unworn, tags attached)</li>
              <li>Once approved, your refund will be processed</li>
              <li>Refund will appear in your account within 5-7 business days</li>
              <li>You&apos;ll receive an email confirmation once the refund is complete</li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`}
              style={button}
            >
              Track Return Status
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Questions? Contact us at support@lyrafashion.com
            </Text>
            <Text style={footerText}>
              Lyra Fashion • Free Returns. Always.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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
  padding: '24px 0',
  textAlign: 'center' as const,
};

const heading = {
  color: '#4A5F4B',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const subheading = {
  color: '#1a202c',
  fontSize: '16px',
  margin: '0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

const section = {
  padding: '20px 0',
};

const text = {
  color: '#1a202c',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const detailsBox = {
  backgroundColor: '#f7fafc',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const detailsHeading = {
  color: '#4A5F4B',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const detailsText = {
  color: '#1a202c',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const list = {
  color: '#1a202c',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
  paddingLeft: '24px',
};

const ctaSection = {
  padding: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4A5F4B',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const footerSection = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#718096',
  fontSize: '12px',
  margin: '0 0 8px 0',
};
