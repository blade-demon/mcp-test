# LLM 大模型调用功能

本 MCP 服务器现在支持调用多种大语言模型，包括 OpenAI GPT、Anthropic Claude 和本地模型。

## 🚀 功能特性

- **多种模型支持**：OpenAI GPT、Anthropic Claude、Google Gemini、阿里云通义千问、本地模型
- **多种任务类型**：对话、文本生成、翻译、摘要、代码生成、图像理解
- **流式响应**：支持实时流式输出，提供更好的用户体验
- **对话历史管理**：支持多轮对话，自动管理对话上下文
- **性能监控**：实时监控 API 调用性能、成本和成功率
- **提示词模板**：内置多种专业模板，支持自定义模板
- **智能重试**：自动错误分类和重试机制，提高成功率
- **灵活配置**：可调节温度、最大 token 数等参数
- **完善错误处理**：详细的错误分类和解决建议

## 📋 支持的模型

### OpenAI 模型

- GPT-3.5 Turbo
- GPT-4
- GPT-4o
- GPT-4o Mini

### Anthropic 模型

- Claude 3.5 Sonnet
- Claude 3 Haiku
- Claude 3 Opus

### Google Gemini 模型

- Gemini Pro
- Gemini Pro Vision
- Gemini 1.5 Pro
- Gemini 1.5 Flash

### 阿里云通义千问模型

- Qwen Turbo
- Qwen Plus
- Qwen Max
- Qwen VL Plus

### 本地模型

- Llama 2
- Mistral
- Qwen
- CodeLlama
- Phi-3

## 🔧 配置 API 密钥

### 方法 1：环境变量（推荐）

在项目根目录创建 `.env` 文件：

```bash
# OpenAI API 密钥
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API 密钥
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google API 密钥
GOOGLE_API_KEY=your_google_api_key_here

# 阿里云 API 密钥
ALIBABA_API_KEY=your_alibaba_api_key_here

# 服务器端口
PORT=3000
```

### 方法 2：系统环境变量

```bash
export OPENAI_API_KEY="your_openai_api_key_here"
export ANTHROPIC_API_KEY="your_anthropic_api_key_here"
```

## 🔑 获取 API 密钥

### OpenAI

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录您的账户
3. 创建新的 API 密钥
4. 复制密钥到配置文件

### Anthropic

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 登录您的账户
3. 创建新的 API 密钥
4. 复制密钥到配置文件

## 🛠️ 使用方法

### 1. 启动服务器

```bash
npm install
npm run start:sse
```

### 2. 使用 Web 界面

打开浏览器访问：`http://localhost:3000`

在 LLM 工具区域：

1. 选择请求类型（对话、文本生成等）
2. 选择模型提供商
3. 选择具体模型
4. 输入提示词
5. 调整参数（温度、最大 token 数等）
6. 点击"发送请求"

### 3. 使用命令行客户端

```bash
npm run client
```

### 4. 直接调用 API

```javascript
// 对话示例
const message = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "llm",
    arguments: {
      type: "chat",
      prompt: "你好，请介绍一下你自己",
      provider: "openai",
      model: "gpt-3.5-turbo",
    },
  },
};

// 代码生成示例
const codeMessage = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "llm",
    arguments: {
      type: "code",
      prompt: "实现一个快速排序算法",
      language: "javascript",
      provider: "openai",
      model: "gpt-4",
    },
  },
};
```

## 📝 参数说明

| 参数                 | 类型    | 必填 | 说明                                                       |
| -------------------- | ------- | ---- | ---------------------------------------------------------- |
| `type`               | string  | ✅   | 请求类型：chat, generate, translate, summary, code, vision |
| `prompt`             | string  | ✅   | 用户输入的提示词                                           |
| `provider`           | string  | ❌   | 模型提供商：openai, anthropic, google, alibaba, local      |
| `model`              | string  | ❌   | 具体模型名称                                               |
| `language`           | string  | ❌   | 编程语言（代码生成时使用）                                 |
| `temperature`        | number  | ❌   | 生成温度 (0-2)，默认 0.7                                   |
| `max_tokens`         | number  | ❌   | 最大生成 token 数，默认 2000                               |
| `system_prompt`      | string  | ❌   | 自定义系统提示词                                           |
| `stream`             | boolean | ❌   | 是否启用流式响应                                           |
| `images`             | array   | ❌   | 图片 URL 列表（用于视觉理解）                              |
| `conversation_id`    | string  | ❌   | 对话 ID（用于多轮对话）                                    |
| `template_id`        | string  | ❌   | 提示词模板 ID                                              |
| `template_variables` | object  | ❌   | 模板变量                                                   |

## 🔄 请求类型详解

### chat（对话）

用于一般对话和问答。

```javascript
{
  type: "chat",
  prompt: "什么是人工智能？"
}
```

### generate（文本生成）

用于创意写作、文章生成等。

```javascript
{
  type: "generate",
  prompt: "写一篇关于春天的散文"
}
```

### translate（翻译）

用于文本翻译。

```javascript
{
  type: "translate",
  prompt: "Hello, how are you?"
}
```

### summary（摘要）

用于文本摘要。

```javascript
{
  type: "summary",
  prompt: "这是一篇很长的文章内容..."
}
```

### code（代码生成）

用于代码生成和编程辅助。

```javascript
{
  type: "code",
  prompt: "实现一个二分查找算法",
  language: "python"
}
```

### vision（图像理解）

用于图像分析和理解。

```javascript
{
  type: "vision",
  prompt: "请描述这张图片的内容",
  images: ["https://example.com/image.jpg"]
}
```

### template（模板使用）

使用预定义的提示词模板。

```javascript
{
  type: "template",
  template_id: "code-review",
  template_variables: {
    code: "function add(a, b) { return a + b; }"
  }
}
```

## ⚠️ 注意事项

1. **API 密钥安全**：请妥善保管您的 API 密钥，不要提交到版本控制系统
2. **费用控制**：使用商业 API 会产生费用，请注意控制使用量
3. **本地模型**：本地模型目前是模拟实现，需要根据实际情况配置
4. **网络连接**：确保服务器能够访问外部 API 服务

## 🐛 故障排除

### 常见错误

1. **API 密钥错误**

   ```
   Error: OPENAI_API_KEY 环境变量未设置
   ```

   解决：检查环境变量配置

2. **网络连接错误**

   ```
   Error: OpenAI API 错误: Network error
   ```

   解决：检查网络连接和防火墙设置

3. **模型不支持**

   ```
   Error: 不支持的模型: gpt-5
   ```

   解决：使用支持的模型名称

### 调试模式

设置环境变量启用详细日志：

```bash
DEBUG=mcp:* npm run start:sse
```

## 📚 更多资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic API 文档](https://docs.anthropic.com/)
- [MCP 协议文档](https://modelcontextprotocol.io/)
