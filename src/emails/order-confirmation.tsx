/**
 * Order Confirmation Email Template
 * Story 3-4: Order Confirmation & Email Notification
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

interface OrderConfirmationEmailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
}

export default function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  const customerName = order.customer_name || 'Customer';

  // Calculate estimated delivery date (7-14 business days)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);

  return (
    <Html>
      <Head />
      <Preview>Thank you for your order, {customerName}!</Preview>
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
              Thank you for your order, {customerName}!
            </Heading>
            <Text style={orderNumberText}>
              Order #{order.order_number}
            </Text>
            <Text style={orderDateText}>
              Order Date: {new Date(order.created_at).toLocaleDateString()}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Order Items Table */}
          <Section style={section}>
            <Heading style={sectionHeading}>Order Details</Heading>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {order.order_items.map((item: any) => (
              <Row key={item.id}>
                <Column style={productImageColumn}>
                  <Img
                    src={item.products?.images?.[0] || `${process.env.NEXT_PUBLIC_APP_URL}/images/placeholder.jpg`}
                    width="60"
                    height="60"
                    alt={item.products?.name}
                  />
                </Column>
                <Column style={productDetailsColumn}>
                  <Text style={productName}>{item.products?.name}</Text>
                  <Text style={productVariant}>
                    {item.variant?.size} / {item.variant?.color}
                  </Text>
                  <Text style={productQty}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={priceColumn}>
                  <Text style={price}>
                    ${(item.price * item.quantity / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Order Totals */}
          <Section style={section}>
            <Row>
              <Column style={totalLabelColumn}>
                <Text style={totalLabel}>Subtotal</Text>
                <Text style={totalLabel}>Shipping</Text>
                <Text style={totalLabel}>Tax</Text>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column style={totalValueColumn}>
                <Text style={totalValue}>
                  ${((order.total - (order.shipping || 0) - (order.tax || 0)) / 100).toFixed(2)}
                </Text>
                <Text style={totalValue}>
                  ${((order.shipping || 0) / 100).toFixed(2)}
                </Text>
                <Text style={totalValue}>
                  ${((order.tax || 0) / 100).toFixed(2)}
                </Text>
                <Text style={totalTotal}>
                  ${(order.total / 100).toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          <Section style={section}>
            <Heading style={sectionHeading}>Shipping Address</Heading>
            <Text style={addressText}>
              {order.shipping_address?.full_name}
            </Text>
            <Text style={addressText}>
              {order.shipping_address?.address_line1}
            </Text>
            {order.shipping_address?.address_line2 && (
              <Text style={addressText}>
                {order.shipping_address.address_line2}
              </Text>
            )}
            <Text style={addressText}>
              {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
              {order.shipping_address?.postal_code}
            </Text>
            <Text style={addressText}>
              {order.shipping_address?.country}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Factory Story */}
          <Section style={factorySection}>
            <Text style={factoryText}>
              Your pieces are being carefully crafted at our partner factory in
              Nepal, where skilled artisans bring decades of expertise to every
              stitch.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Next Steps */}
          <Section style={section}>
            <Heading style={sectionHeading}>What&apos;s Next?</Heading>
            <Text style={nextStepsText}>
              • Your order is currently being crafted with care
            </Text>
            <Text style={nextStepsText}>
              • Estimated delivery:{' '}
              {estimatedDelivery.toLocaleDateString()} (7-14 business days)
            </Text>
            <Text style={nextStepsText}>
              • You&apos;ll receive a tracking notification when your order ships
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/confirmation`}
              style={button}
            >
              View Your Order
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Questions? Contact us at support@lyrafashion.com
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
};

const orderNumberText = {
  color: '#1a202c',
  fontSize: '16px',
  margin: '0 0 8px 0',
};

const orderDateText = {
  color: '#718096',
  fontSize: '14px',
  margin: '0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
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

const productImageColumn = {
  width: '80px',
};

const productDetailsColumn = {
  width: '200px',
};

const productName = {
  color: '#1a202c',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const productVariant = {
  color: '#718096',
  fontSize: '14px',
  margin: '0 0 4px 0',
};

const productQty = {
  color: '#718096',
  fontSize: '14px',
  margin: '0',
};

const priceColumn = {
  width: '100px',
  textAlign: 'right' as const,
};

const price = {
  color: '#1a202c',
  fontSize: '16px',
  fontWeight: '600',
};

const totalLabelColumn = {
  width: '200px',
};

const totalValueColumn = {
  width: '100px',
  textAlign: 'right' as const,
};

const totalLabel = {
  color: '#718096',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const totalValue = {
  color: '#1a202c',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const totalTotal = {
  color: '#4A5F4B',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '8px',
};

const addressText = {
  color: '#1a202c',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const factorySection = {
  padding: '24px',
  backgroundColor: '#fef9f5',
  borderRadius: '8px',
};

const factoryText = {
  color: '#1a202c',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
};

const nextStepsText = {
  color: '#1a202c',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
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
