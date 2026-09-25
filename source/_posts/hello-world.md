---
title: 开博第一篇：这个博客写什么，怎么写
date: 2026-09-25 16:30:00
tags: [博客, 使用说明, Markdown]
categories: [站务]
description: 博客上线了。这篇先讲清楚三件事：写什么、怎么发下一篇、常用语法速查。
---

博客搭好了。与其写一篇 "Hello World"，不如把这篇当成我自己的使用说明书 —— 以后忘了怎么写公式、怎么放图片，翻回来看这篇就行。

<!-- more -->

## 一、这个博客写什么

作为电子信息工程的学生，我打算主要记四类内容：

| 类型 | 具体内容 | 为什么值得写 |
| --- | --- | --- |
| 课程笔记 | 高数、线代、信号与系统、模电、数电 | 期末复习直接用，比抄一遍笔记效率高 |
| 实验记录 | 示波器、Multisim、Keil、STM32 | 踩过的坑下次不用再踩 |
| 项目日志 | 电赛、大创、单片机项目 | 面试时能讲出细节 |
| 复盘总结 | 失败原因、低效的原因 | 最值钱，但最难坚持 |

## 二、怎么发下一篇

在博客根目录打开终端（VS Code 菜单：**终端 → 新建终端**），运行：

```bash
npx hexo new "文章标题"
```

Hexo 会在 `source/_posts/` 下生成一个 Markdown 文件，还会自动建一个同名文件夹专门放这篇文章的图片。

写完保存，本地预览：

```bash
npx hexo server
```

浏览器打开 http://localhost:4000 就能看到效果。确认没问题后提交到 GitHub，Cloudflare Pages 会自动重新构建（大约 1 分钟）。

## 三、常用语法速查

### 数学公式

行内公式用单个美元符号，比如一阶 RC 低通滤波器的截止频率 $f_c = \dfrac{1}{2\pi RC}$。

独立成行的公式用两个美元符号：

$$
H(j\omega) = \frac{1}{1 + j\omega RC},
\qquad
|H(j\omega)| = \frac{1}{\sqrt{1 + (\omega RC)^2}}
$$

傅里叶变换这种也没问题：

$$
X(j\omega) = \int_{-\infty}^{+\infty} x(t)\, e^{-j\omega t} \, dt
$$

> 公式是**构建时**用 KaTeX 渲染成 HTML 的，不依赖外部 CDN，所以没网也能正常显示。

### 代码

标注语言就会自动高亮：

```c
// STM32 点灯：让 PA5 输出高电平
#include "stm32f10x.h"

int main(void) {
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;   // 使能 GPIOA 时钟
    GPIOA->CRL &= ~(0xF << 20);           // 清空 PA5 的配置位
    GPIOA->CRL |=  (0x3 << 20);           // 推挽输出，50MHz
    while (1) {
        GPIOA->BSRR = GPIO_BSRR_BS5;      // PA5 = 1
    }
}
```

Python 也一样：

```python
import numpy as np
import matplotlib.pyplot as plt

fs, T = 1000, 0.1
t = np.arange(0, T, 1 / fs)
x = np.sin(2 * np.pi * 50 * t) + 0.3 * np.random.randn(len(t))

plt.plot(t, x)
plt.xlabel("t / s")
plt.show()
```

### 图片

图片放在**文章同名文件夹**里，正文直接写文件名：

```
source/_posts/
├── hello-world.md
└── hello-world/
    └── 波形图.png        ← 图片放这里
```

然后在正文里：

```markdown
![示波器波形](波形图.png)
```

这样图片跟着文章走，以后迁移博客不会丢。

### 其他常用写法

- **加粗**、*斜体*、~~删除线~~、==文字高亮==
- 下标 H~2~O，上标 x^2^
- 行内代码用反引号包起来，比如 `GPIOA->BSRR`
- 引用：

> 记录的意义不在于好看，而在于半年后你还能看懂自己当时在想什么。

- 任务列表：

- [x] 把博客搭起来
- [ ] 写满 10 篇文章
- [ ] 绑定自己的域名

## 四、接下来

先把内容写起来。主题、配色、插件这些，等写满 20 篇再说 —— 那些是最容易把时间吸走、又最没产出的东西。

---

写下去，比写得好重要。