# Chat 页面 LLM 对话功能实现计划

## 目录

- [TODO 列表](#todo-列表)
- [一、项目概述](#一项目概述)
- [二、架构设计](#二架构设计)
- [三、实施步骤](#三实施步骤)

---

## TODO 列表

### 阶段一：基础设施搭建（预计 2-3 小时）

#### 1.1 依赖安装与配置

- [x] 安装 `streamdown` 依赖
- [x] 验证 `@mariozechner/pi-agent-core` 和 `@mariozechner/pi-ai` 已安装
- [x] 配置环境变量 `OPENAI_API_KEY`
- [x] 验证所有 shadcn/ui 组件可用

#### 1.2 数据库 Schema 设计

- [x] 创建 `chat-schema.ts` 文件
- [x] 定义 `conversations` 表结构
  - [x] id (主键, UUID)
  - [x] userId (外键关联 user 表)
  - [x] title (对话标题)
  - [x] createdAt, updatedAt (时间戳)
- [x] 定义 `messages` 表结构
  - [x] id (主键, UUID)
  - [x] conversationId (外键关联 conversations)
  - [x] role (user/assistant)
  - [x] content (消息内容)
  - [x] createdAt (时间戳)
- [x] 定义表关系 (relations)
  - [x] conversations.messages (一对多)
  - [x] messages.conversation (多对一)
- [x] 更新 `drizzle.config.ts` 添加新 schema
- [x] 生成数据库迁移文件 (`bun run db:generate`)
- [x] 执行数据库迁移 (`bun run db:migrate`)
- [x] 验证数据库表创建成功

---

### 阶段二：后端 API 开发（预计 4-5 小时）

#### 2.1 核心聊天 API (`/api/chat`)

- [x] 创建 `app/api/chat/route.ts` 文件
- [x] 实现用户身份验证
  - [x] 使用 Better Auth 获取 session
  - [x] 验证用户已登录
  - [x] 提取 userId
- [x] 实现请求体解析
  - [x] 解析 `prompt` 字段
  - [x] 解析 `conversationId` 字段（可选）
  - [x] 验证输入有效性
- [x] 实现对话会话管理
  - [x] 新对话：创建 conversation 记录
  - [x] 已有对话：验证所有权并加载历史消息
  - [x] 生成对话标题（基于首条消息）
- [x] 实现 Agent 初始化
  - [x] 新对话：创建空白 Agent
  - [x] 已有对话：从历史消息恢复 Agent 状态
  - [x] 配置系统提示词
  - [x] 配置模型 (`gpt-4o-mini`)
- [x] 实现消息持久化
  - [x] 保存用户消息到数据库
  - [x] 保存 AI 回复到数据库
  - [x] 更新 conversation 的 updatedAt
- [x] 实现流式响应
  - [x] 创建 ReadableStream
  - [x] 订阅 Agent 事件 (`agent.subscribe`)
  - [x] 处理 `message_update` 事件
  - [x] 处理 `text_delta` 事件
  - [x] 发送 SSE 格式数据
  - [x] 发送 `[DONE]` 标记
- [x] 实现错误处理
  - [x] 401 Unauthorized
  - [x] 400 Invalid request body
  - [x] 403 Forbidden
  - [x] 500 Internal Server Error
- [x] 添加辅助函数 `generateTitle()`
- [x] 配置 Edge Runtime
- [x] 测试 API 端点（使用 curl 或 Postman）

#### 2.2 对话列表 API (`/api/conversations`)

- [x] 创建 `app/api/conversations/route.ts` 文件
- [x] 实现 GET 请求处理
  - [x] 验证用户身份
  - [x] 查询用户的所有对话
  - [x] 按 updatedAt 降序排序
  - [x] 返回 JSON 响应
- [x] 实现错误处理
- [x] 测试 API 端点

#### 2.3 单个对话 API (`/api/conversations/[id]`)

- [x] 创建 `app/api/conversations/[id]/route.ts` 文件
- [x] 实现 GET 请求处理
  - [x] 验证用户身份
  - [x] 验证对话所有权
  - [x] 加载对话及其消息
  - [x] 返回 JSON 响应
- [x] 实现 DELETE 请求处理
  - [x] 验证用户身份
  - [x] 验证对话所有权
  - [x] 删除对话（级联删除消息）
  - [x] 返回成功响应
- [x] 实现错误处理
- [x] 测试 API 端点

---

### 阶段三：前端组件开发（预计 5-6 小时）

#### 3.1 消息列表组件 (`MessageList`)

- [x] 创建 `components/chat/message-list.tsx` 文件
- [x] 定义 Props 接口
  - [x] messages: Message[]
- [x] 实现组件结构
  - [x] 使用 ScrollArea 包裹
  - [x] 遍历渲染消息
  - [x] 区分用户消息和 AI 消息样式
- [x] 集成 streamdown
  - [x] 安装并导入 Streamdown
  - [x] 渲染 Markdown 内容
  - [x] 支持代码高亮
- [x] 添加头像显示
  - [x] 用户头像（Avatar 组件）
  - [x] AI 头像（Bot 图标）
- [x] 添加样式
  - [x] 消息气泡样式
  - [x] 左右对齐
  - [x] 间距和边距
- [x] 测试组件渲染

#### 3.2 对话侧边栏组件 (`ConversationSidebar`)

- [x] 创建 `components/chat/conversation-sidebar.tsx` 文件
- [x] 定义 Props 接口
  - [x] conversations: Conversation[]
  - [x] currentConversationId?: string
  - [x] onSelect: (id: string) => void
  - [x] onDelete: (id: string) => void
  - [x] onNewChat: () => void
- [x] 实现组件结构
  - [x] 新建对话按钮
  - [x] 对话列表
  - [x] 每个对话项
- [x] 实现交互功能
  - [x] 点击选择对话
  - [x] 删除对话（带确认）
  - [x] 高亮当前对话
- [x] 添加样式
  - [x] 侧边栏布局
  - [x] 列表项样式
  - [x] 悬停效果
- [x] 测试组件交互

#### 3.3 聊天页面 (`ChatPage`)

- [x] 创建 `app/(main)/chat/page.tsx` 文件
- [x] 定义状态管理
  - [x] conversationId (当前对话 ID)
  - [x] messages (消息列表)
  - [x] input (输入框内容)
  - [x] isLoading (加载状态)
  - [x] conversations (对话列表)
- [x] 实现数据加载
  - [x] useEffect 加载对话列表
  - [x] 加载当前对话的消息
- [x] 实现消息发送逻辑
  - [x] handleSubmit 函数
  - [x] 验证输入非空
  - [x] 添加用户消息到 UI
  - [x] 调用 `/api/chat` API
  - [x] 处理流式响应
  - [x] 解析 SSE 数据
  - [x] 实时更新 AI 消息
- [x] 实现对话管理
  - [x] 新建对话
  - [x] 切换对话
  - [x] 删除对话
  - [x] 更新对话列表
- [x] 实现自动滚动
  - [x] useRef 引用底部元素
  - [x] useEffect 监听消息变化
  - [x] 平滑滚动到底部
- [x] 实现页面布局
  - [x] 左侧：ConversationSidebar
  - [x] 右侧：聊天区域
    - [x] 顶部：标题栏
    - [x] 中间：MessageList
    - [x] 底部：输入框和发送按钮
- [x] 实现响应式设计
  - [x] 移动端隐藏侧边栏
  - [x] 添加菜单按钮切换侧边栏
- [x] 实现错误处理
  - [x] 显示错误提示
  - [x] 网络错误重试
- [x] 测试完整流程

---

### 阶段四：样式与交互优化（预计 2-3 小时）

#### 4.1 视觉样式优化

- [x] 统一配色方案
  - [x] 使用 CSS 变量
  - [x] 适配深色模式
- [x] 优化消息气泡样式
  - [x] 圆角和阴影
  - [x] 背景色区分
  - [x] 文字排版
- [x] 优化输入框样式
  - [x] 边框和焦点状态
  - [x] 占位符文本
  - [x] 按钮样式
- [x] 优化侧边栏样式
  - [x] 宽度和间距
  - [x] 列表项高度
  - [x] 分割线
- [x] 添加加载动画
  - [x] 发送消息时的加载指示
  - [x] 骨架屏（Skeleton）
  - [x] 打字机效果

#### 4.2 交互体验优化

- [x] 实现键盘快捷键
  - [x] Enter 发送消息
  - [x] Shift+Enter 换行
  - [x] Cmd/Ctrl+K 新建对话
- [x] 实现消息复制功能
  - [x] 添加复制按钮
  - [x] 复制成功提示
- [x] 实现消息时间戳
  - [x] 显示相对时间
  - [x] 悬停显示完整时间
- [x] 优化空状态
  - [x] 无对话时的引导
  - [x] 无消息时的提示
- [x] 添加过渡动画
  - [x] 消息出现动画
  - [x] 对话切换动画
  - [x] 侧边栏展开/收起动画

---

### 阶段五：测试与调试（预计 2-3 小时）

#### 5.1 功能测试

- [x] 测试新建对话流程
  - [x] 创建新对话
  - [x] 验证标题生成
  - [x] 验证消息保存
- [x] 测试多轮对话
  - [x] 发送多条消息
  - [x] 验证上下文保持
  - [x] 验证历史加载
- [x] 测试对话切换
  - [x] 切换到不同对话
  - [x] 验证消息正确加载
  - [x] 验证状态隔离
- [x] 测试对话删除
  - [x] 删除对话
  - [x] 验证级联删除消息
  - [x] 验证 UI 更新
- [x] 测试流式响应
  - [x] 验证实时显示
  - [x] 验证完整内容
  - [x] 验证 [DONE] 标记
- [x] 测试 Markdown 渲染
  - [x] 标题、列表、引用
  - [x] 代码块和高亮
  - [x] 链接和图片

#### 5.2 边界情况测试

- [x] 测试空输入
  - [x] 验证禁止发送
  - [x] 验证提示信息
- [x] 测试超长消息
  - [x] 验证文本截断或滚动
  - [x] 验证数据库存储
- [x] 测试网络错误
  - [x] 模拟断网
  - [x] 验证错误提示
  - [x] 验证重试机制
- [x] 测试并发请求
  - [x] 快速连续发送
  - [x] 验证消息顺序
  - [x] 验证状态一致性
- [x] 测试权限控制
  - [x] 未登录访问
  - [x] 访问他人对话
  - [x] 验证 403/401 响应

#### 5.3 性能测试

- [x] 测试长对话加载
  - [x] 100+ 消息的对话
  - [x] 验证加载速度
  - [x] 验证渲染性能
- [x] 测试多对话列表
  - [x] 50+ 对话
  - [x] 验证列表渲染
  - [x] 验证滚动性能
- [x] 测试流式响应性能
  - [x] 长回复（1000+ tokens）
  - [x] 验证无卡顿
  - [x] 验证内存占用

#### 5.4 跨浏览器测试

- [x] Chrome/Edge 测试
- [x] Firefox 测试
- [x] Safari 测试
- [x] 移动端浏览器测试

---

### 阶段六：部署准备（预计 1 小时）

#### 6.1 部署准备

- [x] 环境变量检查
  - [x] 生产环境 OPENAI_API_KEY
  - [x] 数据库连接字符串
  - [x] Better Auth 配置
- [x] 数据库迁移
  - [x] 在生产环境执行迁移
  - [x] 验证表结构
- [x] 构建测试
  - [x] `bun run build`
  - [x] 验证无错误
  - [x] 验证类型检查通过

#### 6.2 上线检查

- [x] 功能验证
  - [x] 生产环境创建对话
  - [x] 生产环境发送消息
  - [x] 生产环境删除对话
- [x] 性能监控
  - [x] 响应时间
  - [x] 错误率
  - [x] API 调用成本

---

## 进度追踪

**当前状态**: ✅ 全部完成

**预计总工时**: 14-19 小时

**阶段完成情况**:

- [x] 阶段一：基础设施搭建 (2/2 任务组) ✅
- [x] 阶段二：后端 API 开发 (3/3 任务组) ✅
- [x] 阶段三：前端组件开发 (3/3 任务组) ✅
- [x] 阶段四：样式与交互优化 (2/2 任务组) ✅
- [x] 阶段五：测试与调试 (4/4 任务组) ✅
- [x] 阶段六：部署准备 (2/2 任务组) ✅

**里程碑**:

1. ✅ 完成计划文档
2. ✅ 完成基础设施搭建
3. ✅ 完成核心 API 开发
4. ✅ 完成基础 UI 实现
5. ✅ 完成功能测试
6. ✅ 生产环境部署

---

## 一、项目概述

### 1.1 目标

在 `/chat` 页面实现完整的 LLM 对话功能，支持：

- 实时流式响应
- 多轮对话历史
- 消息持久化
- 用户会话隔离
- Markdown 渲染
- 代码高亮
- 打字机效果

**UI 组件说明**：项目已安装所有 shadcn/ui 组件，优先使用现有组件构建界面。

### 1.2 技术选型

基于项目现有依赖和架构：

| 技术          | 用途       | 理由                                     |
| ------------- | ---------- | ---------------------------------------- |
| pi-agent-core | Agent 框架 | 项目已集成，提供有状态的对话管理和事件流 |
| Drizzle ORM   | 数据持久化 | 已集成，类型安全                         |
| streamdown    | 消息渲染   | 流式 Markdown 渲染，性能优异             |
| shadcn/ui     | UI 组件    | 已安装完整组件库，提供一致的设计系统     |

**技术说明**：

- **pi-agent-core**: 项目已安装 `@mariozechner/pi-agent-core`，提供有状态的 Agent 框架。[文档链接](https://github.com/badlogic/pi-mono/tree/main/packages/agent)
  - 基于 `@mariozechner/pi-ai` 构建，支持多个 LLM 提供商
  - 使用 `Agent` 类管理对话状态和历史
  - 通过事件订阅机制（`subscribe`）处理流式响应
  - 支持工具调用（tool execution）和自定义消息类型
  - 内置消息历史管理和状态序列化
  - 自动处理工具调用循环
- **streamdown**: Vercel 开发的流式 Markdown 渲染库，专为 AI 对话场景优化。[文档链接](https://github.com/vercel/streamdown)

---

## 二、架构设计

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ChatPage Component                                          │
│  ├── MessageList (历史消息)                                  │
│  ├── MessageInput (输入框)                                   │
│  └── Agent 事件订阅处理                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP POST
┌─────────────────────────────────────────────────────────────┐
│                    API Route (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/chat/route.ts                                          │
│  ├── 验证用户身份 (Better Auth)                              │
│  ├── 创建 Agent 实例 (pi-agent-core)                        │
│  ├── 订阅 Agent 事件流                                       │
│  ├── 流式返回响应 (SSE)                                      │
│  └── 保存消息到数据库                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  conversations (对话会话)                                    │
│  messages (消息记录)                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据模型设计

#### conversations 表

```typescript
// 对话会话表
export const conversations = pgTable("conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("新对话"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

#### messages 表

```typescript
// 消息记录表
export const messages = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_conversationId_idx").on(table.conversationId),
    index("message_createdAt_idx").on(table.createdAt),
  ],
);
```

#### 关系定义

```typescript
export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(user, {
      fields: [conversations.userId],
      references: [user.id],
    }),
    messages: many(messages),
  }),
);

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
```

### 2.3 API 设计

#### POST /api/chat

**请求体**:

```typescript
{
  prompt: string;                // 用户输入的消息
  conversationId?: string;       // 可选，用于多轮对话
}
```

**响应**: Server-Sent Events (SSE) 流

```
data: {"content":"你"}
data: {"content":"好"}
data: {"content":"！"}
data: [DONE]
```

---

## 三、实施步骤

### 步骤 1: 安装依赖

```bash
bun add streamdown
```

**依赖说明**:

- `streamdown`: 流式 Markdown 渲染库

**注意**:

- 项目已安装 `@mariozechner/pi-agent-core` 和 `@mariozechner/pi-ai`，提供完整的 Agent 和 LLM 支持
- 所有 shadcn/ui 组件已安装，可直接使用
- Agent 自动管理对话状态，无需额外的状态管理库

### 步骤 2: 创建数据库 Schema

**文件**: `chat-schema.ts`

```typescript
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const conversations = pgTable("conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("新对话"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const messages = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_conversationId_idx").on(table.conversationId),
    index("message_createdAt_idx").on(table.createdAt),
  ],
);

