#!/usr/bin/env node

/**
 * 测试运行脚本
 * 用于运行所有测试并生成测试报告
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 开始运行MCP计算器测试...\n");

try {
  // 运行Jest测试
  console.log("📊 运行单元测试...");
  execSync("npm test", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("\n✅ 所有测试通过！");
  console.log("\n📋 测试覆盖范围：");
  console.log("  - 计算器功能测试 (加减乘除)");
  console.log("  - 学生成绩查询测试");
  console.log("  - Joker工具测试");
  console.log("  - 集成测试");
} catch (error) {
  console.error("\n❌ 测试失败：", error.message);
  process.exit(1);
}
