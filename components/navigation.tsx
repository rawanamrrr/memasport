"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ShoppingCart, User, Heart, LogOut, Settings, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"

const productLinks = [
  { href: "/products/equipment", label: "Equipment" },
  { href: "/products/apparel", label: "Apparel" },
  { href: "/products/accessories", label: "Accessories" },
  { href: "/products/outlet", label: "Outlet" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { state: authState, logout } = useAuth()
  const { state: cartState } = useCart()
  const { state: favoritesState } = useFavorites()
  const pathname = usePathname()

  // Check if we're on the home page
  const isHomePage = pathname === "/"

  // Handle scroll effect for transparency (only on home page)
  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      // Show background frame the second the user starts scrolling
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // Don't close if clicking inside the mobile navigation or products dropdown
      if (target.closest('.mobile-navigation') || target.closest('.products-dropdown')) {
        return
      }

      setIsOpen(false)
      setShowUserMenu(false)
    }

    if (isOpen || showUserMenu) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [isOpen, showUserMenu])

  // Lock body scroll while the full-screen mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [isOpen])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  // Helper function to check if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // Determine header styling based on page and scroll position
  const getHeaderStyling = () => {
    if (isHomePage && !isScrolled) {
      return 'bg-transparent'
    }

    return 'bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-2xl border-b border-white/10 shadow-2xl'
  }

  // Determine logo based on page and scroll position
  const getLogo = () => {
    return "/mema-logo.png"
  }

  // Determine text colors based on page and scroll position
  const getTextColors = (isActive: boolean = false) => {
    if (isHomePage && !isScrolled) {
      return isActive ? 'text-white' : 'text-white/90 hover:text-white'
    }

    return isActive ? 'text-orange-400' : 'text-white hover:text-orange-400'
  }

  // Determine logo text colors
  const getLogoTextColors = () => {
    if (isHomePage && !isScrolled) {
      return {
        main: 'text-orange-500 group-hover:text-orange-400',
        sub: 'text-white/80'
      }
    }

    return {
      main: 'text-orange-500 group-hover:text-orange-400',
      sub: 'text-gray-300'
    }
  }

  // Determine active link indicator color
  const getActiveIndicatorColor = () => {
    if (isHomePage && !isScrolled) {
      return 'bg-white'
    }

    return 'bg-gradient-to-r from-orange-400 to-orange-600'
  }

  // Determine icon colors
  const getIconColors = (isActive: boolean = false) => {
    if (isHomePage && !isScrolled) {
      return isActive ? 'text-white' : 'text-white/90 hover:text-white'
    }

    return isActive ? 'text-orange-500' : 'text-white/80 hover:text-white'
  }

  // Determine button styling
  const getButtonStyling = () => {
    if (isHomePage && !isScrolled) {
      return {
        signIn: 'text-white/90 hover:text-white hover:bg-white/10',
        signUp: 'bg-white text-black hover:bg-gray-100'
      }
    }

    return {
      signIn: 'text-white/80 hover:text-white hover:bg-white/10',
      signUp: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
    }
  }

  // Show loading state while auth is initializing
  if (authState.isLoading) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${getHeaderStyling()}`} style={{ marginTop: 'var(--offers-banner-height, 0px)' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Simplified loading navigation */}
            <div className={`h-8 w-8 rounded animate-pulse ${!isHomePage || isScrolled ? 'bg-gray-200' : 'bg-white/20'
              }`}></div>
            <div className="flex items-center space-x-4">
              <div className={`h-5 w-5 rounded animate-pulse ${!isHomePage || isScrolled ? 'bg-gray-200' : 'bg-white/20'
                }`}></div>
              <div className={`h-5 w-5 rounded animate-pulse ${!isHomePage || isScrolled ? 'bg-gray-200' : 'bg-white/20'
                }`}></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const logoColors = getLogoTextColors()
  const buttonStyling = getButtonStyling()

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${getHeaderStyling()}`} style={{ marginTop: 'var(--offers-banner-height, 0px)' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div className="relative">
                <Image
                  src={getLogo()}
                  alt="Mema Sports Icon"
                  width={32}
                  height={32}
                  className="h-12 w-12"
                  priority
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                className="flex flex-col"
                style={{ fontFamily: 'var(--font-anton), Anton, Impact, "Arial Black", sans-serif' }}
              >
                <span className={`text-xl font-normal tracking-[0.15em] transition-colors uppercase ${logoColors.main}`}>
                  MEMA
                </span>
                <span className={`text-[10px] font-light tracking-[0.3em] mt-0.5 uppercase transition-colors ${logoColors.sub}`}>
                  SPORTS
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`relative px-4 py-2 transition-all duration-300 font-medium ${getTextColors(isActiveLink("/"))}`}
              >
                Home
                {isActiveLink("/") && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-full ${getActiveIndicatorColor()}`} />
                )}
              </Link>
              <Link
                href="/about"
                className={`relative px-4 py-2 transition-all duration-300 font-medium ${getTextColors(isActiveLink("/about"))}`}
              >
                About
                {isActiveLink("/about") && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-full ${getActiveIndicatorColor()}`} />
                )}
              </Link>
              <div className="relative group">
                <Link
                  href="/products"
                  className={`relative px-4 py-2 transition-all duration-300 font-medium ${getTextColors(isActiveLink("/products"))}`}
                >
                  Products
                  {isActiveLink("/products") && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-full ${getActiveIndicatorColor()}`} />
                  )}
                </Link>
                <div className="absolute top-full left-0 mt-3 w-56 rounded-lg border border-white/10 bg-zinc-950/95 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 backdrop-blur-xl">
                  <div className="py-3">
                    {productLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="mx-2 block rounded-md px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href="/contact"
                className={`relative px-4 py-2 transition-all duration-300 font-medium ${getTextColors(isActiveLink("/contact"))}`}
              >
                Contact
                {isActiveLink("/contact") && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-full ${getActiveIndicatorColor()}`} />
                )}
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Favorites */}
              <Link
                href="/favorites"
                className={`relative p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 ${getIconColors(isActiveLink("/favorites"))}`}
              >
                <Heart className="h-5 w-5" />
                {favoritesState.count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs">
                    {favoritesState.count}
                  </Badge>
                )}
                {isActiveLink("/favorites") && (
                  <div className={`absolute inset-0 rounded-xl ${!isHomePage || isScrolled ? 'bg-black/3' : 'bg-white/20'
                    }`} />
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className={`relative p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 ${getIconColors(isActiveLink("/cart"))}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartState.count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs">
                    {cartState.count}
                  </Badge>
                )}
                {isActiveLink("/cart") && (
                  <div className={`absolute inset-0 rounded-xl ${!isHomePage || isScrolled ? 'bg-black/3' : 'bg-white/20'
                    }`} />
                )}
              </Link>

              {/* User Menu */}
              {authState.isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className={`p-2 transition-colors ${getIconColors()}`}
                  >
                    <User className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{authState.user?.name}</p>
                            <p className="text-xs text-gray-500">{authState.user?.email}</p>
                          </div>

                          {authState.user?.role !== "admin" && (
                            <Link
                              href="/account"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              My Account
                            </Link>
                          )}

                          {authState.user?.role === "admin" && (
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`transition-all ${buttonStyling.signIn}`}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      className={`transition-all ${buttonStyling.signUp}`}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(!isOpen)
                }}
                className={`md:hidden p-2 transition-colors ${getIconColors()}`}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile Navigation — full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-navigation fixed inset-0 z-50 md:hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 flex h-full w-full flex-col overflow-y-auto bg-gradient-to-b from-zinc-950 to-black shadow-2xl"
            >
              {/* Header row inside panel */}
              <div className="flex items-center justify-between px-6 pt-6" style={{ paddingTop: 'calc(1.5rem + var(--offers-banner-height, 0px))' }}>
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <Image src="/mema-logo.png" alt="Mema Sports" width={28} height={28} className="h-9 w-9" />
                  <span
                    className="text-lg font-normal tracking-[0.15em] text-orange-500 uppercase"
                    style={{ fontFamily: 'var(--font-anton), Anton, Impact, "Arial Black", sans-serif' }}
                  >
                    MEMA
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 px-6 py-8">
                <nav className="flex flex-col">
                  <Link
                    href="/"
                    className={`relative border-b border-white/10 py-4 text-2xl font-bold tracking-tight transition-colors ${isActiveLink("/") ? "text-orange-400" : "text-white hover:text-orange-300"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/about"
                    className={`relative border-b border-white/10 py-4 text-2xl font-bold tracking-tight transition-colors ${isActiveLink("/about") ? "text-orange-400" : "text-white hover:text-orange-300"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>

                  <div className="products-dropdown border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <Link
                        href="/products"
                        className={`flex-1 py-4 text-2xl font-bold tracking-tight transition-colors ${isActiveLink("/products") ? "text-orange-400" : "text-white hover:text-orange-300"
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Products
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setProductsOpen(!productsOpen)
                        }}
                        className="p-2 text-white/60 transition-colors hover:text-white"
                      >
                        <ChevronDown className={`h-6 w-6 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {productsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden pb-3"
                        >
                          {productLinks.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`block py-2.5 pl-2 text-base font-medium transition-colors ${isActiveLink(item.href) ? "text-orange-400" : "text-white/70 hover:text-white"
                                }`}
                              onClick={() => setIsOpen(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    href="/contact"
                    className={`relative border-b border-white/10 py-4 text-2xl font-bold tracking-tight transition-colors ${isActiveLink("/contact") ? "text-orange-400" : "text-white hover:text-orange-300"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                </nav>

                {/* Auth section */}
                <div className="mt-8">
                  {!authState.isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center border-white/20 bg-white/5 text-white hover:bg-white/10">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="mb-3 text-sm font-medium text-white/60">{authState.user?.name}</p>
                      {authState.user?.role !== "admin" && (
                        <Link
                          href="/account"
                          className="block py-2 text-base font-medium text-white/85 transition-colors hover:text-orange-300"
                          onClick={() => setIsOpen(false)}
                        >
                          My Account
                        </Link>
                      )}
                      {authState.user?.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="block py-2 text-base font-medium text-white/85 transition-colors hover:text-orange-300"
                          onClick={() => setIsOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="block w-full py-2 text-left text-base font-medium text-red-400 transition-colors hover:text-red-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
