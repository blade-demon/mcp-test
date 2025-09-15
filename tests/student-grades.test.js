import { describe, test, expect } from "@jest/globals";
import { studentGradesHandler } from "../src/tools/studentGrades.js";
import { readStudentsData } from "../src/utils/csvReader.js";

// 使用导入的学生成绩查询函数
const studentGrades = studentGradesHandler;

describe("学生成绩查询功能测试", () => {
  test("查询总分最高的同学", async () => {
    const result = await studentGrades({ query_type: "total_highest" });
    expect(result.content[0].text).toContain("总分最高的同学是：");
    expect(result.content[0].text).toContain("总分为：");
  });

  test("查询语文最高分的同学", async () => {
    const result = await studentGrades({ query_type: "chinese_highest" });
    expect(result.content[0].text).toContain("语文最高分的同学是：");
    expect(result.content[0].text).toContain("语文成绩：");
  });

  test("查询数学最高分的同学", async () => {
    const result = await studentGrades({ query_type: "math_highest" });
    expect(result.content[0].text).toContain("数学最高分的同学是：");
    expect(result.content[0].text).toContain("数学成绩：");
  });

  test("查询英语最高分的同学", async () => {
    const result = await studentGrades({ query_type: "english_highest" });
    expect(result.content[0].text).toContain("英语最高分的同学是：");
    expect(result.content[0].text).toContain("英语成绩：");
  });

  test("查询所有最高分统计", async () => {
    const result = await studentGrades({ query_type: "all_highest" });
    expect(result.content[0].text).toContain("班级成绩统计：");
    expect(result.content[0].text).toContain("总分最高：");
    expect(result.content[0].text).toContain("语文最高：");
    expect(result.content[0].text).toContain("数学最高：");
    expect(result.content[0].text).toContain("英语最高：");
  });

  test("无效查询类型测试", async () => {
    const result = await studentGrades({ query_type: "invalid" });
    expect(result.content[0].text).toContain("错误：不支持的查询类型");
  });

  test("验证英语最高分是孙八", async () => {
    const result = await studentGrades({ query_type: "english_highest" });
    expect(result.content[0].text).toContain("孙八");
    expect(result.content[0].text).toContain("92分");
  });

  test("验证数据完整性", async () => {
    const students = await readStudentsData();
    expect(students.length).toBeGreaterThan(0);
    expect(students[0]).toHaveProperty("姓名");
    expect(students[0]).toHaveProperty("语文");
    expect(students[0]).toHaveProperty("数学");
    expect(students[0]).toHaveProperty("英语");
    expect(students[0]).toHaveProperty("总分");
  });
});
