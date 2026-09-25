# 我的技术笔记

个人博客，基于 **Hexo 8 + Fluid 主题**，部署在 **Cloudflare Pages**。

已经配好的东西：

- ✅ 数学公式（KaTeX **构建时**渲染，样式自托管，不依赖境外 CDN）
- ✅ 代码高亮（构建时生成，无 JS 也能看到配色）
- ✅ 文章同名图片文件夹（图片跟着文章走，迁移不丢图）
- ✅ 中文换行优化、全文搜索、RSS 订阅、站点地图、404 页面
- ✅ 响应式 + 深色模式（Fluid 自带）

---

## 一、开工前先改这 4 处

| 文件 | 改什么 |
| --- | --- |
| `_config.yml` | `author` 改成你的名字；`url` 改成部署后的真实网址 |
| `_config.fluid.yml` | `navbar.blog_title` 博客名、`index.slogan.text` 首页副标题、`about.name` |
| `source/about/index.md` | 自我介绍、GitHub、邮箱 |
| `_config.fluid.yml` | `about.icons` 里的 GitHub 链接 |

---

## 二、日常使用（三条命令）

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

打开 <http://localhost:4000>。改完保存刷新即可，**不用重启**。`Ctrl + C` 停止。

### 3. 发布

```bash
git add .
git commit -m "新增：文章标题"
git push
```

推送到 GitHub 后，Cloudflare Pages 自动构建发布，约 1 分钟。

---

## 三、文章怎么写

### Front-matter（每篇开头的配置块）

```yaml
---
title: 一阶 RC 低通滤波器实验记录
date: 2026-09-25 16:30:00
updated:                       # 可选，不填自动用文件修改时间
tags: [电路实验, 滤波器]        # 关键词，会出现在标签页
categories: [实验记录]          # 归属，会出现在分类页
description: 用示波器测 RC 电路的幅频特性，以及我踩的两个坑。
---
```

`description` 会用于 SEO 和首页摘要，建议写一句人话。

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

**不需要任何额外开关**，写完直接构建即可。

### 图片

图片放进**文章同名文件夹**，正文直接写文件名：

```markdown
![示波器波形](波形图.png)
```

> ⚠️ 注意：图片文件名建议用英文或数字（如 `waveform.png`），中文文件名在某些部署环境下会出现链接问题。

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
| **加粗** | `**加粗**` |
| *斜体* | `*斜体*` |
| ~~删除线~~ | `~~删除线~~` |
| 高亮 | `==高亮==` |
| 下标 | `H~2~O` |
| 上标 | `x^2^` |
| 表格 | 标准 Markdown 表格语法 |
| 任务列表 | `- [x] 已完成` |

---

## 四、首次部署到 Cloudflare Pages

### 第 1 步：推到 GitHub

在 GitHub 网页上新建一个仓库（**不要**勾选 Add README），名字比如 `my-blog`，然后：

```bash
git remote add origin https://github.com/你的用户名/my-blog.git
git branch -M main
git push -u origin main
```

### 第 2 步：连接 Cloudflare Pages

1. 打开 <https://dash.cloudflare.com/> → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选中刚才的仓库
3. 构建配置填：

   | 配置项 | 值 |
   | --- | --- |
   | Framework preset | `None` |
   | Build command | `npm run build` |
   | Build output directory | `public` |

4. 环境变量（**重要**，否则可能因为 Node 版本过低构建失败）：

   | 变量名 | 值 |
   | --- | --- |
   | `NODE_VERSION` | `22` |

5. 点 **Save and Deploy**，等 1～2 分钟

### 第 3 步：回头改 url

拿到 `https://xxx.pages.dev` 这个网址后，把 `_config.yml` 里的 `url` 改成它，再 push 一次。

> **为什么用 Cloudflare 而不是 Vercel / GitHub Pages？**
> Cloudflare 静态托管带宽不限、国内外访问都比较稳、绑自定义域名不需要备案；GitHub Pages 在国内访问经常不稳定；Vercel / Netlify 的免费额度规则这几年一直在收紧。

### 备选：GitHub Pages

如果只想用 GitHub 自带的 Pages，在仓库里新建 `.github/workflows/pages.yml`：

```yaml
name: Deploy Hexo to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npx hexo generate
      - uses: actions/upload-pages-artifact@v3
        with:
          path: public
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

然后在仓库 **Settings → Pages** 里把 Source 设为 **GitHub Actions**。

---

## 五、常用命令

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

## 六、想改外观

| 想改什么 | 改哪里 |
| --- | --- |
| 导航栏菜单、首页副标题、页脚 | `_config.fluid.yml` |
| 代码块样式 / 行号 / 复制按钮 | `_config.fluid.yml` → `code.highlight` |
| 主题色、字体、深色模式 | `_config.fluid.yml` → 自行添加 `color:`、`font:`、`dark_mode:` |
| 文章页目录、图片缩放、评论 | `_config.fluid.yml` → `post:` |
| 关于页头像和图标 | `_config.fluid.yml` → `about:`，头像图放 `source/img/avatar.png` |

主题完整配置项和中文文档：<https://hexo.fluid-dev.com/docs/guide/>
主题默认值一览（改之前先看这里）：`node_modules/hexo-theme-fluid/_config.yml`

> 代码块目前是**行号模式**。想要「复制按钮 + 语言标签」，把 `_config.fluid.yml` 里 `code.highlight.line_number` 改成 `false`（Fluid 目前这两个不能同时出现）。

---

## 七、目录结构

```
my-blog/
├── _config.yml              # 站点配置（标题、作者、网址、渲染器）
├── _config.fluid.yml        # 主题配置（只写覆盖项）
├── package.json             # 依赖和 npm 脚本
├── .nvmrc                   # 部署平台的 Node 版本
├── scaffolds/               # 新建文章的模板
├── source/
│   ├── _posts/              # ★ 你的文章都在这里
│   ├── about/index.md       # 关于页
│   ├── categories/index.md  # 分类页
│   ├── tags/index.md        # 标签页
│   └── css/                 # 自托管的 KaTeX 样式和字体
└── public/                  # 构建产物（已 gitignore，不用管）
```

---

## 八、遇到问题

**中文乱码 / 构建后文字变问号**
确保 Markdown 文件保存为 **UTF-8 无 BOM**。（VS Code 右下角可以看到编码。）

**改了配置没生效**
先 `npx hexo clean` 再 `npx hexo server`。

**公式没渲染出来**
检查是否写成了 `$...$`（美元符号），以及公式里的 `$` 是否成对。行内公式前后要有空格或标点，不能紧贴汉字。

**图片不显示**
确认图片放在**和文章同名的文件夹**里，且文件名没有中文和空格。

**Cloudflare 构建失败**
九成是 Node 版本：在 Pages 设置里加环境变量 `NODE_VERSION=22`。

**npm 安装报错**
删掉 `node_modules` 和 `package-lock.json`，重新 `npm install`。

---

## 九、几条经验

1. **先写内容，再折腾主题。** 换主题、调配色、加插件是最容易吸收时间又最没产出的行为。
2. **每周一篇 > 每天一篇。** 能坚持一年的低频率，远胜爆发一个月。
3. **内容永远是 Markdown。** 换框架、换平台时，复制文件夹就能搬走。
4. **图片别直接塞进 Git 仓库。** 截图先压缩，否则仓库会越来越大、构建会越来越慢。