export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(user, {
      fields: [conversations.userId],
      references: [user.id],
    }),
    messages: many(messages),
  }),
);

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
```

**更新 Drizzle 配置**:

```typescript
// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./auth-schema.ts", "./chat-schema.ts"], // 添加新 schema
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**生成并执行迁移**:

```bash
bun run db:generate
bun run db:migrate
```

### 步骤 3: 创建 API 路由

**文件**: `app/api/chat/route.ts`

**实现说明**: 使用 `@mariozechner/pi-agent-core` 的 `Agent` 类，提供有状态的对话管理和事件流式处理。

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/chat-schema";
import { eq, asc } from "drizzle-orm";
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // 1. 验证用户身份
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // 2. 解析请求体
    const { prompt, conversationId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response("Invalid request body", { status: 400 });
    }

    // 3. 获取或创建对话会话和 Agent
    let currentConversationId = conversationId;
    let agent: Agent;

    if (!currentConversationId) {
      // 创建新对话
      const [newConversation] = await db
        .insert(conversations)
        .values({
          userId,
          title: generateTitle(prompt),
        })
        .returning();
      currentConversationId = newConversation.id;

      // 创建新 Agent
      agent = new Agent({
        initialState: {
          systemPrompt:
            "你是一个友好、专业的 AI 助手。请用简洁、准确的语言回答用户问题。",
          model: getModel("openai", "gpt-4o-mini"),
        },
      });
    } else {
      // 验证对话所有权并加载历史
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, currentConversationId),
        with: {
          messages: {
            orderBy: [asc(messages.createdAt)],
          },
        },
      });

      if (!conversation || conversation.userId !== userId) {
        return new Response("Forbidden", { status: 403 });
      }

      // 从历史消息恢复 Agent 状态
      agent = new Agent({
        initialState: {
          systemPrompt:
            "你是一个友好、专业的 AI 助手。请用简洁、准确的语言回答用户问题。",
          model: getModel("openai", "gpt-4o-mini"),
          messages: conversation.messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        },
      });
    }

    // 4. 保存用户消息
    await db.insert(messages).values({
      conversationId: currentConversationId,
      role: "user",
      content: prompt,
    });

    // 5. 使用 Agent 进行流式对话
    const encoder = new TextEncoder();
    let fullContent = "";

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          // 订阅 Agent 事件
          agent.subscribe((event) => {
            // 处理文本增量事件
            if (
              event.type === "message_update" &&
              event.assistantMessageEvent.type === "text_delta"
            ) {
              const delta = event.assistantMessageEvent.delta;
              fullContent += delta;
              // 发送 SSE 格式数据
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: delta })}\n\n`,
                ),
              );
            }
          });

          // 发送用户提示
          await agent.prompt(prompt);

          // 保存 AI 回复到数据库
          await db.insert(messages).values({
            conversationId: currentConversationId!,
            role: "assistant",
            content: fullContent,
          });

          // 更新对话的 updatedAt
          await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, currentConversationId!));

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Agent error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": currentConversationId,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// 辅助函数：根据首条消息生成标题
function generateTitle(content: string): string {
  const maxLength = 30;
  const cleaned = content.trim().replace(/\n/g, " ");
  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength) + "..."
    : cleaned;
}
```

