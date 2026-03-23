import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/header';
import { SiteFooter } from '@/components/layout/site-footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Lyra Fashion',
  description: 'Handcrafted fashion with artisan quality',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased h-full flex flex-col`}>
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <SiteFooter />
        <Toaster richColors />
      </body>
    </html>
  );
}

