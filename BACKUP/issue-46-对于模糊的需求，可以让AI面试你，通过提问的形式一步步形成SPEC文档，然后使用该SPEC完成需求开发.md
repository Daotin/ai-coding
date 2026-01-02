---
layout: post
title: "对于模糊的需求，可以让 AI 面试你，通过提问的形式一步步形成 SPEC 文档，然后使用该 SPEC 完成需求开发"
date: 2026-01-02
tags: [AI思考]
---
在 Claude Code 中可以使用 `AskUserQuestionTool` 工具来完善你的需求。

提示词：

```
请阅读这份 @SPEC.md 文件，并使用 AskUserQuestionTool 针对任何方面对我进行详细访谈：包括技术实现、UI 与 UX（用户界面与体验）、潜在疑虑、权衡取舍等，但请确保提出的问题不是那种显而易见的问题。请保持极高的深度，并持续对我进行访谈，直到内容完整为止，最后再将规范说明（Spec）写入该文件中。
```

适用场景：这个方法特别适合想法还比较模糊，需要帮助梳理的项目，或者涉及较多细节和交互的应用。

其他工具比如 Cursor 中，虽然没有 AskUserQuestionTool ，但是可以采用类似的提示词，让 AI 帮你完善 SPEC文档。


参考文档：https://www.atcyrus.com/stories/claude-code-ask-user-question-tool-guide