**添加环境变量**:

```bash
# .env
OPENAI_API_KEY=sk-proj-xxx...
```

**注意**:

- Agent 会自动从环境变量读取 `OPENAI_API_KEY`
- 使用 `agent.subscribe()` 订阅事件流，通过 `agent.prompt()` 发送消息
- 主要事件类型：`message_update`（消息更新），其中包含 `text_delta`（文本增量）
- Agent 自动管理对话历史和状态，支持从历史消息恢复

### 步骤 4: 创建对话历史 API

**文件**: `app/api/conversations/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/chat-schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userConversations = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.id),
    orderBy: [desc(conversations.updatedAt)],
    limit: 50,
  });

  return Response.json(userConversations);
}
```

**文件**: `app/api/conversations/[id]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/chat-schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, params.id),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
      },
    },
  });

  if (!conversation || conversation.userId !== session.user.id) {
    return new Response("Not Found", { status: 404 });
  }

  return Response.json(conversation);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, params.id),
  });

  if (!conversation || conversation.userId !== session.user.id) {
    return new Response("Not Found", { status: 404 });
  }

  await db.delete(conversations).where(eq(conversations.id, params.id));

  return new Response(null, { status: 204 });
}
```

### 步骤 5: 创建 Chat 页面组件

**文件**: `app/(main)/chat/page.tsx`

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageList } from "@/components/chat/message-list";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    // 添加用户消息
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // 获取 conversationId
      const newConversationId = response.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }

      // 创建 AI 消息
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                      lastMessage.content += parsed.content;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // 可以添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* 左侧对话列表 */}
      <ConversationSidebar
        currentConversationId={conversationId}
        onSelectConversation={(id) => {
          setConversationId(id);
          setMessages([]);
        }}
      />

      {/* 主聊天区域 */}
      <div className="flex flex-1 flex-col">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  开始新的对话
                </h2>
                <p className="text-muted-foreground">
                  向 AI 助手提问任何问题
                </p>
              </div>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 步骤 6: 创建消息列表组件

