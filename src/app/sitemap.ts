import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://game-seo-links.netlify.app' // 将在部署后替换为实际域名

  // 基础页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/admin/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
  ]

  // 这里可以动态添加已发布的文章页面
  // 由于使用本地存储，在构建时无法获取动态内容
  // 实际使用时可以通过API或数据库获取文章列表

  return staticPages
}
