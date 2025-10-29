---
layout: post
title: "自动删除 FG"
date: 2025-10-27
tags: [AI实战]
---
> FG 就是 feature gating，简单理解就是一堆 if-else，条件来自线上配置数据，主要是预防某个新特性上线后，存在质量问题，放一定比例的量观测线上情况用的；但是，FG 容易写，但懒得维护，一旦写上就没人想着删掉，导致代码里出现了很多很多 if-else ，并且还很可能嵌套。

这是一个很简单的场景，人力可以维护，但比较繁琐，用 AI 反而很高效了。

怎么个自动删除？

1. 先去平台上取数，看那些 FG key 已经全量或已经被删除；
2. 扫描仓库，用 [ag](https://github.com/ggreer/the_silver_searcher) 找到还在用这个 key 的代码文件；
3. 调用 LLM api，让 AI 删除这部分 IF-else 判断逻辑；
4. 自动提交代码，创建 PR，跑 CI，跑 test & build & ts check，看看有没有问题；
5. 人工 CR 通过后，合入

前面的 1-4 都做成自动化了，每天自动跑。

而且，现在的大模型（Claude sonnet 4.5, GPT-5-codex）效果会比使用 AST 做处理的效果好。