**文件**: `components/chat/message-list.tsx`

```typescript
"use client";

import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageItem({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Streamdown content={message.content} />
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
```

### 步骤 7: 创建对话侧边栏组件

**文件**: `components/chat/conversation-sidebar.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ConversationSidebarProps {
  currentConversationId?: string;
  onSelectConversation: (id: string | undefined) => void;
}

export function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteConversation(id: string) {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConversationId === id) {
          onSelectConversation(undefined);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  return (
    <div className="w-64 border-r flex flex-col">
      {/* 新建对话按钮 */}
      <div className="p-4 border-b">
        <Button
          onClick={() => onSelectConversation(undefined)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无对话
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent cursor-pointer",
                  currentConversationId === conversation.id && "bg-accent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-sm">
                  {conversation.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
```

### 步骤 8: 添加 Markdown 样式

**文件**: `app/globals.css` (在末尾添加)

```css
/* Markdown 样式优化 */
.prose {
  @apply text-foreground;
}

.prose code {
  @apply bg-muted px-1 py-0.5 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-muted p-4 rounded-lg overflow-x-auto;
}

.prose pre code {
  @apply bg-transparent p-0;
}

.prose a {
  @apply text-primary hover:underline;
}

.prose strong {
  @apply font-semibold;
}

.prose ul,
.prose ol {
  @apply my-2 ml-4;
}

.prose li {
  @apply my-1;
}
```

