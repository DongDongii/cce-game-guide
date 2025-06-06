"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Globe,
  Link2,
  Eye,
  FileText,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type SEOArticle,
  type AnchorLink,
  SEOArticleManager,
  categories,
  linkTargets,
  generateQualityAnchorLinks,
  seoTemplates,
} from "@/lib/seoSystem";
import { SupabaseSEOManager } from "@/lib/supabase";

interface SEOArticleEditorProps {
  article?: SEOArticle;
  onSave: (article: SEOArticle) => void;
  onPublish: (article: SEOArticle) => void;
  onCancel: () => void;
}

export function SEOArticleEditor({
  article,
  onSave,
  onPublish,
  onCancel,
}: SEOArticleEditorProps) {
  const [formData, setFormData] = useState<SEOArticle>(
    () => article || SEOArticleManager.createDefaultArticle()
  );
  const [activeTab, setActiveTab] = useState<
    "content" | "seo" | "links" | "simple"
  >("content");
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [writingMode, setWritingMode] = useState<"advanced" | "simple">(
    "advanced"
  );

  // 自动生成slug和提取关键词
  useEffect(() => {
    if (formData.title) {
      const updates: Partial<SEOArticle> = {};

      // 自动生成slug（仅在新建文章时）
      if (!article) {
        updates.slug = SEOArticleManager.generateSlug(formData.title);
      }

      // 提取关键词
      if (formData.title || formData.content) {
        updates.extractedKeywords = SEOArticleManager.extractKeywords(
          formData.title,
          formData.content
        );
      }

      // 自动更新SEO标题
      updates.seoMetadata = {
        ...formData.seoMetadata,
        title:
          formData.title.length > 60
            ? `${formData.title.substring(0, 57)}...`
            : formData.title,
      };

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
      }
    }
  }, [formData.title, formData.content, formData.seoMetadata, article]);

  const updateFormData = (updates: Partial<SEOArticle>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateSEOData = (updates: Partial<SEOArticle["seoMetadata"]>) => {
    setFormData((prev) => ({
      ...prev,
      seoMetadata: { ...prev.seoMetadata, ...updates },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addAnchorLink = (link: AnchorLink) => {
    updateFormData({
      anchorLinks: [...formData.anchorLinks, link],
    });
  };

  const removeAnchorLink = (linkId: string) => {
    updateFormData({
      anchorLinks: formData.anchorLinks.filter((link) => link.id !== linkId),
    });
  };

  const generateQuickLinks = (
    targetSite: keyof typeof linkTargets,
    keyword: string
  ) => {
    const links = generateQualityAnchorLinks(targetSite, keyword);
    updateFormData({
      anchorLinks: [...formData.anchorLinks, ...links],
    });
  };

  const loadTemplate = (templateKey: keyof typeof seoTemplates) => {
    const template = seoTemplates[templateKey];
    updateFormData({ content: template });
  };

  const handleSave = async () => {
    try {
      // 使用Supabase保存文章
      const savedArticle = await SupabaseSEOManager.saveArticle(formData);
      if (savedArticle) {
        onSave(savedArticle);
      } else {
        // 如果Supabase保存失败，回退到本地存储
        SEOArticleManager.saveDraft(formData);
        onSave(formData);
      }
    } catch (error) {
      console.error("保存文章失败:", error);
      // 出错时回退到本地存储
      SEOArticleManager.saveDraft(formData);
      onSave(formData);
    }
  };

  const handlePublish = async () => {
    try {
      const publishedArticle = {
        ...formData,
        status: "published" as const,
        publishDate: new Date().toISOString(),
      };

      // 使用Supabase保存并发布文章
      const savedArticle = await SupabaseSEOManager.saveArticle(
        publishedArticle
      );
      if (savedArticle) {
        onPublish(savedArticle);
      } else {
        // 如果Supabase保存失败，回退到本地存储
        SEOArticleManager.saveArticle(publishedArticle);
        onPublish(publishedArticle);
      }
    } catch (error) {
      console.error("发布文章失败:", error);
      // 出错时回退到本地存储
      const publishedArticle = {
        ...formData,
        status: "published" as const,
        publishDate: new Date().toISOString(),
      };
      SEOArticleManager.saveArticle(publishedArticle);
      onPublish(publishedArticle);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {article ? "编辑SEO文章" : "创建SEO文章"}
          </h2>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">
              锚链接: {formData.anchorLinks.length}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "编辑" : "预览"}
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存草稿
          </Button>
          <Button
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700"
          >
            <Globe className="h-4 w-4 mr-2" />
            发布文章
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex flex-wrap space-x-1 mb-6">
        {[
          { id: "simple", name: "简单写作", icon: FileText },
          { id: "content", name: "高级编辑", icon: TrendingUp },
          { id: "seo", name: "SEO优化", icon: Target },
          { id: "links", name: "锚链接管理", icon: Link2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as "content" | "seo" | "links" | "simple")
            }
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 简单写作模式 */}
      {activeTab === "simple" && (
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章标题 *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="输入吸引人的标题..."
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(categories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 文章描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章描述
            </label>
            <textarea
              value={formData.seoMetadata.description}
              onChange={(e) => updateSEOData({ description: e.target.value })}
              placeholder="简短描述文章内容，用于SEO和社交分享..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* 文章内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateFormData({ content: e.target.value })}
              placeholder="开始写作...

支持Markdown格式：
- **加粗文本**
- *斜体文本*
- [链接文本](URL)
- # 大标题
- ## 中标题
- ### 小标题
- - 列表项"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono"
              rows={20}
            />
          </div>

          {/* 快速设置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="simpleRecommended"
                checked={formData.isRecommended}
                onChange={(e) =>
                  updateFormData({ isRecommended: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="simpleRecommended"
                className="text-sm font-medium text-gray-700"
              >
                推荐文章
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="simpleActive"
                checked={formData.isActive}
                onChange={(e) => updateFormData({ isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="simpleActive"
                className="text-sm font-medium text-gray-700"
              >
                立即上架
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                重要程度 (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) =>
                  updateFormData({ priority: Number.parseInt(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                当前: {formData.priority}
              </span>
            </div>
          </div>

          {/* 自动提取的关键词 */}
          {formData.extractedKeywords.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🤖 AI自动提取的关键词
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.extractedKeywords.slice(0, 8).map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 内容编辑标签页 */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章标题 *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="输入SEO优化的标题..."
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => updateFormData({ slug: e.target.value })}
                placeholder="url-friendly-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(categories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级 (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) =>
                  updateFormData({
                    priority: Number.parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>
          </div>

          {/* 推荐和状态设置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecommended"
                checked={formData.isRecommended}
                onChange={(e) =>
                  updateFormData({ isRecommended: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="isRecommended"
                className="text-sm font-medium text-gray-700"
              >
                推荐文章
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => updateFormData({ isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                前台显示
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  updateFormData({
                    status: e.target.value as
                      | "draft"
                      | "published"
                      | "archived",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>

          {/* 标签管理 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章标签
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签..."
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag}>添加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 自动提取的关键词 */}
          {formData.extractedKeywords.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自动提取的关键词
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.extractedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 内容模板 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              使用内容模板
            </label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplate("game-currency-guide")}
              >
                游戏货币指南
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplate("game-guide")}
              >
                游戏攻略模板
              </Button>
            </div>
          </div>

          {/* 内容编辑器 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章内容 (支持Markdown)
            </label>
            {showPreview ? (
              <div className="border rounded-lg p-4 min-h-[500px] bg-gray-50">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {formData.content}
                  </pre>
                </div>
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => updateFormData({ content: e.target.value })}
                placeholder="在这里输入文章内容，使用{variable}来标记需要替换的变量..."
                className="w-full h-[500px] p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        </div>
      )}

      {/* SEO优化标签页 */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO标题 (50-60字符)
              </label>
              <Input
                value={formData.seoMetadata.title}
                onChange={(e) => updateSEOData({ title: e.target.value })}
                placeholder="SEO优化的标题..."
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.seoMetadata.title.length}/60
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG标题 (社交媒体)
              </label>
              <Input
                value={formData.seoMetadata.ogTitle || ""}
                onChange={(e) => updateSEOData({ ogTitle: e.target.value })}
                placeholder="社交媒体分享标题..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta描述 (150-160字符)
            </label>
            <textarea
              value={formData.seoMetadata.description}
              onChange={(e) => updateSEOData({ description: e.target.value })}
              placeholder="吸引人的文章描述，包含主要关键词..."
              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.seoMetadata.description.length}/160
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关键词 (用逗号分隔)
            </label>
            <Input
              value={formData.seoMetadata.keywords.join(", ")}
              onChange={(e) =>
                updateSEOData({
                  keywords: e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter((k) => k),
                })
              }
              placeholder="主要关键词, 长尾关键词, 相关词汇..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG图片URL
              </label>
              <Input
                value={formData.seoMetadata.ogImage || ""}
                onChange={(e) => updateSEOData({ ogImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                规范链接
              </label>
              <Input
                value={formData.seoMetadata.canonical || ""}
                onChange={(e) => updateSEOData({ canonical: e.target.value })}
                placeholder="https://example.com/canonical-url"
              />
            </div>
          </div>
        </div>
      )}

      {/* 锚链接管理标签页 */}
      {activeTab === "links" && (
        <div className="space-y-6">
          {/* 快速生成链接 */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              快速生成高质量外链
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(linkTargets).map(([key, target]) => (
                <div key={key} className="space-y-2">
                  <h4 className="font-medium text-gray-800">{target.name}</h4>
                  <p className="text-sm text-gray-600">{target.description}</p>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="关键词"
                      id={`keyword-${key}`}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(
                          `keyword-${key}`
                        ) as HTMLInputElement;
                        if (input?.value) {
                          generateQuickLinks(
                            key as keyof typeof linkTargets,
                            input.value
                          );
                          input.value = "";
                        }
                      }}
                    >
                      生成链接
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 手动添加链接 */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              手动添加锚链接
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="链接文本" id="manual-text" />
              <Input placeholder="目标URL" id="manual-url" />
              <select
                id="manual-rel"
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="nofollow">nofollow</option>
                <option value="sponsored">sponsored</option>
                <option value="ugc">ugc</option>
                <option value="">无rel属性</option>
              </select>
              <Button
                onClick={() => {
                  const textInput = document.getElementById(
                    "manual-text"
                  ) as HTMLInputElement;
                  const urlInput = document.getElementById(
                    "manual-url"
                  ) as HTMLInputElement;
                  const relSelect = document.getElementById(
                    "manual-rel"
                  ) as HTMLSelectElement;

                  if (textInput?.value && urlInput?.value) {
                    addAnchorLink({
                      id: `manual-${Date.now()}`,
                      text: textInput.value,
                      url: urlInput.value,
                      target: "_blank",
                      rel: relSelect.value as
                        | "nofollow"
                        | "sponsored"
                        | "ugc"
                        | "",
                      keywords: [textInput.value],
                    });
                    textInput.value = "";
                    urlInput.value = "";
                  }
                }}
              >
                添加链接
              </Button>
            </div>
          </div>

          {/* 链接列表 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              当前锚链接 ({formData.anchorLinks.length})
            </h3>
            <div className="space-y-3">
              {formData.anchorLinks.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-blue-600">
                          {link.text}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {link.rel || "无rel"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{link.url}</p>
                      {link.keywords && link.keywords.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          关键词: {link.keywords.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnchorLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}

              {formData.anchorLinks.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  还没有添加任何锚链接
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
