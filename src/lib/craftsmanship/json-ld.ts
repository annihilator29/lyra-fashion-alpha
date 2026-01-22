/**
 * Schema.org JSON-LD Generator for Craftsmanship Content
 * 
 * Generates structured data markup for search engines following
 * schema.org ManufacturingProcess and related types.
 * 
 * @module lib/craftsmanship/json-ld
 */

import type { CraftsmanshipContent, JSONLDManufacturingProcess } from './types';

/**
 * Generate JSON-LD structured data for craftsmanship details
 * Follows schema.org ManufacturingProcess type for rich search results
 * 
 * @param craftsmanship - The craftsmanship content to generate markup for
 * @param productName - Optional product name for context
 * @returns JSON-LD script content as string
 */
export function generateManufacturingProcessJSONLD(
  craftsmanship: CraftsmanshipContent,
  productName?: string
): string {
  const schema: JSONLDManufacturingProcess = {
    '@context': 'https://schema.org',
    '@type': 'ManufacturingProcess',
    name: productName ? `Craftsmanship of ${productName}` : 'Product Craftsmanship',
    productionDate: craftsmanship.productionDate,
    manufacturer: craftsmanship.manufacturer ? {
      '@type': 'Organization' as const,
      name: craftsmanship.manufacturer.name,
      logo: craftsmanship.manufacturer.logo,
      url: craftsmanship.manufacturer.url
    } : undefined,
    productManufacturingProcess: [
      // Materials sourcing process
      {
        '@type': 'ManufacturingProcess' as const,
        name: 'Materials Sourcing',
        description: craftsmanship.materials.fabric,
        startDate: craftsmanship.productionDate
      },
      // Construction process
      {
        '@type': 'ManufacturingProcess' as const,
        name: 'Construction',
        description: craftsmanship.construction.stitching.join(', '),
        startDate: craftsmanship.productionDate
      },
      // Quality checks as separate processes
      ...craftsmanship.quality_checks.map(qc => ({
        '@type': 'ManufacturingProcess' as const,
        name: 'Quality Control',
        description: qc,
        startDate: craftsmanship.productionDate
      }))
    ]
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate JSON-LD for product with craftsmanship details
 * Combines Product and ManufacturingProcess schemas
 * 
 * @param craftsmanship - The craftsmanship content
 * @param productName - Product name
 * @param productSku - Product SKU
 * @returns JSON-LD script content as string
 */
export function generateProductWithCraftsmanshipJSONLD(
  craftsmanship: CraftsmanshipContent,
  productName: string,
  productSku?: string
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    sku: productSku || craftsmanship.sku,
    description: `Handcrafted with ${craftsmanship.materials.fabric} from ${craftsmanship.materials.origin}`,
    manufacturingDetails: {
      '@type': 'ManufacturingProcess',
      name: 'Craftsmanship Details',
      productionDate: craftsmanship.productionDate,
      manufacturer: craftsmanship.manufacturer ? {
        '@type': 'Organization',
        name: craftsmanship.manufacturer.name,
        logo: craftsmanship.manufacturer.logo,
        url: craftsmanship.manufacturer.url
      } : undefined,
      productManufacturingProcess: [
        {
          '@type': 'ManufacturingProcess',
          name: 'Materials',
          description: `${craftsmanship.materials.fabric} - Origin: ${craftsmanship.materials.origin}`
        },
        {
          '@type': 'ManufacturingProcess',
          name: 'Construction',
          description: craftsmanship.construction.stitching.join(', ')
        },
        ...craftsmanship.quality_checks.map(qc => ({
          '@type': 'ManufacturingProcess',
          name: 'Quality Check',
          description: qc
        }))
      ]
    }
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate breadcrumb list schema for factory story links
 * 
 * @param factoryStoryUrl - URL to the factory story
 * @param productName - Product name
 * @returns JSON-LD script content as string
 */
export function generateBreadcrumbJSONLD(
  factoryStoryUrl: string,
  productName: string
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://lyrafashion.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Our Factory Story',
        item: factoryStoryUrl
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: productName
      }
    ]
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate WebSite search schema for related content
 * 
 * @returns JSON-LD script content as string
 */
export function generateWebsiteSearchJSONLD(): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lyra Fashion',
    url: 'https://lyrafashion.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://lyrafashion.com/search?q={search_terms_string}'
      },
      'query-input': 'required name=search_terms_string'
    }
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate FAQ schema for craftsmanship details
 * Useful for common questions about the product
 * 
 * @param faqs - Array of question/answer pairs
 * @returns JSON-LD script content as string
 */
export function generateFAQJSONLD(
  faqs: Array<{ question: string; answer: string }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Common FAQ entries for craftsmanship content
 */
export const COMMON_CRAFTMANSHIP_FAQS = [
  {
    question: 'What makes this product sustainable?',
    answer: 'This product is crafted using eco-friendly materials and ethical manufacturing practices. Our factory follows strict environmental standards and fair labor practices.'
  },
  {
    question: 'How should I care for this garment?',
    answer: 'Each product comes with specific care instructions based on its materials. Generally, we recommend washing in cold water and air drying to extend the life of your garment.'
  },
  {
    question: 'Where is this product made?',
    answer: 'Our products are handcrafted in certified factories that meet our high standards for quality and sustainability. Each product includes information about its origin and craftsmanship details.'
  }
] as const;
