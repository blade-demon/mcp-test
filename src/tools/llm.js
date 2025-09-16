/**
 * LLM 大模型调用工具
 * 支持多种大模型：OpenAI GPT、Anthropic Claude、本地模型等
 */

import { z } from "zod";

// 对话历史管理器
class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.maxHistoryLength = 20; // 最大历史记录数
  }

  // 获取对话历史
  getConversation(conversationId) {
    return this.conversations.get(conversationId) || [];
  }

  // 添加消息到对话历史
  addMessage(conversationId, role, content) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }

    const conversation = this.conversations.get(conversationId);
    conversation.push({ role, content, timestamp: Date.now() });

    // 限制历史记录长度
    if (conversation.length > this.maxHistoryLength) {
      conversation.splice(0, conversation.length - this.maxHistoryLength);
    }

    return conversation;
  }

  // 清空对话历史
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }

  // 获取所有对话ID
  getAllConversationIds() {
    return Array.from(this.conversations.keys());
  }
}

// 全局对话管理器实例
const conversationManager = new ConversationManager();

// 提示词模板管理器
class PromptTemplateManager {
  constructor() {
    this.templates = {
      // 代码生成模板
      "code-review": {
        name: "代码审查",
        description: "专业的代码审查模板",
        systemPrompt:
          "你是一个资深的代码审查专家，请仔细审查以下代码，提供详细的改进建议。",
        userPrompt:
          "请审查以下代码：\n\n{{code}}\n\n请从以下几个方面进行分析：\n1. 代码质量和可读性\n2. 性能优化建议\n3. 安全性问题\n4. 最佳实践建议",
        variables: ["code"],
        category: "code",
      },

      "code-optimization": {
        name: "代码优化",
        description: "代码性能优化模板",
        systemPrompt: "你是一个性能优化专家，请分析代码并提供优化建议。",
        userPrompt:
          "请优化以下代码的性能：\n\n{{code}}\n\n优化目标：{{goal}}\n\n请提供具体的优化方案和预期效果。",
        variables: ["code", "goal"],
        category: "code",
      },

      // 写作模板
      "article-writing": {
        name: "文章写作",
        description: "专业文章写作模板",
        systemPrompt: "你是一个专业的写作助手，擅长创作高质量的文章。",
        userPrompt:
          "请写一篇关于{{topic}}的文章。\n\n要求：\n- 字数：{{wordCount}}字\n- 风格：{{style}}\n- 目标读者：{{audience}}\n\n请确保文章结构清晰，内容充实，语言流畅。",
        variables: ["topic", "wordCount", "style", "audience"],
        category: "writing",
      },

      "email-writing": {
        name: "邮件写作",
        description: "商务邮件写作模板",
        systemPrompt: "你是一个商务沟通专家，擅长撰写专业的商务邮件。",
        userPrompt:
          "请帮我写一封{{type}}邮件。\n\n收件人：{{recipient}}\n主题：{{subject}}\n内容要点：{{points}}\n语气：{{tone}}",
        variables: ["type", "recipient", "subject", "points", "tone"],
        category: "writing",
      },

      // 翻译模板
      "technical-translation": {
        name: "技术文档翻译",
        description: "技术文档专业翻译模板",
        systemPrompt: "你是一个专业的技术文档翻译专家，精通中英文技术术语。",
        userPrompt:
          "请将以下{{sourceLang}}技术文档翻译成{{targetLang}}：\n\n{{text}}\n\n要求：\n- 保持技术术语的准确性\n- 保持原文的逻辑结构\n- 确保翻译的专业性和可读性",
        variables: ["sourceLang", "targetLang", "text"],
        category: "translation",
      },

      // 分析模板
      "data-analysis": {
        name: "数据分析",
        description: "数据分析报告模板",
        systemPrompt: "你是一个数据分析专家，擅长从数据中提取有价值的洞察。",
        userPrompt:
          "请分析以下数据：\n\n{{data}}\n\n分析维度：{{dimensions}}\n\n请提供：\n1. 数据概览\n2. 关键发现\n3. 趋势分析\n4. 建议和结论",
        variables: ["data", "dimensions"],
        category: "analysis",
      },

      // 创意模板
      brainstorming: {
        name: "头脑风暴",
        description: "创意头脑风暴模板",
        systemPrompt: "你是一个创意专家，擅长激发创新思维和提供创意方案。",
        userPrompt:
          "请为{{topic}}进行头脑风暴，提供{{count}}个创意方案。\n\n约束条件：{{constraints}}\n\n请确保每个方案都具有可行性和创新性。",
        variables: ["topic", "count", "constraints"],
        category: "creative",
      },

      // 学习模板
      "learning-guide": {
        name: "学习指南",
        description: "个性化学习指南模板",
        systemPrompt: "你是一个教育专家，擅长制定个性化的学习计划。",
        userPrompt:
          "请为{{subject}}制定一个学习指南。\n\n学习者背景：{{background}}\n学习目标：{{goals}}\n时间安排：{{timeframe}}\n\n请提供详细的学习路径和资源推荐。",
        variables: ["subject", "background", "goals", "timeframe"],
        category: "education",
      },
    };
  }

