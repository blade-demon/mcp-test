/**
 * 简化的MCP服务器实现
 * 用于SSE传输方式
 */

import { jokerHandler } from "./tools/joker.js";
import { calculatorHandler } from "./tools/calculator.js";
import { studentGradesHandler } from "./tools/studentGrades.js";
import { llmHandler } from "./tools/llm.js";

export class SimpleMcpServer {
  constructor() {
    this.tools = new Map();
    this.resources = new Map();
    this.initializeTools();
    this.initializeResources();
  }

  /**
   * 初始化工具
   */
  initializeTools() {
    // 注册计算器工具
    this.tools.set("calculator", {
      name: "calculator",
      title: "四则运算计算器",
      description: "执行基本的加减乘除运算",
      handler: calculatorHandler,
    });

    // 注册学生成绩查询工具
    this.tools.set("student_grades", {
      name: "student_grades",
      title: "学生成绩查询",
      description: "查询学生成绩信息：总分最高、各科最高分等",
      handler: studentGradesHandler,
    });

    // 注册笑话工具
    this.tools.set("joker", {
      name: "joker",
      title: "tell me joke",
      description: "tell me joke about the topic",
      handler: jokerHandler,
    });

    // 注册LLM工具
    this.tools.set("llm", {
      name: "llm",
      title: "LLM 大模型调用",
      description: "调用各种大语言模型进行对话、文本生成、翻译、摘要和代码生成",
      handler: llmHandler,
    });
  }

  /**
   * 初始化资源
   */
  initializeResources() {
    // 注册问候资源
    this.resources.set("greeting", {
      name: "greeting",
      title: "Greeting Resource",
      description: "Dynamic greeting generator",
      template: "greeting://",
      handler: async (uri, params) => {
        const name = uri.pathname.replace("/", "");
        return {
          contents: [
            {
              uri: uri.href,
              text: `Hello, ${name}!`,
            },
          ],
        };
      },
    });
  }

  /**
   * 获取所有工具
   */
  getTools() {
    return Array.from(this.tools.values());
  }

  /**
   * 获取所有资源
   */
  getResources() {
    return Array.from(this.resources.values());
  }

  /**
   * 获取工具信息
   */
  getToolInfo() {
    return this.getTools().map((tool) => ({
      name: tool.name,
      title: tool.title,
      description: tool.description,
    }));
  }

  /**
   * 获取资源信息
   */
  getResourceInfo() {
    return this.getResources().map((resource) => ({
      name: resource.name,
      title: resource.title,
      description: resource.description,
      template: resource.template,
    }));
  }

  /**
   * 启动服务器
   */
  async start() {
    console.log("Simple MCP Server started");
    return Promise.resolve();
  }

  /**
   * 停止服务器
   */
  async stop() {
    console.log("Simple MCP Server stopped");
    return Promise.resolve();
  }
}
