/**
 * Personalized Recommendations Email Template
 * Story 4.5: Email Notifications & Marketing Preferences
 * Based on user's purchase history and wishlist
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

interface RecommendedProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  category: string;
  link: string;
}

interface PersonalizedRecommendationsEmailProps {
  customerName?: string;
  recommendations: RecommendedProduct[];
  reasonText?: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export default function PersonalizedRecommendationsEmail({
  customerName = 'Customer',
  recommendations,
  reasonText = "Based on your recent purchases, we thought you'd love these pieces:",
  unsubscribeUrl,
  preferencesUrl,
}: PersonalizedRecommendationsEmailProps) {
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

          {/* Personalization Message */}
          <Section style={section}>
            <Heading style={heading}>Picked For You, {customerName}</Heading>
            <Text style={text}>
              {reasonText}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Recommendations */}
          <Section style={section}>
            {recommendations.map((product, index) => (
              <div key={product.id}>
                <Section style={productSection}>
                  <Img
                    src={product.imageUrl}
                    width="100%"
                    height="250"
                    alt={product.name}
                    style={productImage}
                  />
                  <Section style={productDetails}>
                    <Text style={category}>{product.category}</Text>
                    <Text style={productName}>{product.name}</Text>
                    <Text style={price}>{product.price}</Text>
                    <Section style={buttonContainer}>
                      <Button href={product.link} style={button}>
                        View Details
                      </Button>
                    </Section>
                  </Section>
                </Section>
                {index < recommendations.length - 1 && <Hr style={hr} />}
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Why These Recommendations? */}
          <Section style={highlightSection}>
            <Heading style={sectionHeading}>How We Picked These</Heading>
            <Text style={text}>
              • Based on items you&apos;ve purchased previously
            </Text>
            <Text style={text}>
              • Similar styles and colors to your wardrobe
            </Text>
            <Text style={text}>
              • From the same sustainable collections you love
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/products`}
              style={ctaButton}
            >
              Browse All Recommendations
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              These recommendations are based on your purchase history and browsing activity.
            </Text>
            <Text style={footerText}>
              <a href={preferencesUrl} style={linkButton}>
                Update Your Preferences
              </a>
            </Text>
            <Text style={footerText}>
              to improve future recommendations
            </Text>
            <Text style={footerText}>
              Or{' '}
              <a href={unsubscribeUrl} style={linkButton}>
                unsubscribe from recommendations
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

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const section = {
  padding: '20px 0',
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
};

const productSection = {
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '0 0 16px 0',
};

const productImage = {
  width: '100%',
  borderRadius: '6px',
  margin: '0 0 16px 0',
};

const productDetails = {
  marginTop: '16px',
};

const category = {
  color: '#718096',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 4px 0',
};

const productName = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const price = {
  color: '#4A5F4B',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const buttonContainer = {
  margin: '16px 0',
};

const button = {
  backgroundColor: '#4A5F4B',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const highlightSection = {
  padding: '24px',
  backgroundColor: '#fef9f5',
  borderRadius: '8px',
  margin: '24px 0',
};

const sectionHeading = {
  color: '#4A5F4B',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const ctaButton = {
  backgroundColor: '#4A5F4B',
  color: '#ffffff',
  padding: '16px 32px',
  borderRadius: '6px',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'inline-block',
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
