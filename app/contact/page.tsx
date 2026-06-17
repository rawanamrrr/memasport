"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setError("An error occurred while sending your message")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="section-padding pt-40 md:pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent" />
        <div className="section-container relative">
          <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="section-pill mb-8 justify-center mx-auto">
              <Sparkles className="mr-2 h-4 w-4 text-orange-400" />
              Connect With Mema Sports
            </div>
            <h1 className="hero-heading text-white">Get in Touch</h1>
            <p className="hero-subheading mt-6">
              We'd love to hear from you. Send us a message about our sports equipment and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding pt-16 pb-12">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="glass-panel border-0">
                <CardContent className="p-8">
                  <h2 className="section-title text-left text-3xl">Send us a Message</h2>

                  {success && (
                    <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                      <AlertDescription>
                        Thank you for your message! We'll get back to you soon.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="mb-6 border-red-500/30 bg-red-500/10 text-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-xs uppercase tracking-widest text-gray-300 mb-2 block">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-orange-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-300 mb-2 block">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-xs uppercase tracking-widest text-gray-300 mb-2 block">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-orange-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-xs uppercase tracking-widest text-gray-300 mb-2 block">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-orange-500 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/30"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-light tracking-wider mb-6">Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Whether you have questions about our sports equipment, need help choosing the perfect gear, or want to
                  learn more about our brand, we're here to help.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-gray-600">info@memasports.com</p>
                  </div>
                </div>



                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Business Hours</h3>
                    <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Friday - Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

                             <div className="pt-8">
                 <h3 className="font-medium mb-4">Follow Us</h3>
                 <p className="text-gray-600 mb-4">
                   Stay connected for the latest updates, new releases, and exclusive offers.
                 </p>
                                   <div className="flex space-x-3">
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
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                    </Link>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="section-pill mb-6 justify-center mx-auto">
              <Sparkles className="mr-2 h-4 w-4 text-orange-400" />
              FAQ
            </div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Find answers to common questions about our sports equipment, shipping, and more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 space-y-4 text-left"
            >
              <h3 className="text-xl font-semibold text-white">What is your return policy?</h3>
              <p className="text-gray-300 text-sm">
                We offer a 30-day return policy for all unused items in original packaging. Returns are free and easy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass-panel p-8 space-y-4 text-left"
            >
              <h3 className="text-xl font-semibold text-white">Do you offer warranties?</h3>
              <p className="text-gray-300 text-sm">
                Yes! All our sports equipment comes with manufacturer warranties ranging from 1-5 years depending on the product.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="glass-panel p-8 space-y-4 text-left"
            >
              <h3 className="text-xl font-semibold text-white">How do I choose the right size?</h3>
              <p className="text-gray-300 text-sm">
                Check our size guide for each product. We also offer free size exchanges within 30 days of purchase.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="glass-panel p-8 space-y-4 text-left"
            >
              <h3 className="text-xl font-semibold text-white">How should I care for my equipment?</h3>
              <p className="text-gray-300 text-sm">
                Follow the care instructions provided with each product. Most equipment can be cleaned with mild soap and water.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image src="/mema-sports-logo-white.png" alt="Mema Sports" width={150} height={100} className="h-16 w-auto" />
              <p className="text-gray-400 text-sm">
                Crafting exceptional sports equipment that elevates athletic performance.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
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
              <h3 className="text-white font-semibold mb-4">Collections</h3>
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