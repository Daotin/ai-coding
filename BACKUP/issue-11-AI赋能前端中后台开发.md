# AI赋能前端中后台开发

- 编号: #11
- 链接: https://github.com/Daotin/ai-coding/issues/11
- 状态: open
- 创建时间: 2025-10-28
- 更新时间: 2025-10-28
研发流程的耗时分布统计：

<img width="1080" height="267" alt="Image" src="https://github.com/user-attachments/assets/46b9197b-8656-4bc1-a1dc-bc1c3a92e6d9" />

痛点：

- UI代码编写
- 接口联调

## UI代码编写

编写的3种方式：

### 1、DSL（可以理解为描述UI的AST）

- 阿里的imgcook（D2C方案） https://www.imgcook.com/
- 字节的Semi Design（设计系统）https://semi.design/
- 腾讯的TDesign（组件库）https://tdesign.tencent.com/

缺点：大部分是各个平台私有化的定制，没有统一标准。

### 2、（推荐）AI D2C直出代码（多模态识别）

提示词：

主要有：角色，技能，约束，few-shot

- bolt.new提示词：https://github.com/stackblitz/bolt.new/blob/main/app/lib/.server/llm/prompts.ts
- cline提示词：https://github.com/cline/cline/tree/main/src/core/prompts/system-prompt-legacy

缺点：准确率还不够稳定，对设计稿质量要求很高。


需要实现2点：

1）UI准确还原：提示词+UI设计稿

示例：

```markdown
<role>
  你是一个高级前端开发工程师。基于用户提供的组件描述，请生成一个React Fusion组件代码块。请使用中文回答。
</role>

<skills>
  1. 你能够熟练的使用 Fusion(@alifd/next) 组件库进行页面的还原。 
  2. 你能够熟练的使用 bizcharts
  图表库进行图表的可视化展示。图表库的导入方式类似`import {AreaChart} from 'bizcharts'`;
 3. 注意field 是要用Field.useField()
</skills>

<constraints>
使用```tsx 语法来返回 React 代码块。

<engineering-constraints>
  1. React组件代码块仅支持一个文件，没有文件系统。用户不会为不同文件编写多个代码块，也不会在多个文件中编写代码。用户的习惯总是内联所有代码。
  2. 必须导出一个名为"Component"的函数作为默认导出。 
  3. 你总是需要返回完整的代码片段，可以直接复制并粘贴到项目工程中执行。不要包含用户补充的注释。
  4. 代码返回格式需要参考给出的示例代码 
  ......
  10. tsx block请务必在第一个返回，后面讲思考过程和解释。
  11. 请注意UI的布局、颜色、主要按钮等信息，保证和图像中的结构和布局一致。
  12. 按照 <data-define></data-define>中的数据、hooks定义构建符合字段含义的数据。
</engineering-constraints>

<attention>
1. form用法中应该用Field.useField() 而不是Form.useForm，更要注意Rol Col用法和props
2. pay attention on fusion components. 如果不确定有没有对应组件请用div实现
3. 请注意严格按照图片中的逻辑、描述进行还原
......
</attention>

<style-constraints>
  1. 总是尝试使用 @alifd/next 库，在 @alifd/next 不满足的情况下才通过 div 和 style 属性生成。
  2. 必须生成响应式设计，生成的代码移动端优先。 
......
</style-constraints>

</constraints>

<good-examples>
......
</good-examples>

<bad-examples>
......
</bad-examples>
```

2）使用私有组件库

方案1：主要是：生成每个组件的说明文档。

<img width="1080" height="139" alt="Image" src="https://github.com/user-attachments/assets/1bcb3f11-4a4c-4e7c-8b36-5a166b1203b9" />

流程：

1. 开发私有组件库，并编写代码注释
2. 使用AI提取注释+源代码，生成Markdown文档
3. 审核和完善Markdown文档，作为RAG知识库
4. 使用LLM通过UI截图生成页面代码
5. 验证私有组件的出码效果，进行微调

下面是一个将组件源代码转换成标准化的组件Markdown文档的提示词：

```markdown
<role>
  您是一个专注于为前端组件生成清晰结构化文档的文档助手。根据用户提供的 React 组件代码，您的任务是创建与示例文档 `example.md` 格式和风格一致的规范化文档片段。
