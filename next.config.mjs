/** @type {import('next').NextConfig} */

// ════════════════════════════════════════════════════════════════════════
//  Headers de sécurité HTTP — appliqués à toutes les routes
//  Sources : OWASP, Mozilla Observatory, securityheaders.com
// ════════════════════════════════════════════════════════════════════════

const securityHeaders = [
  // Force HTTPS pendant 2 ans (HSTS preload-ready)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Empêche le sniffing du content-type
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Empêche d'être intégré dans une iframe (clickjacking)
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Limite les permissions browser que la page peut demander
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Limite ce qui fuite vers les liens externes
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Cross-Origin headers (isolation moderne)
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Content-Security-Policy — permissif pour Stripe et Supabase
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.anthropic.com https://r.stripe.com wss://*.supabase.co",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  // Désactive le header X-Powered-By (fingerprinting)
  poweredByHeader: false,
  // Compresse les réponses
  compress: true,
  // Strict mode React
  reactStrictMode: true,
}

export default nextConfig
