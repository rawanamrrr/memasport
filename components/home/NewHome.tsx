"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { ArrowRight, Star, Shield, Truck, Sparkles, Zap, Trophy, Target, Instagram, Facebook, Package, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useEffect } from "react"

export default function NewHome() {
  const categoriesRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Force video to play on mobile and ensure looping
  useEffect(() => {
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(error => {
          console.log("Video autoplay failed:", error)
        })
      }
    }

    // Ensure video loops when it ends
    const handleVideoEnd = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    }

    // Try to play immediately
    playVideo()

    // Try again after a short delay
    const timer = setTimeout(playVideo, 100)

    // Try when user interacts with the page
    const handleInteraction = () => {
      playVideo()
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('click', handleInteraction)
    }

    document.addEventListener('touchstart', handleInteraction)
    document.addEventListener('click', handleInteraction)

    // Add event listener for video end
    if (videoRef.current) {
      videoRef.current.addEventListener('ended', handleVideoEnd)
    }

    return () => {
      clearTimeout(timer)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('click', handleInteraction)
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [])

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 400
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialsRef.current) {
      const scrollAmount = 400
      testimonialsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }
  const features = [
    {
      icon: Shield,
      title: "Premium Quality",
      desc: "Top-tier materials and craftsmanship"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Free shipping on orders over 1000 EGP"
    },
    {
      icon: Award,
      title: "Trusted Brand",
      desc: "50,000+ satisfied athletes"
    },
    {
      icon: Target,
      title: "Expert Support",
      desc: "24/7 customer service team"
    },
  ]

  const categories = [
    {
      href: "/products/equipment",
      title: "Equipment",
      desc: "Professional-grade sports gear",
      img: "/placeholder-sports-equipment.jpg",
    },
    {
      href: "/products/apparel",
      title: "Apparel",
      desc: "High-performance athletic wear",
      img: "/placeholder-sports-apparel.jpg",
    },
    {
      href: "/products/accessories",
      title: "Accessories",
      desc: "Essential training accessories",
      img: "/placeholder-sports-accessories.jpg",
    },
    {
      href: "/products/outlet",
      title: "Outlet",
      desc: "Exclusive deals & discounts",
      img: "/placeholder-sports-outlet.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-24" style={{ paddingTop: 'calc(8rem + var(--offers-banner-height, 0px))' }}>
        {/* Video Background */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            webkit-playsinline="true"
            x-webkit-airplay="allow"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ objectFit: 'cover' }}
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23000000'/%3E%3C/svg%3E"
          >
            <source src="/mema-video.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-black/40 to-purple-900/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-semibold">Premium Athletic Gear</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight">
              <span className="block text-white">ELEVATE YOUR</span>
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                PERFORMANCE
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience the perfect blend of innovation and performance. 
              <span className="block mt-2">Gear that moves with you, built to last.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-black text-orange-400">50K+</div>
                <div className="text-sm text-gray-400 mt-1">Happy Athletes</div>
              </div>
              <div>
                <div className="text-4xl font-black text-orange-400">4.9★</div>
                <div className="text-sm text-gray-400 mt-1">Average Rating</div>
              </div>
              <div>
                <div className="text-4xl font-black text-orange-400">100%</div>
                <div className="text-sm text-gray-400 mt-1">Quality Guarantee</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
            <motion.div
              className="w-1.5 h-3 bg-orange-500 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Shop by <span className="text-orange-500">Category</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find exactly what you need for your sport
            </p>
          </motion.div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Scrollable Categories */}
            <div
              ref={categoriesRef}
              className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-pan-x"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x'
              }}
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.href}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-80"
                >
                  <Link href={cat.href} className="group block">
                    <Card className="overflow-hidden border-white/10 bg-black/40 hover:border-orange-500/50 transition-all duration-300">
                      <div className="relative h-80 overflow-hidden">
                        <Image
                          src={cat.img}
                          alt={cat.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{cat.title}</h3>
                          <p className="text-sm text-gray-300">{cat.desc}</p>
                          <div className="mt-4 inline-flex items-center text-orange-400 font-semibold">
                            Shop Now
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)' }} />
        </div>
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Zap className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Ready to Elevate Your Game?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of athletes who trust Mema Sports for their performance needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" variant="outline" className="bg-white text-orange-600 hover:bg-gray-100 border-0 text-lg px-8 py-6">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              What Athletes <span className="text-orange-500">Say</span>
            </h2>
            <p className="text-xl text-gray-400">Real reviews from real athletes</p>
          </motion.div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollTestimonials('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollTestimonials('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Scrollable Testimonials */}
            <div
              ref={testimonialsRef}
              className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-pan-x"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x'
              }}
            >
              {[
                { name: "Ahmed M.", role: "Professional Runner", review: "The quality is outstanding. These products have genuinely improved my performance and comfort during training." },
                { name: "Sara K.", role: "Fitness Coach", review: "I recommend Mema Sports to all my clients. The durability and design are unmatched in the market." },
                { name: "Omar H.", role: "Basketball Player", review: "Best sports gear I've ever used. The attention to detail and performance features are incredible." }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-96"
                >
                  <Card className="bg-white/5 border-white/10 hover:border-orange-500/30 transition-all duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-5 h-5 fill-orange-500 text-orange-500" />
                        ))}
                      </div>
                      <p className="text-white/90 mb-6 leading-relaxed">"{testimonial.review}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{testimonial.name}</div>
                          <div className="text-sm text-gray-400">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="pb-28">
        <div className="container mx-auto px-6 md:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 md:p-14 backdrop-blur-xl">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">Join the club</h3>
            <p className="text-white/70 mt-2">Get early access to drops, exclusive offers and training tips.</p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 rounded-2xl bg-black/60 border border-white/10 px-4 py-3 outline-none focus:ring-2 ring-orange-500/40 text-white placeholder-white/40"
              />
              <Button className="shrink-0">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-white/10 py-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <Image
                src="/mema-sports-icon-black.png"
                alt="Mema Sports"
                width={150}
                height={60}
                className="h-12 w-auto"
              />
              <p className="text-white/60 text-sm leading-relaxed">
                Crafting exceptional sports equipment that elevates athletic performance.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-bold text-white mb-4">Navigation</h3>
              <div className="space-y-3 text-sm">
                <Link href="/" className="block text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/about" className="block text-white/70 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/products" className="block text-white/70 hover:text-white transition-colors">
                  Products
                </Link>
                <Link href="/contact" className="block text-white/70 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Collections */}
            <div>
              <h3 className="font-bold text-white mb-4">Collections</h3>
              <div className="space-y-3 text-sm">
                <Link href="/products/equipment" className="block text-white/70 hover:text-white transition-colors">
                  Equipment
                </Link>
                <Link href="/products/apparel" className="block text-white/70 hover:text-white transition-colors">
                  Apparel
                </Link>
                <Link href="/products/accessories" className="block text-white/70 hover:text-white transition-colors">
                  Accessories
                </Link>
                <Link href="/products/outlet" className="block text-white/70 hover:text-white transition-colors">
                  Outlet
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <div className="space-y-3 text-sm text-white/70">
                <p>Email: info@memasports.com</p>
                <p className="mb-4">Follow us for updates</p>
                <div className="flex gap-3">
                  <Link
                    href="https://www.instagram.com/sensefragrances.eg?igsh=MXYxcTh5ZTlhZzMzNQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                  </Link>
                  <Link
                    href="https://www.facebook.com/share/1JhHgi2Psu/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <Facebook className="h-5 w-5 text-white" />
                    </div>
                  </Link>
                  <Link
                    href="https://www.tiktok.com/@sensefragrances.eg?_t=ZS-8zL3M6ji8HZ&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2025 Mema Sports. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
