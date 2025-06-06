# Supabase 设置指南

本项目使用 Supabase 作为后端数据库来存储和管理 SEO 文章。请按照以下步骤设置 Supabase：

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并登录或注册一个账户
2. 创建一个新项目
3. 记下项目的 URL 和匿名密钥（anon key）

## 2. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件（如果不存在）
2. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. 将占位符替换为您实际的 Supabase URL 和匿名密钥

## 3. 设置数据库表

1. 在 Supabase 控制面板中，导航到 SQL 编辑器
2. 创建一个新的查询
3. 复制 `supabase-setup.sql` 文件中的内容到查询编辑器
4. 执行查询以创建必要的表和函数

## 4. 设置身份验证（可选）

如果您想使用 Supabase 的身份验证功能：

1. 在 Supabase 控制面板中，导航到 Authentication > Settings
2. 配置您希望使用的身份验证提供商（电子邮件、社交登录等）
3. 更新项目代码以使用 Supabase 身份验证

## 5. 测试连接

1. 启动开发服务器：`npm run dev`
2. 访问管理员页面并尝试发布一篇文章
3. 检查 Supabase 表中是否成功创建了文章

## 常见问题解决

### 发布文章时出现错误

如果在发布文章时遇到 "Error publishing article" 错误：

1. 检查浏览器控制台中的详细错误信息
2. 确认您的 `.env.local` 文件中包含正确的 Supabase URL 和密钥
3. 验证 Supabase 项目中已正确设置数据库表
4. 确保您的 Supabase 项目的 RLS（行级安全）策略配置正确

### 数据库表结构问题

如果遇到与数据库表结构相关的错误：

1. 确认您已运行 `supabase-setup.sql` 中的所有 SQL 命令
2. 检查 Supabase 表结构是否与 `src/lib/seoSystem.ts` 中的 `SEOArticle` 接口匹配
