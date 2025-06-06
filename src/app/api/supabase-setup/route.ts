import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 添加静态配置和revalidate
export const dynamic = "force-static";
export const revalidate = 0; // 每次请求都重新验证

// 这是一个用于初始化Supabase数据库表结构的脚本
// 可以在开发环境中运行一次来设置必要的表和函数

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// 初始化数据库结构
async function initializeSupabaseSchema() {
  try {
    console.log("开始初始化Supabase数据库表结构...");

    // 创建SEO文章表
    const { error: tableError } = await supabase.rpc(
      "create_seo_articles_table"
    );

    if (tableError) {
      // 如果RPC函数不存在，直接使用SQL创建表
      const { error: createTableError } = await supabase
        .from("articles")
        .select("id")
        .limit(1);

      if (
        createTableError &&
        createTableError.message.includes("does not exist")
      ) {
        // 表不存在，创建表
        // 注意：Supabase JS客户端不直接支持执行原始SQL
        // 需要使用REST API或通过Supabase控制台执行
        console.log("需要在Supabase控制台中创建表，SQL如下:");
        console.log(`
          CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            anchorLinks JSONB DEFAULT '[]',
            seoMetadata JSONB NOT NULL,
            publishDate TIMESTAMP WITH TIME ZONE,
            lastModified TIMESTAMP WITH TIME ZONE,
            status TEXT NOT NULL,
            priority INTEGER DEFAULT 5,
            category TEXT NOT NULL,
            tags TEXT[] DEFAULT '{}',
            isRecommended BOOLEAN DEFAULT false,
            extractedKeywords TEXT[] DEFAULT '{}',
            isActive BOOLEAN DEFAULT true,
            viewCount INTEGER DEFAULT 0
          );
          
          CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
          CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
          CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
        `);

        return {
          success: false,
          message: "需要在Supabase控制台中创建表结构",
        };
      } else if (createTableError) {
        console.error("检查表是否存在时出错:", createTableError);
        return {
          success: false,
          error: createTableError.message,
        };
      } else {
        console.log("seo_articles表已存在");
      }
    }

    // 创建增加浏览次数的函数
    const { error: funcError } = await supabase.rpc(
      "check_increment_view_count_function"
    );

    if (funcError) {
      // 如果检查函数不存在，需要在Supabase控制台中创建
      console.log("需要在Supabase控制台中创建函数，SQL如下:");
      console.log(`
        CREATE OR REPLACE FUNCTION increment_view_count(article_id TEXT)
        RETURNS VOID AS $$
        BEGIN
          UPDATE articles
          SET viewCount = viewCount + 1,
              lastModified = NOW()
          WHERE id = article_id;
        END;
        $$ LANGUAGE plpgsql;
      `);

      return {
        success: false,
        message: "需要在Supabase控制台中创建函数",
      };
    }

    console.log("Supabase数据库结构初始化完成");
    return { success: true };
  } catch (error) {
    console.error("初始化Supabase数据库结构时出错:", error);
    return { success: false, error };
  }
}

// 导出一个API路由处理函数
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "此API只能在开发环境中使用" },
      { status: 403 }
    );
  }

  const result = await initializeSupabaseSchema();

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
