# 性压抑指数计算器 (Sexual Repression Index Calculator)

🧠 **基于科学研究的专业性心理健康评估工具**

## 项目概述

性压抑指数计算器是一个基于多个经过验证的心理测量量表的专业评估工具，帮助用户科学地了解自己的性心理特征，促进性健康和亲密关系的发展。

### ✨ 核心特性

- 🔬 **科学可靠**: 基于SIS/SES、Mosher性内疚、KISS-9、SOS等国际认可量表
- ⚡ **双版本支持**: 快测版(39题，5-8分钟) + 完整版(117题，25-40分钟)
- 📊 **专业分析**: 四维度分析 + SRI指数(0-100) + 个性化建议
- 🔒 **隐私保护**: 测评答案本地处理；付费解锁仅发送支付会话信息
- 💳 **付费解锁**: 支持 Stripe Checkout 解锁完整报告
- 📱 **现代化UI**: 响应式设计，支持所有设备
- 💾 **数据管理**: 历史记录、数据导出、自动保存
- 🔗 **社交分享**: 多平台分享、智能文案、二维码生成

## 🚀 快速开始

### 环境要求

- Node.js >= 22.0.0
- 现代浏览器支持

### 安装和运行

```bash
# 克隆项目
git clone [project-url]
cd sexual-repression-index-calculator

# 安装依赖
npm install

# 注意：如果在 `npm install` 过程中遇到 `date-fns` 和 `react-day-picker` 的依赖冲突，请尝试将 `package.json` 中的 `date-fns` 版本降级到 `^3.0.0`。
# 注意：如果在 `npm install` 过程中遇到 `react` 和 `react-day-picker` 的依赖冲突，请尝试将 `package.json` 中的 `react` 和 `react-dom` 版本降级到 `^18.2.0`，同时将 `@types/react` 和 `@types/react-dom` 更新到 `^18.2.82` 和 `^18.2.25`。

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### 访问应用

- 开发环境: http://localhost:3000
- 生产环境: 根据部署配置

### Stripe 完整报告解锁

结果页保留免费基础结果，并通过 Stripe Checkout 解锁完整报告。问卷回答和人口学信息仍保存在用户本地浏览器；支付流程只使用评估会话 ID 作为 Stripe metadata/client reference，用于付款后回到当前浏览器校验解锁。

在 Vercel 环境变量中配置：

```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_FULL_REPORT_PRICE_ID=price_xxx
PUBLIC_SRI_REPORT_PRICE_LABEL=￥9.9
PUBLIC_SITE_URL=https://your-domain.example
```

`STRIPE_SECRET_KEY` 必须配置到实际运行支付接口的环境。生产域名使用
Production；`dev` 分支和 `dev.sri.kuhung.me` 使用 Preview，并建议将变量限定到
`dev` 分支。`PUBLIC_SITE_URL` 也应按环境分别配置；未配置时，接口会使用当前请求域名
生成 Stripe 的成功和取消回跳地址。

如果不使用 `STRIPE_FULL_REPORT_PRICE_ID`，接口会使用以下变量动态创建 Checkout line item：

```bash
STRIPE_REPORT_PRICE_AMOUNT=990
STRIPE_REPORT_PRICE_CURRENCY=cny
STRIPE_REPORT_PRODUCT_NAME=SRI Full Report
```

Stripe Dashboard 建议：

- 品牌/商户展示名使用 `Kuhung Lab` 或 `SRI Calculator`
- 商品名使用 `SRI Full Report`
- 账单描述使用 `KUHUNG LAB` 或 `SRI REPORT`，避免在银行卡账单中暴露敏感主题
- 在 Public business details 中配置：
  - Terms of service URL: `https://your-domain.example/terms`
  - Privacy policy URL: `https://your-domain.example/privacy`
  - Refund policy URL: `https://your-domain.example/refunds`
  - Support/contact URL: `https://kuhung.me/about` 或你的专用支持邮箱/页面
- 当前 Checkout Session 会要求用户勾选服务条款；如果 Stripe Dashboard 没有有效的 Terms of service URL，创建 Checkout Session 可能失败。

#### 支付漏斗埋点

支付链路使用 Vercel Web Analytics Custom Events，按以下顺序分析转化：

| 事件 | 触发位置 | 含义 |
| --- | --- | --- |
| `Checkout Intent` | 浏览器 | 用户点击支付解锁 |
| `Checkout Created` | 服务端 | Stripe Checkout Session 创建成功 |
| `Checkout Failed` / `Checkout Client Failed` | 服务端 / 浏览器 | 创建 Session 或请求链路失败 |
| `Checkout Cancelled` | 浏览器 | 用户从 Stripe 取消并返回 |
| `Payment Verified` | 服务端 | Stripe 确认订单已支付 |
| `Payment Verification Pending` / `Payment Verification Failed` | 服务端 | 支付尚未完成或校验失败 |
| `Report Unlocked` / `Report Unlock Failed` | 浏览器 | 当前浏览器完成或未能完成报告解锁 |