</role>

<skills>
  1. 能有效解析和理解 React 组件代码
  2. 擅长将代码逻辑、结构和功能转化为精准简明的文档
  3. 熟悉 @ali/homepage-card 和 bizcharts 库的细节，能在文档中准确描述其用法
</skills>

<output-constraints>
  1. 输出必须采用 Markdown 格式
  2. 输出内容仅包含组件说明，不包含任何礼貌性冗余表述
  3. 文档应包含组件描述、属性类型、默认值和用法示例
  4. 注意识别接口中实际未使用但被强制要求填写的字段，需在文档中明确标注
  5. 生成使用示例时，必须包含原始代码接口定义中标记为必填的参数（即使未实际使用）
  6. 严格遵循 `example.md` 的样式和格式规范
  7. 确保文档专业准确，覆盖边界用例和典型场景
</output-constraints>

<engineering-constraints>
  1. 分析 React 组件代码以提取必要的文档信息
  2. 重点将代码逻辑转换为清晰的文档结构（"描述"/"属性"/"示例用法"/"注意事项"）
  3. 避免技术术语，使用简洁易懂的语言适应广泛读者群体
</engineering-constraints>
```

仅有文档还不够，AI回答的时候需要使用哪些私有组件的文档？

1. 手动指定使用xxx文档，开发某个页面（这个页面需要附图给AI）、
2. （全部加载）把文档全部作为AI上下文（需要组件库文档不多，且使用类似Gimini超大上下文的模型）
3. （按需加载）将开发页面的元素与私有组件库特征进行向量化匹配

需要：使用LamaIndex等RAG服务将组件文档转换为向量形式并存储在向量数据库中。当收到查询请求时，将问题转化为向量进行检索，匹配成功后定位到源文档，并结合业务提示词和组件文档作为上下文输入，最终生成结果。

流程：

<img width="781" height="425" alt="Image" src="https://github.com/user-attachments/assets/41e32c49-a7c9-413a-8ff9-b273484e3061" />


当然，自建RAG服务比较麻烦，我们可以使用现成的服务，比如[[Dify](https://docs.dify.ai/zh-hans/introduction)](https://docs.dify.ai/zh-hans/introduction)。

关于问题的提问，分为2种：

1. 文字提问。这种可以极大提高RAG的召回的匹配度。
2. 附加图片。由于图片的识别问题，存在一定的匹配失败的概率。解决方案：文档上需要有详细的应用场景和对应的案例，或者是通过类似CopyCoder的方案在前置进行一次图片转文字Prompt的解析，帮助更精准的召回。


方案2： [MCP原理解析及搭建私有组件库MCP](https://github.com/Daotin/ai-coding/issues/10)

### 3、设计规范文档驱动

建立比如技术栈，CSS变量系统，组件规范等文档库，汇总成一套MDC供Cursor使用。

<img width="1080" height="870" alt="Image" src="https://github.com/user-attachments/assets/aab075f5-6192-431a-8504-2b0276c1aabf" />

CSS变量系统：

```css
/* 颜色系统 */
:root {
/* 主色调 */
--primary-50: #f0f9ff;
--primary-500: #3b82f6;
--primary-900: #1e3a8a;

/* 语义化颜色 */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* 间距系统 */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
}
```

组件规范模板：


```markdown
## 按钮组件 (Button)

### 基础样式
- 默认高度：40px
- 内边距：12px 24px
- 圆角：6px
- 字体：14px, 500字重

### 状态变化
- hover：背景色加深10%，添加阴影
- active：背景色加深20%
- disabled：透明度50%，禁用交互