  // 获取模板
  getTemplate(templateId) {
    return this.templates[templateId];
  }

  // 获取所有模板
  getAllTemplates() {
    return this.templates;
  }

  // 按分类获取模板
  getTemplatesByCategory(category) {
    return Object.entries(this.templates)
      .filter(([_, template]) => template.category === category)
      .reduce((acc, [id, template]) => {
        acc[id] = template;
        return acc;
      }, {});
  }

  // 渲染模板
  renderTemplate(templateId, variables) {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`模板不存在: ${templateId}`);
    }

    let systemPrompt = template.systemPrompt;
    let userPrompt = template.userPrompt;

    // 替换变量
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      systemPrompt = systemPrompt.replace(new RegExp(placeholder, "g"), value);
      userPrompt = userPrompt.replace(new RegExp(placeholder, "g"), value);
    }

    return {
      systemPrompt,
      userPrompt,
      template: template,
    };
  }

  // 添加自定义模板
  addTemplate(templateId, template) {
    this.templates[templateId] = template;
  }

  // 删除模板
  removeTemplate(templateId) {
    delete this.templates[templateId];
  }
}

// 全局提示词模板管理器实例
const promptTemplateManager = new PromptTemplateManager();

// 错误处理和重试机制
class ErrorHandler {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 基础延迟1秒
      maxDelay: 10000, // 最大延迟10秒
      backoffMultiplier: 2, // 退避乘数
    };

    this.errorTypes = {
      RATE_LIMIT: "rate_limit",
      NETWORK_ERROR: "network_error",
      AUTH_ERROR: "auth_error",
      QUOTA_EXCEEDED: "quota_exceeded",
      MODEL_UNAVAILABLE: "model_unavailable",
      INVALID_REQUEST: "invalid_request",
      UNKNOWN_ERROR: "unknown_error",
    };
  }

  // 分类错误类型
  classifyError(error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return this.errorTypes.RATE_LIMIT;
    }
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection")
    ) {
      return this.errorTypes.NETWORK_ERROR;
    }
    if (
      message.includes("unauthorized") ||
      message.includes("api key") ||
      message.includes("authentication")
    ) {
      return this.errorTypes.AUTH_ERROR;
    }
    if (
      message.includes("quota") ||
      message.includes("billing") ||
      message.includes("credit")
    ) {
      return this.errorTypes.QUOTA_EXCEEDED;
    }
    if (
      message.includes("model") &&
      (message.includes("not found") || message.includes("unavailable"))
    ) {
      return this.errorTypes.MODEL_UNAVAILABLE;
    }
    if (message.includes("invalid") || message.includes("bad request")) {
      return this.errorTypes.INVALID_REQUEST;
    }

    return this.errorTypes.UNKNOWN_ERROR;
  }

  // 判断是否应该重试
  shouldRetry(error, attempt) {
    if (attempt >= this.retryConfig.maxRetries) {
      return false;
    }

    const errorType = this.classifyError(error);

    // 这些错误类型不应该重试
    const nonRetryableErrors = [
      this.errorTypes.AUTH_ERROR,
      this.errorTypes.QUOTA_EXCEEDED,
      this.errorTypes.MODEL_UNAVAILABLE,
      this.errorTypes.INVALID_REQUEST,
    ];

    return !nonRetryableErrors.includes(errorType);
  }

  // 计算重试延迟
  calculateDelay(attempt) {
    const delay =
      this.retryConfig.baseDelay *
      Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  // 等待指定时间
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 执行带重试的操作
  async executeWithRetry(operation, context = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt)) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        console.log(
          `重试 ${attempt + 1}/${this.retryConfig.maxRetries}，延迟 ${delay}ms`
        );
        await this.sleep(delay);
      }
    }

    // 所有重试都失败了，抛出最后一个错误
    throw this.enhanceError(lastError, context);
  }

  // 增强错误信息
  enhanceError(error, context = {}) {
    const errorType = this.classifyError(error);
    const enhancedError = new Error(error.message);

    enhancedError.type = errorType;
    enhancedError.originalError = error;
    enhancedError.context = context;
    enhancedError.timestamp = Date.now();

    // 添加建议
    enhancedError.suggestions = this.getErrorSuggestions(errorType);

    return enhancedError;
  }

  // 获取错误建议
  getErrorSuggestions(errorType) {
    const suggestions = {
      [this.errorTypes.RATE_LIMIT]: [
        "等待一段时间后重试",
        "减少请求频率",
        "考虑升级API计划",
      ],
      [this.errorTypes.NETWORK_ERROR]: [
        "检查网络连接",
        "稍后重试",
        "检查防火墙设置",
      ],
      [this.errorTypes.AUTH_ERROR]: [
        "检查API密钥是否正确",
        "确认API密钥权限",
        "重新生成API密钥",
      ],
      [this.errorTypes.QUOTA_EXCEEDED]: [
        "检查账户余额",
        "升级API计划",
        "等待下个计费周期",
      ],
      [this.errorTypes.MODEL_UNAVAILABLE]: [
        "尝试其他模型",
        "稍后重试",
        "检查模型名称是否正确",
      ],
      [this.errorTypes.INVALID_REQUEST]: [
        "检查请求参数",
        "查看API文档",
        "验证输入格式",
      ],
      [this.errorTypes.UNKNOWN_ERROR]: [
        "稍后重试",
        "联系技术支持",
        "检查服务状态",
      ],
    };

    return suggestions[errorType] || suggestions[this.errorTypes.UNKNOWN_ERROR];
  }
}

