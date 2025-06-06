"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, TrendingUp, Clock, Link2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type SEOArticle,
  SEOArticleManager,
  categories,
} from "@/lib/seoSystem";
import {
  WebsiteStructuredData,
  OrganizationStructuredData,
} from "@/components/StructuredData";
import { TopBanner } from "@/components/TopBanner";

export default function HomePage() {
  const [articles, setArticles] = useState<SEOArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setArticles(SEOArticleManager.getActiveArticles());
  }, []);

  // 使用新的搜索功能
  const filteredArticles = SEOArticleManager.searchArticles(
    searchQuery,
    selectedCategory
  );

  // 文章已经在getActiveArticles中排序过了，这里直接使用
  const sortedArticles = filteredArticles;

  // 分类名称映射（英文）
  const categoryNames = {
    "gaming-guides": "Game Guides",
    "game-currency": "Game Currency",
    "game-items": "Game Items",
    "game-accounts": "Game Accounts",
    "game-boosting": "Game Boosting",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部蓝色横条 */}
      <TopBanner locale="en" />

      {/* 顶部导航栏 */}
      <nav className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">CCE Game Guide</h1>
                <p className="text-blue-100 text-sm">
                  Professional Gaming Guides & Resource Recommendations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Admin link hidden from public view */}
            </div>
          </div>
        </div>
      </nav>

      {/* 搜索和筛选 */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">
                Latest Game Guides
              </h2>
              <span className="text-sm text-gray-500">
                {filteredArticles.length} articles total
              </span>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search game guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(categories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {categoryNames[key as keyof typeof categoryNames]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 文章网格 */}
      <main className="container mx-auto px-4 py-8">
        {sortedArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* 分类标签 */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          categories[
                            article.category as keyof typeof categories
                          ]?.color,
                      }}
                    >
                      {
                        categoryNames[
                          article.category as keyof typeof categoryNames
                        ]
                      }
                    </span>
                    {article.priority >= 8 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        Recommended
                      </span>
                    )}
                  </div>

                  {/* 文章标题 */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      href={`/article/${article.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  {/* 文章描述 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.seoMetadata.description}
                  </p>

                  {/* 标签 */}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 文章元信息 */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(article.publishDate).toLocaleDateString(
                        "en-US"
                      )}
                    </div>
                    <div className="flex items-center">
                      <Link2 className="h-4 w-4 mr-1" />
                      {article.anchorLinks.length} links
                    </div>
                  </div>

                  {/* 阅读按钮 */}
                  <div className="mt-4">
                    <Link
                      href={`/article/${article.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      阅读更多 →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory
                ? "No articles found"
                : "No articles published yet"}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory
                ? "Try adjusting your search criteria or select another category"
                : "More game guides coming soon!"}
            </p>
          </div>
        )}
      </main>

      {/* 分类导航 */}
      <section className="bg-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Browse Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(categories).map(([key, category]) => {
              const count = articles.filter((a) => a.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === key ? "" : key)
                  }
                  className={`p-4 rounded-lg border transition-colors text-center ${
                    selectedCategory === key
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="font-medium text-gray-900">
                    {categoryNames[key as keyof typeof categoryNames]}
                  </div>
                  <div className="text-sm text-gray-500">{count} articles</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 底部信息 */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">
              Professional Gaming Guide Website
            </h3>
            <p className="text-gray-400 text-sm">
              Providing the latest and most comprehensive game guides, strategy
              tips and resource recommendations
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <span className="text-gray-400">CCE Game Guide</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 结构化数据 */}
      <WebsiteStructuredData />
      <OrganizationStructuredData />
    </div>
  );
}
