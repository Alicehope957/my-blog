# 我的技术笔记

个人博客，基于 **Hexo 8 + Fluid 主题**，部署在 **Cloudflare Pages**（Git 集成自动构建）。

- 线上地址：<https://rin3water.pages.dev> ✅ 已上线，国内不用代理也能打开
- 仓库：<https://github.com/Alicehope957/my-blog>

> ℹ️ 最早部署的 `my-blog.1626788950.workers.dev` 在国内被 DNS 污染、不开代理打不开，
> 改用 Cloudflare Pages 并把项目名改成 `rin3water` 才解决。详见[第四节](#四部署cloudflare-pages)。

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

## 四、部署：Cloudflare Pages

### 网址

```
https://rin3water.pages.dev
```

> **Pages 的项目名是全球唯一的**，直接决定网址。
> 一开始想用 `my-blog`，但已经被别人占了（DNS 能解析出 IP，就说明那里有项目），所以改成了 `rin3water`。
> 以后再改名，记得同步改 `_config.yml` 里的 `url`。

### 为什么不用 Workers

最早部署成了 Cloudflare **Worker**，拿到的是 `my-blog.1626788950.workers.dev`。这个域名在国内被 DNS 污染，不开代理根本打不开。本机实测：

| 域名 | DNS 解析 | 结果 |
| --- | --- | --- |
| `my-blog.1626788950.workers.dev` | `199.59.150.39`、`208.43.170.231` 等（每次不同，全都不在 Cloudflare 段） | ❌ 打不开 |
| `rin3water.pages.dev` | Cloudflare 段（`172.66.x.x`） | ✅ 实测可访问 |
| `developers.cloudflare.com`（对照） | `104.16.x.189` | ✅ |

`workers.dev` 和 `pages.dev` 都是 Cloudflare 的免费域名，但在国内的待遇完全不一样。而且 Cloudflare [官方文档](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)也明确说 `workers.dev` 只适合个人项目快速试用，正式站点应该用 custom domain。

### 建立 Pages 项目（网页操作）

1. 打开 <https://dash.cloudflare.com/> → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选中仓库 `Alicehope957/my-blog`
3. **Project name** 填 `rin3water` —— 这个名字决定最终网址，必须全球唯一
4. 构建配置：

   | 配置项 | 值 |
   | --- | --- |
   | Framework preset | `None` |
   | Build command | `npm run build` |
   | Build output directory | `public` |

5. **环境变量**（不填可能因为 Node 版本过低构建失败）：

   | 变量名 | 值 |
   | --- | --- |
   | `NODE_VERSION` | `22` |

6. 点 **Save and Deploy**，等 1～2 分钟

### 部署成功后

1. **删掉旧的 Worker**：Workers & Pages → 选中那个 Worker → Settings → 拉到最底部 **Delete**。
   不然同一份内容会有两个地址。
2. `_config.yml` 里的 `url` 要写成 `https://rin3water.pages.dev` —— 注意是**两个斜杠**。
   写成一个斜杠（`https:/...`）虽然 Hexo 内部会容错、表面看不出来，但属于错误配置，迟早出问题。
3. 以后每次 `git push`，Cloudflare 都会自动重新构建，约 1 分钟。

### 以后想绑自定义域名（可选）

Pages 项目 → **Custom domains** → **Set up a custom domain** → 填域名。

前提是：

1. 买域名（约 ¥60/年；Cloudflare Registrar 成本价、不用实名，最省事）
2. **先把域名接入 Cloudflare**（Add a site，然后到注册商处把 NS 改成 Cloudflare 的地址）
   —— 自定义域名只能建在你自己账号下的 zone 上

注意：

- **不需要备案。** Cloudflare 走海外节点，跟 ICP 备案无关；只有解析到中国大陆境内服务器时才需要。
- `你的域名.com` 和 `www.你的域名.com` 是两个独立主机名，要分别添加，另一个再加一条重定向规则。
- 绑完记得把 `_config.yml` 的 `url` 一起改掉，否则 sitemap 和 canonical 还指向旧地址。

### 如果 pages.dev 哪天也不好使了

备选方案（都是免费的）：

- **GitHub Pages**：<https://alicehope957.github.io>。实测这台机器上打得开（DNS 没被污染），但要求把仓库改名为 `Alicehope957.github.io`，且国内速度一般。
- **腾讯 EdgeOne Pages**：<https://pages.edgeone.ai/>。国产、免费、国内访问快，有现成的 Hexo 部署教程。
- **国内 OSS + CDN + 备案域名**：最稳，但要走备案流程，大一阶段没必要。

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
├── scripts/                 # ★ 构建自检：有页面生成失败就让构建报错（见第八节）
├── source/
│   ├── _posts/              # ★ 你的文章都在这里
│   ├── about/index.md       # 关于页
│   ├── categories/index.md  # 分类页（Fluid 主题本身也会生成，留着也无妨）
│   ├── tags/index.md        # 标签页（同上）
│   └── css/                 # 自托管样式：katex.min.css + fonts/ + custom.css
└── public/                  # 构建产物（已 gitignore，不用管）
```

---

## 八、遇到问题

**网站打不开 / 需要代理**
见第四节。旧的 `workers.dev` 域名在国内被 DNS 污染，改用 `pages.dev` 即可。

**中文乱码 / 构建后文字变问号**
确保 Markdown 文件保存为 **UTF-8 无 BOM**。（VS Code 右下角可以看到编码。）

**改了配置没生效**
先 `npx hexo clean` 再 `npx hexo server`。

**公式没渲染出来**
检查是否写成了 `$...$`（美元符号），以及公式里的 `$` 是否成对。行内公式前后要有空格或标点，不能紧贴汉字。

**图片不显示**
确认图片放在**和文章同名的文件夹**里，且文件名没有中文和空格。

**改了内容、push 了、Cloudflare 也说构建成功，但网站没更新**

先在页面地址后面加个随机参数刷新，绕过 CDN 缓存（比如 `/about/?v=123`）。
如果变成 **404**，基本可以确定是那个文件的 **front-matter 被破坏了**：
第 1 行的 `---` 被转义成了 `\---`，或者文件开头多了 BOM / 空行。

后果很阴险：Hexo 只在日志里打一行 ERROR，**退出码依然是 0**，
所以 Cloudflare 显示「构建成功」，但那个页面根本没生成 ——
线上要么 404，要么你看到的是 CDN 缓存的旧页面。

**怎么定位**：本地跑一次构建，自检会直接点名坏掉的文件：

```bash
npm run build
```

会看到类似输出：

```
[构建自检失败] 构建有问题，已阻止部署。
Hexo 处理这些文件时出错了（它们的内容不会出现在网站上）：
  ✗ about/index.md
```

`scripts/check-pages.js` 就是干这个的：它拦截 Hexo 的 `Process failed` 日志并让构建
**真正失败**，所以以后在 Cloudflare 上会看到红色的构建失败 —— 那是它在正常工作，
不要慌，按日志改掉对应文件即可。

**Cloudflare 构建失败**
九成是 Node 版本：确认环境变量里有 `NODE_VERSION=22`。

**npm 安装报错**
删掉 `node_modules` 和 `package-lock.json`，重新 `npm install`。

**别用系统默认查看器或 Markdown 预览器编辑这些 .md 文件**

已经踩过两次坑了：某些查看器 / 格式化器会自动「帮你转义」，把 `` `_config.yml` ``
写成 `` `\_config.yml` ``、把 front-matter 的 `---` 写成 `\---`、把 `[链接]` 写成 `\[链接]`。
轻则页面上多出一堆反斜杠，重则整个页面被 Hexo 跳过、线上直接 404。

建议：用 **VS Code** 打开这些文件，并把 Windows 里 `.md` 的默认打开方式改成 VS Code。
装 `Markdown All in One` 就够用了，不要装会自动 format 的插件。

---

## 九、几条经验

1. **先写内容，再折腾主题。** 换主题、调配色、加插件是最容易吸收时间又最没产出的行为。
2. **每周一篇 > 每天一篇。** 能坚持一年的低频率，远胜爆发一个月。
3. **内容永远是 Markdown。** 换框架、换平台时，复制文件夹就能搬走。
4. **图片别直接塞进 Git 仓库。** 截图先压缩，否则仓库会越来越大、构建会越来越慢。