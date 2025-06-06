import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("API 路由: 测试 Supabase 连接");

    // 测试环境变量
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "未设置",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "已设置"
        : "未设置",
    };
    console.log("环境变量检查:", envCheck);

    // 测试基本连接
    console.log("测试 Supabase 基本连接...");
    let healthData = null;
    let healthError = null;
    try {
      const healthResult = await supabase.from("_health").select("*").limit(1);
      healthData = healthResult.data;
      healthError = healthResult.error;
    } catch (e) {
      console.error("健康检查请求失败:", e);
      healthError = e;
    }

    // 测试 articles 表
    console.log("测试 articles 表...");
    let articlesData = null;
    let articlesError = null;
    try {
      const articlesResult = await supabase
        .from("articles")
        .select("id")
        .limit(1);
      articlesData = articlesResult.data;
      articlesError = articlesResult.error;
    } catch (e) {
      console.error("articles表请求失败:", e);
      articlesError = e;
    }

    // 测试 RLS 策略
    console.log("测试 RLS 策略...");
    let publishedData = null;
    let publishedError = null;
    try {
      const publishedResult = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .limit(1);
      publishedData = publishedResult.data;
      publishedError = publishedResult.error;
    } catch (e) {
      console.error("已发布文章请求失败:", e);
      publishedError = e;
    }

    // 安全地获取错误信息
    const getErrorMessage = (error: unknown): string => {
      if (!error) return "无错误";
      if (typeof error === "string") return error;
      if (typeof error === "object" && error !== null) {
        const errorObj = error as Record<string, unknown>;
        if (errorObj.message && typeof errorObj.message === "string")
          return errorObj.message;
        return JSON.stringify(error);
      }
      return String(error);
    };

    const results = {
      env: envCheck,
      health: {
        success: !healthError,
        error: healthError ? getErrorMessage(healthError) : null,
        data: healthData ? "有数据" : "无数据",
      },
      articles: {
        success: !articlesError,
        error: articlesError ? getErrorMessage(articlesError) : null,
        data: Array.isArray(articlesData) ? articlesData.length : 0,
      },
      published: {
        success: !publishedError,
        error: publishedError ? getErrorMessage(publishedError) : null,
        data: Array.isArray(publishedData) ? publishedData.length : 0,
      },
    };

    console.log("测试结果:", results);

    return NextResponse.json(results);
  } catch (error) {
    console.error("API 路由测试出错:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
