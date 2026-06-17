import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Playfair_Display, Crimson_Text } from 'next/font/google'
import { Anton } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ProductProvider } from "@/lib/product-context"
import { OrderProvider } from "@/lib/order-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { CartProvider } from "@/lib/cart-context"
import { CartSuccessNotification } from "@/components/cart-success-notification"
import { OffersBanner } from "@/components/offers-banner"

// Configure fonts
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair-display',
  display: 'swap',
})

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-crimson-text',
  display: 'swap',
})

const inter = Inter({ subsets: ["latin"] })

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Mema Sports - Premium Sports Equipment & Sportswear",
  description: "Discover our premium collection of sports equipment and athletic wear. From professional gear to luxury sportswear, elevate your performance with Mema Sports.",
  keywords: "sports equipment, sportswear, athletic gear, fitness, luxury sports, premium equipment",
  generator: 'mema-sports',
  icons: {
    icon: '/mema-logo.png',
    shortcut: '/mema-logo.png',
    apple: '/mema-logo.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${crimsonText.variable} ${anton.variable}`}>
      <body className={inter.className}>
        <div className="page-shell flex min-h-screen flex-col">
          <OffersBanner />
          <AuthProvider>
            <ProductProvider>
              <OrderProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <main className="flex-1">
                      {children}
                    </main>
                    <CartSuccessNotification />
                  </CartProvider>
                </FavoritesProvider>
              </OrderProvider>
            </ProductProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}