// 全局错误处理器实例
const errorHandler = new ErrorHandler();

// 支持的模型类型 - 只支持 Google Gemini 2.0 Flash
const SUPPORTED_MODELS = {
  google: ["gemini-2.0-flash"],
};

// 请求参数验证模式
const LLMRequestSchema = z.object({
  type: z
    .enum([
      "chat",
      "generate",
      "translate",
      "summary",
      "code",
      "vision",
      "template",
    ])
    .describe("请求类型"),
  prompt: z.string().min(1).describe("用户输入的提示词"),
  model: z.string().optional().describe("指定使用的模型"),
  provider: z
    .enum(["openai", "anthropic", "google", "alibaba", "local"])
    .optional()
    .describe("模型提供商"),
  language: z.string().optional().describe("编程语言（用于代码生成）"),
  max_tokens: z.number().optional().describe("最大生成token数"),
  temperature: z.number().min(0).max(2).optional().describe("生成温度"),
  system_prompt: z.string().optional().describe("系统提示词"),
  stream: z.boolean().optional().describe("是否启用流式响应"),
  images: z
    .array(z.string())
    .optional()
    .describe("图片URL列表（用于视觉理解）"),
  conversation_id: z.string().optional().describe("对话ID（用于多轮对话）"),
  template_id: z.string().optional().describe("提示词模板ID"),
  template_variables: z.record(z.string()).optional().describe("模板变量"),
});

