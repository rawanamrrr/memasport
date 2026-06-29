"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, CheckCircle, Package } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"

// Read the JWT from the persisted auth blob (same pattern as the account page)
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null

  const authData = localStorage.getItem("sense_auth")
  if (!authData) return null

  try {
    const parsedData = JSON.parse(authData)
    return parsedData.token || null
  } catch (error) {
    console.error("Error parsing auth data:", error)
    return null
  }
}

interface OrderItem {
  id?: string
  productId?: string
  productName?: string
  name?: string
  size?: string
  volume?: string
  price?: number
  quantity?: number
  image?: string
}

interface ItemReviewState {
  rating: number
  comment: string
  submitting: boolean
  submitted: boolean
  error: string | null
}

export default function ReviewOrderPage() {
  const { state: authState } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : (params.orderId as string)

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Record<string, ItemReviewState>>({})

  useEffect(() => {
    if (authState.isLoading) return

    if (!authState.isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (authState.user?.role === "admin") {
      router.push("/admin/dashboard")
      return
    }

    const token = getAuthToken()
    if (!token) {
      router.push("/auth/login")
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          router.push("/auth/login")
          return
        }

        if (!response.ok) {
          throw new Error("Failed to load your orders")
        }

        const orders = await response.json()
        const found = (orders || []).find(
          (o: any) => String(o.id) === String(orderId) || String(o.orderNumber) === String(orderId),
        )

        if (!found) {
          setLoadError("We couldn't find this order in your account.")
        } else if (!["shipped", "delivered"].includes(found.status)) {
          setOrder(found)
          setLoadError("This order isn't delivered yet, so it can't be reviewed.")
        } else {
          setOrder(found)
        }
      } catch (error: any) {
        console.error("Error fetching order:", error)
        setLoadError(error.message || "Something went wrong while loading your order.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [authState.isLoading, authState.isAuthenticated, authState.user?.role, orderId, router])

  const getItemKey = (item: OrderItem, index: number) =>
    String(item.productId || item.id || index)

  const defaultReviewState: ItemReviewState = {
    rating: 0,
    comment: "",
    submitting: false,
    submitted: false,
    error: null,
  }

  const updateReview = (key: string, patch: Partial<ItemReviewState>) => {
    setReviews((prev) => ({
      ...prev,
      [key]: {
        ...defaultReviewState,
        ...prev[key],
        ...patch,
      },
    }))
  }

  const submitReview = async (item: OrderItem, key: string) => {
    const current = reviews[key]
    const rating = current?.rating || 0

    if (rating === 0) {
      updateReview(key, { error: "Please select a rating." })
      return
    }

    const token = getAuthToken()
    if (!token) {
      router.push("/auth/login")
      return
    }

    const productId = item.productId || item.id
    if (!productId) {
      updateReview(key, { error: "Product information is incomplete." })
      return
    }

    updateReview(key, { submitting: true, error: null })

    try {
      const response = await fetch("/api/reviews/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: productId,
          orderId,
          rating,
          comment: current?.comment || "",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit review")
      }

      updateReview(key, { submitting: false, submitted: true, error: null })
    } catch (error: any) {
      console.error("Review submission error:", error)
      updateReview(key, {
        submitting: false,
        error: error.message || "An error occurred while submitting your review.",
      })
    }
  }

  if (authState.isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your order...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!authState.isAuthenticated || authState.user?.role === "admin") {
    return null
  }

  const canReview = order && ["shipped", "delivered"].includes(order.status)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/account"
              className="inline-flex items-center text-gray-400 hover:text-orange-500 transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Account
            </Link>
            <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-2">Rate Your Order</h1>
            {order && (
              <p className="text-gray-400">
                Order #{order.id} · Share your thoughts on the products you received.
              </p>
            )}
          </motion.div>

          {loadError && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
              <p className="text-gray-300">{loadError}</p>
              {!order && (
                <Link href="/account">
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                    Go to My Account
                  </Button>
                </Link>
              )}
            </div>
          )}

          {canReview && (
            <div className="space-y-6">
              {(order.items || []).map((item: OrderItem, index: number) => {
                const key = getItemKey(item, index)
                const state = reviews[key] || defaultReviewState
                const displayName = item.productName || item.name || "Product"

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-6"
                  >
                    <div className="flex items-center mb-5">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={displayName}
                        width={64}
                        height={64}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded mr-4 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{displayName}</p>
                        <p className="text-sm text-gray-400">
                          {[item.size, item.volume].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>

                    {state.submitted ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span>Thanks! Your review has been submitted.</span>
                      </div>
                    ) : (
                      <>
                        <div className="mb-5">
                          <p className="mb-2 text-sm font-medium text-gray-300">Your Rating</p>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateReview(key, { rating: star, error: null })}
                                className="p-1 focus:outline-none"
                                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                              >
                                <Star
                                  className={`h-7 w-7 transition-colors ${
                                    star <= state.rating
                                      ? "fill-orange-500 text-orange-500"
                                      : "text-gray-600 hover:text-orange-400"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-5">
                          <p className="mb-2 text-sm font-medium text-gray-300">
                            Your Review (Optional)
                          </p>
                          <textarea
                            value={state.comment}
                            onChange={(e) => updateReview(key, { comment: e.target.value })}
                            placeholder="Share your experience with this product..."
                            className="w-full h-24 p-3 rounded-md bg-black border border-zinc-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
                          />
                        </div>

                        {state.error && (
                          <p className="text-red-500 text-sm mb-4">{state.error}</p>
                        )}

                        <Button
                          onClick={() => submitReview(item, key)}
                          disabled={state.submitting || state.rating === 0}
                          className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                        >
                          {state.submitting
                            ? "Submitting..."
                            : state.rating === 0
                              ? "Select a Rating"
                              : "Submit Review"}
                        </Button>
                      </>
                    )}
                  </motion.div>
                )
              })}

              {(!order.items || order.items.length === 0) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">This order has no items to review.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