事件属性仅包含商品、支付模式、评估类型、金额、币种、环境和标准化错误分类。
禁止发送评估会话 ID、Stripe Checkout Session ID、邮箱、人口学信息、问卷回答或原始错误文本。

## 📋 功能说明

### 评估版本

#### 🏃‍♂️ 快测版 (推荐)
- **时长**: 5-8分钟
- **题目**: 39题
- **量表**: SIS/SES-SF(14) + Mosher性内疚(10) + KISS-9(9) + SOS筛查(5)
- **适用**: 初次使用、快速了解

#### 🎯 完整版
- **时长**: 25-40分钟
- **题目**: 117题
- **量表**: 完整版SIS/SES(45) + 完整Mosher(28) + KISS-9(9) + 完整SOS(21) + BSAS(23)
- **适用**: 深入分析、专业咨询

### 核心算法

#### SRI指数计算
```
SRI = Σ(标准化维度分数) → 0-100映射
四维度: SOS反向 + 性内疚 + 性羞耻 + SIS优势
```

#### 等级划分
- 很低 (0-20): 较少压抑
- 偏低 (20-40): 轻度压抑
- 中等 (40-60): 中度压抑
- 偏高 (60-80): 较高压抑
- 很高 (80-100): 高度压抑

## 🏗️ 技术架构

### 前端技术栈

- **框架**: React 19 + TypeScript
- **路由**: React Router v7
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Query + React Hooks
- **图表**: Recharts
- **表单**: React Hook Form + Zod
- **图标**: Lucide React

### 后端技术栈

- **支付接口**: Vercel API Functions + Stripe Checkout
- **运行时**: Deno Edge Function / Vercel Serverless Functions
- **框架**: Hono.js + zValidator
- **数据验证**: Zod
- **构建工具**: Rsbuild

### 数据架构

```
用户数据流:
知情同意 → 人口学信息 → 问卷评估 → 结果计算 → 本地存储
                                    ↓
                        历史记录 ← 数据导出
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── assessment/      # 评估相关组件
│   ├── common/         # 通用组件
│   └── ui/             # shadcn/ui组件
├── pages/              # 页面组件
├── lib/                # 工具库
│   ├── scales/         # 量表定义
│   ├── calculator/     # 计算引擎
│   └── storage/        # 存储管理
├── types/              # TypeScript类型
├── server/             # 服务端代码
└── styles/             # 样式文件
```

## 🔒 隐私保护

### 数据安全承诺

- ✅ **本地处理**: 问卷回答和测评结果在客户端处理，不上传服务器
- ✅ **支付隔离**: Stripe 解锁流程不上传问卷回答，仅校验付款会话
- ✅ **匿名化**: 导出数据完全匿名化处理
- ✅ **用户控制**: 用户拥有完全的数据控制权
- ✅ **安全清理**: 提供安全的数据删除功能
- ✅ **透明度**: 开源代码，完全透明

### 数据存储

- **位置**: 浏览器 localStorage
- **内容**: 评估回答、结果分析、人口学信息
- **加密**: 客户端存储，无需加密传输
- **清理**: 用户可随时完全删除

## 📊 科学依据

### 量表来源

1. **SIS/SES**: Janssen等人的双控制模型量表
2. **Mosher性内疚**: 经典性内疚测量工具
3. **KISS-9**: Kyle等人的性羞耻量表
4. **SOS**: Fisher等人的性观感调查
5. **BSAS**: Hendrick等人的性态度量表

### 信效度

- 所有量表均经过严格的心理测量学验证
- 具有良好的内部一致性和重测信度
- 在多个文化背景下得到验证

## 🛠️ 开发指南

### 代码风格

- TypeScript严格模式
- ESLint + Prettier格式化
- 组件化设计原则
- 函数式编程优先

### 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 发起Pull Request

### 测试

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建测试
npm run build
```

## 📖 使用指南

### 开始评估

1. 访问主页选择评估版本
2. 仔细阅读知情同意书
3. 填写基本人口学信息
4. 按照指引完成问卷
5. 查看详细结果分析

### 结果解读

- **SRI指数**: 综合性压抑程度(0-100)
- **四维度分析**: 具体问题领域识别
- **个性化建议**: 基于结果的改善建议
- **非诊断性**: 仅供自我了解，不替代专业诊断

## ⚠️ 重要声明

- 本工具仅供教育和自我了解使用
- 不能替代专业心理健康服务
- 如有严重心理健康问题，请寻求专业帮助
- 评估结果不构成医学诊断

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 支持

如果您觉得这个项目有帮助，请给我们一个 ⭐️

---

**性压抑指数计算器** - 让科学研究服务于个人成长和性健康发展