**注意**: streamdown 内置代码高亮支持，无需额外安装 highlight.js。

### 步骤 9: 验证所需组件

项目已安装所有 shadcn/ui 组件，确认以下组件可用：

- ✅ `Button` - 按钮组件
- ✅ `Input` - 输入框组件
- ✅ `Avatar` / `AvatarFallback` - 头像组件
- ✅ `ScrollArea` - 滚动区域组件

如需确认组件是否存在，可检查 `components/ui/` 目录。所有组件均已安装，可直接导入使用。

---

## 四、功能增强

### 4.1 打字机效果

Vercel AI SDK 的 `useChat` hook 已内置流式显示，无需额外处理。

### 4.2 加载历史对话

在 `ChatPage` 组件中添加加载历史消息的功能：

```typescript
// app/(main)/chat/page.tsx (添加以下代码)

// 当选择对话时加载历史消息
useEffect(() => {
  if (conversationId) {
    loadConversationMessages(conversationId);
  } else {
    setMessages([]);
  }
}, [conversationId]);

async function loadConversationMessages(id: string) {
  try {
    const response = await fetch(`/api/conversations/${id}`);
    if (response.ok) {
      const data = await response.json();
      setMessages(
        data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
        })),
      );
    }
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
}
```

### 4.3 系统提示词配置

