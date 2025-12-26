'use client';

import { useState } from 'react';

interface TransparencyCardProps {
  factoryPrice: number;
  retailPrice: number;
  savings: number;
}

type SegmentType = 'materials' | 'labor' | 'transport' | 'lyra';

export function TransparencyCard({ factoryPrice, retailPrice, savings }: TransparencyCardProps) {
  const [hoveredSegment, setHoveredSegment] = useState<SegmentType | null>(null);

  // Calculate percentages (exact match to design spec)
  const materialsPercent = 0.4;   // 40%
  const laborPercent = 0.3;       // 30%
  const transportPercent = 0.2;     // 20%
  const lyraPercent = 0.1;          // 10%

  const materialsCost = factoryPrice * materialsPercent;
  const laborCost = factoryPrice * laborPercent;
  const transportCost = factoryPrice * transportPercent;
  const lyraCost = factoryPrice * lyraPercent;

  const segments = [
    { type: 'materials', percent: materialsPercent, cost: materialsCost, color: '#5D6D5B' },
    { type: 'labor', percent: laborPercent, cost: laborCost, color: '#8B9D89' },
    { type: 'transport', percent: transportPercent, cost: transportCost, color: '#B8C5B6' },
    { type: 'lyra', percent: lyraPercent, cost: lyraCost, color: '#D8D6D1' },
  ];

  // const hoveredSegmentData = segments.find(s => s.type === hoveredSegment);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="font-semibold mb-3">Factory-Direct Pricing</h4>

      {/* Cost Bar - continuous bar matching design spec */}
      <div className="h-10 bg-gray-200 rounded-lg mb-4 flex overflow-hidden">
        {segments.map(segment => (
          <div
            key={segment.type}
            className={`h-full transition-all duration-300 cursor-pointer relative ${
              hoveredSegment === segment.type ? 'transform-gpu' : ''
            }`}
            style={{
              width: `${segment.percent * 100}%`,
              backgroundColor: segment.color,
              // 3D effect styles when hovered
              boxShadow: hoveredSegment === segment.type
                ? `0 8px 25px rgba(0,0,0,0.3), inset 0 -4px 10px rgba(0,0,0,0.2), inset 0 4px 10px rgba(255,255,255,0.3)`
                : `0 2px 8px rgba(0,0,0,0.1), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.2)`,
              transform: hoveredSegment === segment.type
                ? 'translateY(-2px) scale(1.02)'
                : 'translateY(0) scale(1)',
              zIndex: hoveredSegment === segment.type ? '10' : '1',
            }}
            onMouseEnter={() => setHoveredSegment(segment.type as SegmentType)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            {/* Cost Name and Amount - centered in each segment */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-white text-xs font-medium"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)' }}
              >
                {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)}
              </span>
              <span
                className="text-white text-xs font-bold mt-1"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)' }}
              >
                ${segment.cost.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Segment labels with percentages below bar */}
      <div className="flex justify-between text-xs mb-4">
        {segments.map(segment => (
          <span
            key={segment.type}
            className={`cursor-pointer transition-opacity duration-200 ${
              hoveredSegment === segment.type ? 'opacity-100' : 'opacity-60'
            }`}
            onMouseEnter={() => setHoveredSegment(segment.type as SegmentType)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            {segment.type.charAt(0).toUpperCase() + segment.type.slice(1)} ({(segment.percent * 100).toFixed(0)}%)
          </span>
        ))}
      </div>

      {/* Comparison */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Factory Direct Price:</span>
          <span className="font-medium">${factoryPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Traditional Retail Price:</span>
          <span className="line-through text-gray-500">${retailPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
          <span className="text-green-600">You Save:</span>
          <span className="text-green-600">${savings.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          You save 40% vs retail through our direct-to-consumer model
        </p>
      </div>
    </div>
  );
}
