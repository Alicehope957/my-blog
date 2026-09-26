# 使用提醒~

个人博客，基于 **Hexo 8 + Fluid 主题**，部署在 **Cloudflare Pages**。

- 线上地址：<https://rin3water.pages.dev>
- 仓库：<https://github.com/Alicehope957/my-blog>

已配置：

* 数学公式
* 代码高亮
* 图片文件夹跟随文章名
* 中文换行优化、全文搜索、RSS 订阅、站点地图、404 页面
* 响应式 + 深色模式

---
## 使用命令

### 1. 新建文章

```bash
npx hexo new "文章标题"
```

会生成两个东西：

```
source/_posts/
├── 文章标题.md        ← 正文写这里
└── 文章标题/          ← 这篇的图片放这里
```

### 2. 本地预览

```bash
npx hexo server
```

打开 <http://localhost:4000>。改完保存刷新即可。`Ctrl + C` 停止。

### 3. 发布

```bash
git add .
git commit -m "新增：文章标题"
git push
```

Push到 GitHub 后，Cloudflare 自动构建发布。

---

## 文章格式

### Front-matter（每篇开头配置块）

```yaml
---
title: 一阶 RC 低通滤波器实验记录
date: 2026-09-25 16:30:00
updated:                       # 可选，不填自动用文件修改时间
tags: [电路实验, 滤波器]        # 关键词，会出现在标签页
categories: [实验记录]          # 归属，会出现在分类页
description: 用示波器测 RC 电路的幅频特性。
---
```

`description` 会用于 SEO 和首页摘要。

### 摘要

在正文里插入这一行，它**上面**的内容就会作为首页摘要：

```markdown
<!-- more -->
```

### 数学公式

行内用单个美元符号：截止频率 $f_c = \dfrac{1}{2\pi RC}$

独立成行用两个美元符号：

$$
H(j\omega) = \frac{1}{1 + j\omega RC}
$$

### 图片

图片放进**文章同名文件夹**，正文直接写文件名：

```markdown
![示波器波形](波形图.png)
```

> 图片文件名建议用英文或数字（如 `waveform.png`）。

### 代码

标注语言就会自动高亮：

````markdown
```c
GPIOA->BSRR = GPIO_BSRR_BS5;
```
````

### 其他语法

| 效果 | 写法 |
| --- | --- |
| 加粗 | `**加粗**` |
| 斜体 | `*斜体*` |
| 删除线 | `~~删除线~~` |
| 高亮 | `==高亮==` |
| 下标 | `H~2~O` |
| 上标 | `x^2^` |
| 表格 | 标准 Markdown 表格语法 |
| 任务列表 | `- [x] 已完成` |

---

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npx hexo new "标题"` | 新建文章 |
| `npx hexo new draft "标题"` | 新建草稿（不会发布） |
| `npx hexo publish "标题"` | 把草稿转成正式文章 |
| `npx hexo server` | 本地预览 <http://localhost:4000> |
| `npx hexo clean` | 清理缓存（改配置后建议执行） |
| `npx hexo generate` | 只构建，不启动服务器 |

也可以简写：`npm run new -- "标题"`、`npm run server`、`npm run build`、`npm run clean`。

---

## 改外观

| 改什么 | 改哪里 |
| --- | --- |
| 导航栏菜单、首页副标题、页脚 | `_config.fluid.yml` |
| 代码块样式 / 行号 / 复制按钮 | `_config.fluid.yml` → `code.highlight` |
| 主题色、字体、深色模式 | `_config.fluid.yml` → 自行添加 `color:`、`font:`、`dark_mode:` |
| 文章页目录、图片缩放、评论 | `_config.fluid.yml` → `post:` |
| 关于页头像和图标 | `_config.fluid.yml` → `about:`，头像图放 `source/img/avatar.png` |

主题完整配置项和中文文档：<https://hexo.fluid-dev.com/docs/guide/>

主题默认值一览：`node_modules/hexo-theme-fluid/_config.yml`

> 代码块目前是**行号模式**。想要「复制按钮 + 语言标签」，把 `_config.fluid.yml` 里 `code.highlight.line_number` 改成 `false`（Fluid 目前这两个不能同时出现）。

---

## 目录结构

```
my-blog/
├── _config.yml              # 站点配置（标题、作者、网址、渲染器）
├── _config.fluid.yml        # 主题配置（只写覆盖项）
├── package.json             # 依赖和 npm 脚本
├── .nvmrc                   # 部署平台的 Node 版本
├── scaffolds/               # 新建文章的模板
├── scripts/                 # ★ 构建自检
├── source/
│   ├── _posts/              # ★ 文章都在这里
│   ├── about/index.md       # 关于页
│   ├── categories/index.md  # 分类页（Fluid 主题本身也会生成）
│   ├── tags/index.md        # 标签页（同上）
│   └── css/                 # 自托管样式：katex.min.css + fonts/ + custom.css
└── public/                  # 构建产物（已 gitignore）
```

---

## 遇到问题

**改了配置没生效**
先 `npx hexo clean` 再 `npx hexo server`。

**公式没渲染出来**
检查是否写成了 `$...$`（美元符号），以及公式里的 `$` 是否成对。行内公式前后要有空格或标点，不能紧贴汉字。

**图片不显示**
确认图片放在**和文章同名的文件夹**里，且不要使用中文文件名。

**npm 安装报错**
删掉 `node_modules` 和 `package-lock.json`，重新 `npm install`。
