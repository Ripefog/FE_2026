// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
    },
    SEARCH: {
      SIMPLE: '/search',
      TEMPORAL: 'search/temporal'
    },
  },
//   TIMEOUT: 60000, // 60 seconds 
//   RETRY_ATTEMPTS: 3,
} as const;

// Request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

