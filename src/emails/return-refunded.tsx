/**
 * Return Refunded Email Template
 * Story 6.4: Returns & Refunds Processing
 * Sent when refund is processed
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

interface ReturnRefundedEmailProps {
  returnData: {
    rma_number: string;
    refund_amount: number;
    stripe_refund_id: string | null;
    refunded_at: string;
  };
  order: {
    id: string;
    order_number: string;
  };
}

export default function ReturnRefundedEmail({ returnData, order }: ReturnRefundedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Refund Processed - {returnData.refund_amount.toFixed(2)} Refunded</Preview>
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
            <Heading style={heading}>Refund Processed! 💰</Heading>
            <Text style={subheading}>
              Your refund of ${returnData.refund_amount.toFixed(2)} has been processed.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={text}>
              Great news! We&apos;ve processed your refund for order #{order.order_number}. 
              The refund has been issued to your original payment method.
            </Text>

            <div style={refundBox}>
              <Text style={refundAmount}>${returnData.refund_amount.toFixed(2)}</Text>
              <Text style={refundLabel}>Refunded to Original Payment Method</Text>
            </div>

            <div style={detailsBox}>
              <Text style={detailsHeading}>Refund Details:</Text>
              <Text style={detailsText}>
                <strong>RMA Number:</strong> {returnData.rma_number}
              </Text>
              <Text style={detailsText}>
                <strong>Order:</strong> #{order.order_number}
              </Text>
              <Text style={detailsText}>
                <strong>Refund Date:</strong> {new Date(returnData.refunded_at).toLocaleDateString()}
              </Text>
              {returnData.stripe_refund_id && (
                <Text style={detailsText}>
                  <strong>Transaction ID:</strong> {returnData.stripe_refund_id}
                </Text>
              )}
            </div>
          </Section>

          <Section style={section}>
            <Text style={text}>
              <strong>When will I see the refund?</strong>
            </Text>
            <ul style={list}>
              <li>Credit/Debit Cards: 3-5 business days</li>
              <li>Bank Accounts: 5-7 business days</li>
              <li>Depending on your bank&apos;s processing time</li>
            </ul>
            <Text style={text}>
              If you don&apos;t see the refund after 7 business days, please contact your 
              bank or credit card company first, then reach out to us if needed.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`}
              style={button}
            >
              View Order Details
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Thank you for shopping with Lyra Fashion!
            </Text>
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

const refundBox = {
  backgroundColor: '#4A5F4B',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const refundAmount = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const refundLabel = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
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
