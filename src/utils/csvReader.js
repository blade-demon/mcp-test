import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 读取学生成绩CSV文件
 * @returns {Promise<Array>} 返回学生数据数组
 */
export async function readStudentsData() {
  return new Promise((resolve, reject) => {
    const students = [];
    const csvPath = path.join(__dirname, "..", "..", "students.csv");

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        students.push({
          姓名: row.姓名,
          语文: parseInt(row.语文),
          数学: parseInt(row.数学),
          英语: parseInt(row.英语),
          总分: parseInt(row.语文) + parseInt(row.数学) + parseInt(row.英语),
        });
      })
      .on("end", () => {
        resolve(students);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
