# MCP Server with SSE Support

## 🚀 概述

这个项目现在支持两种传输方式：

1. **Stdio 传输** - 传统的标准输入/输出方式
2. **SSE 传输** - 基于 HTTP Server-Sent Events 的 Web 方式

## 📁 项目结构

```
mcp-calculator/
├── src/
│   ├── index.js              # Stdio版本的MCP服务器
│   ├── server-sse.js         # SSE版本的MCP服务器
│   ├── transports/           # 传输层实现
│   │   └── sseTransport.js   # SSE传输层
│   ├── tools/                # MCP工具
│   │   ├── calculator.js     # 计算器工具
│   │   ├── studentGrades.js  # 学生成绩查询工具
│   │   └── joker.js          # 笑话工具
│   └── utils/                # 工具函数
│       └── csvReader.js      # CSV读取器
├── examples/                 # 客户端示例
│   ├── client.html           # Web客户端
│   └── client.js             # Node.js客户端
├── tests/                    # 测试文件
└── package.json              # 项目配置
```

## 🛠️ 安装和运行

### 安装依赖

```bash
npm install
```

### 运行方式

#### 1. Stdio 版本（传统方式）

```bash
npm start
# 或
node src/index.js
```

#### 2. SSE 版本（Web 方式）

```bash
npm run start:sse
# 或
node src/server-sse.js
```

服务器将在 `http://localhost:3000` 启动。

## 🌐 SSE API 端点

### 主要端点

- **SSE 连接**: `GET /sse?sessionId=<session_id>`
- **发送 MCP 消息**: `POST /mcp/<session_id>`
- **服务器状态**: `GET /status`
- **工具列表**: `GET /tools`
- **资源列表**: `GET /resources`

### 示例

#### 获取服务器状态

```bash
curl http://localhost:3000/status
```

响应：

```json
{
  "status": "running",
  "activeSessions": 0,
  "version": "1.0.0",
  "tools": ["joker", "calculator", "student_grades"],
  "resources": ["greeting"]
}
```

#### 获取工具列表

```bash
curl http://localhost:3000/tools
```

## 🎯 客户端使用

### Web 客户端

1. 启动 SSE 服务器：`npm run start:sse`
2. 打开 `examples/client.html` 在浏览器中
3. 点击"连接"按钮
4. 使用各种工具进行测试

### Node.js 客户端

```bash
# 启动SSE服务器
npm run start:sse

# 在另一个终端运行客户端
npm run client
```

## 🔧 工具使用示例

### 计算器工具

```javascript
const message = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "calculator",
    arguments: {
      operation: "add",
      a: 10,
      b: 5,
    },
  },
};
```

### 学生成绩查询工具

```javascript
const message = {
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "student_grades",
    arguments: {
      query_type: "english_highest",
    },
  },
};
```

### 笑话工具

```javascript
const message = {
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "joker",
    arguments: {
      topic: "programming",
    },
  },
};
```

### 问候资源

```javascript
const message = {
  jsonrpc: "2.0",
  id: 4,
  method: "resources/read",
  params: {
    uri: "greeting://徐紫微",
  },
};
```

## 🧪 测试

运行所有测试：

```bash
npm test
```

运行特定测试：

```bash
# SSE传输层测试
npm test tests/sse.test.js

# 计算器测试
npm test tests/calculator.test.js

# 学生成绩测试
npm test tests/student-grades.test.js
```

## 🔄 传输方式对比

| 特性       | Stdio         | SSE                       |
| ---------- | ------------- | ------------------------- |
| 连接方式   | 标准输入/输出 | HTTP + Server-Sent Events |
| 客户端类型 | 命令行工具    | Web 浏览器、HTTP 客户端   |
| 实时通信   | ❌            | ✅                        |
| 多客户端   | ❌            | ✅                        |
| 跨域支持   | N/A           | ✅ (CORS)                 |
| 会话管理   | ❌            | ✅                        |
| 错误处理   | 基础          | 增强                      |

## 🚀 部署建议

### 生产环境

1. 使用环境变量配置端口：

   ```bash
   PORT=8080 npm run start:sse
   ```

2. 使用 PM2 进行进程管理：

   ```bash
   npm install -g pm2
   pm2 start src/server-sse.js --name "mcp-server"
   ```

3. 使用 Nginx 进行反向代理和负载均衡

### Docker 部署

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
COPY students.csv ./
EXPOSE 3000
CMD ["npm", "run", "start:sse"]
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**

   ```bash
   # 使用不同端口
   PORT=8080 npm run start:sse
   ```

2. **CORS 错误**

   - 确保服务器配置了 CORS 中间件
   - 检查客户端域名是否被允许

3. **连接超时**
   - 检查防火墙设置
   - 确保服务器正在运行

### 调试

启用详细日志：

```bash
DEBUG=mcp:* npm run start:sse
```

## 📚 更多信息

- [MCP 协议文档](https://modelcontextprotocol.io/)
- [Server-Sent Events MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Express.js 文档](https://expressjs.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！
