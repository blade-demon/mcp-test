/**
 * 货币兑换 MCP Client 客户端
 * 用于调用货币兑换 MCP Server 接口
 */

export class CurrencyExchangeClient {
  constructor(serverUrl = "http://localhost:3000") {
    this.serverUrl = serverUrl;
    this.sessionId = null;
    this.eventSource = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return ++this.messageId;
  }

  /**
   * 连接到MCP服务器
   */
  async connect() {
    try {
      this.sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 建立SSE连接
      this.eventSource = new EventSource(
        `${this.serverUrl}/sse?sessionId=${this.sessionId}`
      );

      return new Promise((resolve, reject) => {
        let serverStarted = false;
        let connectionEstablished = false;

        const timeout = setTimeout(() => {
          this.eventSource.close();
          reject(new Error("连接超时"));
        }, 15000);

        this.eventSource.onopen = () => {
          console.log("✅ SSE连接已建立");
          connectionEstablished = true;

          if (serverStarted) {
            clearTimeout(timeout);
            resolve();
          }
        };

        this.eventSource.onerror = (error) => {
          clearTimeout(timeout);
          console.error("❌ 连接MCP服务器失败:", error);
          reject(error);
        };

        // 监听server-status事件
        this.eventSource.addEventListener("server-status", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(
              `📊 服务器状态: ${data.status} - ${data.message || ""}`
            );

            if (data.status === "started") {
              serverStarted = true;
              console.log("✅ MCP服务器已启动");

              if (connectionEstablished) {
                clearTimeout(timeout);
                resolve();
              }
            }
          } catch (error) {
            console.error("解析server-status事件失败:", error);
          }
        });

        // 监听mcp-message事件
        this.eventSource.addEventListener("mcp-message", (event) => {
          this.handleServerMessage(event);
        });

        // 处理其他消息（兼容性）
        this.eventSource.onmessage = (event) => {
          // 如果没有事件类型，尝试作为通用消息处理
          if (!event.type) {
            this.handleServerMessage(event);
          }
        };
      });
    } catch (error) {
      console.error("连接失败:", error);
      throw error;
    }
  }

  /**
   * 处理MCP消息
   */
  handleServerMessage(event) {
    try {
      const data = JSON.parse(event.data);

      if (data.id) {
        const pendingRequest = this.pendingRequests.get(data.id);
        if (pendingRequest) {
          pendingRequest.resolve(data);
          this.pendingRequests.delete(data.id);
        } else {
          console.warn(`收到未匹配的MCP响应: ${data.id}`);
        }
      } else {
        console.log("收到MCP消息:", data);
      }
    } catch (error) {
      console.error("处理MCP消息失败:", error);
    }
  }

  /**
   * 发送MCP消息
   */
  async sendMcpMessage(message) {
    if (!this.sessionId) {
      throw new Error("未连接到服务器，请先调用 connect() 方法");
    }

    const messageId = this.generateMessageId();
    const fullMessage = {
      jsonrpc: "2.0",
      id: messageId,
      ...message,
    };

    return new Promise((resolve, reject) => {
      // 存储待处理的请求
      this.pendingRequests.set(messageId, { resolve, reject });

      // 发送HTTP POST请求
      fetch(`${this.serverUrl}/mcp/${this.sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullMessage),
      }).catch((error) => {
        this.pendingRequests.delete(messageId);
        reject(error);
      });

      // 设置超时
      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          reject(new Error("请求超时"));
        }
      }, 20000);
    });
  }

  /**
   * 初始化MCP连接
   */
  async initialize() {
    const response = await this.sendMcpMessage({
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "currency-exchange-client",
          version: "1.0.0",
        },
      },
    });

    console.log("🚀 MCP初始化完成:", response.result);
    return response.result;
  }

  /**
   * 货币兑换
   * @param {number} amount - 兑换金额
   * @param {string} fromCurrency - 源货币代码
   * @param {string} toCurrency - 目标货币代码
   * @returns {Promise<Object>} 兑换结果
   */
  async exchangeCurrency(amount, fromCurrency, toCurrency) {
    try {
      const response = await this.sendMcpMessage({
        method: "tools/call",
        params: {
          name: "currency_exchange",
          arguments: {
            amount: parseFloat(amount),
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.result;
    } catch (error) {
      console.error("货币兑换失败:", error);
      throw error;
    }
  }

  /**
   * 获取支持的货币列表
   */
  async getSupportedCurrencies() {
    try {
      const response = await fetch(`${this.serverUrl}/tools`);
      const tools = await response.json();
      const currencyTool = tools.find(
        (tool) => tool.name === "currency_exchange"
      );

      return {
        tool: currencyTool,
        supportedCurrencies: [
          "USD",
          "EUR",
          "GBP",
          "JPY",
          "CNY",
          "CAD",
          "AUD",
          "CHF",
          "HKD",
          "NZD",
        ],
      };
    } catch (error) {
      console.error("获取货币列表失败:", error);
      throw error;
    }
  }

  /**
   * 批量货币兑换
   * @param {Array} exchanges - 兑换请求数组
   * @returns {Promise<Array>} 批量兑换结果
   */
  async batchExchange(exchanges) {
    const results = [];

    for (const exchange of exchanges) {
      try {
        const result = await this.exchangeCurrency(
          exchange.amount,
          exchange.fromCurrency,
          exchange.toCurrency
        );
        results.push({
          input: exchange,
          result: result,
          success: true,
        });
      } catch (error) {
        results.push({
          input: exchange,
          error: error.message,
          success: false,
        });
      }
    }

    return results;
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.sessionId = null;
    this.pendingRequests.clear();
    console.log("🔌 已断开MCP服务器连接");
  }

  /**
   * 获取服务器状态
   */
  async getServerStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/status`);
      return await response.json();
    } catch (error) {
      console.error("获取服务器状态失败:", error);
      throw error;
    }
  }
}

// 使用示例
export async function createCurrencyExchangeClient(serverUrl) {
  const client = new CurrencyExchangeClient(serverUrl);
  await client.connect();
  await client.initialize();
  return client;
}
