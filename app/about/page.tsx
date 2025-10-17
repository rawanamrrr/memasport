"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Award, Heart, Sparkles, Instagram, Facebook } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <div className="section-pill mb-8 justify-center mx-auto">
              <Sparkles className="mr-2 h-4 w-4 text-orange-400" />
              Mema Sports Legacy
            </div>
            <h1 className="hero-heading text-white">Our Story</h1>
            <p className="hero-subheading mt-6">
              Born from a passion for athletic excellence, Mema Sports represents the perfect harmony between performance and
              craftsmanship in the world of premium sports equipment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding pt-16 pb-12">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title mb-6">A New Beginning: Mema Sports</h2>
              <p className="section-subtitle mb-6">
                In 2025, from the heart of athletic excellence, a new legacy is born. At Mema Sports, we don't just sell equipment; we elevate athletic performance. We are the inheritors of a tradition that stretches back to the ancient Olympics, when athletic achievement was not just a sport but a sacred pursuit, a mark of human excellence and determination.
              </p>
              <p className="section-subtitle mb-6">
                We saw an industry that had forgotten its roots, and we knew it was time to bring the soul of athletic excellence into the modern world. Our creations are a tribute to the timeless power of sports, blending the rich heritage of athletic achievement with cutting-edge technology and contemporary design for the 21st century athlete.
              </p>
              <p className="section-subtitle">
                This is more than a brand; it's a movement. This is a journey to connect with the essence of athletic excellence, a return to the competitive spirit that drives us all. Mema Sports invites you to experience the power of a new era, rooted in the oldest pursuit of all - the pursuit of greatness.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-orange-500/10">
                <Image
                  src="/placeholder-sports-equipment.jpg?height=400&width=500"
                  alt="Sports equipment manufacturing"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-orange-500/10">
                <Image
                  src="/placeholder-sports-apparel.jpg?height=400&width=500"
                  alt="Sports technology and materials"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="section-title mb-6">Our Philosophy</h2>
              <p className="section-subtitle mb-6">
                At Mema Sports, we believe that athletic equipment is more than just gear—it's a form of self-expression, a performance
                enhancer, and a confidence booster. Each of our products is carefully crafted to elevate athletic performance
                and create lasting achievements.
              </p>
              <p className="section-subtitle">
                We source our materials from the finest suppliers worldwide, ensuring that every piece of equipment contains only
                the highest quality components. Our commitment to sustainability and ethical practices guides every decision we
                make, from material sourcing to manufacturing processes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="section-pill mb-6 justify-center mx-auto">
              <Award className="mr-2 h-4 w-4 text-orange-400" />
              Our Principles
            </div>
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              The principles that guide our craft and define our commitment to athletic excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="glass-panel text-center p-10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Excellence</h3>
              <p className="text-gray-300 leading-relaxed">
                We pursue perfection in every aspect of our craft, from the selection of materials to the final
                performance of our equipment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass-panel text-center p-10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Passion</h3>
              <p className="text-gray-300 leading-relaxed">
                Our love for sports drives everything we do. Each product is created with genuine passion and
                dedication to the pursuit of athletic excellence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="glass-panel text-center p-10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Innovation</h3>
              <p className="text-gray-300 leading-relaxed">
                We constantly explore new technologies and materials to create unique equipment that pushes the
                boundaries of athletic performance.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding py-20">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-6">Experience Our Craft</h2>
            <p className="section-subtitle mb-8 max-w-2xl mx-auto">
              Discover the technology behind each product and find the perfect equipment that elevates your athletic performance.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-orange-500/30">
                Explore Our Collections
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image src="/mema-sports-logo-white.png" alt="Mema Sports" width={150} height={100} className="h-16 w-auto" />
              <p className="text-gray-400 text-sm">
                Crafting exceptional sports equipment that elevates athletic performance.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Navigation</h3>
              <div className="space-y-2 text-sm">
                <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/products" className="block text-gray-400 hover:text-white transition-colors">
                  Products
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Collections</h3>
              <div className="space-y-2 text-sm">
                <Link href="/products/equipment" className="block text-gray-400 hover:text-white transition-colors">
                  Sports Equipment
                </Link>
                <Link href="/products/apparel" className="block text-gray-400 hover:text-white transition-colors">
                  Athletic Apparel
                </Link>
                <Link href="/products/accessories" className="block text-gray-400 hover:text-white transition-colors">
                  Accessories
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Email: info@memasports.com</p>
                <p className="mb-3">Follow us for updates</p>
                <div className="flex space-x-3">
                  <Link
                    href="https://www.instagram.com/sensefragrances.eg?igsh=MXYxcTh5ZTlhZzMzNQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <Instagram className="h-4 w-4 text-white" />
                    </div>
                  </Link>
                  <Link
                    href="https://www.facebook.com/share/1JhHgi2Psu/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <Facebook className="h-4 w-4 text-white" />
                    </div>
                  </Link>
                  <Link
                    href="https://www.tiktok.com/@sensefragrances.eg?_t=ZS-8zL3M6ji8HZ&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Mema Sports. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
