"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, X, Heart, Sparkles, RefreshCw, Package, Instagram, Facebook } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useCart } from "@/lib/cart-context"
import { useFavorites } from "@/lib/favorites-context"
import { GiftPackageSelector } from "@/components/gift-package-selector"
import useEmblaCarousel from 'embla-carousel-react'

interface ProductSize {
  size: string
  volume: string
  originalPrice?: number
  discountedPrice?: number
}

interface Product {
  _id: string
  id: string
  name: string
  description: string
  longDescription: string
  images: string[]
  rating: number
  reviews: number
  category: "equipment" | "apparel" | "accessories" | "outlet"
  sizes: ProductSize[]
  isActive: boolean
  isNew: boolean
  isBestseller: boolean
  // Gift package fields
  isGiftPackage?: boolean
  packagePrice?: number
  packageOriginalPrice?: number
  giftPackageSizes?: any[]
  notes?: {
    top: string[]
    middle: string[]
    base: string[]
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [showGiftPackageSelector, setShowGiftPackageSelector] = useState(false)
  
  // Function to calculate the smallest price from all sizes
  const getSmallestPrice = (sizes: ProductSize[]) => {
    if (!sizes || sizes.length === 0) return 0
    
    const prices = sizes.map(size => size.discountedPrice || size.originalPrice || 0)
    return Math.min(...prices.filter(price => price > 0))
  }

  // Function to calculate the smallest original price from all sizes
  const getSmallestOriginalPrice = (sizes: ProductSize[]) => {
    if (!sizes || sizes.length === 0) return 0
    
    const prices = sizes.map(size => size.originalPrice || 0)
    return Math.min(...prices.filter(price => price > 0))
  }
  
  // Embla Carousel state
  const [emblaRefEquipment, emblaApiEquipment] = useEmblaCarousel({ 
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: false,
  })
  const [selectedIndexEquipment, setSelectedIndexEquipment] = useState(0)
  
  const [emblaRefApparel, emblaApiApparel] = useEmblaCarousel({ 
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: false,
  })
  const [selectedIndexApparel, setSelectedIndexApparel] = useState(0)
  
  const [emblaRefAccessories, emblaApiAccessories] = useEmblaCarousel({ 
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: false,
  })
  const [selectedIndexAccessories, setSelectedIndexAccessories] = useState(0)
  
  const [emblaRefOutlet, emblaApiOutlet] = useEmblaCarousel({ 
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: false
  })
  const [selectedIndexOutlet, setSelectedIndexOutlet] = useState(0)

  const { dispatch: cartDispatch } = useCart()
  const { 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite, 
    loading: favoritesLoading 
  } = useFavorites()

  const fetchProducts = async () => {
  try {
    // إذا الكود شغال على client استخدم relative URL
    const baseUrl = typeof window !== "undefined"
      ? ""
      : process.env.NEXT_PUBLIC_BASE_URL;

    const response = await fetch(`${baseUrl}/api/products?limit=20`);

    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    } else {
      console.error("Error fetching products:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchProducts();
}, []);


  const categorizedProducts = {
    equipment: products.filter((p) => p.category === "equipment" && p.isActive),
    apparel: products.filter((p) => p.category === "apparel" && p.isActive),
    accessories: products.filter((p) => p.category === "accessories" && p.isActive),
    outlet: products.filter((p) => p.category === "outlet" && p.isActive),
  }

  const openSizeSelector = (product: Product) => {
    // For gift packages, open the gift package selector instead
    if (product.isGiftPackage) {
      setSelectedProduct(product)
      setShowGiftPackageSelector(true)
    } else {
    setSelectedProduct(product)
    setSelectedSize(product.sizes.length > 0 ? product.sizes[0] : null)
    setQuantity(1)
    setShowSizeSelector(true)
    }
  }

  const closeSizeSelector = () => {
    setShowSizeSelector(false)
    setTimeout(() => {
      setSelectedProduct(null)
      setSelectedSize(null)
    }, 300)
  }

  const addToCart = () => {
    if (!selectedProduct || !selectedSize) return
    
    cartDispatch({
      type: "ADD_ITEM",
      payload: {
        id: `${selectedProduct.id}-${selectedSize.size}`,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedSize.discountedPrice || selectedSize.originalPrice || 0,
        originalPrice: selectedSize.originalPrice,
        size: selectedSize.size,
        volume: selectedSize.volume,
        image: selectedProduct.images[0],
        category: selectedProduct.category,
        quantity: quantity
      }
    })
    
    closeSizeSelector()
  }

  const toggleFavorite = async (product: any) => {
    try {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id)
      } else {
        // For gift packages, use package price; for regular products, use smallest size price
        const price = product.isGiftPackage && product.packagePrice 
          ? product.packagePrice 
          : getSmallestPrice(product.sizes);
          
        await addToFavorites({
          id: product.id,
          name: product.name,
          price: price,
          image: product.images[0],
          category: product.category,
          rating: product.rating,
          isNew: product.isNew,
          isBestseller: product.isBestseller,
          sizes: product.sizes,
          // Add gift package fields
          isGiftPackage: product.isGiftPackage,
          packagePrice: product.packagePrice,
          packageOriginalPrice: product.packageOriginalPrice,
          giftPackageSizes: product.giftPackageSizes,
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // Carousel scroll functions
  const scrollToEquipment = useCallback((index: number) => {
    if (!emblaApiEquipment) return
    emblaApiEquipment.scrollTo(index)
  }, [emblaApiEquipment])

  const scrollToApparel = useCallback((index: number) => {
    if (!emblaApiApparel) return
    emblaApiApparel.scrollTo(index)
  }, [emblaApiApparel])

  const scrollToAccessories = useCallback((index: number) => {
    if (!emblaApiAccessories) return
    emblaApiAccessories.scrollTo(index)
  }, [emblaApiAccessories])

  const scrollToOutlet = useCallback((index: number) => {
    if (!emblaApiOutlet) return
    emblaApiOutlet.scrollTo(index)
  }, [emblaApiOutlet])

  // Carousel event listeners
  useEffect(() => {
    if (!emblaApiEquipment) return
    emblaApiEquipment.on('select', () => {
      setSelectedIndexEquipment(emblaApiEquipment.selectedScrollSnap())
    })
  }, [emblaApiEquipment])

  useEffect(() => {
    if (!emblaApiApparel) return
    emblaApiApparel.on('select', () => {
      setSelectedIndexApparel(emblaApiApparel.selectedScrollSnap())
    })
  }, [emblaApiApparel])

  useEffect(() => {
    if (!emblaApiAccessories) return
    emblaApiAccessories.on('select', () => {
      setSelectedIndexAccessories(emblaApiAccessories.selectedScrollSnap())
    })
  }, [emblaApiAccessories])

  useEffect(() => {
    if (!emblaApiOutlet) return
    emblaApiOutlet.on('select', () => {
      setSelectedIndexOutlet(emblaApiOutlet.selectedScrollSnap())
    })
  }, [emblaApiOutlet])

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="section-container pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-t-2 border-b-2 border-orange-500 rounded-full mx-auto mb-4"
            />
            <p className="muted-text">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Size Selector Modal */}
      {showSizeSelector && selectedProduct && (
        <>
          {/* Gift Package Selector */}
          {selectedProduct.isGiftPackage ? (
            <GiftPackageSelector
              product={selectedProduct}
              isOpen={showSizeSelector}
              onClose={closeSizeSelector}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          ) : (
            /* Regular Product Size Selector */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeSizeSelector}
        >
          <motion.div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium">{selectedProduct.name}</h3>
                  <p className="text-gray-600 text-sm">Select your preferred size</p>
                </div>
                <div className="flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(selectedProduct)
                    }}
                    className="mr-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label={isFavorite(selectedProduct.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        isFavorite(selectedProduct.id) 
                          ? "text-red-500 fill-red-500" 
                          : "text-gray-700"
                      }`} 
                    />
                  </button>
                  <button 
                    onClick={closeSizeSelector}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close size selector"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="relative w-20 h-20 mr-4">
                  <Image
                    src={selectedProduct.images[0] || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {selectedProduct.description}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(selectedProduct.rating) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-2">
                      ({selectedProduct.rating.toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-3">Available Sizes</h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProduct.sizes.map((size) => (
                    <motion.button
                      key={size.size}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`border-2 rounded-xl p-3 text-center transition-all ${
                        selectedSize?.size === size.size
                          ? 'border-black bg-black text-white shadow-md'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedSize(size)}
                      aria-label={`Select size ${size.size} - ${size.volume}`}
                    >
                      <div className="font-medium">{size.size}</div>
                      <div className="text-xs mt-1">{size.volume}</div>
                      <div className="text-xs mt-2">
                        {size.originalPrice && size.discountedPrice && size.discountedPrice < size.originalPrice ? (
                          <>
                            <span className="line-through text-gray-400 block">EGP{size.originalPrice}</span>
                            <span className="text-red-600 font-medium">EGP{size.discountedPrice}</span>
                          </>
                        ) : size.discountedPrice && size.discountedPrice < (size.originalPrice || 0) ? (
                          <span className="text-red-600 font-medium">EGP{size.discountedPrice}</span>
                        ) : (
                          <span className="font-medium">EGP{size.originalPrice || 0}</span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Quantity Selection */}
              <div className="mb-4">
                <h4 className="font-medium mb-3">Quantity</h4>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <span className="text-gray-600">-</span>
                  </motion.button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-600">+</span>
                  </motion.button>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <div>
                  {selectedSize ? (
                    <div>
                      {selectedSize.originalPrice && selectedSize.discountedPrice && selectedSize.discountedPrice < selectedSize.originalPrice ? (
                        <>
                          <span className="line-through text-gray-400 text-lg block">EGP{selectedSize.originalPrice}</span>
                          <span className="text-xl font-medium text-red-600">EGP{selectedSize.discountedPrice}</span>
                        </>
                      ) : selectedSize.discountedPrice && selectedSize.discountedPrice < (selectedSize.originalPrice || 0) ? (
                        <span className="text-xl font-medium text-red-600">EGP{selectedSize.discountedPrice}</span>
                      ) : (
                        <span className="text-xl font-medium">EGP{selectedSize.originalPrice || 0}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xl font-medium text-gray-400">Select a size</span>
                  )}
                </div>
                
                <Button 
                  onClick={addToCart} 
                  className="flex items-center bg-black hover:bg-gray-800 rounded-full px-6 py-5"
                  disabled={!selectedSize}
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
          )}
        </>
      )}

      {/* Hero Section */}
      <section className="section-padding pt-44 md:pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/15 via-transparent to-transparent" />
        <div className="absolute -inset-32 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),_transparent_60%)] opacity-70" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-500/15 to-orange-600/10 border border-orange-500/40 rounded-full mb-8 backdrop-blur-xl shadow-lg shadow-orange-500/10">
              <Sparkles className="mr-2 h-4 w-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-semibold tracking-wider">SIGNATURE COLLECTIONS</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">Collections</h1>
            <p className="text-xl md:text-2xl text-gray-300/90 max-w-3xl mx-auto leading-relaxed font-light">
              Discover our carefully curated products, each crafted to capture unforgettable moments and express individual
              personalities.
            </p>
            <div className="mt-12 flex flex-wrap gap-5 justify-center">
              <Button
                onClick={fetchProducts}
                size="lg"
                className="group shadow-2xl hover:shadow-orange-500/40"
              >
                <RefreshCw className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Refresh All Products
              </Button>
              <Link href="#collections" className="inline-flex">
                <Button
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-xl"
                >
                  Explore Sections
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Equipment Collection */}
      <section id="collections" className="section-padding py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-purple-500/10" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Equipment</h2>
                <p className="text-lg text-gray-400/90 font-light">Professional-grade sports gear</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Link href="/products/equipment">
                  <Button
                    size="sm"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="overflow-hidden" ref={emblaRefEquipment}>
                <div className="flex">
                  {categorizedProducts.equipment.map((product, index) => (
                    <div key={product._id} className="flex-[0_0_80%] min-w-0 pl-4 relative h-full">
                      <div className="group relative h-full">
                        {/* Favorite Button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await toggleFavorite(product)
                          }}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                          aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              isFavorite(product.id) 
                                ? "text-red-500 fill-red-500" 
                                : "text-gray-700"
                            }`} 
                          />
                        </button>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 z-10 space-y-2">
                          {product.isBestseller && (
                            <Badge className="bg-black text-white">Bestseller</Badge>
                          )}
                          {product.isNew && !product.isBestseller && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        
                        {/* Product Card - Mobile Carousel */}
                        <Card className="border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-2xl hover:shadow-glow hover:border-white/20 transition-all duration-500 h-full mr-4 overflow-hidden">
                          <CardContent className="p-0 h-full flex flex-col">
                            <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                              <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <div className="flex items-center mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(product.rating) 
                                            ? "fill-yellow-400 text-yellow-400" 
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs ml-2">
                                    ({product.rating.toFixed(1)})
                                  </span>
                                </div>

                                <h3 className="text-lg font-medium mb-1">
                                  {product.name}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-left">
                                    {(() => {
                                      // Handle gift packages
                                      if (product.isGiftPackage) {
                                        const packagePrice = product.packagePrice || 0;
                                        const packageOriginalPrice = product.packageOriginalPrice || 0;
                                        
                                        if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                          return (
                                            <>
                                              <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                              <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                            </>
                                          );
                                        } else {
                                          return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                        }
                                      }
                                      
                                      // Handle regular products
                                      if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                        return (
                                      <>
                                        <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                        <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                      </>
                                        );
                                      } else {
                                        return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                      }
                                    })()}
                                  </div>
                                  
                                  <button 
                                    className="p-2 bg-white/20 border border-white/20 backdrop-blur-lg rounded-full hover:bg-white/30 transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      openSizeSelector(product)
                                    }}
                                    aria-label="Add to cart"
                                  >
                                    <ShoppingCart className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 md:hidden">
                {categorizedProducts.equipment.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToEquipment(index)}
                    className={`w-2 h-2 mx-1 rounded-full transition-colors ${
                      index === selectedIndexEquipment ? 'bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categorizedProducts.equipment.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="group relative h-full">
                    {/* Favorite Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await toggleFavorite(product)
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                      aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          isFavorite(product.id) 
                            ? "text-red-500 fill-red-500" 
                            : "text-gray-700"
                        }`} 
                      />
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 space-y-2">
                      {product.isBestseller && (
                        <Badge className="bg-black text-white">Bestseller</Badge>
                      )}
                      {product.isNew && !product.isBestseller && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                    
                    {/* Product Card - Desktop Grid */}
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-center mb-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating) 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs ml-2">
                                ({product.rating.toFixed(1)})
                              </span>
                            </div>

                            <h3 className="text-lg font-medium mb-1">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                {(() => {
                                  // Handle gift packages
                                  if (product.isGiftPackage) {
                                    const packagePrice = product.packagePrice || 0;
                                    const packageOriginalPrice = product.packageOriginalPrice || 0;
                                    
                                    if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                      return (
                                        <>
                                          <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                          <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                        </>
                                      );
                                    } else {
                                      return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                    }
                                  }
                                  
                                  // Handle regular products
                                  if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                    return (
                                  <>
                                    <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                    <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                  </>
                                    );
                                  } else {
                                    return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                  }
                                })()}
                              </div>
                              
                              <button 
                                className={`p-2 border border-white/20 backdrop-blur-lg rounded-full transition-colors ${
                                  product.isGiftPackage 
                                    ? "bg-gradient-to-r from-orange-500/40 to-pink-500/40 hover:from-orange-500/60 hover:to-pink-500/60" 
                                    : "bg-white/15 hover:bg-white/25"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openSizeSelector(product)
                                }}
                                aria-label={product.isGiftPackage ? "Customize Package" : "Add to cart"}
                              >
                                {product.isGiftPackage ? (
                                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Apparel Collection */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-orange-500/10" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="section-title mb-2">Apparel</h2>
                <p className="muted-text">High-performance athletic wear</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Link href="/products/apparel">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="overflow-hidden" ref={emblaRefApparel}>
                <div className="flex">
                  {categorizedProducts.apparel.map((product, index) => (
                    <div key={product._id} className="flex-[0_0_80%] min-w-0 pl-4 relative h-full">
                      <div className="group relative h-full">
                        {/* Favorite Button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await toggleFavorite(product)
                          }}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                          aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              isFavorite(product.id) 
                                ? "text-red-500 fill-red-500" 
                                : "text-gray-700"
                            }`} 
                          />
                        </button>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 z-10 space-y-2">
                          {product.isBestseller && (
                            <Badge className="bg-black text-white">Bestseller</Badge>
                          )}
                          {product.isNew && !product.isBestseller && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        
                        {/* Product Card - Women Mobile */}
                        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full mr-4">
                          <CardContent className="p-0 h-full flex flex-col">
                            <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                              <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <div className="flex items-center mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(product.rating) 
                                            ? "fill-yellow-400 text-yellow-400" 
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs ml-2">
                                    ({product.rating.toFixed(1)})
                                  </span>
                                </div>

                                <h3 className="text-lg font-medium mb-1">
                                  {product.name}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-left">
                                    {(() => {
                                      // Handle gift packages
                                      if (product.isGiftPackage) {
                                        const packagePrice = product.packagePrice || 0;
                                        const packageOriginalPrice = product.packageOriginalPrice || 0;
                                        
                                        if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                          return (
                                            <>
                                              <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                              <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                            </>
                                          );
                                        } else {
                                          return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                        }
                                      }
                                      
                                      // Handle regular products
                                      if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                        return (
                                      <>
                                        <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                        <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                      </>
                                        );
                                      } else {
                                        return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                      }
                                    })()}
                                  </div>
                                  
                                  <button 
                                    className="p-2 bg-white/20 border border-white/20 backdrop-blur-lg rounded-full hover:bg-white/30 transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      openSizeSelector(product)
                                    }}
                                    aria-label="Add to cart"
                                  >
                                    <ShoppingCart className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 md:hidden">
                {categorizedProducts.apparel.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToApparel(index)}
                    className={`w-2 h-2 mx-1 rounded-full transition-colors ${
                      index === selectedIndexApparel ? 'bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categorizedProducts.apparel.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="group relative h-full">
                    {/* Favorite Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await toggleFavorite(product)
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                      aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          isFavorite(product.id) 
                            ? "text-red-500 fill-red-500" 
                            : "text-gray-700"
                        }`} 
                      />
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 space-y-2">
                      {product.isBestseller && (
                        <Badge className="bg-black text-white">Bestseller</Badge>
                      )}
                      {product.isNew && !product.isBestseller && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                    
                    {/* Product Card - Women Desktop */}
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-center mb-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating) 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs ml-2">
                                ({product.rating.toFixed(1)})
                              </span>
                            </div>

                            <h3 className="text-lg font-medium mb-1">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                {(() => {
                                  // Handle gift packages
                                  if (product.isGiftPackage) {
                                    const packagePrice = product.packagePrice || 0;
                                    const packageOriginalPrice = product.packageOriginalPrice || 0;
                                    
                                    if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                      return (
                                        <>
                                          <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                          <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                        </>
                                      );
                                    } else {
                                      return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                    }
                                  }
                                  
                                  // Handle regular products
                                  if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                    return (
                                  <>
                                    <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                    <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                  </>
                                    );
                                  } else {
                                    return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                  }
                                })()}
                              </div>
                              
                              <button 
                                className={`p-2 border border-white/20 backdrop-blur-lg rounded-full transition-colors ${
                                  product.isGiftPackage 
                                    ? "bg-gradient-to-r from-orange-500/40 to-pink-500/40 hover:from-orange-500/60 hover:to-pink-500/60" 
                                    : "bg-white/15 hover:bg-white/25"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openSizeSelector(product)
                                }}
                                aria-label={product.isGiftPackage ? "Customize Package" : "Add to cart"}
                              >
                                {product.isGiftPackage ? (
                                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bundles */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="section-title mb-2">Bundles</h2>
                <p className="muted-text">Curated Collections</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Link href="/products/accessories">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="overflow-hidden" ref={emblaRefAccessories}>
                <div className="flex">
                  {categorizedProducts.accessories.map((product, index) => (
                    <div key={product._id} className="flex-[0_0_80%] min-w-0 pl-4 relative h-full">
                      <div className="group relative h-full">
                        {/* Favorite Button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await toggleFavorite(product)
                          }}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                          aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              isFavorite(product.id) 
                                ? "text-red-500 fill-red-500" 
                                : "text-gray-700"
                            }`} 
                          />
                        </button>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 z-10 space-y-2">
                          {product.isBestseller && (
                            <Badge className="bg-black text-white">Bestseller</Badge>
                          )}
                          {product.isNew && !product.isBestseller && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        
                        {/* Product Card - Packages Mobile */}
                        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full mr-4">
                          <CardContent className="p-0 h-full flex flex-col">
                            <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                              <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <div className="flex items-center mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(product.rating) 
                                            ? "fill-yellow-400 text-yellow-400" 
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs ml-2">
                                    ({product.rating.toFixed(1)})
                                  </span>
                                </div>

                                <h3 className="text-lg font-medium mb-1">
                                  {product.name}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-left">
                                    {(() => {
                                      // Handle gift packages
                                      if (product.isGiftPackage) {
                                        const packagePrice = product.packagePrice || 0;
                                        const packageOriginalPrice = product.packageOriginalPrice || 0;
                                        
                                        if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                          return (
                                            <>
                                              <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                              <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                            </>
                                          );
                                        } else {
                                          return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                        }
                                      }
                                      
                                      // Handle regular products
                                      if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                        return (
                                      <>
                                        <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                        <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                      </>
                                        );
                                      } else {
                                        return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                      }
                                    })()}
                                  </div>
                                  
                                  <button 
                                    className="p-2 bg-white/20 border border-white/20 backdrop-blur-lg rounded-full hover:bg-white/30 transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      openSizeSelector(product)
                                    }}
                                    aria-label="Add to cart"
                                  >
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 md:hidden">
                {categorizedProducts.accessories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToAccessories(index)}
                    className={`w-2 h-2 mx-1 rounded-full transition-colors ${
                      index === selectedIndexAccessories ? 'bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categorizedProducts.accessories.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="group relative h-full">
                    {/* Favorite Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await toggleFavorite(product)
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                      aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          isFavorite(product.id) 
                            ? "text-red-500 fill-red-500" 
                            : "text-gray-700"
                        }`} 
                      />
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 space-y-2">
                      {product.isBestseller && (
                        <Badge className="bg-black text-white">Bestseller</Badge>
                      )}
                      {product.isNew && !product.isBestseller && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                    
                    {/* Product Card - Packages Desktop */}
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-center mb-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating) 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs ml-2">
                                ({product.rating.toFixed(1)})
                              </span>
                            </div>

                            <h3 className="text-lg font-medium mb-1">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                {(() => {
                                  // Handle gift packages
                                  if (product.isGiftPackage) {
                                    const packagePrice = product.packagePrice || 0;
                                    const packageOriginalPrice = product.packageOriginalPrice || 0;
                                    
                                    if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                      return (
                                        <>
                                          <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                          <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                        </>
                                      );
                                    } else {
                                      return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                    }
                                  }
                                  
                                  // Handle regular products
                                  if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                    return (
                                  <>
                                    <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                    <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                  </>
                                    );
                                  } else {
                                    return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                  }
                                })()}
                              </div>
                              
                              <button 
                                className={`p-2 border border-white/20 backdrop-blur-lg rounded-full transition-colors ${
                                  product.isGiftPackage 
                                    ? "bg-gradient-to-r from-orange-500/40 to-pink-500/40 hover:from-orange-500/60 hover:to-pink-500/60" 
                                    : "bg-white/15 hover:bg-white/25"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openSizeSelector(product)
                                }}
                                aria-label={product.isGiftPackage ? "Customize Package" : "Add to cart"}
                              >
                                {product.isGiftPackage ? (
                                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Outlet Collection */}
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/12 via-transparent to-purple-500/12" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="section-title mb-2">Outlet</h2>
                <p className="muted-text">Special Deals &amp; Discounts</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchProducts}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Link href="/products/outlet">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="overflow-hidden" ref={emblaRefOutlet}>
                <div className="flex">
                  {categorizedProducts.outlet.map((product, index) => (
                    <div key={product._id} className="flex-[0_0_80%] min-w-0 pl-4 relative h-full">
                      <div className="group relative h-full">
                        {/* Favorite Button */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await toggleFavorite(product)
                          }}
                          className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                          aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              isFavorite(product.id) 
                                ? "text-red-500 fill-red-500" 
                                : "text-gray-700"
                            }`} 
                          />
                        </button>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 z-10 space-y-2">
                          {product.isBestseller && (
                            <Badge className="bg-black text-white">Bestseller</Badge>
                          )}
                          {product.isNew && !product.isBestseller && (
                            <Badge variant="secondary">New</Badge>
                          )}
                        </div>
                        
                        {/* Product Card - Outlet Mobile */}
                        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full mr-4">
                          <CardContent className="p-0 h-full flex flex-col">
                            <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                              <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <div className="flex items-center mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(product.rating) 
                                            ? "fill-yellow-400 text-yellow-400" 
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs ml-2">
                                    ({product.rating.toFixed(1)})
                                  </span>
                                </div>

                                <h3 className="text-lg font-medium mb-1">
                                  {product.name}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-left">
                                    {(() => {
                                      // Handle gift packages
                                      if (product.isGiftPackage) {
                                        const packagePrice = product.packagePrice || 0;
                                        const packageOriginalPrice = product.packageOriginalPrice || 0;
                                        
                                        if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                          return (
                                            <>
                                              <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                              <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                            </>
                                          );
                                        } else {
                                          return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                        }
                                      }
                                      
                                      // Handle regular products
                                      if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                        return (
                                      <>
                                        <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                        <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                      </>
                                        );
                                      } else {
                                        return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                      }
                                    })()}
                                  </div>
                                  
                                  <button 
                                    className="p-2 bg-white/20 border border-white/20 backdrop-blur-lg rounded-full hover:bg-white/30 transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      openSizeSelector(product)
                                    }}
                                    aria-label="Add to cart"
                                  >
                                    <ShoppingCart className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 md:hidden">
                {categorizedProducts.outlet.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToOutlet(index)}
                    className={`w-2 h-2 mx-1 rounded-full transition-colors ${
                      index === selectedIndexOutlet ? 'bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categorizedProducts.outlet.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="group relative h-full">
                    {/* Favorite Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await toggleFavorite(product)
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-colors"
                      aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          isFavorite(product.id) 
                            ? "text-red-500 fill-red-500" 
                            : "text-gray-700"
                        }`} 
                      />
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 space-y-2">
                      {product.isBestseller && (
                        <Badge className="bg-black text-white">Bestseller</Badge>
                      )}
                      {product.isNew && !product.isBestseller && (
                        <Badge variant="secondary">New</Badge>
                      )}
                    </div>
                    
                    {/* Product Card - Outlet Desktop */}
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        <Link href={`/products/${product.category}/${product.id}`} className="block relative aspect-square flex-grow">
                          <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-center mb-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating) 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs ml-2">
                                ({product.rating.toFixed(1)})
                              </span>
                            </div>

                            <h3 className="text-lg font-medium mb-1">
                              {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                {(() => {
                                  // Handle gift packages
                                  if (product.isGiftPackage) {
                                    const packagePrice = product.packagePrice || 0;
                                    const packageOriginalPrice = product.packageOriginalPrice || 0;
                                    
                                    if (packageOriginalPrice > 0 && packagePrice < packageOriginalPrice) {
                                      return (
                                        <>
                                          <span className="line-through text-gray-300 text-sm block">EGP{packageOriginalPrice}</span>
                                          <span className="text-lg font-light text-red-400">EGP{packagePrice}</span>
                                        </>
                                      );
                                    } else {
                                      return <span className="text-lg font-light">EGP{packagePrice}</span>;
                                    }
                                  }
                                  
                                  // Handle regular products
                                  if (getSmallestOriginalPrice(product.sizes) > 0 && getSmallestPrice(product.sizes) < getSmallestOriginalPrice(product.sizes)) {
                                    return (
                                  <>
                                    <span className="line-through text-gray-300 text-sm block">EGP{getSmallestOriginalPrice(product.sizes)}</span>
                                    <span className="text-lg font-light text-red-400">EGP{getSmallestPrice(product.sizes)}</span>
                                  </>
                                    );
                                  } else {
                                    return <span className="text-lg font-light">EGP{getSmallestPrice(product.sizes)}</span>;
                                  }
                                })()}
                              </div>
                              
                              <button 
                                className={`p-2 border border-white/20 backdrop-blur-lg rounded-full transition-colors ${
                                  product.isGiftPackage 
                                    ? "bg-gradient-to-r from-orange-500/40 to-pink-500/40 hover:from-orange-500/60 hover:to-pink-500/60" 
                                    : "bg-white/15 hover:bg-white/25"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openSizeSelector(product)
                                }}
                                aria-label={product.isGiftPackage ? "Customize Package" : "Add to cart"}
                              >
                                {product.isGiftPackage ? (
                                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gift Package Selector Modal */}
      {showGiftPackageSelector && selectedProduct && (
        <GiftPackageSelector
          product={selectedProduct}
          isOpen={showGiftPackageSelector}
          onClose={() => setShowGiftPackageSelector(false)}
          onToggleFavorite={(product) => {
            if (isFavorite(product.id)) {
              removeFromFavorites(product.id)
            } else {
              addToFavorites({
                id: product.id,
                name: product.name,
                price: product.packagePrice || 0,
                image: product.images[0],
                category: product.category,
                rating: product.rating,
                isNew: product.isNew || false,
                isBestseller: product.isBestseller || false,
                sizes: product.giftPackageSizes || [],
                isGiftPackage: product.isGiftPackage,
                packagePrice: product.packagePrice,
                packageOriginalPrice: product.packageOriginalPrice,
                giftPackageSizes: product.giftPackageSizes,
              })
            }
          }}
          isFavorite={isFavorite}
        />
      )}

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true, amount: 0.3 }}
        className="bg-black text-white py-12"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image src="/logo-white.png" alt="Sense Fragrances" width={150} height={100} className="h-16 w-auto" />
              <p className="text-gray-400 text-sm">
                Crafting exceptional fragrances that capture the essence of elegance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-medium mb-4">Collections</h3>
              <div className="space-y-2 text-sm">
                <Link href="/products/equipment" className="block text-gray-400 hover:text-white transition-colors">
                  Equipment
                </Link>
                <Link href="/products/apparel" className="block text-gray-400 hover:text-white transition-colors">
                  Apparel
                </Link>
                <Link href="/products/accessories" className="block text-gray-400 hover:text-white transition-colors">
                  Accessories
                </Link>
                <Link href="/products/outlet" className="block text-gray-400 hover:text-white transition-colors">
                  Outlet Deals
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-medium mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Email: sensefragrances1@gmail.com</p>
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
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400"
          >
            <p>&copy; 2025 Sense Fragrances. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>

      {/* Decorative floating elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="fixed bottom-8 left-8 z-10"
      >
        <Sparkles className="h-6 w-6 text-purple-400" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="fixed top-1/4 right-8 z-10"
      >
        <Sparkles className="h-4 w-4 text-pink-400" />
      </motion.div>
    </div>
  )
}