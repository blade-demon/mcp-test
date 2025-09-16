import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import { SSETransport } from "../src/transports/sseTransport.js";

// 模拟HTTP响应对象
class MockResponse {
  constructor() {
    this.headers = {};
    this.statusCode = 200;
    this.data = "";
    this.ended = false;
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = { ...this.headers, ...headers };
  }

  write(data) {
    this.data += data;
  }

  end() {
    this.ended = true;
  }
}

// 模拟HTTP请求对象
class MockRequest {
  constructor() {
    this.on = jest.fn();
  }
}

describe("SSE传输层测试", () => {
  let mockRes;
  let mockReq;
  let transport;

  beforeAll(() => {
    mockRes = new MockResponse();
    mockReq = new MockRequest();
  });

  afterAll(() => {
    if (transport) {
      transport.close();
    }
  });

  test("创建SSE传输层", () => {
    transport = new SSETransport(mockRes, mockReq);

    expect(transport).toBeDefined();
    expect(transport.isConnected).toBe(true);
    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.headers["Content-Type"]).toBe("text/event-stream");
    expect(mockRes.headers["Cache-Control"]).toBe("no-cache");
    expect(mockRes.headers["Connection"]).toBe("keep-alive");
  });

  test("发送SSE消息", () => {
    transport.sendSSEMessage("test-event", { message: "test data" });

    expect(mockRes.data).toContain("event: test-event");
    expect(mockRes.data).toContain('data: {"message":"test data"}');
  });

  test("发送MCP消息", async () => {
    const message = { id: 1, method: "test" };
    await transport.send(message);

    expect(mockRes.data).toContain("event: mcp-message");
    expect(mockRes.data).toContain('data: {"id":1,"method":"test"}');
  });

  test("处理消息", () => {
    const testData = JSON.stringify({ id: 1, result: "success" });

    // 监听消息事件
    let receivedMessage = null;
    transport.on("message", (message) => {
      receivedMessage = message;
    });

    transport.handleMessage(testData);

    expect(receivedMessage).toEqual({ id: 1, result: "success" });
  });

  test("处理无效JSON消息", () => {
    let errorReceived = false;
    transport.on("error", (error) => {
      errorReceived = true;
      expect(error.message).toContain("Failed to parse message");
    });

    transport.handleMessage("invalid json");

    expect(errorReceived).toBe(true);
  });

  test("关闭连接", () => {
    // 重置mockRes以测试关闭
    const newMockRes = new MockResponse();
    const newTransport = new SSETransport(newMockRes, new MockRequest());

    // 确保连接状态为true
    expect(newTransport.isConnected).toBe(true);

    newTransport.close();

    expect(newTransport.isConnected).toBe(false);
    expect(newMockRes.ended).toBe(true);
  });

  test("连接事件", () => {
    const newTransport = new SSETransport(
      new MockResponse(),
      new MockRequest()
    );

    let connectedEvent = false;
    newTransport.on("connect", () => {
      connectedEvent = true;
    });

    // 手动触发连接事件
    newTransport.emit("connect");

    expect(connectedEvent).toBe(true);

    newTransport.close();
  });

  test("消息缓冲", () => {
    const bufferedTransport = new SSETransport(
      new MockResponse(),
      new MockRequest()
    );
    bufferedTransport.isConnected = false; // 模拟未连接状态

    // 清空初始的连接消息
    bufferedTransport.messageBuffer = [];

    bufferedTransport.sendSSEMessage("buffered-event", { data: "buffered" });

    expect(bufferedTransport.messageBuffer).toHaveLength(1);
    expect(bufferedTransport.messageBuffer[0]).toEqual({
      event: "buffered-event",
      data: { data: "buffered" },
    });

    bufferedTransport.close();
  });
});