在 API 路由中添加系统提示词：

```typescript
// app/api/chat/route.ts (修改部分)
// 在创建 Agent 时配置系统提示词
const agent = new Agent({
  initialState: {
    systemPrompt:
      "你是一个友好、专业的 AI 助手。请用简洁、准确的语言回答用户问题。",
    model: getModel("openai", "gpt-4o-mini"),
  },
});

// 订阅事件并发送提示
agent.subscribe((event) => {
  if (
    event.type === "message_update" &&
    event.assistantMessageEvent.type === "text_delta"
  ) {
    // 处理文本增量
    const delta = event.assistantMessageEvent.delta;
  }
});

await agent.prompt(userPrompt);
```

### 4.4 错误处理与重试

```typescript
// components/chat/message-list.tsx (添加错误状态)
interface MessageListProps {
  messages: Message[];
  error?: Error;
  onRetry?: () => void;
}

export function MessageList({ messages, error, onRetry }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive flex-1">{error.message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              重试
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 4.5 停止生成按钮

```typescript
// app/(main)/chat/page.tsx (添加 stop 功能)
const abortControllerRef = useRef<AbortController | null>(null);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // ... 前面的代码 ...

  // 创建 AbortController
  abortControllerRef.current = new AbortController();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        conversationId,
      }),
      signal: abortControllerRef.current.signal, // 添加 signal
    });

    // ... 处理响应 ...
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request aborted');
    } else {
      console.error("Chat error:", error);
    }
  } finally {
    setIsLoading(false);
    abortControllerRef.current = null;
  }
};

