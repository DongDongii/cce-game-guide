import { createClient } from "@supabase/supabase-js";
import type { SEOArticle } from "./seoSystem";
import { addLog } from "@/components/DebugLogger";
import crypto from "crypto";

// 使用环境变量或直接配置（生产环境中应使用环境变量）
// 注意：请替换为您的Supabase项目URL和匿名密钥
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 仅在客户端环境中使用 addLog
if (typeof window !== "undefined") {
  addLog(
    `Supabase 初始化配置: URL=${supabaseUrl ? "已设置" : "未设置"}, KEY=${
      supabaseKey ? "已设置" : "未设置"
    }`
  );
}

// 检查配置是否有效
if (
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl === "https://your-project-id.supabase.co" ||
  supabaseKey === "your-anon-key"
) {
  // 仅在客户端环境中使用 addLog
  if (typeof window !== "undefined") {
    addLog(
      "错误: Supabase配置无效。请在.env.local文件中设置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY环境变量。"
    );
  }
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl || "", supabaseKey || "", {
  auth: {
    persistSession: false, // 禁用会话持久化，避免认证问题
  },
});

// 仅在客户端环境中使用 addLog
if (typeof window !== "undefined") {
  addLog("Supabase 客户端已初始化");
}

// 测试 Supabase 连接是否正常
if (typeof window !== "undefined") {
  (async () => {
    try {
      addLog("测试 Supabase 连接...");
      const { data, error } = await supabase
        .from("articles")
        .select("id")
        .limit(1);
      addLog(
        `Supabase 连接测试结果: ${!error ? "成功" : "失败"} ${
          error ? JSON.stringify(error) : ""
        }`
      );
    } catch (e) {
      addLog(`Supabase 连接测试失败: ${e}`);
    }
  })();
}

// SEO文章相关的Supabase操作
export class SupabaseSEOManager {
  private static TABLE_NAME = "articles";

