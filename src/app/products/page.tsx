import { redirect } from 'next/navigation';

/**
 * Products Index Page
 * 
 * Redirects to the first category (dresses) since the main products
 * listing requires a category parameter.
 */
export default function ProductsPage() {
    redirect('/products/dresses');
}

export const metadata = {
    title: 'Shop All Products | Lyra Fashion',
    description: 'Browse our collection of sustainable, ethically-made fashion pieces.',
};
