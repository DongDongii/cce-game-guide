"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  FileText,
  Link2,
  BarChart3,
  TrendingUp,
  Target,
  Search,
  Lock,
  Eye,
  EyeOff,
  Star,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOArticleEditor } from "@/components/SEOArticleEditor";
import {
  type SEOArticle,
  SEOArticleManager,
  categories,
  getArticleStats,
} from "@/lib/seoSystem";
import { SupabaseSEOManager, supabase } from "@/lib/supabase";
import { TopBanner } from "@/components/TopBanner";
import DebugLogger, { addLog } from "@/components/DebugLogger";

// 测试 Supabase 连接
async function testSupabaseConnection() {
  addLog("开始测试 Supabase 连接...");
  try {
    // 测试最简单的查询
    addLog("测试 Supabase 健康状态...");
    const { data: healthData, error: healthError } = await supabase
      .from("_health")
      .select("*");
    addLog(`健康检查结果: ${healthError ? "失败" : "成功"}`);

    // 测试表是否存在
    addLog("测试 articles 表...");
    const { data, error } = await supabase
      .from("articles")
      .select("id")
      .limit(1);
    addLog(
      `表测试结果: ${error ? "失败" : "成功"} ${
        data ? `(找到 ${data.length} 条记录)` : ""
      }`
    );

    // 测试 RLS 策略
    addLog("测试 RLS 策略...");
    const { data: rlsData, error: rlsError } = await supabase
      .from("articles")
      .select("count");
    addLog(`RLS 测试结果: ${rlsError ? "失败" : "成功"}`);

    // 返回连接状态
    return !healthError && !error;
  } catch (e) {
    addLog(`Supabase 连接测试异常: ${e}`);
    return false;
  }
}

// 在页面加载时执行测试
if (typeof window !== "undefined") {
  testSupabaseConnection().then((isConnected) => {
    addLog(`Supabase 连接状态: ${isConnected ? "已连接" : "连接失败"}`);
  });
}

type ViewMode = "list" | "edit" | "create" | "login";

// Admin password - in production, this should be stored securely
const ADMIN_PASSWORD = "cce2024admin";

