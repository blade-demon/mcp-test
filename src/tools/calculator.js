import { z } from "zod";

/**
 * 计算器工具配置
 */
export const calculatorConfig = {
  name: "calculator",
  title: "四则运算计算器",
  description: "执行基本的加减乘除运算",
  inputSchema: {
    operation: z
      .string()
      .describe(
        "运算类型: add(加法), subtract(减法), multiply(乘法), divide(除法)"
      ),
    a: z.number().describe("第一个数字"),
    b: z.number().describe("第二个数字"),
  },
};

/**
 * 执行计算器运算
 * @param {Object} params - 参数对象
 * @param {string} params.operation - 运算类型
 * @param {number} params.a - 第一个数字
 * @param {number} params.b - 第二个数字
 * @returns {Object} 返回计算结果
 */
export async function calculatorHandler({ operation, a, b }) {
  try {
    let result;
    let operationText;

    switch (operation.toLowerCase()) {
      case "add":
      case "+":
        result = a + b;
        operationText = `${a} + ${b}`;
        break;
      case "subtract":
      case "-":
        result = a - b;
        operationText = `${a} - ${b}`;
        break;
      case "multiply":
      case "*":
        result = a * b;
        operationText = `${a} × ${b}`;
        break;
      case "divide":
      case "/":
        if (b === 0) {
          return {
            content: [{ type: "text", text: "错误：除数不能为零！" }],
          };
        }
        result = a / b;
        operationText = `${a} ÷ ${b}`;
        break;
      default:
        return {
          content: [
            {
              type: "text",
              text: "错误：不支持的运算类型。支持的运算：add(加法), subtract(减法), multiply(乘法), divide(除法)",
            },
          ],
        };
    }

    return {
      content: [{ type: "text", text: `${operationText} = ${result}` }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `计算错误：${error.message}` }],
    };
  }
}
