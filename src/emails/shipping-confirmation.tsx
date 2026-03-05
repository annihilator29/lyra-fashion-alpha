/**
 * Shipping Confirmation Email Template
 * Story 7.3: Order Management & Fulfillment Tools
 * AC4: Shipping & Tracking Management - Email notification
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

interface ShippingConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  shippingAddress: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  orderItems?: Array<{
    product_name?: string;
    quantity: number;
    variant?: {
      size?: string;
      color?: string;
    } | null;
  }>;
}

export function ShippingConfirmationEmail({
  orderNumber,
  customerName,
  carrier,
  trackingNumber,
  estimatedDelivery,
  shippingAddress,
  orderItems = [],
}: ShippingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order has shipped! Track it here.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>LYRA FASHION</Text>
            <Text style={tagline}>Artisan-Crafted Fashion</Text>
          </Section>

          <Heading style={h1}>🎉 Your Order Has Shipped!</Heading>

          <Text style={text}>
            Dear {customerName},
          </Text>

          <Text style={text}>
            Great news! Your order is on its way. We&apos;ve handed it over to {carrier.toUpperCase()} and it should arrive soon.
          </Text>

          {/* Tracking Box */}
          <Section style={trackingBox}>
            <Text style={trackingTitle}>Track Your Package</Text>
            
            <Section style={trackingInfo}>
              <Text style={trackingLabel}>Tracking Number</Text>
              <Text style={trackingValue}>{trackingNumber}</Text>
              
              <Text style={trackingLabel}>Carrier</Text>
              <Text style={text}>{carrier.toUpperCase()}</Text>
              
              {estimatedDelivery && (
                <>
                  <Text style={trackingLabel}>Estimated Delivery</Text>
                  <Text style={text}>{estimatedDelivery}</Text>
                </>
              )}
            </Section>

            <Button style={button} href={getTrackingUrl(carrier, trackingNumber)}>
              Track Your Package
            </Button>
          </Section>

          {/* Order Summary */}
          <Section style={orderBox}>
            <Text style={orderTitle}>Order Summary</Text>
            <Text style={orderLabel}>Order Number: {orderNumber}</Text>
            
            <Hr style={divider} />
            
            {orderItems.length > 0 && (
              <Section>
                {orderItems.map((item, index) => (
                  <Section key={index} style={itemRow}>
                    <Text style={itemText}>
                      {item.product_name}
                      {item.variant && (item.variant.size || item.variant.color) && (
                        <Text style={variantText}>
                          ({item.variant.size}
                          {item.variant.size && item.variant.color && '/'}
                          {item.variant.color})
                        </Text>
                      )}
                    </Text>
                    <Text style={quantityText}>Qty: {item.quantity}</Text>
                  </Section>
                ))}
              </Section>
            )}
          </Section>

          {/* Shipping Address */}
          <Section style={addressBox}>
            <Text style={addressTitle}>Shipping To:</Text>
            <Text style={text}>
              {shippingAddress.name}<br />
              {shippingAddress.address_line1}<br />
              {shippingAddress.address_line2 && (
                <>{shippingAddress.address_line2}<br /></>
              )}
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}<br />
              {shippingAddress.country}
            </Text>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Thank you for shopping with Lyra Fashion!
          </Text>

          <Text style={footerText}>
            Questions? Contact us at support@lyrafashion.com
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

const trackingBox = {
  backgroundColor: '#e8f4f8',
  padding: '25px',
  borderRadius: '8px',
  margin: '25px 0',
  textAlign: 'center' as const,
};

const trackingTitle = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  marginBottom: '20px',
};

const trackingInfo = {
  marginBottom: '20px',
};

const trackingLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  marginBottom: '5px',
};

const trackingValue = {
  color: '#000000',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  marginBottom: '15px',
  fontFamily: 'monospace',
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
};

const orderBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '25px 0',
};

const orderTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  marginBottom: '10px',
};

const orderLabel = {
  color: '#666666',
  fontSize: '14px',
  marginBottom: '15px',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const itemRow = {
  marginBottom: '10px',
  paddingBottom: '10px',
  borderBottom: '1px solid #e5e5e5',
};

const itemText = {
  color: '#000000',
  fontSize: '15px',
  marginBottom: '3px',
};

const variantText = {
  color: '#666666',
  fontSize: '13px',
  marginTop: '3px',
};

const quantityText = {
  color: '#666666',
  fontSize: '14px',
  marginBottom: '0',
};

const addressBox = {
  margin: '25px 0',
};

const addressTitle = {
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

/**
 * Get tracking URL for carrier
 */
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const urls: Record<string, string> = {
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
  };
  return urls[carrier.toLowerCase()] || '#';
}

export default ShippingConfirmationEmail;