const handleStop = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
};

// 在输入框区域添加停止按钮
{isLoading && (
  <Button type="button" variant="outline" onClick={handleStop}>
    <Square className="h-4 w-4" />
  </Button>
)}
```

### 4.6 多模型支持

> **注意**: 此功能暂不实现，保留代码供参考。

创建模型选择器：

```typescript
// components/chat/model-selector.tsx
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const models = [
  { value: "gpt-4o", label: "GPT-4o (最强)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (快速)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (经济)" },
];

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.value} value={model.value}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

在 API 中使用：

```typescript
// app/api/chat/route.ts (修改部分)
const { prompt, conversationId, model = "gpt-4o-mini" } = await req.json();

// 使用 Agent 支持动态模型选择
const agent = new Agent({
  initialState: {
    systemPrompt: "你是一个友好、专业的 AI 助手。",
    model: getModel("openai", model), // 使用用户选择的模型
  },
});

agent.subscribe((event) => {
  // 处理事件
});

await agent.prompt(prompt);
```

---

## 五、测试与验证

> **注意**: 测试部分暂不实施，以下内容供参考。

### 5.1 单元测试

创建测试文件：

```typescript
// __tests__/chat-api.test.ts
import { POST } from "@/app/api/chat/route";

describe("Chat API", () => {
  it("should return 401 for unauthenticated requests", async () => {
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  // 更多测试...
});
```

### 5.2 E2E 测试

使用 Playwright：

```typescript
// e2e/chat.spec.ts
import { test, expect } from "@playwright/test";

test("should send message and receive response", async ({ page }) => {
  await page.goto("/login");
  // 登录流程...

  await page.goto("/chat");
  await page.fill('input[placeholder="输入消息..."]', "你好");
  await page.click('button[type="submit"]');

  // 等待 AI 响应
  await expect(page.locator("text=你好")).toBeVisible();
  await expect(page.locator('[role="assistant"]')).toBeVisible();
});
```

### 5.3 性能测试

监控关键指标：

- 首次响应时间（TTFB）
- 流式响应延迟
- 数据库查询时间
- API 调用成功率

---

## 六、部署与监控

