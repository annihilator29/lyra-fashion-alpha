/**
 * Return Rejected Email Template
 * Story 6.4: Returns & Refunds Processing - AC-6
 * Sent when return is rejected after inspection
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

interface ReturnRejectedEmailProps {
  returnData: {
    rma_number: string;
    rejection_reason: string;
    inspection_notes: string | null;
    rejected_at: string;
  };
  order: {
    id: string;
    order_number: string;
  };
}

export default function ReturnRejectedEmail({ returnData, order }: ReturnRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Return Update Required - Action Needed</Preview>
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
            <Heading style={heading}>Return Update Required</Heading>
            <Text style={subheading}>
              We need to discuss the return for order #{order.order_number}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={text}>
              After inspecting your return, we&apos;ve determined that the items don&apos;t meet 
              our return criteria. We understand this may be disappointing, and we&apos;re here 
              to help find a solution.
            </Text>

            <div style={rejectionBox}>
              <Text style={rejectionHeading}>Return Not Approved</Text>
              <Text style={rejectionText}>
                <strong>Reason:</strong> {returnData.rejection_reason}
              </Text>
              {returnData.inspection_notes && (
                <Text style={rejectionText}>
                  <strong>Inspection Notes:</strong> {returnData.inspection_notes}
                </Text>
              )}
            </div>

            <div style={detailsBox}>
              <Text style={detailsHeading}>Return Information:</Text>
              <Text style={detailsText}>
                <strong>RMA Number:</strong> {returnData.rma_number}
              </Text>
              <Text style={detailsText}>
                <strong>Order:</strong> #{order.order_number}
              </Text>
              <Text style={detailsText}>
                <strong>Date:</strong> {new Date(returnData.rejected_at).toLocaleDateString()}
              </Text>
            </div>
          </Section>

          <Section style={section}>
            <Text style={text}>
              <strong>Your Options:</strong>
            </Text>
            <div style={optionsBox}>
              <Text style={optionHeading}>Option 1: Return Items to You</Text>
              <Text style={optionText}>
                We can ship the items back to you at your expense. Please reply to this email 
                to confirm your shipping address.
              </Text>
            </div>
            <div style={optionsBox}>
              <Text style={optionHeading}>Option 2: Donation with Store Credit</Text>
              <Text style={optionText}>
                We can donate the items to a local charity on your behalf and provide you with 
                store credit for future purchases.
              </Text>
            </div>
            <div style={optionsBox}>
              <Text style={optionHeading}>Option 3: Appeal the Decision</Text>
              <Text style={optionText}>
                If you believe this decision was made in error, please reply to this email with 
                additional information or photos, and we&apos;ll review your case.
              </Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={ctaSection}>
            <Button
              href={`mailto:support@lyrafashion.com?subject=Return Appeal - ${returnData.rma_number}`}
              style={button}
            >
              Contact Support
            </Button>
            <div style={{ marginTop: '12px' }}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`}
                style={secondaryButton}
              >
                View Return Details
              </Button>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={text}>
              <strong>Our Return Policy:</strong>
            </Text>
            <Text style={policyText}>
              Items must be unworn, unwashed, and have original tags attached to be eligible 
              for a full refund. Items showing signs of wear, damage beyond original condition, 
              or missing tags may be subject to rejection or partial refund.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              We&apos;re here to help find a solution that works for you.
            </Text>
            <Text style={footerText}>
              Contact us at support@lyrafashion.com or reply to this email.
            </Text>
            <Text style={footerText}>
              Lyra Fashion • We Value Your Business
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

const rejectionBox = {
  backgroundColor: '#FED7D7',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  border: '1px solid #FC8181',
};

const rejectionHeading = {
  color: '#C53030',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const rejectionText = {
  color: '#742A2A',
  fontSize: '14px',
  margin: '0 0 8px 0',
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

const optionsBox = {
  backgroundColor: '#EBF8FF',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
  borderLeft: "4px solid '#4A5F4B'",
};

const optionHeading = {
  color: '#2C5282',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const optionText = {
  color: '#1a202c',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.5',
};

const policyText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
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

const secondaryButton = {
  backgroundColor: 'transparent',
  color: '#4A5F4B',
  padding: '12px 24px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  border: '2px solid #4A5F4B',
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
