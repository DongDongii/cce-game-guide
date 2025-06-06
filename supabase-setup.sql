-- 创建SEO文章表
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  anchorLinks JSONB DEFAULT '[]'::jsonb,
  seoMetadata JSONB NOT NULL,
  publishDate TIMESTAMP WITH TIME ZONE NOT NULL,
  lastModified TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  priority INTEGER NOT NULL DEFAULT 5,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  isRecommended BOOLEAN DEFAULT false,
  extractedKeywords JSONB DEFAULT '[]'::jsonb,
  isActive BOOLEAN DEFAULT true,
  viewCount INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_isActive ON articles(isActive);

-- 创建增加浏览次数的存储过程
CREATE OR REPLACE FUNCTION increment_view_count(article_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET viewCount = viewCount + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- 添加RLS策略（行级安全）
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名用户读取已发布且激活的文章
CREATE POLICY "允许匿名用户读取已发布文章" ON articles
  FOR SELECT
  USING (status = 'published' AND isActive = true);

-- 创建策略：允许认证用户完全访问
CREATE POLICY "允许认证用户完全访问" ON articles
  FOR ALL
  USING (auth.role() = 'authenticated'); 