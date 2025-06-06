export interface AnchorLink {
  id: string;
  text: string;
  url: string;
  target?: "_blank" | "_self";
  rel?: "nofollow" | "sponsored" | "ugc" | "";
  title?: string;
  keywords?: string[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface SEOArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  anchorLinks: AnchorLink[];
  seoMetadata: SEOMetadata;
  publishDate: string;
  lastModified: string;
  status: "draft" | "published" | "archived";
  priority: number; // 1-10 用于排序
  category: string;
  tags: string[];
  isRecommended: boolean; // 是否推荐
  extractedKeywords: string[]; // 自动提取的关键词
  isActive: boolean; // 是否上架（显示在前台）
  viewCount: number; // 浏览次数
}

// 游戏分类配置
export const categories = {
  "gaming-guides": { name: "游戏攻略", color: "#3B82F6" },
  "game-currency": { name: "游戏货币", color: "#EF4444" },
  "game-items": { name: "游戏道具", color: "#10B981" },
  "game-accounts": { name: "游戏账号", color: "#F59E0B" },
  "game-boosting": { name: "游戏代练", color: "#8B5CF6" },
  other: { name: "其他", color: "#6B7280" },
};

// 高质量的外链目标网站配置
export const linkTargets = {
  gmygm: {
    name: "GMYGM",
    baseUrl: "https://www.gmygm.com",
    description: "专业游戏货币交易平台",
    rel: "sponsored" as const,
    keywords: ["游戏货币", "GMYGM", "游戏金币"],
  },
  "gmygm-items": {
    name: "GMYGM Items",
    baseUrl: "https://www.gmygm.com/items",
    description: "全球游戏道具服务提供商",
    rel: "sponsored" as const,
    keywords: ["游戏道具", "GMYGM", "游戏装备"],
  },
  "gmygm-accounts": {
    name: "GMYGM Accounts",
    baseUrl: "https://www.gmygm.com/accounts",
    description: "游戏账号交易平台",
    rel: "sponsored" as const,
    keywords: ["游戏账号", "GMYGM", "账号交易"],
  },
};

// 本地存储管理
export class SEOArticleManager {
  private static STORAGE_KEY = "seo-articles";
  private static DRAFTS_KEY = "seo-drafts";

  static getPublishedArticles(): SEOArticle[] {
    if (typeof window === "undefined") return [];

    try {
      const articles = localStorage.getItem(SEOArticleManager.STORAGE_KEY);
      return articles ? JSON.parse(articles) : [];
    } catch {
      return [];
    }
  }

  static getDrafts(): SEOArticle[] {
    if (typeof window === "undefined") return [];

    try {
      const drafts = localStorage.getItem(SEOArticleManager.DRAFTS_KEY);
      return drafts ? JSON.parse(drafts) : [];
    } catch {
      return [];
    }
  }

  static saveArticle(article: SEOArticle): void {
    if (typeof window === "undefined") return;

    const articles = SEOArticleManager.getPublishedArticles();
    const existingIndex = articles.findIndex((a) => a.id === article.id);

    article.lastModified = new Date().toISOString();

    if (existingIndex >= 0) {
      articles[existingIndex] = article;
    } else {
      articles.push(article);
    }

    // 按优先级和发布日期排序
    articles.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return (
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
    });

    localStorage.setItem(
      SEOArticleManager.STORAGE_KEY,
      JSON.stringify(articles)
    );
  }

  static saveDraft(article: SEOArticle): void {
    if (typeof window === "undefined") return;

    const drafts = SEOArticleManager.getDrafts();
    const existingIndex = drafts.findIndex((a) => a.id === article.id);

    article.lastModified = new Date().toISOString();

    if (existingIndex >= 0) {
      drafts[existingIndex] = article;
    } else {
      drafts.push(article);
    }

    localStorage.setItem(SEOArticleManager.DRAFTS_KEY, JSON.stringify(drafts));
  }

  static deleteArticle(articleId: string): void {
    if (typeof window === "undefined") return;

    // 从已发布文章中删除
    const articles = SEOArticleManager.getPublishedArticles();
    const filteredArticles = articles.filter((a) => a.id !== articleId);
    localStorage.setItem(
      SEOArticleManager.STORAGE_KEY,
      JSON.stringify(filteredArticles)
    );

    // 从草稿中删除
    const drafts = SEOArticleManager.getDrafts();
    const filteredDrafts = drafts.filter((a) => a.id !== articleId);
    localStorage.setItem(
      SEOArticleManager.DRAFTS_KEY,
      JSON.stringify(filteredDrafts)
    );
  }

  static publishDraft(articleId: string): void {
    const drafts = SEOArticleManager.getDrafts();
    const article = drafts.find((a) => a.id === articleId);

    if (article) {
      article.status = "published";
      article.publishDate = new Date().toISOString();
      SEOArticleManager.saveArticle(article);

      // 从草稿中移除
      const remainingDrafts = drafts.filter((a) => a.id !== articleId);
      localStorage.setItem(
        SEOArticleManager.DRAFTS_KEY,
        JSON.stringify(remainingDrafts)
      );
    }
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  static extractKeywords(title: string, content: string): string[] {
    // 常见的停用词
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
    ]);

    // 合并标题和内容
    const text = `${title} ${content}`.toLowerCase();

    // 提取单词，过滤停用词和短词
    const words = text
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    // 统计词频
    const wordCount = new Map<string, number>();
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }

    // 返回出现频率最高的前10个关键词
    return Array.from(wordCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  static createDefaultArticle(): SEOArticle {
    const id = crypto.randomUUID();
    return {
      id,
      title: "",
      slug: "",
      content: "",
      anchorLinks: [],
      seoMetadata: {
        title: "",
        description: "",
        keywords: [],
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      },
      publishDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: "draft",
      priority: 5,
      category: "gaming-guides",
      tags: [],
      isRecommended: false,
      extractedKeywords: [],
      isActive: true,
      viewCount: 0,
    };
  }

  static toggleArticleStatus(articleId: string): void {
    if (typeof window === "undefined") return;

    const articles = SEOArticleManager.getPublishedArticles();
    const article = articles.find((a) => a.id === articleId);

    if (article) {
      article.isActive = !article.isActive;
      article.lastModified = new Date().toISOString();
      SEOArticleManager.saveArticle(article);
    }
  }

  static getActiveArticles(): SEOArticle[] {
    return SEOArticleManager.getPublishedArticles()
      .filter((article) => article.isActive)
      .sort((a, b) => {
        // 优先按推荐状态排序
        if (a.isRecommended !== b.isRecommended) {
          return a.isRecommended ? -1 : 1;
        }
        // 然后按优先级排序
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // 最后按发布日期排序（最新的在前）
        return (
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
      });
  }

  static incrementViewCount(articleId: string): void {
    if (typeof window === "undefined") return;

    const articles = SEOArticleManager.getPublishedArticles();
    const article = articles.find((a) => a.id === articleId);

    if (article) {
      article.viewCount = (article.viewCount || 0) + 1;
      article.lastModified = new Date().toISOString();
      SEOArticleManager.saveArticle(article);
    }
  }

  static getArticleBySlug(slug: string): SEOArticle | null {
    const articles = SEOArticleManager.getPublishedArticles();
    return articles.find((a) => a.slug === slug && a.isActive) || null;
  }

  static searchArticles(query: string, category?: string): SEOArticle[] {
    const articles = SEOArticleManager.getActiveArticles();

    if (!query && !category) {
      return articles;
    }

    return articles.filter((article) => {
      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.seoMetadata.description
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        ) ||
        article.extractedKeywords.some((keyword) =>
          keyword.toLowerCase().includes(query.toLowerCase())
        );

      const matchesCategory = !category || article.category === category;

      return matchesQuery && matchesCategory;
    });
  }
}

