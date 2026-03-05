/**
 * Packing Slip PDF Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC4: Generate and print packing slip PDF
 * 
 * React-PDF implementation for packing slips with:
 * - Lyra Fashion branding
 * - Order details and items
 * - Shipping address
 * - Barcode/QR code support
 */

'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import type { OrderWithItems } from '@/types/order';

// Register fonts (using standard fonts for now)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  // Page
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto',
  },
  
  // Header
  header: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000000',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  
  // Title
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  
  // Info Section
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoColumn: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 11,
    color: '#000000',
    lineHeight: 1.5,
  },
  
  // Items Table
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableCell: {
    fontSize: 10,
    color: '#000000',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  // Column widths
  col1: { width: '35%' },
  col2: { width: '15%', textAlign: 'center' as const },
  col3: { width: '15%', textAlign: 'center' as const },
  col4: { width: '15%', textAlign: 'right' as const },
  col5: { width: '20%', textAlign: 'right' as const },
  
  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center' as const,
    lineHeight: 1.5,
  },
  
  // Barcode placeholder
  barcode: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  barcodeText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center' as const,
  },
  
  // Utility
  bold: {
    fontWeight: 'bold',
  },
  textRight: {
    textAlign: 'right' as const,
  },
  textCenter: {
    textAlign: 'center' as const,
  },
  mb10: {
    marginBottom: 10,
  },
});

interface PackingSlipProps {
  order: OrderWithItems;
}

export function PackingSlipDocument({ order }: PackingSlipProps) {
  const orderItems = order.order_items || [];
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>LYRA FASHION</Text>
          <Text style={styles.companyInfo}>
            Artisan-Crafted Fashion | Handmade with Care
          </Text>
          <Text style={styles.companyInfo}>
            www.lyrafashion.com | support@lyrafashion.com
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>PACKING SLIP</Text>

        {/* Order & Customer Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Order Number</Text>
              <Text style={styles.infoValue}>
                {order.order_number || order.id.slice(0, 8).toUpperCase()}
              </Text>
              <Text style={styles.infoValue}>
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>
                {(order as any).customers?.name || (order.shipping_address as any)?.name || 'N/A'}
              </Text>
              <Text style={styles.infoValue}>
                {(order as any).customers?.email || order.customer_email || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Ship To:</Text>
          <View style={{ marginTop: 5 }}>
            <Text style={styles.infoValue}>
              {(order.shipping_address as any)?.name || 'N/A'}
            </Text>
            <Text style={styles.infoValue}>
              {(order.shipping_address as any)?.address_line1 || ''}
            </Text>
            {(order.shipping_address as any)?.address_line2 && (
              <Text style={styles.infoValue}>
                {(order.shipping_address as any).address_line2}
              </Text>
            )}
            <Text style={styles.infoValue}>
              {(order.shipping_address as any)?.city}, {(order.shipping_address as any)?.state}{' '}
              {(order.shipping_address as any)?.postal_code}
            </Text>
            <Text style={styles.infoValue}>
              {(order.shipping_address as any)?.country}
            </Text>
            {(order.shipping_address as any)?.phone && (
              <Text style={styles.infoValue}>
                {(order.shipping_address as any).phone}
              </Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.col1]}>Item</Text>
            <Text style={[styles.tableCellHeader, styles.col2]}>Qty</Text>
            <Text style={[styles.tableCellHeader, styles.col3]}>Size</Text>
            <Text style={[styles.tableCellHeader, styles.col4]}>Color</Text>
            <Text style={[styles.tableCellHeader, styles.col5]}>SKU</Text>
          </View>

          {/* Rows */}
          {orderItems.map((item, index) => (
            <View
              key={(item as any).id || index}
              style={[
                styles.tableRow,
                index < orderItems.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#e5e5e5' } : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.col1]}>
                {item.product_name || 'Item'}
                {item.variant && (item.variant.size || item.variant.color) && (
                  <Text>
                    {' '}
                    ({item.variant.size}
                    {item.variant.size && item.variant.color && '/'}
                    {item.variant.color})
                  </Text>
                )}
              </Text>
              <Text style={[styles.tableCell, styles.col2, styles.textCenter]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.col3, styles.textCenter]}>
                {item.variant?.size || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.col4, styles.textRight]}>
                {item.variant?.color || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.col5, styles.textRight]}>
                {item.variant?.sku || (item.products as any)?.sku || 'N/A'}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Shipping Method</Text>
              <Text style={styles.infoValue}>
                {order.carrier ? order.carrier.toUpperCase() : 'Standard'}
              </Text>
              {order.tracking_number && (
                <Text style={styles.infoValue}>
                  Tracking: {order.tracking_number}
                </Text>
              )}
            </View>
            <View style={styles.infoColumn}>
              <View style={{ marginLeft: 'auto', width: '60%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={styles.infoLabel}>Subtotal:</Text>
                  <Text style={styles.infoValue}>
                    ${(order.total / 100).toFixed(2)}
                  </Text>
                </View>
                {order.tax && order.tax > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={styles.infoLabel}>Tax:</Text>
                    <Text style={styles.infoValue}>
                      ${(order.tax / 100).toFixed(2)}
                    </Text>
                  </View>
                )}
                {order.shipping && order.shipping > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={styles.infoLabel}>Shipping:</Text>
                    <Text style={styles.infoValue}>
                      ${(order.shipping / 100).toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5, borderTopWidth: 1, borderTopColor: '#000' }}>
                  <Text style={[styles.infoLabel, styles.bold]}>Total:</Text>
                  <Text style={[styles.infoValue, styles.bold]}>
                    ${(order.total / 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.barcode}>
          <Text style={styles.barcodeText}>
            Order: {order.order_number || order.id.slice(0, 8).toUpperCase()}
          </Text>
          <Text style={styles.barcodeText}>
            Generated: {new Date().toLocaleDateString('en-US')}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your order!
          </Text>
          <Text style={styles.footerText}>
            For questions or concerns, please contact us at support@lyrafashion.com
          </Text>
          <Text style={styles.footerText}>
            www.lyrafashion.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate PDF blob from order data
 */
export async function generatePackingSlipPDF(order: PackingSlipProps['order']): Promise<Blob> {
  const document = <PackingSlipDocument order={order} />;
  const blob = await pdf(document).toBlob();
  return blob;
}

/**
 * Download packing slip PDF
 */
export async function downloadPackingSlip(
  order: PackingSlipProps['order'],
  filename?: string
) {
  const blob = await generatePackingSlipPDF(order);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `packing-slip-${order.order_number || order.id.slice(0, 8)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
