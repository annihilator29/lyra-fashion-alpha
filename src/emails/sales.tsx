/**
 * Sales and Promotions Email Template
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
  Img,
  Section,
  Text,
} from '@react-email/components';

interface SalesEmailProps {
  customerName?: string;
  discountCode: string;
  discountAmount: string;
  validUntil: string;
  saleItems?: Array<{
    name: string;
    originalPrice: string;
    salePrice: string;
    imageUrl: string;
    link: string;
  }>;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export default function SalesEmail({
  customerName = 'Customer',
  discountCode,
  discountAmount,
  validUntil,
  saleItems = [],
  unsubscribeUrl,
  preferencesUrl,
}: SalesEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={headerSection}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="150"
              height="50"
              alt="Lyra Fashion"
              style={{ margin: '0 auto', display: 'block' }}
            />
          </Section>

          <Hr style={hr} />

          {/* Sale Banner */}
          <Section style={bannerSection}>
            <Heading style={saleBanner}>
              ⚡ FLASH SALE - {discountAmount} OFF!
            </Heading>
          </Section>

          {/* Discount Code */}
          <Section style={highlightSection}>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              For a limited time, enjoy <strong>{discountAmount}</strong>{' '}
              off your entire purchase with code:
            </Text>
            <Section style={codeContainer}>
              <Text style={discountCodeStyle}>{discountCode}</Text>
            </Section>
            <Text style={text}>
              Valid until: <strong>{validUntil}</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Sale Items */}
          {saleItems.length > 0 && (
            <Section style={section}>
              <Heading style={sectionHeading}>Shop the Sale</Heading>
              {saleItems.map((item, index) => (
                <div key={index}>
                  <Section style={itemSection}>
                    <Img
                      src={item.imageUrl}
                      width="100%"
                      height="200"
                      alt={item.name}
                      style={productImage}
                    />
                    <Section style={itemDetails}>
                      <Text style={productName}>{item.name}</Text>
                      <Text style={priceRow}>
                        <span style={originalPrice}>{item.originalPrice}</span>
                        <span style={salePrice}>{item.salePrice}</span>
                      </Text>
                      <Section style={buttonContainer}>
                        <Button href={item.link} style={button}>
                          Shop Now
                        </Button>
                      </Section>
                    </Section>
                  </Section>
                  {index < saleItems.length - 1 && <Hr style={hr} />}
                </div>
              ))}
            </Section>
          )}

          <Hr style={hr} />

          {/* Terms */}
          <Section style={section}>
            <Text style={smallText}>
              • Discount applies to all items on lyrafashion.com
            </Text>
            <Text style={smallText}>
              • Cannot be combined with other offers
            </Text>
            <Text style={smallText}>
              • Free shipping on orders over $100
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/products?sale=true`}
              style={ctaButton}
            >
              Shop All Sale Items
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you opted in to receive sales and promotions.
            </Text>
            <Text style={footerText}>
              <a href={preferencesUrl} style={linkButton}>
                Update Preferences
              </a>
            </Text>
            <Text style={footerText}>
              Or{' '}
              <a href={unsubscribeUrl} style={linkButton}>
                unsubscribe from marketing emails
              </a>
            </Text>
            <Text style={copyrightText}>
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

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const bannerSection = {
  backgroundColor: '#4A5F4B',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px',
};

const saleBanner = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
};

const highlightSection = {
  padding: '24px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '24px 0',
  border: '2px solid #d97706',
};

const text = {
  color: '#1a202c',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
};

const codeContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const discountCodeStyle = {
  backgroundColor: '#ffffff',
  color: '#4A5F4B',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '16px 32px',
  letterSpacing: '4px',
  display: 'inline-block',
  border: '2px solid #4A5F4B',
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

const itemSection = {
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const productImage = {
  width: '100%',
  borderRadius: '6px',
  margin: '0 0 16px 0',
};

const itemDetails = {
  marginTop: '16px',
};

const productName = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const priceRow = {
  fontSize: '18px',
  margin: '8px 0',
};

const originalPrice = {
  color: '#9ca3af',
  textDecoration: 'line-through',
  marginRight: '12px',
};

const salePrice = {
  color: '#d97706',
  fontWeight: 'bold',
};

const buttonContainer = {
  margin: '16px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4A5F4B',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none' as const,
  display: 'inline-block',
} as const;

const ctaSection = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const ctaButton = {
  backgroundColor: '#d97706',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '6px',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'inline-block',
};

const smallText = {
  color: '#718096',
  fontSize: '14px',
  margin: '4px 0',
};

const footer = {
  padding: '24px 0',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
};

const footerText = {
  color: '#718096',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const linkButton = {
  color: '#4A5F4B',
  textDecoration: 'underline',
  fontSize: '14px',
};

const copyrightText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '16px 0 0 0',
};
