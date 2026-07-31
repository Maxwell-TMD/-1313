# 公考刷题统计

面向公务员考试备考的单用户 Web App，用于记录刷题数据、计算正确率、查看趋势并识别薄弱模块。

## 功能

- 今日与累计题量、答对数、加权正确率和连续学习天数
- 最近 7 天题量及正确率趋势
- 行测、申论一级与二级模块统计
- 独立试卷记录：按行测模块填写题目数、答对数和得分
- 试卷总题数、总答对数、总得分、正确率及模块汇总
- 新增、编辑、详情、删除、筛选和分页
- 7 天、30 天、全部时间及自定义日期分析
- CSV 导出、JSON 完整备份与事务恢复
- 浅色/深色模式和移动端底部导航
- 生产环境单密码访问保护

## 技术栈

- Next.js 15、React 19、TypeScript
- Tailwind CSS、shadcn/ui 风格组件
- Recharts
- Prisma 6
- 本地 SQLite；生产 Turso/libSQL
- Zod、Vitest

## 环境要求

- Node.js 20.9 或更高版本
- npm 10 或更高版本

## 本地运行

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:setup
npm run dev
```

Windows PowerShell 可使用：

```powershell
Copy-Item .env.example .env
```

访问 `http://localhost:3000`。本地 `.env` 中 `APP_PASSWORD` 为空时不会显示登录页。

## 环境变量

| 名称 | 本地 | 生产 | 说明 |
| --- | --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | 保留该值供 Prisma CLI 使用 | 本地 SQLite 地址，相对于 `prisma/` |
| `TURSO_DATABASE_URL` | 空 | `libsql://...` | Turso 数据库地址 |
| `TURSO_AUTH_TOKEN` | 空 | 必填 | Turso 访问令牌 |
| `APP_PASSWORD` | 空 | 必填 | 单用户访问密码 |
| `SESSION_SECRET` | 本地任意值 | 必填，至少 32 字节随机值 | 签名登录 Cookie |
| `APP_TIME_ZONE` | `Asia/Shanghai` | `Asia/Shanghai` | 每日统计使用的时区 |

可生成随机会话密钥：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

## 数据库

### 本地 SQLite

`npm run db:setup` 会：

1. 执行 `prisma/migrations` 中的 SQL；
2. 创建数据库约束和索引；
3. 写入默认行测、申论模块。

命令可以重复执行，不会重复写入模块。开发阶段修改 Prisma Schema 后可运行：

```bash
npm run db:migrate
npm run db:generate
```

### Turso

Vercel 的函数文件系统不提供持久 SQLite 文件，因此生产环境使用 SQLite 兼容的 Turso/libSQL。

1. 在 Turso 创建数据库并取得 URL、Token。
2. 按目录名称顺序，将 `prisma/migrations` 下的全部 `migration.sql` 应用到远程数据库。
3. 在本地临时配置 Turso 环境变量并执行 `npm run db:seed`，或使用 Turso 控制台导入默认模块。
4. 将 Turso 环境变量添加到 Vercel。

远程 Turso 不直接使用 `prisma migrate deploy`；Schema 变更应先生成并审查 SQLite SQL，再通过 Turso CLI 应用。

## 常用命令

```bash
npm run dev            # 开发服务器
npm run lint           # ESLint
npm run test           # Vitest
npm run test:coverage  # 测试覆盖率
npm run build          # Prisma Client + Next.js 生产构建
npm run start          # 启动生产构建
npm run db:setup       # 初始化本地数据库并写入默认模块
npm run db:seed        # 单独写入默认模块
```

## 数据规则

- 正确率按 `总答对数 ÷ 总题数 × 100%` 加权计算。
- 试卷与日常刷题记录独立统计；试卷总得分为各模块得分之和。
- 总题数为 0 时显示“暂无数据”。
- 薄弱模块至少需要累计 10 题。
- 薄弱模块按正确率升序；正确率相同时题量更多者优先。
- 日期使用 `YYYY-MM-DD` 保存，避免纯日期受到 UTC 转换影响。
- 数据库同时约束题量大于 0、答对数不超过题量、用时非负。

## 测试

测试包括统计纯函数、Zod 校验、JSON 引用校验，以及使用独立 SQLite 文件执行的练习和试卷增删查、日期范围过滤、试卷聚合和数据库约束验证。

```bash
npm run lint
npm run test
npm run build
```

## Vercel 部署

1. 将仓库导入 Vercel。
2. Framework Preset 选择 Next.js。
3. Build Command 保持 `npm run build`。
4. 添加上述 Turso、访问密码、会话密钥及时区环境变量。
5. 部署后使用访问密码登录并新增一条记录，确认刷新后数据仍存在。

## 备份建议

- 定期从设置页导出 JSON。
- CSV 仅用于 Excel 查看，不支持恢复。
- JSON 同时备份练习、试卷和模块；恢复前会先校验并显示摘要，确认后才覆盖数据。
- 非法 JSON 或数据库写入失败不会破坏原有数据。
