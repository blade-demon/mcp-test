import { describe, test, expect } from "@jest/globals";
import { calculatorHandler } from "../src/tools/calculator.js";

// 使用导入的计算器函数
const calculator = calculatorHandler;

describe("计算器功能测试", () => {
  test("加法测试 - 使用英文操作名", async () => {
    const result = await calculator({ operation: "add", a: 5, b: 3 });
    expect(result.content[0].text).toBe("5 + 3 = 8");
  });

  test("加法测试 - 使用符号", async () => {
    const result = await calculator({ operation: "+", a: 10, b: 7 });
    expect(result.content[0].text).toBe("10 + 7 = 17");
  });

  test("减法测试 - 使用英文操作名", async () => {
    const result = await calculator({ operation: "subtract", a: 10, b: 4 });
    expect(result.content[0].text).toBe("10 - 4 = 6");
  });

  test("减法测试 - 使用符号", async () => {
    const result = await calculator({ operation: "-", a: 15, b: 8 });
    expect(result.content[0].text).toBe("15 - 8 = 7");
  });

  test("乘法测试 - 使用英文操作名", async () => {
    const result = await calculator({ operation: "multiply", a: 6, b: 7 });
    expect(result.content[0].text).toBe("6 × 7 = 42");
  });

  test("乘法测试 - 使用符号", async () => {
    const result = await calculator({ operation: "*", a: 9, b: 8 });
    expect(result.content[0].text).toBe("9 × 8 = 72");
  });

  test("除法测试 - 使用英文操作名", async () => {
    const result = await calculator({ operation: "divide", a: 15, b: 3 });
    expect(result.content[0].text).toBe("15 ÷ 3 = 5");
  });

  test("除法测试 - 使用符号", async () => {
    const result = await calculator({ operation: "/", a: 20, b: 4 });
    expect(result.content[0].text).toBe("20 ÷ 4 = 5");
  });

  test("除零错误测试", async () => {
    const result = await calculator({ operation: "divide", a: 10, b: 0 });
    expect(result.content[0].text).toBe("错误：除数不能为零！");
  });

  test("无效操作测试", async () => {
    const result = await calculator({ operation: "invalid", a: 5, b: 3 });
    expect(result.content[0].text).toBe(
      "错误：不支持的运算类型。支持的运算：add(加法), subtract(减法), multiply(乘法), divide(除法)"
    );
  });

  test("大小写不敏感测试", async () => {
    const result = await calculator({ operation: "ADD", a: 3, b: 4 });
    expect(result.content[0].text).toBe("3 + 4 = 7");
  });

  test("负数运算测试", async () => {
    const result = await calculator({ operation: "add", a: -5, b: 3 });
    expect(result.content[0].text).toBe("-5 + 3 = -2");
  });

  test("小数运算测试", async () => {
    const result = await calculator({ operation: "multiply", a: 2.5, b: 4 });
    expect(result.content[0].text).toBe("2.5 × 4 = 10");
  });
});