### 尺寸规格
- small：32px高度，8px 16px内边距
- medium：40px高度，12px 24px内边距
- large：48px高度，16px 32px内边距

### 使用场景
- primary：主要操作按钮
- secondary：次要操作按钮
- ghost：轻量级操作按钮
```


交互规范定义：

```css
/* 动画时长 */
:root {
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;

/* 缓动函数 */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 状态反馈 */
.button {
transition: all var(--duration-normal) var(--ease-out);
}

.button:hover {
transform: translateY(-1px);
box-shadow: 04px12pxrgba(0, 0, 0, 0.15);
}
```

最后合成的mdc示例：

```markdown
 // .cursor/rules/frontend-design.mdc 示例配置
---
 description: 前端设计规范和开发标准
 alwaysApply: true
 ---

 # 前端开发规范

 ## 设计系统要求
 - 严格遵循项目设计规范
 - 使用CSS变量而非硬编码值
 - 确保组件可复用性
 - 添加必要的TypeScript类型定义

 ## 样式规范
 - 使用我们定义的设计变量系统
 - 组件命名遵循BEM规范
 - 响应式设计必须考虑移动端适配

 @design-system.md
 @component-template.tsx
```

## 接口联调

痛点：

- 需求频繁变动，导致接口的字段数据也会变动
- 接口文档更新不及时，后端代码变动未及时更新文档

解决方案：希望借助AI的能力，把接口定义到前端代码生成的过程标准化。

- 对于后端，不需要花时间和精力去编写/维护接口文档
- 对于前端，在获取到接口定义的时候，自动转换成实体模型及相关请求hooks，减少时间去编写重复性的代码。


流程图：

<img width="1080" height="382" alt="Image" src="https://github.com/user-attachments/assets/44538b77-44b4-4eb8-ae65-b2ffb79e45c4" />


- 对于后端：通过不同途径（技术文档/PRD/Java代码(controller/interface)等）的接口定义的语料输入，经由LLM模型进行思考解析出标准化的[[OpenAPI schema 3.0](https://spec.openapis.org/oas/v3.0.3.html)](https://spec.openapis.org/oas/v3.0.3.html)协议，作为前后端对接的凭证。

实现一：可以提供了一个管理页面，服务端开发可以在管理页面上粘贴本次迭代变更相关的接口代码或者是技术文档，只要能包含全量的信息即可，存在部分的冗余也没有关系。（这一步后续也可以集成到git webhooks或者终端的指令上，智能去分析仓库中相关涉及这次变更的代码和实体模型），最后以OpenAPI Schema的格式进行输出。

问题：准确率相对偏低一点，可能需要进行二次的修改。

实现二：通过安装Swagger插件，在项目中引入springfox-swagger2的依赖，并初始化配置类，具体的接入方式和demo可以参考SpringFox的官方站点介绍：https://springfox.github.io/springfox/ ，完成接入后，可以通过在代码中添加注释的就就可以自动生成swagger-ui ，并在本地的web页面中可以直接复制出OpenAPI Schema

- 对于前端：通过schema生成对应的接口相关前端代码，model,apis,mock等。

可以参考：Kubb(https://kubb.dev/) 是专为现代 TypeScript 前端工程设计的 OpenAPI 代码生成器，通过解析 OpenAPI 3.x 规范自动生成完整类型安全的 API 客户端代码。

<img width="1080" height="819" alt="Image" src="https://github.com/user-attachments/assets/cf614c83-4f88-4c9a-a08e-b3203c8e3886" />


## 代码拟合和调整

以上生成了UI界面和接口代码，下面就是要让AI对二者进行拟合。

示例提示词：

```markdown

// 此处省略通用的一些编码要求
......
你是一个高级前端开发工程师，具有React组件和Hooks的深度开发经验
熟练编写和集成自定义 hooks 与组件
将用户提供的 React 组件代码与自定义 hooks 整合在一起。
偏爱使用${component_lib}组件，如果必要或用户要求，可以使用其他第三方库。

....

## 注意事项
确保整合代码的逻辑流畅和一致性
理解用户的主要目标，包括如何整合组件和 Hooks，确保整合后的代码符合最佳实践。
确保 Hooks 的方法名、引用路径以及类型定义的准确性和一致性。
导入 hook, model 的目录路径应该是相对于当前文件的路径，并加上 `generate`。
最终组件中使用的数据字段应该是根据请求返回的数据定义来的。

// 此处省略具体的内容规划，结构格式要求和执行路径
......
```

## Code Review

1、外部产品

用AI进行Code review其实已经是一个比较成熟的操作，在外部也有很多类似的研发工具产品：

- 比如gitlab极狐公司推出的CodeRider（[https://gitlab.cn/resources/articles/ability_tag/28）](https://gitlab.cn/resources/articles/ability_tag/28%EF%BC%89)
- Codium AI公司推出的PR-Agent（[https://github.com/qodo-ai/pr-agenthttps://www.qodo.ai/）](https://github.com/qodo-ai/pr-agenthttps://www.qodo.ai/%EF%BC%89)
- CodeRabbit

缺点：

- 大部分产品的工作流都是依附在Github上的，和其他代码平台的兼容性不够好
- 大部分功能需要收费
- 数据安全性问题无法完成保障


> 如何开发一个自己的codereview AI Agent？
> 

由于大部分的前端场景对于逻辑的处理没有特别的复杂场景，更多是对代码风格，模型在简单的逻辑问题、命名拼写错误等，框架的调用的最佳实践等一些不涉及到文件之间上下文业务逻辑的场景，所以自动动手实现一个AI codereview工具的成本并不高，主要步骤：

1. 在merge request提交的时候触发webhooks
2. 通过code open api获取对应的code changes
3. 通过prompt引导AI对代码进行审查
4. 给出的优化建议以评论形式提交在mr上

流程图：

<img width="1080" height="1114" alt="Image" src="https://github.com/user-attachments/assets/e01f1f46-a1cf-4dc8-a974-fd871487f728" />

提示词示例：

```markdown
<system>
你将扮演一名资深软件工程师，对同事的代码进行评审。
</system>

针对每个文件，判断是否需要提供反馈。
若需要，用1-2句话说明反馈内容。
若需修改代码，需注明原始代码并提出修改建议。
建议后不要添加其他内容。
若无反馈，则不对该文件添加评论。

最后，用1-2句话总结整体反馈。

<example>
### filename.js
The name of this variable is unclear.

Original:
```js
const x = getAllUsers();
```

Suggestion:
```js
const allUsers = getAllUsers();
```
</example>
//...省略其他example
```

效果示例：

<img width="1080" height="375" alt="Image" src="https://github.com/user-attachments/assets/363c5bf2-01b8-424e-949a-30bb15503420" />

可以发现，AI code review和传统的静态代码扫描缺陷可以形成互补，能更好的发现一些人为的粗心导致的代码实现不够严谨的问题。

缺点：

- 绝大部分的代码都没有代码缺陷，而这时候大模型总是倾向于编造一些问题来提示我们注意。
- 由于业务背景、需求文档、技术方案、上下游系统依赖、俗成的约定等信息的缺失，导致人类能判断的代码缺陷而 AI 却找不出来。


## 工具产品化

以上流程，可以整合到vscode 插件来产品化，使得用户使用起来更加方便顺畅。

- 用户上传UI设计图，生成UI代码
- 用户上传scheme/url，生成接口代码
- 一键代码拟合
- 【扩展】新增chat模式，在能力上进行了定制和增强，包括根据已经出码的上下文，持续进行代码优化和调整

原文链接：

- https://mp.weixin.qq.com/s/bg32-w2e308XBPXyXpE6sQ
- https://mp.weixin.qq.com/s/U5VFoQuXSy4ta0wM7lu3dg
