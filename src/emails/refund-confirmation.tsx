/**
 * Refund Confirmation Email Template
 * Story 7.3: Order Management & Fulfillment Tools
 * AC5: Refund & Return Processing - Email notification
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface RefundConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  refundAmount: number;
  refundReason: string;
  refundId: string;
  refundDate: string;
  expectedProcessingDays: number;
}

export function RefundConfirmationEmail({
  orderNumber,
  customerName,
  refundAmount,
  refundReason,
  refundId,
  refundDate,
  expectedProcessingDays,
}: RefundConfirmationEmailProps) {
  const reasonMessages: Record<string, string> = {
    defective: 'The item was defective or damaged',
    wrong_item: 'You received the wrong item',
    changed_mind: 'You changed your mind about the purchase',
    other: 'As requested',
  };

  return (
    <Html>
      <Head />
      <Preview>Your refund has been processed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>LYRA FASHION</Text>
            <Text style={tagline}>Artisan-Crafted Fashion</Text>
          </Section>

          <Heading style={h1}>Refund Processed</Heading>

          <Text style={text}>
            Dear {customerName},
          </Text>

          <Text style={text}>
            Your refund has been successfully processed. You should see the credit appear in your account within {expectedProcessingDays} business days, depending on your bank&apos;s processing time.
          </Text>

          {/* Refund Details Box */}
          <Section style={refundBox}>
            <Text style={refundTitle}>Refund Details</Text>
            
            <Section style={detailRow}>
              <Text style={detailLabel}>Refund Amount</Text>
              <Text style={refundAmountStyle}>${(refundAmount / 100).toFixed(2)}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={detailRow}>
              <Text style={detailLabel}>Order Number</Text>
              <Text style={detailValue}>{orderNumber}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={detailRow}>
              <Text style={detailLabel}>Refund Reason</Text>
              <Text style={detailValue}>{reasonMessages[refundReason] || refundReason}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={detailRow}>
              <Text style={detailLabel}>Refund ID</Text>
              <Text style={detailValue}>{refundId}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={detailRow}>
              <Text style={detailLabel}>Processed On</Text>
              <Text style={detailValue}>{refundDate}</Text>
            </Section>
          </Section>

          {/* Timeline Box */}
          <Section style={timelineBox}>
            <Text style={timelineTitle}>What Happens Next?</Text>
            
            <Section style={timelineItem}>
              <Text style={timelineStep}>1</Text>
              <Text style={timelineText}>
                <strong>Refund Processed</strong><br />
                We&apos;ve initiated your refund (completed)
              </Text>
            </Section>

            <Section style={timelineItem}>
              <Text style={timelineStep}>2</Text>
              <Text style={timelineText}>
                <strong>Bank Processing</strong><br />
                Your bank processes the refund ({expectedProcessingDays} business days)
              </Text>
            </Section>

            <Section style={timelineItem}>
              <Text style={timelineStep}>3</Text>
              <Text style={timelineText}>
                <strong>Credit Posted</strong><br />
                Funds appear in your account
              </Text>
            </Section>
          </Section>

          {/* Return Instructions (if applicable) */}
          {(refundReason === 'defective' || refundReason === 'wrong_item') && (
            <Section style={returnBox}>
              <Text style={returnTitle}>Return Instructions</Text>
              <Text style={text}>
                Since your refund was due to {reasonMessages[refundReason]}, we&apos;ll send you a prepaid return label via email within 24 hours. Please package the item securely and drop it off at any authorized shipping location.
              </Text>
            </Section>
          )}

          <Hr style={divider} />

          <Text style={footer}>
            We&apos;re sorry to see you go and hope to serve you better in the future.
          </Text>

          <Text style={footerText}>
            Questions? Reply to this email or contact us at support@lyrafashion.com
          </Text>

          <Text style={footerText}>
            www.lyrafashion.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const logo = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#000000',
  marginBottom: '5px',
};

const tagline = {
  fontSize: '14px',
  color: '#666666',
  marginBottom: '0',
};

const h1 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '10px',
};

const refundBox = {
  backgroundColor: '#f0f9f0',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
  border: '1px solid #c3e6cb',
};

const refundTitle = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  marginBottom: '20px',
};

const detailRow = {
  marginBottom: '5px',
};

const detailLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  marginBottom: '5px',
};

const detailValue = {
  color: '#000000',
  fontSize: '15px',
  marginBottom: '0',
};

const refundAmountStyle = {
  color: '#28a745',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  marginBottom: '0',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '15px 0',
};

const timelineBox = {
  backgroundColor: '#f8f9fa',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
};

const timelineTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  marginBottom: '20px',
};

const timelineItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const timelineStep = {
  backgroundColor: '#000000',
  color: '#ffffff',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '30px',
  marginRight: '15px',
  flexShrink: 0,
  fontWeight: 'bold' as const,
};

const timelineText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  marginTop: '3px',
};

const returnBox = {
  backgroundColor: '#fff3cd',
  padding: '20px',
  borderRadius: '6px',
  margin: '25px 0',
  borderLeft: '4px solid #ffc107',
};

const returnTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  marginBottom: '10px',
};

const footer = {
  color: '#666666',
  fontSize: '14px',
  textAlign: 'center' as const,
  marginTop: '30px',
  marginBottom: '5px',
};

const footerText = {
  color: '#999999',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginBottom: '3px',
};

export default RefundConfirmationEmail;
