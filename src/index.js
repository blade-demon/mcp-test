import dotenv from "dotenv";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 加载环境变量
dotenv.config();

// 导入工具配置和处理器
import { jokerConfig, jokerHandler } from "./tools/joker.js";
import { calculatorConfig, calculatorHandler } from "./tools/calculator.js";
import {
  studentGradesConfig,
  studentGradesHandler,
} from "./tools/studentGrades.js";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

// 注册joker工具
server.registerTool(
  jokerConfig.name,
  {
    title: jokerConfig.title,
    description: jokerConfig.description,
    inputSchema: jokerConfig.inputSchema,
  },
  jokerHandler
);

// 注册计算器工具
server.registerTool(
  calculatorConfig.name,
  {
    title: calculatorConfig.title,
    description: calculatorConfig.description,
    inputSchema: calculatorConfig.inputSchema,
  },
  calculatorHandler
);

// 注册学生成绩查询工具
server.registerTool(
  studentGradesConfig.name,
  {
    title: studentGradesConfig.title,
    description: studentGradesConfig.description,
    inputSchema: studentGradesConfig.inputSchema,
  },
  studentGradesHandler
);

// Add a dynamic greeting resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  {
    title: "Greeting Resource", // Display name for UI
    description: "Dynamic greeting generator",
  },
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
