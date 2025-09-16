# 货币兑换 MCP 服务器

一个基于 MCP (Model Context Protocol) 的货币兑换服务器，支持多种主流货币之间的兑换计算。

## 功能特性

- 💱 **货币兑换**: 支持 10 种主流货币之间的兑换计算
- 🤖 **LLM 集成**: 支持自然语言处理货币兑换请求
- 📊 **CSV 处理**: 支持批量处理 CSV 文件中的兑换请求
- 🌐 **Web 客户端**: 提供完整的 Web 界面进行货币兑换

## 支持的货币

| 货币       | ISO 代码 | 兑换美元汇率 |
| ---------- | -------- | ------------ |
| 美元       | USD      | 1.000 (基准) |
| 欧元       | EUR      | 1.083        |
| 英镑       | GBP      | 1.272        |
| 日元       | JPY      | 156.80       |
| 人民币     | CNY      | 7.243        |
| 加拿大元   | CAD      | 1.370        |
| 澳大利亚元 | AUD      | 1.515        |
| 瑞士法郎   | CHF      | 0.915        |
| 港元       | HKD      | 7.810        |
| 新西兰元   | NZD      | 1.646        |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
./start-server.sh
```

### 3. 访问客户端

- **货币兑换客户端**: http://localhost:3000/examples/currency-exchange-client.html
- **简单客户端测试**: http://localhost:3000/test-client-simple.html

## API 端点

- **状态检查**: `GET /status`
- **工具列表**: `GET /tools`
- **SSE 连接**: `GET /sse?sessionId=<session_id>`
- **MCP 消息**: `POST /mcp/<session_id>`

## 核心工具

### currency_exchange

计算不同货币之间的兑换金额

```javascript
{
  "name": "currency_exchange",
  "arguments": {
    "amount": 1000,
    "fromCurrency": "CNY",
    "toCurrency": "HKD"
  }
}
```

### currency_exchange_llm

使用 LLM 处理自然语言货币兑换请求

```javascript
{
  "name": "currency_exchange_llm",
  "arguments": {
    "userInput": "我想兑换一千人民币为港元"
  }
}
```

## 文件结构

```
├── src/                          # 服务器端代码
│   ├── mcpServer.js              # MCP 服务器核心
│   ├── server-sse.js             # SSE 服务器
│   ├── config/
│   │   └── config.js             # 服务器配置
│   ├── tools/                    # MCP 工具
│   │   ├── currencyExchange.js   # 货币兑换工具
│   │   ├── currencyExchangeLLM.js # LLM 处理工具
│   │   ├── calculator.js         # 计算器工具
│   │   ├── joker.js              # 笑话工具
│   │   ├── llm.js                # LLM 工具
│   │   └── studentGrades.js      # 学生成绩工具
│   ├── transports/
│   │   └── sseTransport.js       # SSE 传输层
│   └── utils/
│       ├── csvReader.js          # CSV 读取工具
│       └── sessionStore.js       # 会话存储
├── client/                       # 客户端代码
│   ├── html/
│   │   └── currency-exchange-client.html # Web 客户端
│   ├── js/
│   │   └── CurrencyExchangeClient.js     # 客户端核心类
│   └── css/                      # CSS 样式文件（预留）
├── tests/                        # 测试文件
├── 用户输入.csv                   # LLM 输入文件
├── 结果输出.csv                   # LLM 输出文件
└── start-server.sh               # 启动脚本
```

## 使用示例

### Web 客户端使用

1. 访问 http://localhost:3000/client/html/currency-exchange-client.html
2. 输入金额、源货币和目标货币
3. 点击"兑换货币"按钮查看结果

### LLM 批量处理

1. 在 `用户输入.csv` 文件中添加自然语言兑换请求
2. 使用 `currency_exchange_llm` 工具处理
3. 结果将保存到 `结果输出.csv` 文件

## 客户端开发说明

### 客户端代码结构

```
client/
├── html/                    # HTML页面
│   └── currency-exchange-client.html
├── js/                      # JavaScript模块
│   └── CurrencyExchangeClient.js
└── css/                     # CSS样式文件（预留）
```

### 客户端文件说明

#### HTML 页面

- `currency-exchange-client.html`: 货币兑换 MCP 客户端的主页面，提供用户界面和交互功能

#### JavaScript 模块

- `CurrencyExchangeClient.js`: MCP 客户端核心类，负责与服务器的 SSE 连接和 MCP 消息处理

### 客户端开发特性

- 所有客户端代码都使用 ES6 模块语法
- HTML 页面通过`<script type="module">`加载 JavaScript 模块
- 客户端使用浏览器原生的 EventSource 进行 SSE 连接
- 支持现代浏览器的 ES6+特性

## 技术栈

- **Node.js**: 服务器运行环境
- **Express.js**: Web 服务器框架
- **Server-Sent Events (SSE)**: 实时通信
- **MCP Protocol**: 模型上下文协议
- **CSV 处理**: 批量数据处理

## 许可证

MIT License
