import { z } from "zod";

/**
 * Joker工具配置
 */
export const jokerConfig = {
  name: "joker",
  title: "tell me joke",
  description: "tell me joke about the topic",
  inputSchema: { topic: z.string() },
};

/**
 * 处理joker请求
 * @param {Object} params - 参数对象
 * @param {string} params.topic - 笑话主题
 * @returns {Object} 返回笑话内容
 */
export async function jokerHandler({ topic }) {
  return {
    content: [{ type: "text", text: `I will tell you a joke about ${topic}` }],
  };
}
