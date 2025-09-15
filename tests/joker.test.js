import { describe, test, expect } from "@jest/globals";
import { jokerHandler } from "../src/tools/joker.js";

// 使用导入的joker函数
const joker = jokerHandler;

describe("Joker工具功能测试", () => {
  test("基本笑话功能测试", async () => {
    const result = await joker({ topic: "programming" });
    expect(result.content[0].text).toBe(
      "I will tell you a joke about programming"
    );
  });

  test("中文话题测试", async () => {
    const result = await joker({ topic: "程序员" });
    expect(result.content[0].text).toBe("I will tell you a joke about 程序员");
  });

  test("空话题测试", async () => {
    const result = await joker({ topic: "" });
    expect(result.content[0].text).toBe("I will tell you a joke about ");
  });

  test("特殊字符话题测试", async () => {
    const result = await joker({ topic: "AI & Machine Learning" });
    expect(result.content[0].text).toBe(
      "I will tell you a joke about AI & Machine Learning"
    );
  });

  test("数字话题测试", async () => {
    const result = await joker({ topic: "123" });
    expect(result.content[0].text).toBe("I will tell you a joke about 123");
  });

  test("长话题测试", async () => {
    const longTopic =
      "This is a very long topic that contains many words and should still work properly";
    const result = await joker({ topic: longTopic });
    expect(result.content[0].text).toBe(
      `I will tell you a joke about ${longTopic}`
    );
  });

  test("返回格式验证", async () => {
    const result = await joker({ topic: "test" });
    expect(result).toHaveProperty("content");
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty("type", "text");
    expect(result.content[0]).toHaveProperty("text");
  });
});
