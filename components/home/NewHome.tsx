"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { ArrowRight, Star, Shield, Truck, Zap, Trophy, Target, Instagram, Facebook, Award, ChevronLeft, ChevronRight } from "lucide-react"
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
      const container = categoriesRef.current
      const children = Array.from(container.children) as HTMLElement[]
      if (children.length === 0) return

      const itemWidth = children[0].offsetWidth
      const gap = 24 // gap-6
      const scrollPosition = container.scrollLeft
      
      // Calculate current index based on scroll position
      const currentIndex = Math.round(scrollPosition / (itemWidth + gap))
      
      // Calculate target index
      let targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
      
      // Clamp target index between 0 and children.length - 1
      targetIndex = Math.max(0, Math.min(targetIndex, children.length - 1))
      
      // Scroll the target child into center view
      children[targetIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialsRef.current) {
      const container = testimonialsRef.current
      const children = Array.from(container.children) as HTMLElement[]
      if (children.length === 0) return

      const itemWidth = children[0].offsetWidth
      const gap = 24 // gap-6
      const scrollPosition = container.scrollLeft
      
      // Calculate current index based on scroll position
      const currentIndex = Math.round(scrollPosition / (itemWidth + gap))
      
      // Calculate target index
      let targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
      
      // Clamp target index between 0 and children.length - 1
      targetIndex = Math.max(0, Math.min(targetIndex, children.length - 1))
      
      // Scroll the target child into center view
      children[targetIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
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

  const stats = [
    { value: "50K+", label: "Happy athletes" },
    { value: "4.9/5", label: "Average rating" },
    { value: "100%", label: "Quality guarantee" },
  ]

  const testimonials = [
    { name: "Ahmed M.", role: "Professional Runner", review: "The quality is outstanding. These products have genuinely improved my performance and comfort during training." },
    { name: "Sara K.", role: "Fitness Coach", review: "I recommend Mema Sports to all my clients. The durability and design are unmatched in the market." },
    { name: "Omar H.", role: "Basketball Player", review: "Best sports gear I've ever used. The attention to detail and performance features are incredible." }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[92svh] flex items-center justify-center overflow-hidden pt-32 pb-16 md:pt-28 md:pb-20" style={{ paddingTop: 'calc(8rem + var(--offers-banner-height, 0px))' }}>
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
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,.28),rgba(0,0,0,.44)_45%,rgba(20,184,166,.18))]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-black/35 px-4 py-2 text-sm backdrop-blur-md sm:px-5"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-semibold">Premium Athletic Gear</span>
            </motion.div>

            <h1 className="mt-7 text-4xl font-black leading-[0.92] tracking-normal sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block text-white">ELEVATE</span>
              <span className="block text-white">YOUR</span>
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                PERFORMANCE
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-200 sm:text-lg md:text-xl">
              Performance gear for training days, match days, and every session between.
              <span className="block sm:inline"> Built tough, styled clean, ready fast.</span>
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/products">
                <Button size="lg" className="w-full min-w-52 group sm:w-auto">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/products/outlet">
                <Button size="lg" variant="outline" className="w-full min-w-52 border-white/25 bg-black/25 hover:bg-white/10 sm:w-auto">
                  Shop Outlet
                </Button>
              </Link>
            </div>

            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-black/35 backdrop-blur-md">
              {stats.map((stat) => (
                <div key={stat.label} className="border-r border-white/10 px-3 py-4 last:border-r-0 sm:px-6">
                  <div className="text-2xl font-black text-orange-400 sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-300 sm:text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </section>

      {/* Features Section */}
      <section className="border-y border-white/10 bg-zinc-950 py-14">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-lg border border-white/10 bg-white/[0.03] p-6 text-left transition-colors hover:border-orange-400/40 hover:bg-white/[0.06]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/25">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-zinc-900 py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
              Shop by <span className="text-orange-500">Category</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
              Find exactly what you need for your sport
            </p>
          </motion.div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 md:flex"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 md:flex"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Scrollable Categories */}
            <div
              ref={categoriesRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scroll-px-6 touch-pan-x md:gap-6"
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
                  className="w-[82vw] flex-shrink-0 snap-center sm:w-80"
                >
                  <Link href={cat.href} className="group block">
                    <Card className="overflow-hidden rounded-lg border-white/10 bg-black/40 transition-all duration-300 hover:border-orange-500/50">
                      <div className="relative h-72 overflow-hidden">
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
                          <div className="mt-4 inline-flex items-center text-sm font-semibold text-orange-400">
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
      <section className="bg-black px-4 py-10 md:px-8 md:py-14">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] border border-orange-300/25 bg-gradient-to-br from-orange-600 via-orange-500 to-teal-600 py-16 shadow-2xl shadow-orange-950/30 md:rounded-[5rem] md:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)' }} />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/25" />
          <div className="container relative z-10 mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Zap className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="mb-5 text-3xl font-black text-white sm:text-4xl md:text-5xl">
                  Ready to Elevate Your Game?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
                  Join thousands of athletes who trust Mema Sports for their performance needs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button size="lg" variant="outline" className="border-0 bg-white text-orange-600 hover:bg-gray-100">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black py-20 md:py-24">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              What Athletes <span className="text-orange-500">Say</span>
            </h2>
            <p className="text-base text-gray-400 md:text-lg">Real reviews from real athletes</p>
          </motion.div>

          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollTestimonials('left')}
              className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:flex"
              aria-label="Scroll testimonials left"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollTestimonials('right')}
              className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:flex"
              aria-label="Scroll testimonials right"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Scrollable Testimonials */}
            <div
              ref={testimonialsRef}
              className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-pan-x snap-x snap-mandatory scroll-px-6"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none', 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x'
              }}
            >
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-[80vw] sm:w-96 snap-center"
                >
                  <Card className="h-full rounded-lg border-white/10 bg-white/5 transition-all duration-300 hover:border-orange-500/30">
                    <CardContent className="p-6 sm:p-8">
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
      <section className="pb-24">
        <div className="container mx-auto px-6 md:px-8">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 md:p-10">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">Join the club</h3>
            <p className="text-white/70 mt-2">Get early access to drops, exclusive offers and training tips.</p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-white/10 bg-black/60 px-4 py-3 text-white outline-none ring-orange-500/40 placeholder-white/40 focus:ring-2 sm:flex-1"
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
                src="/mema-sports-icon-white.png"
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
