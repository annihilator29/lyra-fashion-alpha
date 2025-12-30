import { ExternalLink } from 'lucide-react';

interface TrackingLinkProps {
  trackingNumber: string;
  carrier?: string;
}

export default function TrackingLink({ trackingNumber, carrier }: TrackingLinkProps) {
  // Carrier-specific tracking URLs
  const carrierUrls: Record<string, string> = {
    usps: `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/track.html?tracknumber=${trackingNumber}`,
  };

  const trackingUrl = carrier && carrierUrls[carrier.toLowerCase()]
    ? carrierUrls[carrier.toLowerCase()]
    : null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">
        Tracking: {trackingNumber}
      </span>
      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
        >
          Track Package
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
