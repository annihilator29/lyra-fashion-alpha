'use client';

import { useState } from 'react';

interface TransparencyCardProps {
  factoryPrice: number;
  retailPrice: number;
  savings: number;
}

export function TransparencyCard({ factoryPrice, retailPrice, savings }: TransparencyCardProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Calculate percentages for the bar chart
  const fabricPercent = 0.4; // 40% of cost is fabric
  const laborPercent = 0.3;  // 30% of cost is labor
  const transportPercent = 0.1; // 10% of cost is transport

  const fabricCost = factoryPrice * fabricPercent;
  const laborCost = factoryPrice * laborPercent;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="font-semibold mb-3">Factory-Direct Pricing</h4>
      
      {/* Interactive bar chart */}
      <div className="relative h-8 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div 
          className={`h-full ${hoveredSegment === 'fabric' ? 'bg-blue-600' : 'bg-blue-400'}`}
          style={{ width: `${fabricPercent * 100}%` }}
          onMouseEnter={() => setHoveredSegment('fabric')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <span className="sr-only">Fabric: ${fabricCost.toFixed(2)}</span>
        </div>
        <div 
          className={`h-full ${hoveredSegment === 'labor' ? 'bg-green-600' : 'bg-green-400'}`}
          style={{ width: `${laborPercent * 100}%` }}
          onMouseEnter={() => setHoveredSegment('labor')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <span className="sr-only">Labor: ${laborCost.toFixed(2)}</span>
        </div>
        <div 
          className={`h-full ${hoveredSegment === 'transport' ? 'bg-yellow-600' : 'bg-yellow-400'}`}
          style={{ width: `${transportPercent * 100}%` }}
          onMouseEnter={() => setHoveredSegment('transport')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <span className="sr-only">Transport: ${(factoryPrice * transportPercent).toFixed(2)}</span>
        </div>
      </div>

      {/* Segment labels */}
      <div className="flex justify-between text-xs mb-4">
        <span 
          className={`cursor-pointer ${hoveredSegment === 'fabric' ? 'font-bold' : ''}`}
          onMouseEnter={() => setHoveredSegment('fabric')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          Fabric
        </span>
        <span 
          className={`cursor-pointer ${hoveredSegment === 'labor' ? 'font-bold' : ''}`}
          onMouseEnter={() => setHoveredSegment('labor')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          Labor
        </span>
        <span 
          className={`cursor-pointer ${hoveredSegment === 'transport' ? 'font-bold' : ''}`}
          onMouseEnter={() => setHoveredSegment('transport')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          Transport
        </span>
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