/**
 * 获取默认模型配置
 */
function getDefaultModelConfig(type, provider) {
  // 所有任务类型都使用 gemini-2.0-flash
  return "gemini-2.0-flash";
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(
  type,
  language,
  customSystemPrompt,
  hasImages = false
) {
  if (customSystemPrompt) {
    return customSystemPrompt;
  }

  const systemPrompts = {
    chat: "你是一个友好的AI助手，请用中文回答用户的问题。",
    generate: "你是一个创意写作助手，请根据用户的要求生成高质量的文本内容。",
    translate: "你是一个专业的翻译助手，请准确翻译用户提供的文本。",
    summary: "你是一个专业的摘要助手，请为用户提供的文本生成简洁准确的摘要。",
    code: `你是一个专业的${
      language || "JavaScript"
    }编程助手，请生成高质量、可运行的代码。`,
    vision: "你是一个专业的图像理解助手，请详细描述和分析用户提供的图片内容。",
  };

  let basePrompt = systemPrompts[type] || systemPrompts.chat;

  if (hasImages && type === "vision") {
    basePrompt +=
      " 请仔细观察图片中的细节，包括物体、文字、颜色、构图等，并提供详细的分析。";
  }

  return basePrompt;
}

/**
 * 构建用户提示词
 */
function buildUserPrompt(type, prompt, language, images = []) {
  const prompts = {
    chat: prompt,
    generate: `请生成以下内容的文本：\n${prompt}`,
    translate: `请翻译以下文本：\n${prompt}`,
    summary: `请为以下文本生成摘要：\n${prompt}`,
    code: `请用${language || "JavaScript"}语言实现以下功能：\n${prompt}`,
    vision: `请分析以下图片：\n${prompt}`,
  };

  let userPrompt = prompts[type] || prompt;

  if (images && images.length > 0) {
    userPrompt += `\n\n图片URL列表：\n${images
      .map((url, index) => `${index + 1}. ${url}`)
      .join("\n")}`;
  }

  return userPrompt;
}

/**
 * 调用 OpenAI API
 */
async function callOpenAI(messages, model, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 环境变量未设置");
  }

  const requestBody = {
    model: model,
    messages: messages,
    max_tokens: options.max_tokens || 2000,
    temperature: options.temperature || 0.7,
    stream: options.stream || false,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `OpenAI API 错误: ${error.error?.message || response.statusText}`
    );
  }

  if (options.stream) {
    return await handleStreamResponse(response);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 处理流式响应
 */
async function handleStreamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return fullResponse;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
}

/**
 * 调用 Anthropic API
 */
