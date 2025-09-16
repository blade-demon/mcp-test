import { EventEmitter } from "events";

/**
 * SSE (Server-Sent Events) 传输层实现
 * 用于MCP服务器与客户端之间的通信
 */
export class SSETransport extends EventEmitter {
  constructor(res, req) {
    super();
    this.res = res;
    this.req = req;
    this.isConnected = false;
    this.messageBuffer = [];
    this.messageHandlers = new Map();
    this.heartbeatTimer = null;

    this.setupSSE();
  }

  /**
   * 设置SSE连接
   */
  setupSSE() {
    // 设置SSE响应头
    this.res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // 发送初始连接消息
    this.sendSSEMessage("connected", { message: "MCP Server connected" });

    this.isConnected = true;
    this.emit("connect");

    // 心跳保持，防止中间件闲置断开（每15秒）
    this.heartbeatTimer = setInterval(() => {
      try {
        // 注释行作为SSE心跳
        this.res.write(":heartbeat\n\n");
      } catch (_) {
        // 写入失败则关闭
        this.close();
      }
    }, 15000);
  }

  /**
   * 发送SSE消息
   * @param {string} event - 事件类型
   * @param {any} data - 数据
   */
  sendSSEMessage(event, data) {
    if (!this.isConnected) {
      this.messageBuffer.push({ event, data });
      return;
    }

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.res.write(message);
  }

  /**
   * 发送服务器状态事件
   * @param {string} status - 状态类型 (starting, started, error)
   * @param {string} message - 状态消息
   * @param {any} data - 额外数据
   */
  sendServerStatus(status, message, data = {}) {
    this.sendSSEMessage("server-status", {
      status,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  /**
   * 发送MCP消息
   * @param {any} message - MCP消息
   */
  async send(message) {
    this.sendSSEMessage("mcp-message", message);
  }

  /**
   * 处理接收到的消息
   * @param {any} data - 接收到的数据
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      this.emit("message", message);
    } catch (error) {
      this.emit(
        "error",
        new Error(`Failed to parse message: ${error.message}`)
      );
    }
  }

  /**
   * 关闭连接
   */
  close() {
    if (this.isConnected) {
      this.isConnected = false;
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
      this.sendSSEMessage("disconnected", {
        message: "MCP Server disconnected",
      });
      this.res.end();
      this.emit("close");
    }
  }

  /**
   * 处理客户端断开连接
   */
  handleDisconnect() {
    this.close();
  }

  /**
   * MCP传输层接口方法
   */
  async start() {
    // SSE连接已经在构造函数中建立
    return Promise.resolve();
  }

  // 移除重复的异步 close，避免递归

  /**
   * 发送消息到MCP服务器
   */
  async sendMessage(message) {
    // 这里应该将消息发送到MCP服务器
    // 由于我们使用HTTP POST来处理消息，这里只是触发事件
    this.emit("message", message);
  }

  /**
   * 处理来自MCP服务器的消息
   */
  handleMcpMessage(message) {
    this.sendSSEMessage("mcp-message", message);
  }
}
