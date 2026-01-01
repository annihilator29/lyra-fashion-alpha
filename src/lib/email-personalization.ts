/**
 * Email Personalization Service
 * Story 4.5: Email Notifications & Marketing Preferences
 *
 * Provides personalized product recommendations based on:
 * - Purchase history
 * - Wishlist items
 * - Category preferences
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'

interface ProductRecommendation {
  id: string
  name: string
  imageUrl: string
  price: number
  link: string
  category?: string
  score: number
}

// Supabase join returns nested structure - use 'any' for flexibility

/**
 * Get personalized product recommendations for a user
 * @param userId - User ID
 * @param limit - Number of recommendations to return (default: 6)
 * @returns Array of product recommendations with relevance scores (price in dollars as string for email templates)
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 6
): Promise<Array<{
    id: string
    name: string
    imageUrl: string
    price: string  // Formatted price string for email templates
    link: string
    category: string | undefined
  }>> {
  const supabase = await createClient()

  // 1. Get purchase history
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      order_items (
        products (
          id,
          name,
          images,
          category,
          subcategory
        )
      )
    `)
    .eq('customer_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  if (ordersError) {
    console.error('Error fetching orders for personalization:', ordersError)
    return []
  }

  // 2. Get wishlist items
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlist_items')
    .select(`
      products (
        id,
        name,
        images,
        category,
        subcategory,
        price
      )
    `)
    .eq('user_id', userId)

  if (wishlistError) {
    console.error('Error fetching wishlist for personalization:', wishlistError)
    return []
  }

  // 3. Analyze purchase patterns
  const categoryFrequency = new Map<string, number>()
  const subcategoryFrequency = new Map<string, number>()

  orders?.forEach((order: any) => {
    if (!order.order_items) return

    order.order_items.forEach((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      const category = product?.category
      const subcategory = product?.subcategory

      if (category) {
        categoryFrequency.set(
          category,
          (categoryFrequency.get(category) || 0) + 1
        )
      }

      if (subcategory) {
        subcategoryFrequency.set(
          subcategory,
          (subcategoryFrequency.get(subcategory) || 0) + 1
        )
      }
    })
  })

  // Get top categories and subcategories
  const topCategories = Array.from(categoryFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category)

  const topSubcategories = Array.from(subcategoryFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([subcategory]) => subcategory)

  // 4. Collect purchased and wishlist product IDs to exclude
  const purchasedIds = new Set<string>()
  const wishlistIds = new Set<string>()

  orders?.forEach((order: any) => {
    order.order_items?.forEach((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      if (product?.id) {
        purchasedIds.add(product.id)
      }
    })
  })

  wishlist?.forEach((item: any) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    if (product?.id) {
      wishlistIds.add(product.id)
    }
  })

  const excludeIds = new Set([...purchasedIds, ...wishlistIds])

  // 5. Fetch recommended products based on preferences
  const recommendations: Array<ProductRecommendation & {
    score: number
    categoryScore: number
    subcategoryScore: number
  }> = []

  // Try fetching by top categories first
  if (topCategories.length > 0) {
    const { data: categoryProducts, error: categoryError } = await supabase
      .from('products')
      .select('id, name, images, category, subcategory, price')
      .in('category', topCategories)
      .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (!categoryError && categoryProducts) {
      categoryProducts.forEach((product) => {
        const categoryScore =
          categoryFrequency.get(product.category || '') || 0
        const subcategoryScore =
          subcategoryFrequency.get(product.subcategory || '') || 0
        const score = categoryScore * 2 + subcategoryScore

        recommendations.push({
          id: product.id,
          name: product.name,
          imageUrl: product.images?.[0] || '/images/placeholder.jpg',
          price: (product.price || 0) / 100,
          link: `/products/${product.id}`,
          category: product.category || '',
          score,
          categoryScore,
          subcategoryScore,
        })
      })
    }
  }

  // Fallback: Fetch by top subcategories if not enough recommendations
  if (recommendations.length < limit && topSubcategories.length > 0) {
    const { data: subcategoryProducts, error: subcategoryError } =
      await supabase
        .from('products')
        .select('id, name, images, category, subcategory, price')
        .in('subcategory', topSubcategories)
        .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
        .order('created_at', { ascending: false })
        .limit(limit * 2)

    if (!subcategoryError && subcategoryProducts) {
      subcategoryProducts.forEach((product) => {
        // Avoid duplicates
        if (recommendations.find((r) => r.id === product.id)) {
          return
        }

        const categoryScore =
          categoryFrequency.get(product.category || '') || 0
        const subcategoryScore =
          subcategoryFrequency.get(product.subcategory || '') || 0
        const score = categoryScore * 2 + subcategoryScore

        recommendations.push({
          id: product.id,
          name: product.name,
          imageUrl: product.images?.[0] || '/images/placeholder.jpg',
          price: product.price || 0,
          link: `/products/${product.id}`,
          category: product.category,
          score,
          categoryScore,
          subcategoryScore,
        })
      })
    }
  }

  // Sort by score and return top N
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ categoryScore, subcategoryScore, score, price, ...rec }) => ({
      id: rec.id,
      name: rec.name,
      imageUrl: rec.imageUrl,
      price: `$${((price) / 100).toFixed(2)}` as string, // Format numeric price as string for email templates
      link: rec.link,
      category: rec.category,
    }))
}

/**
 * Get abandoned cart recommendations
 * Returns products from user's wishlist to encourage completion
 * @param userId - User ID
 * @returns Array of wishlist product recommendations
 */
