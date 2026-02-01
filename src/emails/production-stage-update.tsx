import * as React from 'react';
import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Link } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface ProductionStageUpdateEmailProps {
  customerName: string;
  orderNumber: string;
  stage: 'cutting' | 'sewing' | 'finishing' | 'qc';
  status: 'in_progress' | 'completed';
  craftsmanshipMessage: string;
  orderUrl: string;
  estimatedCompletion?: string;
}

const stageLabels: Record<string, string> = {
  cutting: 'Cutting',
  sewing: 'Sewing',
  finishing: 'Finishing',
  qc: 'Quality Check'
};

const stageMessages: Record<string, Record<string, string>> = {
  cutting: {
    in_progress: "Your fabric is being carefully measured and cut by skilled hands.",
    completed: "Precision cutting complete - your fabric pieces are ready for the next stage."
  },
  sewing: {
    in_progress: "Your dress is being carefully sewn by our artisans with years of experience.",
    completed: "Expert sewing complete - your garment is taking shape beautifully."
  },
  finishing: {
    in_progress: "Final touches are being added to ensure your garment is flawless.",
    completed: "Finishing complete - your garment is now ready for quality inspection."
  },
  qc: {
    in_progress: "Quality checks ensure every stitch meets our exacting standards.",
    completed: "Quality inspection passed - your garment meets our high standards and is ready for shipping."
  }
};

export default function ProductionStageUpdateEmail({
  customerName,
  orderNumber,
  stage,
  status,
  craftsmanshipMessage,
  orderUrl,
  estimatedCompletion
}: ProductionStageUpdateEmailProps) {
  const stageLabel = stageLabels[stage];
  const stageMessage = stageMessages[stage]?.[status] || craftsmanshipMessage;
  const isCompleted = status === 'completed';

  return (
    <Html>
      <Head />
      <Preview>Production Update for Order {orderNumber} - {stageLabel} {isCompleted ? 'Complete' : 'In Progress'}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto my-8">
            {/* Header */}
            <Section className="bg-primary p-8 text-center">
              <Heading className="text-2xl font-bold text-white m-0">
                Lyra Fashion
              </Heading>
              <Text className="text-primary-foreground/80 mt-2 mb-0">
                Factory-Direct Craftsmanship
              </Text>
            </Section>

            {/* Content */}
            <Section className="p-8">
              <Heading className="text-xl font-semibold text-gray-900 mb-4">
                Production Update for Your Order
              </Heading>

              <Text className="text-gray-700 mb-6">
                Hi {customerName},
              </Text>

              <Text className="text-gray-700 mb-4">
                We wanted to let you know about the progress on your order <strong>#{orderNumber}</strong>.
              </Text>

              {/* Stage Update Box */}
              <Section className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-6">
                <Text className="text-amber-900 font-semibold mb-2">
                  {stageLabel}: {isCompleted ? '✓ Completed' : '→ In Progress'}
                </Text>
                <Text className="text-amber-800 italic m-0">
                  &ldquo;{stageMessage}&rdquo;
                </Text>
              </Section>

              {craftsmanshipMessage && craftsmanshipMessage !== stageMessage && (
                <Text className="text-gray-600 italic mb-4">
                  &ldquo;{craftsmanshipMessage}&rdquo;
                </Text>
              )}

              {estimatedCompletion && (
                <Text className="text-gray-700 mb-4">
                  <strong>Estimated Completion:</strong>{' '}
                  {new Date(estimatedCompletion).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              )}

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Link
                  href={orderUrl}
                  className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium no-underline"
                >
                  View Order Status
                </Link>
              </Section>

              <Text className="text-gray-600 text-sm">
                You can track your order&apos;s progress anytime by visiting your account or using the order lookup feature on our website.
              </Text>
            </Section>

            <Hr className="border-gray-200 mx-8" />

            {/* Footer */}
            <Section className="p-8 text-center">
              <Text className="text-gray-500 text-sm mb-2">
                Thank you for choosing Lyra Fashion
              </Text>
              <Text className="text-gray-400 text-xs">
                Factory-direct sustainable fashion from Nepal
              </Text>
              <Text className="text-gray-400 text-xs mt-4">
                You received this email because you opted in to production updates.
                <br />
                <Link href="{{unsubscribeUrl}}" className="text-primary underline">
                  Unsubscribe from production updates
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