  // 获取所有已发布文章
  static async getPublishedArticles(): Promise<SEOArticle[]> {
    if (typeof window !== "undefined") {
      addLog(`开始获取已发布文章 - 时间戳: ${new Date().toISOString()}`);
      addLog(
        `Supabase 配置: URL=${
          process.env.NEXT_PUBLIC_SUPABASE_URL ? "已设置" : "未设置"
        }, KEY=${
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "已设置" : "未设置"
        }, 表名=${SupabaseSEOManager.TABLE_NAME}`
      );
    }

    try {
      if (typeof window !== "undefined") {
        addLog("准备发送 Supabase 请求...");
      }
      const { data, error } = await supabase
        .from(SupabaseSEOManager.TABLE_NAME)
        .select("*")
        .eq("status", "published")
        .order("priority", { ascending: false })
        .order("publishdate", { ascending: false });

      if (typeof window !== "undefined") {
        addLog("Supabase 请求已完成");
        addLog(
          `Supabase 响应数据: ${
            data ? `获取到 ${data.length} 条记录` : "无数据"
          }`
        );
      }

      if (error) {
        if (typeof window !== "undefined") {
          addLog(`Supabase 响应错误: ${JSON.stringify(error)}`);
          addLog(`获取已发布文章失败: ${JSON.stringify(error)}`);
        }
        return [];
      }

      // 确保返回的数据是数组，并将数据库字段映射到应用程序模型
      return Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            // 确保字段名称符合应用程序的驼峰命名约定
            publishDate: item.publishdate,
            lastModified: item.lastmodified,
            seoMetadata: item.seometadata || item.seoMetadata || {},
            anchorLinks: item.anchorlinks || item.anchorLinks || [],
            isRecommended: item.isrecommended ?? item.isRecommended ?? false,
            extractedKeywords:
              item.extractedkeywords || item.extractedKeywords || [],
            isActive: item.isactive ?? item.isActive ?? true,
            viewCount: item.viewcount ?? item.viewCount ?? 0,
          }))
        : [];
    } catch (e) {
      if (typeof window !== "undefined") {
        addLog(`获取已发布文章时发生异常: ${e}`);
      }
      return [];
    }
  }

  // 获取草稿
  static async getDrafts(): Promise<SEOArticle[]> {
    try {
      if (typeof window !== "undefined") {
        addLog("开始获取草稿...");
      }
      const { data, error } = await supabase
        .from(SupabaseSEOManager.TABLE_NAME)
        .select("*")
        .eq("status", "draft")
        .order("lastmodified", { ascending: false });

      if (typeof window !== "undefined") {
        addLog(
          `草稿获取结果: 成功=${!error}, 记录数=${data ? data.length : 0}`
        );
      }

      if (error) {
        if (typeof window !== "undefined") {
          addLog(`获取草稿失败: ${JSON.stringify(error)}`);
        }
        return [];
      }

      // 确保返回的数据是数组
      return Array.isArray(data) ? (data as SEOArticle[]) : [];
    } catch (e) {
      if (typeof window !== "undefined") {
        addLog(`获取草稿时发生异常: ${e}`);
      }
      return [];
    }
  }

  // 保存文章（新增或更新）
  static async saveArticle(article: SEOArticle): Promise<SEOArticle | null> {
    try {
      // 如果是新文章，生成唯一ID
      if (!article.id) {
        article.id = crypto.randomUUID();
        if (typeof window !== "undefined") {
          addLog(`为新文章生成ID: ${article.id}`);
        }
      }

      // 更新最后修改时间
      article.lastModified = new Date().toISOString();

      // 将对象键名转换为小写以匹配数据库列名
      const dbArticle = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        anchorlinks: article.anchorLinks,
        seometadata: article.seoMetadata,
        publishdate: article.publishDate,
        lastmodified: article.lastModified,
        status: article.status,
        priority: article.priority,
        category: article.category,
        tags: article.tags,
        isrecommended: article.isRecommended,
        extractedkeywords: article.extractedKeywords,
        isactive: article.isActive,
        viewcount: article.viewCount,
      };

      const { data, error } = await supabase
        .from(SupabaseSEOManager.TABLE_NAME)
        .upsert(dbArticle, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        if (typeof window !== "undefined") {
          addLog(`保存文章失败: ${JSON.stringify(error)}`);
        }
        return null;
      }

      // 将数据库返回的数据转换回应用程序模型
      return {
        ...data,
        publishDate: data.publishdate,
        lastModified: data.lastmodified,
        seoMetadata: data.seometadata || {},
        anchorLinks: data.anchorlinks || [],
        isRecommended: data.isrecommended ?? false,
        extractedKeywords: data.extractedkeywords || [],
        isActive: data.isactive ?? true,
        viewCount: data.viewcount ?? 0,
      } as SEOArticle;
    } catch (e) {
      if (typeof window !== "undefined") {
        addLog(`保存文章时发生异常: ${e}`);
      }
      return null;
    }
  }

  // 发布草稿
  static async publishDraft(articleId: string): Promise<boolean> {
    const { error } = await supabase
      .from(SupabaseSEOManager.TABLE_NAME)
      .update({
        status: "published",
        publishdate: new Date().toISOString(),
        lastmodified: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (error) {
      if (typeof window !== "undefined") {
        addLog(`发布草稿失败: ${JSON.stringify(error)}`);
      }
      return false;
    }

    return true;
  }

  // 删除文章
  static async deleteArticle(articleId: string): Promise<boolean> {
    const { error } = await supabase
      .from(SupabaseSEOManager.TABLE_NAME)
      .delete()
      .eq("id", articleId);

    if (error) {
      if (typeof window !== "undefined") {
        addLog(`删除文章失败: ${JSON.stringify(error)}`);
      }
      return false;
    }

    return true;
  }

  // 切换文章状态（上架/下架）
  static async toggleArticleStatus(articleId: string): Promise<boolean> {
    // 先获取当前状态
    const { data: article, error: fetchError } = await supabase
      .from(SupabaseSEOManager.TABLE_NAME)
      .select("isactive")
      .eq("id", articleId)
      .single();

    if (fetchError) {
      if (typeof window !== "undefined") {
        addLog(`获取文章状态失败: ${JSON.stringify(fetchError)}`);
      }
      return false;
    }

    // 更新为相反状态
    const { error: updateError } = await supabase
      .from(SupabaseSEOManager.TABLE_NAME)
      .update({
        isactive: !article.isactive,
        lastmodified: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (updateError) {
      if (typeof window !== "undefined") {
        addLog(`更新文章状态失败: ${JSON.stringify(updateError)}`);
      }
      return false;
    }

    return true;
  }

  // 根据slug获取文章
  static async getArticleBySlug(slug: string): Promise<SEOArticle | null> {
    const { data, error } = await supabase
      .from(SupabaseSEOManager.TABLE_NAME)
      .select("*")
      .eq("slug", slug)
      .eq("isactive", true)
      .single();

    if (error) {
      if (typeof window !== "undefined") {
        addLog(`根据slug获取文章失败: ${JSON.stringify(error)}`);
      }
      return null;
    }

    return data as SEOArticle;
  }

  // 根据ID获取文章
  static async getArticleById(id: string): Promise<SEOArticle | null> {
    try {
      if (typeof window !== "undefined") {
        addLog(`开始通过ID获取文章: ${id}`);
      }
      const { data, error } = await supabase
        .from(SupabaseSEOManager.TABLE_NAME)
        .select("*")
        .eq("id", id)
        .eq("isactive", true)
        .single();

      if (error) {
        if (typeof window !== "undefined") {
          addLog(`根据ID获取文章失败: ${JSON.stringify(error)}`);
        }
        return null;
      }

      if (!data) {
        if (typeof window !== "undefined") {
          addLog(`未找到ID为 ${id} 的文章`);
        }
        return null;
      }

      // 转换数据格式
      return {
        ...data,
        publishDate: data.publishdate,
        lastModified: data.lastmodified,
        seoMetadata: data.seometadata || {},
        anchorLinks: data.anchorlinks || [],
        isRecommended: data.isrecommended ?? false,
        extractedKeywords: data.extractedkeywords || [],
        isActive: data.isactive ?? true,
        viewCount: data.viewcount ?? 0,
      } as SEOArticle;
    } catch (e) {
      if (typeof window !== "undefined") {
        addLog(`获取文章时发生异常: ${e}`);
      }
      return null;
    }
  }

  // 增加文章浏览次数
  static async incrementViewCount(articleId: string): Promise<boolean> {
    const { error } = await supabase.rpc("increment_view_count", {
      article_id: articleId,
    });

    if (error) {
      if (typeof window !== "undefined") {
        addLog(`增加浏览次数失败: ${JSON.stringify(error)}`);
      }
      return false;
    }

    return true;
  }

  // 搜索文章
  static async searchArticles(
    query: string,
    category?: string
  ): Promise<SEOArticle[]> {
    let queryBuilder = supabase
      .from(SupabaseSEOManager.TABLE_NAME)
      .select("*")
      .eq("isactive", true)
      .eq("status", "published");

    // 添加搜索条件
    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,content.ilike.%${query}%,seometadata->>description.ilike.%${query}%`
      );
    }

    // 添加分类筛选
    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    // 排序
    queryBuilder = queryBuilder
      .order("isrecommended", { ascending: false })
      .order("priority", { ascending: false })
      .order("publishdate", { ascending: false });

    const { data, error } = await queryBuilder;

    if (error) {
      if (typeof window !== "undefined") {
        addLog(`搜索文章失败: ${JSON.stringify(error)}`);
      }
      return [];
    }

    return data as SEOArticle[];
  }

  // 获取文章统计信息
  static async getArticleStats() {
    try {
      const { data: published = [], error: publishedError } = await supabase
        .from(SupabaseSEOManager.TABLE_NAME)
        .select("id, category, anchorlinks")
        .eq("status", "published");

      const { data: drafts = [], error: draftsError } = await supabase
        .from(SupabaseSEOManager.TABLE_NAME)
        .select("id")
        .eq("status", "draft");

      if (publishedError || draftsError) {
        if (typeof window !== "undefined") {
          addLog(
            `获取统计信息失败: ${JSON.stringify(publishedError || draftsError)}`
          );
        }
        return {
          totalPublished: 0,
          totalDrafts: 0,
          totalAnchorLinks: 0,
          categoryCounts: {},
        };
      }

      // 确保数据是数组
      const publishedArray = Array.isArray(published) ? published : [];
      const draftsArray = Array.isArray(drafts) ? drafts : [];

      // 计算锚链接总数
      const totalAnchorLinks = publishedArray.reduce((sum, article) => {
        return sum + (article.anchorlinks?.length || 0);
      }, 0);

      // 按分类统计文章数
      const categoryCounts = publishedArray.reduce(
        (acc: Record<string, number>, article) => {
          if (article && article.category) {
            acc[article.category] = (acc[article.category] || 0) + 1;
          }
          return acc;
        },
        {}
      );

      return {
        totalPublished: publishedArray.length,
        totalDrafts: draftsArray.length,
        totalAnchorLinks,
        categoryCounts,
      };
    } catch (e) {
      if (typeof window !== "undefined") {
        addLog(`获取文章统计信息时发生异常: ${e}`);
      }
      return {
        totalPublished: 0,
        totalDrafts: 0,
        totalAnchorLinks: 0,
        categoryCounts: {},
      };
    }
  }
}

// 在页面加载时添加
async function testSupabaseConnection() {
  try {
    // 修正语法：使用 count 作为列名
    const { data, error } = await supabase.from("articles").select("count"); // 正确的语法

    if (typeof window !== "undefined") {
      addLog(
        `Supabase 连接测试: 数据=${JSON.stringify(data)}, 错误=${
          error ? JSON.stringify(error) : "无"
        }`
      );
    }
    return !error;
  } catch (e) {
    if (typeof window !== "undefined") {
      addLog(`Supabase 连接测试失败: ${e}`);
    }
    return false;
  }
}

if (typeof window !== "undefined") {
  testSupabaseConnection().then((isConnected) => {
    addLog(`Supabase 是否连接成功: ${isConnected}`);
  });
}