export async function getAbandonedCartRecommendations(
  userId: string
): Promise<Array<{
    id: string
    name: string
    imageUrl: string
    price: string  // Formatted price string for email templates
    link: string
    category: string | undefined
  }>> {
  const supabase = await createClient()

  const { data: wishlist, error } = await supabase
    .from('wishlist_items')
    .select(`
      products (
        id,
        name,
        images,
        category,
        price
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching wishlist for abandoned cart:', error)
    return []
  }

  return (
    wishlist?.map((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: product?.id || '',
        name: product?.name || '',
        imageUrl: Array.isArray(product?.images) ? product.images[0] : (product?.images?.[0] || '/images/placeholder.jpg'),
        price: `$${((product?.price || 0) / 100).toFixed(2)}` as string,
        link: `/products/${product?.id}`,
        category: product?.category || '',
        score: 100, // Wishlist items get highest priority
      }
    }) || []
  )
}

/**
 * Get new arrivals recommendations for a user
 * Based on their purchase history, show new products in favorite categories
 * @param userId - User ID
 * @param limit - Number of recommendations to return
 * @returns Array of new product recommendations
 */
export async function getNewArrivalsRecommendations(
  userId: string,
  limit: number = 6
): Promise<Array<{
    id: string
    name: string
    imageUrl: string
    price: string  // Formatted price string for email templates
    link: string
    category: string | undefined
  }>> {
  const supabase = await createClient()

  // Get user's favorite categories
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      order_items (
        products (
          category
        )
      )
    `)
    .eq('customer_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  const categoryFrequency = new Map<string, number>()

  orders?.forEach((order: any) => {
    if (!order.order_items) return

    order.order_items.forEach((item: any) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      const category = product?.category
      if (category) {
        categoryFrequency.set(
          category,
          (categoryFrequency.get(category) || 0) + 1
        )
      }
    })
  })

  const topCategories = Array.from(categoryFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category)

  // Fetch new arrivals in top categories
  if (topCategories.length > 0) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images, category, price, created_at')
      .in('category', topCategories)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching new arrivals:', error)
      return []
    }

    return (
      products?.map((product) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.images?.[0] || '/images/placeholder.jpg',
        price: `$${((product.price || 0) / 100).toFixed(2)}` as string,
        link: `/products/${product.id}`,
        category: product.category || '',
        score: 100,
      })) || []
    )
  }

  // Fallback: Fetch general new arrivals
  const { data: fallbackProducts, error: fallbackError } = await supabase
    .from('products')
    .select('id, name, images, category, price')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (fallbackError) {
    console.error('Error fetching fallback new arrivals:', fallbackError)
    return []
  }

  return (
    fallbackProducts?.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.images?.[0] || '/images/placeholder.jpg',
      price: `$${((product.price || 0) / 100).toFixed(2)}` as string,
      link: `/products/${product.id}`,
      category: product.category,
      score: 100,
    })) || []
  )
}

/**
 * Get complementary products for a specific product
 * @param productId - Product ID
 * @param limit - Number of recommendations to return
 * @returns Array of complementary product recommendations
 */
export async function getComplementaryProducts(
  productId: string,
  limit: number = 4
): Promise<Array<{
    id: string
    name: string
    imageUrl: string
    price: string  // Formatted price string for email templates
    link: string
    category: string | undefined
  }>> {
  const supabase = await createClient()

  // Get product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('category, subcategory')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    console.error('Error fetching product for complementary items:', productError)
    return []
  }

  // Fetch products from same category/subcategory
  const { data: complementaryProducts, error } = await supabase
    .from('products')
    .select('id, name, images, category, price')
    .eq('category', product.category)
    .neq('id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching complementary products:', error)
    return []
  }

  return (
    complementaryProducts?.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.images?.[0] || '/images/placeholder.jpg',
      price: `$${((p.price || 0) / 100).toFixed(2)}` as string,
      link: `/products/${p.id}`,
      category: p.category || '',
      score: 100,
    })) || []
  )
}