async function callAnthropic(messages, model, options = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY 环境变量未设置");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model,
      max_tokens: options.max_tokens || 2000,
      temperature: options.temperature || 0.7,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Anthropic API 错误: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * 调用 Google Gemini API
 */
async function callGoogleGemini(messages, model, options = {}) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY 环境变量未设置");
  }

  // 转换消息格式为Gemini格式
  const geminiMessages = messages.map((msg) => ({
    role: msg.role === "system" ? "user" : msg.role,
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Google Gemini API 错误: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * 调用阿里云通义千问 API
 */
async function callAlibabaQwen(messages, model, options = {}) {
  const apiKey = process.env.ALIBABA_API_KEY;

  if (!apiKey) {
    throw new Error("ALIBABA_API_KEY 环境变量未设置");
  }

  // 转换消息格式
  const qwenMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        input: {
          messages: qwenMessages,
        },
        parameters: {
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `阿里云通义千问 API 错误: ${error.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.output.text;
}

/**
 * 调用本地模型（模拟）
 */
async function callLocalModel(messages, model, options = {}) {
  // 这里是一个模拟实现，实际使用时需要连接到本地模型服务
  const systemMessage = messages.find((m) => m.role === "system");
  const userMessage = messages.find((m) => m.role === "user");

  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const responses = {
    "llama-2": `[${model} 响应] ${userMessage.content}`,
    mistral: `[${model} 响应] ${userMessage.content}`,
    qwen: `[${model} 响应] ${userMessage.content}`,
    codellama: `[${model} 代码响应] ${userMessage.content}`,
    "phi-3": `[${model} 响应] ${userMessage.content}`,
  };

  return responses[model] || `[本地模型 ${model} 响应] ${userMessage.content}`;
}

/**
 * LLM 工具处理器
 */
export async function llmHandler(args) {
  try {
    // 验证参数
    const validatedArgs = LLMRequestSchema.parse(args);
    const {
      type,
      prompt,
      model,
      provider,
      language,
      max_tokens,
      temperature,
      system_prompt,
      stream,
      images,
      conversation_id,
      template_id,
      template_variables,
    } = validatedArgs;

    // 确定使用的提供商和模型 - 只支持 Google
    const finalProvider = "google";
    const finalModel = model || getDefaultModelConfig(type, finalProvider);

    // 验证模型是否支持
    if (!SUPPORTED_MODELS[finalProvider]?.includes(finalModel)) {
      throw new Error(`不支持的模型: ${finalModel} (提供商: ${finalProvider})`);
    }

    // 构建消息
    const hasImages = images && images.length > 0;
    let systemPrompt, userPrompt;

    // 如果使用模板
    if (template_id && template_variables) {
      try {
        const rendered = promptTemplateManager.renderTemplate(
          template_id,
          template_variables
        );
        systemPrompt = rendered.systemPrompt;
        userPrompt = rendered.userPrompt;
      } catch (error) {
        throw new Error(`模板渲染失败: ${error.message}`);
      }
    } else {
      systemPrompt = buildSystemPrompt(
        type,
        language,
        system_prompt,
        hasImages
      );
      userPrompt = buildUserPrompt(type, prompt, language, images);
    }

    // 构建消息数组
    let messages = [{ role: "system", content: systemPrompt }];

    // 如果有对话ID，获取历史记录
    if (conversation_id) {
      const history = conversationManager.getConversation(conversation_id);
      messages.push(...history);
    }

    // 添加当前用户消息
    messages.push({ role: "user", content: userPrompt });

    // 调用相应的API
    let response;
    const options = { max_tokens, temperature, stream };
    const startTime = Date.now();
    let success = true;

    try {
      // 使用错误处理器执行API调用
      response = await errorHandler.executeWithRetry(
        async () => {
          // 只支持 Google Gemini
          return await callGoogleGemini(messages, finalModel, options);
        },
        {
          provider: finalProvider,
          model: finalModel,
          type: type,
          conversation_id: conversation_id,
        }
      );
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // 请求处理完成
    }

    // 如果有对话ID，保存对话历史
    if (conversation_id) {
      conversationManager.addMessage(conversation_id, "user", userPrompt);
      conversationManager.addMessage(conversation_id, "assistant", response);
    }

    return {
      content: [
        {
          type: "text",
          text: response,
        },
      ],
      usage: {
        model: finalModel,
        provider: finalProvider,
        type: type,
        prompt_tokens: prompt.length,
        completion_tokens: response.length,
        total_tokens: prompt.length + response.length,
        conversation_id: conversation_id,
        has_images: hasImages,
        stream_enabled: stream || false,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: `参数验证错误: ${error.errors
              .map((e) => e.message)
              .join(", ")}`,
          },
        ],
        isError: true,
        errorType: "validation_error",
      };
    }

    // 增强的错误信息
    const errorInfo = {
      message: error.message,
      type: error.type || "unknown_error",
      suggestions: error.suggestions || [],
      timestamp: error.timestamp || Date.now(),
    };

    return {
      content: [
        {
          type: "text",
          text: `LLM 调用失败: ${error.message}\n\n错误类型: ${
            errorInfo.type
          }\n建议: ${errorInfo.suggestions.join(", ")}`,
        },
      ],
      isError: true,
      errorInfo: errorInfo,
    };
  }
}

/**
 * 获取 LLM 工具信息
 */
export function getLLMToolInfo() {
  return {
    name: "llm",
    title: "LLM 大模型调用",
    description:
      "调用各种大语言模型进行对话、文本生成、翻译、摘要、代码生成和图像理解",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: [
            "chat",
            "generate",
            "translate",
            "summary",
            "code",
            "vision",
            "template",
          ],
          description:
            "请求类型：chat(对话), generate(文本生成), translate(翻译), summary(摘要), code(代码生成), vision(图像理解), template(模板使用)",
        },
        prompt: {
          type: "string",
          description: "用户输入的提示词",
        },
        language: {
          type: "string",
          description: "编程语言（用于代码生成）",
        },
        max_tokens: {
          type: "number",
          description: "最大生成token数",
        },
        temperature: {
          type: "number",
          minimum: 0,
          maximum: 2,
          description: "生成温度，控制随机性",
        },
        system_prompt: {
          type: "string",
          description: "自定义系统提示词",
        },
        stream: {
          type: "boolean",
          description: "是否启用流式响应",
        },
        images: {
          type: "array",
          items: {
            type: "string",
          },
          description: "图片URL列表（用于视觉理解）",
        },
        conversation_id: {
          type: "string",
          description: "对话ID（用于多轮对话）",
        },
        template_id: {
          type: "string",
          description: "提示词模板ID",
        },
        template_variables: {
          type: "object",
          description: "模板变量",
        },
      },
      required: ["type", "prompt"],
    },
  };
}

/**
 * 获取支持的模型列表
 */
export function getSupportedModels() {
  return SUPPORTED_MODELS;
}

/**
 * 检查 API 密钥状态
 */
export function checkAPIKeys() {
  return {
    google: !!process.env.GOOGLE_API_KEY,
  };
}

/**
 * 对话历史管理函数
 */
export function getConversationHistory(conversationId) {
  return conversationManager.getConversation(conversationId);
}

export function clearConversationHistory(conversationId) {
  conversationManager.clearConversation(conversationId);
  return { success: true, message: "对话历史已清空" };
}

export function getAllConversations() {
  const conversations = {};
  const ids = conversationManager.getAllConversationIds();

  for (const id of ids) {
    conversations[id] = conversationManager.getConversationStats(id);
  }

  return conversations;
}

/**
 * 提示词模板管理函数
 */
export function getPromptTemplates() {
  return promptTemplateManager.getAllTemplates();
}

export function getPromptTemplate(templateId) {
  return promptTemplateManager.getTemplate(templateId);
}

export function getTemplatesByCategory(category) {
  return promptTemplateManager.getTemplatesByCategory(category);
}

export function renderPromptTemplate(templateId, variables) {
  return promptTemplateManager.renderTemplate(templateId, variables);
}

export function addPromptTemplate(templateId, template) {
  promptTemplateManager.addTemplate(templateId, template);
  return { success: true, message: "模板已添加" };
}

export function removePromptTemplate(templateId) {
  promptTemplateManager.removeTemplate(templateId);
  return { success: true, message: "模板已删除" };
}

/**
 * 错误处理相关函数
 */
export function getErrorTypes() {
  return errorHandler.errorTypes;
}

export function getRetryConfig() {
  return errorHandler.retryConfig;
}

export function updateRetryConfig(config) {
  Object.assign(errorHandler.retryConfig, config);
  return { success: true, message: "重试配置已更新" };
}
