/**
 * Newsletter Email Template
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

interface NewsletterEmailProps {
  customerName?: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  featuredArticles?: Array<{
    title: string;
    excerpt: string;
    imageUrl: string;
    link: string;
  }>;
}

export default function NewsletterEmail({
  customerName = 'Customer',
  unsubscribeUrl,
  preferencesUrl,
  featuredArticles = [],
}: NewsletterEmailProps) {
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

          {/* Welcome */}
          <Section style={section}>
            <Heading style={heading}>Latest from Lyra Fashion</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              Here&apos;s what&apos;s new in the world of sustainable, factory-direct fashion.
            </Text>
          </Section>

          {/* Featured Content */}
          {featuredArticles.length > 0 && (
            <Section style={section}>
              {featuredArticles.map((article, index) => (
                <div key={index}>
                  <Img
                    src={article.imageUrl}
                    width="600"
                    height="300"
                    alt={article.title}
                    style={featuredImage}
                  />
                  <Section style={articleSection}>
                    <Heading style={articleTitle}>{article.title}</Heading>
                    <Text style={articleExcerpt}>{article.excerpt}</Text>
                    <Section style={buttonContainer}>
                      <Button href={article.link} style={button}>
                        Read More
                      </Button>
                    </Section>
                  </Section>
                  {index < featuredArticles.length - 1 && <Hr style={hr} />}
                </div>
              ))}
            </Section>
          )}

          {/* Factory Story */}
          <Section style={factorySection}>
            <Text style={factoryText}>
              <strong>Craftsmanship Spotlight:</strong> Each piece in our collection
              is handcrafted by skilled artisans in Nepal, combining traditional techniques
              with modern design.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You received this email because you opted in to receive marketing emails.
            </Text>
            <Text style={footerText}>
              <a href={preferencesUrl} style={linkButton}>
                Manage Preferences
              </a>
            </Text>
            <Text style={footerText}>
              Or{' '}
              <a href={unsubscribeUrl} style={linkButton}>
                unsubscribe from all marketing emails
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
  color: '#4A5F4B',
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
  margin: '0 0 8px 0',
};

const featuredImage = {
  width: '100%',
  borderRadius: '8px',
  margin: '0 0 16px 0',
};

const articleSection = {
  padding: '20px 0',
};

const articleTitle = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const articleExcerpt = {
  color: '#718096',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
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

const factorySection = {
  padding: '24px',
  backgroundColor: '#fef9f5',
  borderRadius: '8px',
  margin: '24px 0',
};

const factoryText = {
  color: '#1a202c',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
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
