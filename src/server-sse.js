import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { SSETransport } from "./transports/sseTransport.js";
import { SimpleMcpServer } from "./mcpServer.js";
import { SERVER_INFO, DEFAULT_PORT, STATIC_ROUTES } from "./config/config.js";
import { sessionStore } from "./utils/sessionStore.js";

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
for (const route of STATIC_ROUTES) {
  app.use(route.mountPath, express.static(route.dir));
}

// 存储活跃的MCP服务器实例
const activeServers = sessionStore;

/**
 * 创建MCP服务器实例
 */
function createMcpServer(sessionId) {
  return new SimpleMcpServer();
}

/**
 * 处理MCP消息
 */
async function handleMcpMessage(server, message) {
  try {
    // 根据消息类型处理
    switch (message.method) {
      case "tools/call":
        return await handleToolCall(server, message);
      case "resources/read":
        return await handleResourceRead(server, message);
      case "initialize":
        return {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              resources: {},
            },
            serverInfo: {
              name: "demo-server",
              version: "1.0.0",
            },
          },
        };
      default:
        return {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32601,
            message: "Method not found",
          },
        };
    }
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message,
      },
    };
  }
}

/**
 * 处理工具调用
 */
async function handleToolCall(server, message) {
  const { name, arguments: args } = message.params;

  console.log(`🔧 工具调用: ${name}`);
  console.log(`   📊 参数: ${JSON.stringify(args)}`);

  // 获取工具处理器
  const tools = server.getTools();
  const tool = tools.find((t) => t.name === name);

  if (!tool) {
    console.log(`❌ 工具未找到: ${name}`);
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32601,
        message: `Tool '${name}' not found`,
      },
    };
  }

  try {
    const result = await tool.handler(args);
    console.log(`✅ 工具执行成功: ${name}`);
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: result,
    };
  } catch (error) {
    console.error(`❌ 工具执行失败: ${name} - ${error.message}`);
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32603,
        message: "Tool execution error",
        data: error.message,
      },
    };
  }
}

/**
 * 处理资源读取
 */
async function handleResourceRead(server, message) {
  const { uri } = message.params;

  // 获取资源处理器
  const resources = server.getResources();
  const resource = resources.find((r) => uri.startsWith(r.template));

  if (!resource) {
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32601,
        message: `Resource '${uri}' not found`,
      },
    };
  }

  try {
    const result = await resource.handler(new URL(uri), {});
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: result,
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32603,
        message: "Resource read error",
        data: error.message,
      },
    };
  }
}

/**
 * 处理SSE连接
 */
app.get("/sse", async (req, res) => {
  const sessionId = req.query.sessionId || `session_${Date.now()}`;
  const clientIP =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  console.log(`🔗 新的SSE连接: ${sessionId}`);
  console.log(`   📍 客户端IP: ${clientIP}`);
  console.log(
    `   🖥️  User-Agent: ${userAgent.substring(0, 100)}${
      userAgent.length > 100 ? "..." : ""
    }`
  );

  // 创建SSE传输层
  const transport = new SSETransport(res, req);

  // 创建MCP服务器实例
  const server = createMcpServer(sessionId);

  // 存储服务器实例
  activeServers.set(sessionId, { server, transport });

  // 手动处理MCP服务器连接
  try {
    // 发送服务器启动中状态
    transport.sendServerStatus("starting", "正在启动MCP服务器...", {
      sessionId,
    });

    // 初始化MCP服务器
    await server.start();
    console.log(`✅ MCP服务器启动成功: ${sessionId}`);

    // 发送服务器启动成功状态
    transport.sendServerStatus("started", "MCP服务器已成功启动", {
      sessionId,
      serverInfo: {
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
        tools: server.getTools().map((t) => t.name),
        resources: server.getResources().map((r) => r.name),
      },
    });
  } catch (error) {
    console.error(`❌ MCP服务器启动失败: ${sessionId} - ${error.message}`);

    // 发送服务器启动失败状态
    transport.sendServerStatus("error", `MCP服务器启动失败: ${error.message}`, {
      sessionId,
      error: error.message,
    });

    transport.close();
    return;
  }

  // 处理客户端断开连接
  req.on("close", () => {
    console.log(`🔌 客户端断开连接: ${sessionId}`);
    activeServers.delete(sessionId);
    console.log(`📊 当前活跃连接数: ${activeServers.size()}`);
  });

  // 处理传输层错误
  transport.on("error", (error) => {
    console.error(`❌ 传输层错误: ${sessionId} - ${error.message}`);
    activeServers.delete(sessionId);
    console.log(`📊 当前活跃连接数: ${activeServers.size()}`);
  });
});

/**
 * 处理MCP消息的HTTP POST端点
 */
app.post("/mcp/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const message = req.body;
  const clientIP =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  console.log(`📨 收到MCP消息: ${sessionId} (${clientIP})`);
  console.log(`   📝 方法: ${message.method || "unknown"}`);
  console.log(`   🆔 消息ID: ${message.id || "none"}`);

  const serverInstance = activeServers.get(sessionId);

  if (!serverInstance) {
    console.log(`❌ Session未找到: ${sessionId}`);
    return res.status(404).json({ error: "Session not found" });
  }

  try {
    // 处理MCP消息
    const response = await handleMcpMessage(serverInstance.server, message);

    // 通过SSE发送响应
    if (response) {
      serverInstance.transport.handleMcpMessage(response);
      console.log(`✅ MCP消息处理成功: ${sessionId} - ${message.method}`);
    }

    res.json({ status: "message processed" });
  } catch (error) {
    console.error(`❌ MCP消息处理失败: ${sessionId} - ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取服务器状态
 */
app.get("/status", (req, res) => {
  res.json({
    status: "running",
    activeSessions:
      typeof activeServers.size === "function"
        ? activeServers.size()
        : activeServers.size,
    version: SERVER_INFO.version,
    tools: [
      "joker",
      "calculator",
      "student_grades",
      "currency_exchange",
      "currency_exchange_llm",
    ],
    resources: ["greeting"],
  });
});

/**
 * 获取工具列表
 */
app.get("/tools", (req, res) => {
  const server = new SimpleMcpServer();
  res.json(server.getToolInfo());
});

/**
 * 获取资源列表
 */
app.get("/resources", (req, res) => {
  const server = new SimpleMcpServer();
  res.json(server.getResourceInfo());
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 MCP Server with SSE running on port ${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/status`);
  console.log(`🔧 Tools endpoint: http://localhost:${PORT}/tools`);
  console.log(`📚 Resources endpoint: http://localhost:${PORT}/resources`);
  console.log(`\n💡 等待客户端连接...\n`);
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");

  // 关闭所有活跃连接
  const iterator =
    typeof activeServers.entries === "function"
      ? activeServers.entries()
      : activeServers[Symbol.iterator]();
  for (const [sessionId, value] of iterator) {
    const transport = value.transport;
    if (transport) transport.close();
  }

  process.exit(0);
});
