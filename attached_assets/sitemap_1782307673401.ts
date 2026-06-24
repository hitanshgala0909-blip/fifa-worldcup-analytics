import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wc2026.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url:              `${BASE_URL}/`,
      lastModified:     now,
      changeFrequency:  'daily',
      priority:         1.0,
    },
    {
      url:              `${BASE_URL}/teams`,
      lastModified:     now,
      changeFrequency:  'daily',
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/predictor`,
      lastModified:     now,
      changeFrequency:  'weekly',
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/simulator`,
      lastModified:     now,
      changeFrequency:  'daily',
      priority:         0.85,
    },
    {
      url:              `${BASE_URL}/players`,
      lastModified:     now,
      changeFrequency:  'daily',
      priority:         0.85,
    },
    {
      url:              `${BASE_URL}/fantasy`,
      lastModified:     now,
      changeFrequency:  'daily',
      priority:         0.8,
    },
  ]
}
