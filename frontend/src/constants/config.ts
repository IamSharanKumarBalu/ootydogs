// Application configuration

export const config = {
  // App info
  appName: "OotyDogs",
  appTagline: "Find Your Perfect Pet Companion",
  appDescription: "India's trusted platform to discover pets, connect with breeders, and find pet services — all in one place.",

  // Contact — placeholders, swap per deployment
  contact: {
    email: "hello@ootydogs.com",
    phone: "+91 98765 43210",
    instagram: "https://instagram.com/ootydogs",
  },

  // API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    timeout: 30000,
  },

  // Auth
  auth: {
    sessionCookieName: "better-auth.session_token",
    redirectAfterLogin: "/",
    redirectAfterLogout: "/",
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Features
  features: {
    enableWishlist: true,
    enableReviews: false,
    enableCoupon: false,
    enableNotifications: false,
  },

  // Cache
  cache: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  },
};

export type Config = typeof config;

