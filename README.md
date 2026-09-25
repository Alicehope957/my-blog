# 我的技术笔记

个人博客，基于 **Hexo 8 + Fluid 主题**，通过 **Cloudflare Workers**（Git 集成自动构建）部署。

- 线上地址（临时）：<https://my-blog.1626788950.workers.dev>
- 仓库：<https://github.com/Alicehope957/my-blog>

> ⚠️ **这个临时域名在国内被 DNS 污染，需要代理才能访问。**
> 详见 [第四节](#四部署现状迁移到自定义域名)。绑上自己的域名后就能正常访问。

已经配好的东西：

* ✅ 数学公式（KaTeX **构建时**渲染，样式自托管，不依赖境外 CDN）
* ✅ 代码高亮（构建时生成，无 JS 也能看到配色）
* ✅ 文章同名图片文件夹（图片跟着文章走，迁移不丢图）
* ✅ 中文换行优化、全文搜索、RSS 订阅、站点地图、404 页面
* ✅ 响应式 + 深色模式（Fluid 自带）

---

## 一、开工前先改这几处

| 文件 | 改什么 |
| --- | --- |
| `_config.yml` | `author`（已填 `泠@RinOo`）；`url` 换成最终域名 |
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

> 上面的 `source/_posts/` 是真实目录名，Markdown 里的下划线不用加反斜杠转义。

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

推送到 GitHub 后，Cloudflare 自动构建发布，约 1 分钟。

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

**不需要任何额外开关**，写完直接构建即可。公式里的反斜杠原样写，不要写成双反斜杠。

### 图片

图片放进**文章同名文件夹**，正文直接写文件名：

```markdown
![示波器波形](波形图.png)
```

> ⚠️ 图片文件名建议用英文或数字（如 `waveform.png`），中文文件名在某些部署环境下会出现链接问题。

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

## 四、部署现状：迁移到自定义域名

### 现在的情况

站点是以 **Cloudflare Worker** 的形式部署的（不是 Pages），所以拿到的是：

```
my-blog.1626788950.workers.dev
└─┬──┘ └────┬─────┘
Worker 名   你账号的 workers.dev 子域名
```

Cloudflare [官方文档](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)明确建议：`workers.dev` 只是给个人项目快速试用的（被归类为 "Free website"），**正式站点应该跑在 custom domain 上**。

### 为什么必须换掉

在国内网络上解析 `workers.dev` 会拿到被污染的假 IP。本机实测：

| 解析方式 | 结果 |
| --- | --- |
| 系统默认 DNS | `199.59.150.39` |
| 8.8.8.8 | `199.59.150.43` |
| 1.1.1.1 | `104.244.46.52` |
| 对照：`developers.cloudflare.com` | `104.16.2.189` 等（正常的 Cloudflare 段） |

四个答案互不相同，且**全部不在 Cloudflare 的 IP 段**（Cloudflare 是 `104.16.x.x` / `172.67.x.x` / `188.114.x.x`）。这就是 DNS 污染，所以不开代理根本打不开。

### 迁移步骤

**第 1 步：买域名**（约 ¥60/年）

- **Cloudflare Registrar**：成本价、续费不涨价、不用实名 ← 最省事
- Namecheap / Porkbun：也可以
- 国内注册商（阿里云、腾讯云）：可以，但必须**实名认证**

**第 2 步：把域名接入 Cloudflare**

1. <https://dash.cloudflare.com/> → **Add a site** → 输入域名 → 选 **Free** 计划
2. 到域名注册商后台，把 **NS（名称服务器）** 改成 Cloudflare 给你的两个地址
3. 等生效（通常几分钟到几小时）

> 这一步不能跳过：Custom Domain 只能建在**你自己 Cloudflare 账号下的 zone** 上。

**第 3 步：绑到 Worker**

1. **Workers & Pages** → 选中你的 Worker
2. **Settings → Domains & Routes → Add → Custom Domain**
3. 填 `blog.你的域名.com`（或直接 `你的域名.com`）→ **Add Custom Domain**
4. Cloudflare 会自动创建 DNS 记录并签发证书，等 1～2 分钟

**第 4 步：改配置并推送**

```yaml
# _config.yml
url: https://blog.你的域名.com
```

```bash
git add .
git commit -m "绑定自定义域名"
git push
```

`url` 决定 canonical、sitemap、RSS 里的绝对链接，不改会导致搜索引擎收录错误地址。

**第 5 步（建议）：关掉 workers.dev**

Worker → **Settings → Domains & Routes** → `workers.dev` 那一行点 **Disable**。
避免同一份内容有两个可访问地址，被搜索引擎当成重复内容。

### 几个要注意的点

- **不需要备案。** Cloudflare 走海外节点，跟 ICP 备案无关。只有把域名解析到**中国大陆境内服务器**时才需要备案。
- **`你的域名.com` 和 `www.你的域名.com` 是两个独立主机名。** Custom Domain 不支持通配符，只能精确匹配；两个都要用的话，另一个要单独加一条重定向规则。
- **不能建在已有 CNAME 记录的主机名上。** 如果之前手动加过 DNS 记录，先删掉。
- **国内速度仍不保证满速。** 自定义域名躲开了 `workers.dev` 的污染，但 Cloudflare 免费版国内线路偶尔绕路，速度有波动是正常的。
- 如果绑了自定义域名后国内还是打不开，说明域名被针对性污染了，那就得换域名或者上国内方案。

### 关于构建配置

这个仓库里**没有** wrangler 配置文件 —— 你的部署用的是 Cloudflare 的 Git 集成，构建配置存在 Cloudflare 后台，不在代码里。如果哪天需要重配，参数是：

| 配置项 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `public` |
| 环境变量 `NODE_VERSION` | `22` |

### 备选：彻底解决国内访问

如果将来想让国内访问又快又稳，只有一条路：**国内对象存储 / OSS + CDN + 备案域名**。

- 成本：域名约 ¥60/年 + 存储和 CDN 每月几块钱
- 代价：要走 ICP 备案流程（个人可备案，但需要时间）
- 结论：大一阶段没必要，先用 Cloudflare + 自定义域名观察一段时间

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

**网站打不开 / 需要代理**
见第四节。`workers.dev` 在国内被污染，绑自定义域名解决。

**中文乱码 / 构建后文字变问号**
确保 Markdown 文件保存为 **UTF-8 无 BOM**。（VS Code 右下角可以看到编码。）

**改了配置没生效**
先 `npx hexo clean` 再 `npx hexo server`。

**公式没渲染出来**
检查是否写成了 `$...$`（美元符号），以及公式里的 `$` 是否成对。行内公式前后要有空格或标点，不能紧贴汉字。

**图片不显示**
确认图片放在**和文章同名的文件夹**里，且文件名没有中文和空格。

**Cloudflare 构建失败**
九成是 Node 版本：确认环境变量里有 `NODE_VERSION=22`。

**npm 安装报错**
删掉 `node_modules` 和 `package-lock.json`，重新 `npm install`。

**注意：不要让 Markdown 格式化工具处理本文件**
有些格式化器会把 `` `_config.yml` `` 转义成 `` `\_config.yml` ``、把 `---` 转义成 `\---`、把公式转义成 `$f\_c = \\dfrac{...}$`。这些反斜杠会被原样显示出来，公式也会失效。本仓库的 `.editorconfig` / 编辑器设置里应关掉这类自动转义。

---

## 九、几条经验

1. **先写内容，再折腾主题。** 换主题、调配色、加插件是最容易吸收时间又最没产出的行为。
2. **每周一篇 > 每天一篇。** 能坚持一年的低频率，远胜爆发一个月。
3. **内容永远是 Markdown。** 换框架、换平台时，复制文件夹就能搬走。
4. **图片别直接塞进 Git 仓库。** 截图先压缩，否则仓库会越来越大、构建会越来越慢。