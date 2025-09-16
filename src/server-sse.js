import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { SSETransport } from "./transports/sseTransport.js";
import { SimpleMcpServer } from "./mcpServer.js";

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 存储活跃的MCP服务器实例
const activeServers = new Map();

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

  // 获取工具处理器
  const tools = server.getTools();
  const tool = tools.find((t) => t.name === name);

  if (!tool) {
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

  console.log(`New SSE connection: ${sessionId}`);

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
    console.log(`MCP server started for session: ${sessionId}`);

    // 发送服务器启动成功状态
    transport.sendServerStatus("started", "MCP服务器已成功启动", {
      sessionId,
      serverInfo: {
        name: "demo-server",
        version: "1.0.0",
        tools: server.getTools().map((t) => t.name),
        resources: server.getResources().map((r) => r.name),
      },
    });
  } catch (error) {
    console.error(`Failed to start MCP server: ${error.message}`);

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
    console.log(`SSE connection closed: ${sessionId}`);
    activeServers.delete(sessionId);
  });

  // 处理传输层错误
  transport.on("error", (error) => {
    console.error(`Transport error: ${error.message}`);
    activeServers.delete(sessionId);
  });
});

/**
 * 处理MCP消息的HTTP POST端点
 */
app.post("/mcp/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const message = req.body;

  const serverInstance = activeServers.get(sessionId);

  if (!serverInstance) {
    return res.status(404).json({ error: "Session not found" });
  }

  try {
    // 处理MCP消息
    const response = await handleMcpMessage(serverInstance.server, message);

    // 通过SSE发送响应
    if (response) {
      serverInstance.transport.handleMcpMessage(response);
    }

    res.json({ status: "message processed" });
  } catch (error) {
    console.error(`Failed to handle message: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取服务器状态
 */
app.get("/status", (req, res) => {
  res.json({
    status: "running",
    activeSessions: activeServers.size,
    version: "1.0.0",
    tools: ["joker", "calculator", "student_grades"],
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
  console.log(`🚀 MCP Server with SSE running on port ${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/status`);
  console.log(`🔧 Tools endpoint: http://localhost:${PORT}/tools`);
  console.log(`📚 Resources endpoint: http://localhost:${PORT}/resources`);
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");

  // 关闭所有活跃连接
  for (const [sessionId, { transport }] of activeServers) {
    transport.close();
  }

  process.exit(0);
});
