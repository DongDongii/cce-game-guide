import { Suspense } from "react";
import { SupabaseSEOManager } from "@/lib/supabase";
import ArticleClientContent from "./ArticleClientContent";

// 生成静态路径参数
export async function generateStaticParams() {
  try {
    // 获取所有已发布的文章
    const articles = await SupabaseSEOManager.getPublishedArticles();

    // 为每篇文章生成路径参数
    return articles.map((article) => ({
      id: article.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// 获取文章数据
async function getArticle(id: string) {
  try {
    const article = await SupabaseSEOManager.getArticleById(id);
    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// 定义参数类型
type ParamsType = Promise<{ id: string }>;

// 默认导出的页面组件
export default async function ArticlePage({ params }: { params: ParamsType }) {
  const { id } = await params;
  const article = await getArticle(id);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      }
    >
      <ArticleClientContent article={article} />
    </Suspense>
  );
}