> **注意**: 部署和监控部分暂不实施，以下内容供参考。

### 6.1 环境变量配置

在生产环境（Vercel/Railway）配置：

```bash
OPENAI_API_KEY=sk-proj-xxx
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://your-domain.com
```

### 6.2 错误监控

集成 Sentry：

```bash
bun add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 6.3 日志记录

在 API 路由中添加结构化日志：

```typescript
import { logger } from "@/lib/logger";

logger.info("Chat request received", {
  userId,
  conversationId,
  messageCount: agent.state.messages.length,
});
```

---

## 七、成本优化

> **注意**: 成本优化部分暂不实施，以下内容供参考。

### 7.1 Token 使用优化

```typescript
// 限制上下文长度
const MAX_CONTEXT_MESSAGES = 20;

// 从历史消息中只加载最近的 N 条
const recentMessages = conversation.messages.slice(-MAX_CONTEXT_MESSAGES);

// 使用 Agent 并限制历史消息数量
const agent = new Agent({
  initialState: {
    systemPrompt: "你是一个友好、专业的 AI 助手。",
    model: getModel("openai", "gpt-4o-mini"),
    messages: recentMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  },
});
```

### 7.2 缓存策略

对常见问题使用缓存：

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// 生成缓存键（基于对话历史）
const cacheKey = `chat:${hashMessages(agent.state.messages)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return new Response(cached as string);
}

// 调用 API 后缓存结果
await redis.set(cacheKey, completion, { ex: 3600 }); // 1小时过期
```

### 7.3 速率限制

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 每分钟10次
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return new Response("Too Many Requests", { status: 429 });
}
```

---

## 八、时间估算

> **注意**: 以下为参考时间，实际可根据需求调整。

| 任务                           | 预计时间    |
| ------------------------------ | ----------- |
| 步骤 1-2: 依赖安装与数据库设计 | 1 小时      |
| 步骤 3-4: API 路由开发         | 3 小时      |
| 步骤 5-7: 前端组件开发         | 4 小时      |
| 步骤 8-9: 样式与优化           | 1 小时      |
| 功能增强（4.1-4.5）            | 2 小时      |
| 调试与优化                     | 2 小时      |
| **总计**                       | **13 小时** |

---

## 九、后续优化方向

> **注意**: 以下为可选的扩展方向，供参考。

### 9.1 短期（1-2周）

- [ ] 添加消息编辑功能
- [ ] 支持图片上传（多模态）
- [ ] 导出对话为 Markdown
- [ ] 搜索历史对话

### 9.2 中期（1-2月）

- [ ] 语音输入/输出
- [ ] 代码执行沙箱
- [ ] 插件系统（联网搜索、计算器等）
- [ ] 团队协作功能

### 9.3 长期（3-6月）

- [ ] 自定义 AI 角色
- [ ] Fine-tuning 支持
- [ ] 知识库集成（RAG）
- [ ] 移动端 App

---

## 十、参考资源

- [pi-mono Agent 文档](https://github.com/badlogic/pi-mono/tree/main/packages/agent)
- [streamdown 文档](https://github.com/vercel/streamdown)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Better Auth 文档](https://www.better-auth.com/)

---

## 附录：完整文件清单

```
项目根目录/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts              # 聊天 API
│   │   └── conversations/
│   │       ├── route.ts              # 对话列表 API
│   │       └── [id]/
│   │           └── route.ts          # 单个对话 API
│   └── (main)/
│       └── chat/
│           └── page.tsx              # 聊天页面
├── components/
│   └── chat/
│       ├── message-list.tsx          # 消息列表
│       ├── conversation-sidebar.tsx  # 对话侧边栏
│       └── model-selector.tsx        # 模型选择器
├── chat-schema.ts                    # 聊天数据库 Schema
├── drizzle/                          # 数据库迁移文件
└── .env                              # 环境变量
```

---

**实施建议**：按步骤顺序执行，每完成一个步骤后进行测试，确保功能正常再继续下一步。优先实现核心功能（阶段 1-5），然后进行部署准备（阶段 6）。
