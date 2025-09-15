import { z } from "zod";
import { readStudentsData } from "../utils/csvReader.js";

/**
 * 学生成绩查询工具配置
 */
export const studentGradesConfig = {
  name: "student_grades",
  title: "学生成绩查询",
  description: "查询学生成绩信息：总分最高、各科最高分等",
  inputSchema: {
    query_type: z
      .string()
      .describe(
        "查询类型: total_highest(总分最高), chinese_highest(语文最高), math_highest(数学最高), english_highest(英语最高), all_highest(所有最高分)"
      ),
  },
};

/**
 * 处理学生成绩查询
 * @param {Object} params - 参数对象
 * @param {string} params.query_type - 查询类型
 * @returns {Object} 返回查询结果
 */
export async function studentGradesHandler({ query_type }) {
  try {
    const students = await readStudentsData();

    switch (query_type) {
      case "total_highest": {
        const highestTotal = students.reduce((max, student) =>
          student.总分 > max.总分 ? student : max
        );
        return {
          content: [
            {
              type: "text",
              text: `总分最高的同学是：${highestTotal.姓名}，总分为：${highestTotal.总分}分（语文：${highestTotal.语文}，数学：${highestTotal.数学}，英语：${highestTotal.英语}）`,
            },
          ],
        };
      }

      case "chinese_highest": {
        const highestChinese = students.reduce((max, student) =>
          student.语文 > max.语文 ? student : max
        );
        return {
          content: [
            {
              type: "text",
              text: `语文最高分的同学是：${highestChinese.姓名}，语文成绩：${highestChinese.语文}分`,
            },
          ],
        };
      }

      case "math_highest": {
        const highestMath = students.reduce((max, student) =>
          student.数学 > max.数学 ? student : max
        );
        return {
          content: [
            {
              type: "text",
              text: `数学最高分的同学是：${highestMath.姓名}，数学成绩：${highestMath.数学}分`,
            },
          ],
        };
      }

      case "english_highest": {
        const highestEnglish = students.reduce((max, student) =>
          student.英语 > max.英语 ? student : max
        );
        return {
          content: [
            {
              type: "text",
              text: `英语最高分的同学是：${highestEnglish.姓名}，英语成绩：${highestEnglish.英语}分`,
            },
          ],
        };
      }

      case "all_highest": {
        const highestTotal = students.reduce((max, student) =>
          student.总分 > max.总分 ? student : max
        );
        const highestChinese = students.reduce((max, student) =>
          student.语文 > max.语文 ? student : max
        );
        const highestMath = students.reduce((max, student) =>
          student.数学 > max.数学 ? student : max
        );
        const highestEnglish = students.reduce((max, student) =>
          student.英语 > max.英语 ? student : max
        );

        return {
          content: [
            {
              type: "text",
              text: `班级成绩统计：
总分最高：${highestTotal.姓名}（${highestTotal.总分}分）
语文最高：${highestChinese.姓名}（${highestChinese.语文}分）
数学最高：${highestMath.姓名}（${highestMath.数学}分）
英语最高：${highestEnglish.姓名}（${highestEnglish.英语}分）`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: "错误：不支持的查询类型。支持的查询类型：total_highest(总分最高), chinese_highest(语文最高), math_highest(数学最高), english_highest(英语最高), all_highest(所有最高分)",
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `查询错误：${error.message}`,
        },
      ],
    };
  }
}
