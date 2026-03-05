/**
 * Order Status Update Email Template
 * Story 7.3: Order Management & Fulfillment Tools
 * AC3: Order Status Updates - Email notification
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

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  oldStatus?: string;
  newStatus: string;
  customerName: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export function OrderStatusUpdateEmail({
  orderNumber,
  oldStatus,
  newStatus,
  customerName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  notes,
}: OrderStatusUpdateEmailProps) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    production: {
      title: 'Your Order is Being Crafted',
      message: 'Our artisans have started working on your handmade piece.',
    },
    quality_check: {
      title: 'Quality Inspection in Progress',
      message: 'Your order is undergoing our thorough quality check.',
    },
    shipped: {
      title: 'Your Order Has Shipped!',
      message: 'Great news! Your order is on its way to you.',
    },
    delivered: {
      title: 'Your Order Has Been Delivered',
      message: 'We hope you love your new Lyra Fashion piece!',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled as requested.',
    },
  };

  const statusInfo = statusMessages[newStatus] || {
    title: `Order Status Updated`,
    message: `Your order status has been changed to ${newStatus}.`,
  };

  return (
    <Html>
      <Head />
      <Preview>{statusInfo.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{statusInfo.title}</Heading>
          
          <Text style={text}>
            Dear {customerName},
          </Text>

          <Text style={text}>
            {statusInfo.message}
          </Text>

          {/* Order Details Box */}
          <Section style={orderBox}>
            <Text style={orderLabel}>Order Number</Text>
            <Text style={orderValue}>{orderNumber}</Text>
            
            <Hr style={divider} />
            
            <Text style={orderLabel}>Status</Text>
            <Text style={statusValue}>{newStatus.replace('_', ' ').toUpperCase()}</Text>
            
            {oldStatus && (
              <>
                <Hr style={divider} />
                <Text style={orderLabel}>Previous Status</Text>
                <Text style={text}>{oldStatus.replace('_', ' ')}</Text>
              </>
            )}
          </Section>

          {/* Tracking Information */}
          {trackingNumber && carrier && (
            <Section style={trackingBox}>
              <Text style={trackingTitle}>📦 Tracking Information</Text>
              <Text style={text}>
                <strong>Carrier:</strong> {carrier.toUpperCase()}
              </Text>
              <Text style={text}>
                <strong>Tracking Number:</strong> {trackingNumber}
              </Text>
              {estimatedDelivery && (
                <Text style={text}>
                  <strong>Estimated Delivery:</strong> {estimatedDelivery}
                </Text>
              )}
              <Button style={button} href={getTrackingUrl(carrier, trackingNumber)}>
                Track Your Package
              </Button>
            </Section>
          )}

          {/* Notes */}
          {notes && (
            <Section style={notesBox}>
              <Text style={notesTitle}>Message from Lyra Fashion:</Text>
              <Text style={notesText}>{notes}</Text>
            </Section>
          )}

          <Hr style={divider} />

          <Text style={footer}>
            Thank you for choosing Lyra Fashion.
          </Text>

          <Text style={footerText}>
            Questions? Reply to this email or contact us at support@lyrafashion.com
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

const h1 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '10px',
};

const orderBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
};

const orderLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  marginBottom: '5px',
};

const orderValue = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  marginBottom: '15px',
};

const statusValue = {
  color: '#000000',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  marginBottom: '0',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '15px 0',
};

const trackingBox = {
  backgroundColor: '#e8f4f8',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
};

const trackingTitle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  marginBottom: '15px',
};

const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  marginTop: '15px',
  fontWeight: 'bold' as const,
};

const notesBox = {
  backgroundColor: '#fff9e6',
  padding: '20px',
  borderRadius: '6px',
  margin: '20px 0',
  borderLeft: '4px solid #f5c518',
};

const notesTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  marginBottom: '10px',
};

const notesText = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '22px',
  marginBottom: '0',
  fontStyle: 'italic' as const,
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
  marginBottom: '0',
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

export default OrderStatusUpdateEmail;
