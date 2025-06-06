import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 添加静态配置和revalidate
export const dynamic = "force-static";
export const revalidate = 0; // 每次请求都重新验证

export async function GET() {
  try {
    // 测试Supabase连接
    const { data, error } = await supabase
      .from("articles")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "连接Supabase失败",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase连接成功",
      data,
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json(
      {
        success: false,
        message: "发生错误",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
