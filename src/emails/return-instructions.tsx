/**
 * Return Instructions Email Template
 * Story 7.3: Order Management & Fulfillment Tools
 * AC5: Refund & Return Processing - Return instructions
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
  Button,
  Hr,
} from '@react-email/components';

interface ReturnInstructionsEmailProps {
  customerName: string;
  rmaNumber: string;
  returnItems: Array<{
    product_name?: string;
    quantity: number;
    variant?: {
      size?: string;
      color?: string;
    } | null;
  }>;
  returnAddress: {
    name: string;
    address_line1: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  returnDeadline: string;
}

export function ReturnInstructionsEmail({
  customerName,
  rmaNumber,
  returnItems,
  returnAddress,
  returnDeadline,
}: ReturnInstructionsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Return instructions for your order</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>LYRA FASHION</Text>
            <Text style={tagline}>Artisan-Crafted Fashion</Text>
          </Section>

          <Heading style={h1}>Return Instructions</Heading>

          <Text style={text}>
            Dear {customerName},
          </Text>

          <Text style={text}>
            We&apos;re sorry to hear that you need to return your order. We&apos;ve made the process as easy as possible for you.
          </Text>

          {/* RMA Box */}
          <Section style={rmaBox}>
            <Text style={rmaTitle}>Your Return Merchandise Authorization (RMA)</Text>
            <Text style={rmaValue}>{rmaNumber}</Text>
            <Text style={rmaNote}>
              ⚠️ Please include this RMA number with your return package
            </Text>
          </Section>

          {/* Return Items */}
          <Section style={itemsBox}>
            <Text style={itemsTitle}>Items to Return</Text>
            {returnItems.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Text style={itemText}>
                  {item.product_name}
                  {item.variant && (item.variant.size || item.variant.color) && (
                    <Text style={variantText}>
                      Size: {item.variant.size || 'N/A'} | Color: {item.variant.color || 'N/A'}
                    </Text>
                  )}
                </Text>
                <Text style={quantityText}>Quantity: {item.quantity}</Text>
              </Section>
            ))}
          </Section>

          {/* Return Steps */}
          <Section style={stepsBox}>
            <Text style={stepsTitle}>How to Return Your Items</Text>

            <Section style={stepItem}>
              <Text style={stepNumber}>1</Text>
              <Text style={stepText}>
                <strong>Pack Items Securely</strong><br />
                Place all items in their original packaging if possible. Include all tags, labels, and any accessories that came with the product.
              </Text>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>2</Text>
              <Text style={stepText}>
                <strong>Include RMA Number</strong><br />
                Write or print your RMA number ({rmaNumber}) and include it inside the package. This helps us process your return quickly.
              </Text>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>3</Text>
              <Text style={stepText}>
                <strong>Ship to Return Address</strong><br />
                Send your package to the address shown below. We recommend using a trackable shipping service.
              </Text>
            </Section>

            <Section style={stepItem}>
              <Text style={stepNumber}>4</Text>
              <Text style={stepText}>
                <strong>Track Your Return</strong><br />
                Once we receive and inspect your return, we&apos;ll process your refund within 5-7 business days.
              </Text>
            </Section>
          </Section>

          {/* Return Address */}
          <Section style={addressBox}>
            <Text style={addressTitle}>Return Shipping Address:</Text>
            <Text style={addressText}>
              {returnAddress.name}<br />
              {returnAddress.address_line1}<br />
              {returnAddress.city}, {returnAddress.state} {returnAddress.postal_code}<br />
              {returnAddress.country}
            </Text>
          </Section>

          {/* Important Info */}
          <Section style={infoBox}>
            <Text style={infoTitle}>Important Information</Text>
            <Text style={infoText}>
              • Returns must be postmarked by <strong>{returnDeadline}</strong>
            </Text>
            <Text style={infoText}>
              • Items must be in original condition with tags attached
            </Text>
            <Text style={infoText}>
              • Final sale items cannot be returned
            </Text>
            <Text style={infoText}>
              • Refunds will be issued to the original payment method
            </Text>
          </Section>

          <Button style={button} href="https://www.lyrafashion.com/returns">
            View Return Policy
          </Button>

          <Hr style={divider} />

          <Text style={footer}>
            We appreciate your business and hope to serve you again.
          </Text>

          <Text style={footerText}>
            Questions? Contact us at support@lyrafashion.com
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

const rmaBox = {
  backgroundColor: '#fff3cd',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
  textAlign: 'center' as const,
  border: '2px dashed #ffc107',
};

const rmaTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  marginBottom: '10px',
};

const rmaValue = {
  color: '#000000',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  fontFamily: 'monospace',
  marginBottom: '10px',
};

const rmaNote = {
  color: '#856404',
  fontSize: '14px',
  marginBottom: '0',
};

const itemsBox = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '6px',
  margin: '25px 0',
};

const itemsTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  marginBottom: '15px',
};

const itemRow = {
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #e5e5e5',
};

const itemText = {
  color: '#000000',
  fontSize: '15px',
  marginBottom: '5px',
};

const variantText = {
  color: '#666666',
  fontSize: '13px',
  marginTop: '5px',
};

const quantityText = {
  color: '#666666',
  fontSize: '14px',
  marginBottom: '0',
};

const stepsBox = {
  margin: '25px 0',
};

const stepsTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  marginBottom: '20px',
};

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '20px',
};

const stepNumber = {
  backgroundColor: '#000000',
  color: '#ffffff',
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '35px',
  marginRight: '15px',
  flexShrink: 0,
  fontWeight: 'bold' as const,
};

const stepText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  marginTop: '5px',
};

const addressBox = {
  backgroundColor: '#e8f4f8',
  padding: '20px',
  borderRadius: '6px',
  margin: '25px 0',
};

const addressTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  marginBottom: '10px',
};

const addressText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  marginBottom: '0',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '6px',
  margin: '25px 0',
  borderLeft: '4px solid #6c757d',
};

const infoTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  marginBottom: '15px',
};

const infoText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  marginBottom: '8px',
};

const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  marginTop: '20px',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '25px 0',
};

const footer = {
  color: '#666666',
  fontSize: '14px',
  textAlign: 'center' as const,
  marginTop: '20px',
  marginBottom: '5px',
};

const footerText = {
  color: '#999999',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginBottom: '3px',
};

export default ReturnInstructionsEmail;
