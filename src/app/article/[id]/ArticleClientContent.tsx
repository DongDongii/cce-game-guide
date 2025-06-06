"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Link2,
  TrendingUp,
  Star,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SEOArticle } from "@/lib/seoSystem";
import { TopBanner } from "@/components/TopBanner";
import { SupabaseSEOManager } from "@/lib/supabase";
import { addLog } from "@/components/DebugLogger";

// 简单的Markdown到HTML转换函数
function markdownToHtml(markdown: string): string {
  let html = markdown
    // 处理标题
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>'
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>'
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>'
    )
    // 处理加粗和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // 处理列表
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal">$1. $2</li>')
    // 处理链接
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // 处理段落
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // 处理水平分隔线
    .replace(/^---$/gm, '<hr class="my-8 border-gray-300" />')
    // 处理代码块
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
    );

  // 包装在段落中
  html = '<p class="mb-4">' + html + "</p>";

  // 清理多余的段落标签
  html = html.replace(/<p class="mb-4"><\/p>/g, "");
  html = html.replace(/<p class="mb-4">(<h[1-6])/g, "$1");
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");
  html = html.replace(/<p class="mb-4">(<hr)/g, "$1");
  html = html.replace(/(<\/hr>)<\/p>/g, "$1");

  return html;
}

// 文章内容客户端组件
export default function ArticleClientContent({
  article,
}: {
  article: SEOArticle | null;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (article) {
      // 增加浏览次数
      SupabaseSEOManager.incrementViewCount(article.id);
      addLog(`文章浏览次数已增加，ID: ${article.id}`);
    }
    setLoading(false);
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载文章...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBanner locale="en" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">文章未找到</h1>
          <p className="text-gray-600 mb-8">您要查找的文章不存在或已被删除。</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner locale="en" />
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* 文章标题 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* 文章元信息 */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(article.publishDate).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center">
                <Link2 className="h-4 w-4 mr-2" />
                {article.anchorLinks.length} 个外部链接
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                {article.viewCount || 0} 次浏览
              </div>
            </div>

            {/* 文章内容 */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(article.content),
              }}
            />

            {/* 标签 */}
            {article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 推荐外链区域 */}
          {article.anchorLinks.length > 0 && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                推荐资源
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {article.anchorLinks.slice(0, 4).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.target || "_blank"}
                    rel={link.rel || "noopener noreferrer"}
                    className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <Link2 className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">
                        {link.text}
                      </span>
                    </div>
                    {link.keywords && link.keywords.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        关键词: {link.keywords.join(", ")}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