// Custom hook to safely handle localStorage
function useLocalStorage(key: string, initialValue: string) {
  const [storedValue, setStoredValue] = useState<string>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        setStoredValue(item || initialValue);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key, initialValue]);

  const setValue = (value: string) => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue, isLoaded] as const;
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Caught error:", event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      setHasError(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("error", handleError);
      window.addEventListener("unhandledrejection", handleUnhandledRejection);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("error", handleError);
        window.removeEventListener(
          "unhandledrejection",
          handleUnhandledRejection
        );
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading this page. Please try refreshing.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminPage() {
  const [authStatus, setAuthStatus, removeAuthStatus, isAuthLoaded] =
    useLocalStorage("admin-authenticated", "false");
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [articles, setArticles] = useState<SEOArticle[]>([]);
  const [drafts, setDrafts] = useState<SEOArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<
    SEOArticle | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [stats, setStats] = useState(getArticleStats());

  // 分类名称映射（英文）
  const categoryNames = {
    "gaming-guides": "Game Guides",
    "game-currency": "Game Currency",
    "game-items": "Game Items",
    "game-accounts": "Game Accounts",
    "game-boosting": "Game Boosting",
    other: "Other",
  };

  // Ensure hydration is complete before showing content
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Check if user is already authenticated after hydration
    if (isAuthLoaded && authStatus === "true") {
      setIsAuthenticated(true);
      setViewMode("list");
    }
  }, [authStatus, isAuthLoaded]);

  useEffect(() => {
    if (isAuthenticated) {
      // 使用异步IIFE来调用异步的loadData函数
      (async () => {
        await loadData();
      })();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setViewMode("list");
      setAuthStatus("true");
    } else {
      alert("Incorrect password!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewMode("login");
    removeAuthStatus();
  };

  const loadData = async () => {
    try {
      addLog("开始加载数据...");

      // 从Supabase加载数据
      addLog("尝试从 Supabase 加载已发布文章...");
      const publishedArticles = await SupabaseSEOManager.getPublishedArticles();
      addLog(`已发布文章加载完成，获取到 ${publishedArticles.length} 篇文章`);

      addLog("尝试从 Supabase 加载草稿...");
      const draftArticles = await SupabaseSEOManager.getDrafts();
      addLog(`草稿加载完成，获取到 ${draftArticles.length} 篇草稿`);

      addLog("尝试从 Supabase 加载文章统计信息...");
      const articleStats = await SupabaseSEOManager.getArticleStats();
      addLog("文章统计信息加载完成");

      setArticles(publishedArticles);
      setDrafts(draftArticles);
      setStats(articleStats);

      // 同时更新本地存储（作为备份）
      if (typeof window !== "undefined") {
        addLog("更新本地存储...");
        localStorage.setItem("seo-articles", JSON.stringify(publishedArticles));
        localStorage.setItem("seo-drafts", JSON.stringify(draftArticles));
        addLog("本地存储更新完成");
      }

      addLog("数据加载完成");
    } catch (error) {
      addLog(`从 Supabase 加载数据时出错: ${error}`);

      // 如果Supabase加载失败，回退到本地存储
      addLog("回退到本地存储...");
      const localArticles = SEOArticleManager.getPublishedArticles();
      const localDrafts = SEOArticleManager.getDrafts();
      const localStats = getArticleStats();

      addLog(
        `从本地存储加载了 ${localArticles.length} 篇文章和 ${localDrafts.length} 篇草稿`
      );

      setArticles(localArticles);
      setDrafts(localDrafts);
      setStats(localStats);
    }
  };

  const filteredArticles = [
    ...(Array.isArray(articles) ? articles : []),
    ...(Array.isArray(drafts) ? drafts : []),
  ].filter((article) => {
    if (!article) return false;

    const matchesSearch =
      !searchQuery ||
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !filterCategory || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveArticle = async (article: SEOArticle) => {
    try {
      if (article.status === "published") {
        // 使用Supabase保存已发布文章
        const savedArticle = await SupabaseSEOManager.saveArticle(article);
        if (savedArticle) {
          // 如果Supabase保存成功，同时更新本地存储
          SEOArticleManager.saveArticle(article);
        } else {
          throw new Error("Supabase保存失败");
        }
      } else {
        // 使用Supabase保存草稿
        const savedDraft = await SupabaseSEOManager.saveArticle(article);
        if (savedDraft) {
          // 如果Supabase保存成功，同时更新本地存储
          SEOArticleManager.saveDraft(article);
        } else {
          throw new Error("Supabase保存草稿失败");
        }
      }
      await loadData();
      setViewMode("list");
      setEditingArticle(undefined);
    } catch (error) {
      console.error("Error saving article:", error);

      // 如果Supabase保存失败，回退到本地存储
      if (article.status === "published") {
        SEOArticleManager.saveArticle(article);
      } else {
        SEOArticleManager.saveDraft(article);
      }
      await loadData();
      setViewMode("list");
      setEditingArticle(undefined);
      alert("Error saving article. Please try again.");
    }
  };

  const handlePublishArticle = async (article: SEOArticle) => {
    try {
      addLog(`开始发布文章: ${article.id} - ${article.title}`);
      const publishedArticle = { ...article, status: "published" as const };
      addLog("准备发布的文章对象已创建");

      const savedArticle = await SupabaseSEOManager.saveArticle(
        publishedArticle
      );
      addLog(`Supabase保存结果: ${savedArticle ? "成功" : "失败"}`);

      if (savedArticle) {
        SEOArticleManager.saveArticle(publishedArticle);
        addLog("文章已保存到本地存储");
        await loadData();
        setViewMode("list");
        setEditingArticle(undefined);
        addLog("发布流程完成");
      } else {
        throw new Error("Supabase发布失败 - 请检查文章数据");
      }
    } catch (error) {
      addLog(`发布文章时出错: ${error}`);
      // 如果Supabase保存失败，回退到本地存储
      const publishedArticle = { ...article, status: "published" as const };
      SEOArticleManager.saveArticle(publishedArticle);
      addLog("已回退到本地存储保存");

      await loadData();
      setViewMode("list");
      setEditingArticle(undefined);
      alert(`发布文章时出错: ${error}`);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this article? This action cannot be undone."
      )
    ) {
      try {
        // 使用Supabase删除文章
        const success = await SupabaseSEOManager.deleteArticle(articleId);

        if (success) {
          // 如果Supabase删除成功，同时从本地存储中删除
          SEOArticleManager.deleteArticle(articleId);
          loadData();
        } else {
          throw new Error("Supabase删除失败");
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        alert("Error deleting article. Please try again.");
      }
    }
  };

  const handlePublishDraft = async (articleId: string) => {
    try {
      // 使用Supabase发布草稿
      const success = await SupabaseSEOManager.publishDraft(articleId);

      if (success) {
        // 如果Supabase发布成功，更新本地数据
        // 同时从本地存储中删除该草稿
        SEOArticleManager.publishDraft(articleId);
        loadData();
      } else {
        throw new Error("Supabase发布失败");
      }
    } catch (error) {
      console.error("Error publishing draft:", error);
      alert("Error publishing draft. Please try again.");
    }
  };

  const handleToggleArticleStatus = async (articleId: string) => {
    try {
      // 使用Supabase切换文章状态
      const success = await SupabaseSEOManager.toggleArticleStatus(articleId);

      if (success) {
        // 如果Supabase操作成功，同时更新本地存储
        SEOArticleManager.toggleArticleStatus(articleId);
        loadData();
      } else {
        throw new Error("Supabase状态切换失败");
      }
    } catch (error) {
      console.error("Error toggling article status:", error);
      alert("Error updating article status. Please try again.");
    }
  };

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Debug Logger */}
      <DebugLogger />

      {/* Login screen */}
      {!isAuthenticated ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
              <p className="text-gray-600">
                Enter password to access admin dashboard
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="text-center w-full"
                autoComplete="current-password"
              />
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Edit/Create modes */}
          {viewMode === "edit" || viewMode === "create" ? (
            <div className="min-h-screen bg-gray-50">
              <TopBanner locale="en" isAdmin={true} />
              <div className="container mx-auto px-4 py-6">
                <SEOArticleEditor
                  article={editingArticle}
                  onSave={handleSaveArticle}
                  onPublish={handlePublishArticle}
                  onCancel={() => {
                    setViewMode("list");
                    setEditingArticle(undefined);
                  }}
                />
              </div>
            </div>
          ) : (
            /* List mode - simplified for now */
            <div className="min-h-screen bg-gray-50">
              <TopBanner locale="en" isAdmin={true} />
              <div className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Admin Dashboard
                    </h1>
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => setViewMode("create")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Article
                      </Button>
                      <Button variant="outline" onClick={handleLogout}>
                        Logout
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Globe className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalPublished}
                          </p>
                          <p className="text-gray-600">Published Articles</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalDrafts}
                          </p>
                          <p className="text-gray-600">Draft Articles</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Link2 className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalAnchorLinks}
                          </p>
                          <p className="text-gray-600">Total Links</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Articles Table */}
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Articles
                    </h2>
                    {filteredArticles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                          No articles found. Create your first article!
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Title
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Updated
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredArticles.map((article) => (
                              <tr key={article.id}>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    <Link
                                      href={`/article/${article.id}`}
                                      target="_blank"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {article.title || "未命名"}
                                    </Link>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {article.id}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      article.status === "published"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {article.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(
                                    article.lastModified
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingArticle(article);
                                        setViewMode("edit");
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleDeleteArticle(article.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </ErrorBoundary>
  );
}
