#!/usr/bin/env node

/**
 * MCP Server SSE 客户端示例
 * 演示如何通过SSE连接到MCP服务器
 */

import fetch from "node-fetch";
import EventSource from "eventsource";

const SERVER_URL = "http://localhost:3000";
const SESSION_ID = `node_client_${Date.now()}`;

class MCPSSEClient {
  constructor(serverUrl, sessionId) {
    this.serverUrl = serverUrl;
    this.sessionId = sessionId;
    this.eventSource = null;
    this.messageId = 1;
  }

  /**
   * 连接到MCP服务器
   */
  async connect() {
    return new Promise((resolve, reject) => {
      const sseUrl = `${this.serverUrl}/sse?sessionId=${this.sessionId}`;
      console.log(`🔌 连接到: ${sseUrl}`);

      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        console.log("✅ SSE连接已建立");
        resolve();
      };

      this.eventSource.addEventListener("connected", (event) => {
        const data = JSON.parse(event.data);
        console.log(`📡 服务器消息: ${data.message}`);
      });

      this.eventSource.addEventListener("server-status", (event) => {
        const data = JSON.parse(event.data);
        console.log(`📊 服务器状态: ${data.status} - ${data.message}`);

        if (data.status === "started" && data.serverInfo) {
          console.log(`🔧 可用工具: ${data.serverInfo.tools.join(", ")}`);
          console.log(`📚 可用资源: ${data.serverInfo.resources.join(", ")}`);
        }
      });

      this.eventSource.addEventListener("mcp-message", (event) => {
        const message = JSON.parse(event.data);
        console.log("📨 收到MCP消息:");
        console.log(JSON.stringify(message, null, 2));
      });

      this.eventSource.addEventListener("disconnected", (event) => {
        const data = JSON.parse(event.data);
        console.log(`❌ 服务器断开: ${data.message}`);
      });

      this.eventSource.onerror = (error) => {
        console.error("❌ SSE错误:", error);
        reject(error);
      };
    });
  }

  /**
   * 发送MCP消息
   */
  async sendMessage(message) {
    try {
      const response = await fetch(`${this.serverUrl}/mcp/${this.sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log(`📤 已发送MCP消息: ${JSON.stringify(message, null, 2)}`);
        return await response.json();
      } else {
        throw new Error(`发送失败: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ 发送错误: ${error.message}`);
      throw error;
    }
  }

  /**
   * 调用工具
   */
  async callTool(toolName, arguments_) {
    const message = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: arguments_,
      },
    };

    return await this.sendMessage(message);
  }

  /**
   * 读取资源
   */
  async readResource(uri) {
    const message = {
      jsonrpc: "2.0",
      id: this.messageId++,
      method: "resources/read",
      params: {
        uri: uri,
      },
    };

    return await this.sendMessage(message);
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log("🔌 已断开连接");
    }
  }
}

/**
 * 演示函数
 */
async function demonstrate() {
  const client = new MCPSSEClient(SERVER_URL, SESSION_ID);

  try {
    // 连接到服务器
    await client.connect();

    // 等待一下让连接稳定
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n🧮 测试计算器工具...");
    await client.callTool("calculator", {
      operation: "add",
      a: 15,
      b: 25,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n📊 测试学生成绩查询工具...");
    await client.callTool("student_grades", {
      query_type: "english_highest",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n😄 测试笑话工具...");
    await client.callTool("joker", {
      topic: "JavaScript",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n👋 测试问候资源...");
    await client.readResource("greeting://徐紫微");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n🤖 测试 LLM 对话...");
    await client.callTool("llm", {
      type: "chat",
      prompt: "你好，请简单介绍一下你自己",
      model: "gemini-2.0-flash",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n📝 测试 LLM 文本生成...");
    await client.callTool("llm", {
      type: "generate",
      prompt: "请写一首关于春天的短诗",
      model: "gemini-2.0-flash",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n🔤 测试 LLM 翻译...");
    await client.callTool("llm", {
      type: "translate",
      prompt: "Hello, how are you today?",
      model: "gemini-2.0-flash",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("\n💻 测试 LLM 代码生成...");
    await client.callTool("llm", {
      type: "code",
      prompt: "实现一个计算斐波那契数列的函数",
      language: "javascript",
      model: "gemini-2.0-flash",
    });

    // 等待响应
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    console.error("❌ 演示过程中出错:", error.message);
  } finally {
    client.disconnect();
  }
}

/**
 * 获取服务器状态
 */
async function getServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/status`);
    const status = await response.json();
    console.log("📊 服务器状态:");
    console.log(JSON.stringify(status, null, 2));
  } catch (error) {
    console.error("❌ 获取服务器状态失败:", error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🚀 MCP Server SSE 客户端示例");
  console.log("================================\n");

  // 检查服务器状态
  await getServerStatus();

  console.log("\n开始演示...");
  await demonstrate();

  console.log("\n✅ 演示完成");
}

// 运行主函数
main().catch(console.error);