// 生成高质量的锚链接
export function generateQualityAnchorLinks(
  targetSite: keyof typeof linkTargets,
  keyword: string
): AnchorLink[] {
  const target = linkTargets[targetSite];

  return [
    {
      id: `${targetSite}-${Date.now()}-1`,
      text: `${keyword} - ${target.name}专业服务`,
      url: `${target.baseUrl}/${keyword.toLowerCase().replace(/\s+/g, "-")}`,
      target: "_blank",
      rel: target.rel,
      title: `在${target.name}获取${keyword}`,
      keywords: [...target.keywords, keyword],
    },
    {
      id: `${targetSite}-${Date.now()}-2`,
      text: `安全购买${keyword}`,
      url: `${target.baseUrl}/safe-purchase`,
      target: "_blank",
      rel: target.rel,
      title: `${target.description} - ${keyword}`,
      keywords: ["安全购买", keyword, ...target.keywords],
    },
  ];
}

// SEO优化的内容模板
export const seoTemplates = {
  "game-currency-guide": `# {title}

## 什么是{gameName}货币？

{gameName}货币是游戏中的重要资源，用于购买装备、技能和其他游戏内容。获得足够的货币对于游戏进度至关重要。

## 为什么选择购买{gameName}货币？

### 1. 节省时间
- 避免长时间的刷金过程
- 快速获得需要的装备
- 更多时间享受游戏乐趣

### 2. 安全可靠
- 专业平台保障交易安全
- 快速到账，无风险
- 7x24小时客服支持

### 3. 价格优势
- 市场最优价格
- 定期优惠活动
- 批量购买折扣

## 推荐购买平台

### 选择{platform1}的理由
{platform1}作为业界领先的游戏货币提供商，具有以下优势：
- 价格透明，无隐藏费用
- 交易速度快，通常5-15分钟到账
- 支持多种支付方式
- 提供购买保障和退款政策

[立即访问{platform1}购买{gameName}货币]({platform1Link})

### {platform2}的专业服务
{platform2}同样是值得信赖的选择：
- 全球服务，支持多种语言
- 丰富的游戏资源
- 专业的客服团队
- 会员等级制度，享受更多优惠

[查看{platform2}的{gameName}货币价格]({platform2Link})

## 购买注意事项

### 安全提醒
1. **选择正规平台**：确保选择有良好声誉的交易平台
2. **验证卖家身份**：查看卖家评价和交易记录
3. **使用安全支付**：优先选择平台担保交易
4. **保护个人信息**：不要泄露游戏账号密码

### 价格比较
建议在购买前比较不同平台的价格：
- 考虑到账速度
- 查看用户评价
- 了解售后服务
- 注意优惠活动

## 常见问题解答

**Q: 购买游戏货币是否安全？**
A: 选择正规平台购买是安全的。建议选择有良好口碑和完善保障机制的平台。

**Q: 多久能到账？**
A: 通常在5-30分钟内到账，具体时间取决于平台处理速度和游戏服务器状态。

**Q: 可以退款吗？**
A: 大多数正规平台都提供退款保障，具体政策请查看平台条款。

## 总结

购买{gameName}货币可以大大提升游戏体验，但一定要选择可靠的平台。推荐的平台都经过验证，提供安全、快速的服务。

记住，理性消费，享受游戏！

---

*本文为{gameName}货币购买指南，更多游戏攻略请关注我们的网站。*`,

  "game-guide": `# {title}

## 游戏简介

{gameDescription}

## 核心玩法指南

### 基础操作
{basicOperations}

### 进阶技巧
{advancedTips}

### 专家策略
{expertStrategies}

## 推荐资源获取

在游戏过程中，您可能需要额外的资源来提升游戏体验：

### 游戏货币
如果您需要快速获得游戏货币，推荐访问以下专业平台：
[{platform1} - 安全快速的游戏货币服务]({platform1Link})

### 游戏道具
专业的游戏道具交易平台：
[{platform2} - 丰富的游戏道具选择]({platform2Link})

## 常见问题

{faqContent}

## 总结

{conclusion}

---

*获取更多游戏资源和攻略，请访问推荐的专业平台。*`,
};

export function getArticleStats() {
  const published = SEOArticleManager.getPublishedArticles() || [];
  const drafts = SEOArticleManager.getDrafts() || [];

  // 确保 published 和 drafts 是数组
  const publishedArray = Array.isArray(published) ? published : [];
  const draftsArray = Array.isArray(drafts) ? drafts : [];

  return {
    totalPublished: publishedArray.length,
    totalDrafts: draftsArray.length,
    totalAnchorLinks: publishedArray.reduce((sum, article) => {
      // 确保 anchorLinks 存在且是数组
      return (
        sum +
        (article && article.anchorLinks && Array.isArray(article.anchorLinks)
          ? article.anchorLinks.length
          : 0)
      );
    }, 0),
    categoryCounts: publishedArray.reduce((acc, article) => {
      if (article && article.category) {
        acc[article.category] = (acc[article.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };
}
