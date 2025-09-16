/**
 * 货币兑换 LLM 模型调用
 * 用于处理用户输入的金额、货币和目标货币，返回兑换后的金额
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 货币汇率表（以美元为基准）
const EXCHANGE_RATES = {
  USD: 1.0, // 美元（基准货币）
  EUR: 1.083, // 欧元
  GBP: 1.272, // 英镑
  JPY: 156.8, // 日元
  CNY: 7.243, // 人民币
  CAD: 1.37, // 加拿大元
  AUD: 1.515, // 澳大利亚元
  CHF: 0.915, // 瑞士法郎
  HKD: 7.81, // 港元
  NZD: 1.646, // 新西兰元
};

// 货币名称映射
const CURRENCY_NAMES = {
  美元: "USD",
  美金: "USD",
  dollar: "USD",
  dollars: "USD",
  欧元: "EUR",
  euro: "EUR",
  euros: "EUR",
  英镑: "GBP",
  pound: "GBP",
  pounds: "GBP",
  日元: "JPY",
  yen: "JPY",
  yens: "JPY",
  人民币: "CNY",
  元: "CNY",
  yuan: "CNY",
  rmb: "CNY",
  加拿大元: "CAD",
  加元: "CAD",
  "canadian dollar": "CAD",
  澳大利亚元: "AUD",
  澳元: "AUD",
  "australian dollar": "AUD",
  瑞士法郎: "CHF",
  法郎: "CHF",
  franc: "CHF",
  francs: "CHF",
  港元: "HKD",
  港币: "HKD",
  "hong kong dollar": "HKD",
  新西兰元: "NZD",
  纽元: "NZD",
  "new zealand dollar": "NZD",
};

/**
 * 解析用户输入，提取金额和货币信息
 * @param {string} userInput - 用户输入文本
 * @returns {Object} 解析结果
 */
function parseUserInput(userInput) {
  const input = userInput.toLowerCase();

  // 提取数字（支持中文数字）
  const numberPattern = /(\d+(?:\.\d+)?)|([一二三四五六七八九十百千万]+)/g;
  const numbers = [];
  let match;

  while ((match = numberPattern.exec(input)) !== null) {
    if (match[1]) {
      numbers.push(parseFloat(match[1]));
    } else if (match[2]) {
      numbers.push(parseChineseNumber(match[2]));
    }
  }

  // 特殊处理：如果没有找到数字，尝试查找"一千"、"一万"等
  if (numbers.length === 0) {
    if (input.includes("一千")) numbers.push(1000);
    else if (input.includes("一万")) numbers.push(10000);
    else if (input.includes("一百")) numbers.push(100);
    else if (input.includes("一十")) numbers.push(10);
  }

  // 查找货币（按优先级排序，避免重复）
  const currencies = [];
  const foundCurrencies = new Set();

  // 先查找ISO代码（优先级最高）
  const isoPattern = /\b([A-Z]{3})\b/g;
  let isoMatch;
  while ((isoMatch = isoPattern.exec(userInput.toUpperCase())) !== null) {
    const code = isoMatch[1];
    if (EXCHANGE_RATES[code] && !foundCurrencies.has(code)) {
      currencies.push({ name: getCurrencyName(code), code });
      foundCurrencies.add(code);
    }
  }

  // 再查找中文货币名称
  for (const [name, code] of Object.entries(CURRENCY_NAMES)) {
    if (input.includes(name.toLowerCase()) && !foundCurrencies.has(code)) {
      currencies.push({ name, code });
      foundCurrencies.add(code);
    }
  }

  return {
    numbers,
    currencies,
    originalInput: userInput,
  };
}

/**
 * 解析中文数字
 * @param {string} chineseNumber - 中文数字
 * @returns {number} 阿拉伯数字
 */
function parseChineseNumber(chineseNumber) {
  const chineseNumbers = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    百: 100,
    千: 1000,
    万: 10000,
  };

  // 特殊处理常见组合
  if (chineseNumber === "一千") return 1000;
  if (chineseNumber === "一万") return 10000;
  if (chineseNumber === "一百") return 100;
  if (chineseNumber === "一十") return 10;

  let result = 0;
  let temp = 0;

  for (let i = 0; i < chineseNumber.length; i++) {
    const char = chineseNumber[i];
    if (chineseNumbers[char]) {
      if (char === "十" || char === "百" || char === "千" || char === "万") {
        if (temp === 0) temp = 1;
        result += temp * chineseNumbers[char];
        temp = 0;
      } else {
        temp = chineseNumbers[char];
      }
    }
  }

  return result + temp;
}

/**
 * 获取货币名称
 * @param {string} code - 货币代码
 * @returns {string} 货币名称
 */
function getCurrencyName(code) {
  const names = {
    USD: "美元",
    EUR: "欧元",
    GBP: "英镑",
    JPY: "日元",
    CNY: "人民币",
    CAD: "加拿大元",
    AUD: "澳大利亚元",
    CHF: "瑞士法郎",
    HKD: "港元",
    NZD: "新西兰元",
  };
  return names[code] || code;
}

/**
 * 执行货币兑换
 * @param {number} amount - 金额
 * @param {string} fromCurrency - 源货币
 * @param {string} toCurrency - 目标货币
 * @returns {number} 兑换后的金额
 */
function performExchange(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // 转换为美元再转换为目标货币
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = usdAmount * EXCHANGE_RATES[toCurrency];

  // 保留两位小数
  return Math.round(convertedAmount * 100) / 100;
}

/**
 * 处理单个用户输入
 * @param {string} userInput - 用户输入
 * @returns {Object} 处理结果
 */
function processUserInput(userInput) {
  try {
    const parsed = parseUserInput(userInput);

    if (parsed.numbers.length === 0) {
      return {
        amount: null,
        fromCurrency: null,
        toCurrency: null,
        convertedAmount: null,
        error: "无法识别金额",
      };
    }

    if (parsed.currencies.length < 2) {
      return {
        amount: parsed.numbers[0],
        fromCurrency: parsed.currencies[0]?.code || null,
        toCurrency: parsed.currencies[1]?.code || null,
        convertedAmount: null,
        error: "无法识别足够的货币信息",
      };
    }

    const amount = parsed.numbers[0];
    const fromCurrency = parsed.currencies[0].code;
    const toCurrency = parsed.currencies[1].code;

    if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[toCurrency]) {
      return {
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount: null,
        error: "不支持的货币",
      };
    }

    const convertedAmount = performExchange(amount, fromCurrency, toCurrency);

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      error: null,
    };
  } catch (error) {
    return {
      amount: null,
      fromCurrency: null,
      toCurrency: null,
      convertedAmount: null,
      error: error.message,
    };
  }
}

/**
 * 读取用户输入CSV文件
 * @param {string} filePath - 文件路径
 * @returns {Array} 用户输入列表
 */
function readUserInputCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    // 跳过标题行
    const inputs = lines.slice(1).map((line) => line.trim());

    return inputs;
  } catch (error) {
    console.error("读取用户输入文件失败:", error);
    return [];
  }
}

/**
 * 写入结果到CSV文件
 * @param {string} filePath - 文件路径
 * @param {Array} results - 结果数组
 */
function writeResultsCSV(filePath, results) {
  try {
    const csvContent = [
      "金额,货币,目标货币,兑换后的金额",
      ...results.map((result) => {
        if (result.error) {
          return `${result.amount || ""},${result.fromCurrency || ""},${
            result.toCurrency || ""
          },错误: ${result.error}`;
        }
        return `${result.amount},${result.fromCurrency},${result.toCurrency},${result.convertedAmount}`;
      }),
    ].join("\n");

    fs.writeFileSync(filePath, csvContent, "utf-8");
    console.log(`✅ 结果已写入文件: ${filePath}`);
  } catch (error) {
    console.error("写入结果文件失败:", error);
  }
}

/**
 * 货币兑换LLM处理器
 * @param {Object} args - 参数对象
 * @returns {Object} 处理结果
 */
export async function currencyExchangeLLMHandler(args) {
  try {
    const projectRoot = path.resolve(__dirname, "../../");
    const inputFile = path.join(projectRoot, "用户输入.csv");
    const outputFile = path.join(projectRoot, "结果输出.csv");

    console.log("📖 读取用户输入文件:", inputFile);
    const userInputs = readUserInputCSV(inputFile);

    if (userInputs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "❌ 没有找到用户输入数据",
          },
        ],
      };
    }

    console.log(`📊 处理 ${userInputs.length} 个用户输入`);
    const results = [];

    for (const userInput of userInputs) {
      console.log(`🔄 处理: ${userInput}`);
      const result = processUserInput(userInput);
      results.push(result);

      if (result.error) {
        console.log(`❌ 处理失败: ${result.error}`);
      } else {
        console.log(
          `✅ 兑换结果: ${result.amount} ${result.fromCurrency} = ${result.convertedAmount} ${result.toCurrency}`
        );
      }
    }

    // 写入结果文件
    writeResultsCSV(outputFile, results);

    const successCount = results.filter((r) => !r.error).length;
    const errorCount = results.filter((r) => r.error).length;

    return {
      content: [
        {
          type: "text",
          text: `✅ 货币兑换LLM处理完成！
📊 处理统计:
- 总输入: ${userInputs.length} 条
- 成功: ${successCount} 条
- 失败: ${errorCount} 条
- 结果文件: ${outputFile}

📋 详细结果:
${results
  .map((result, index) => {
    const input = userInputs[index];
    if (result.error) {
      return `${index + 1}. "${input}" → 错误: ${result.error}`;
    }
    return `${index + 1}. "${input}" → ${result.amount} ${
      result.fromCurrency
    } = ${result.convertedAmount} ${result.toCurrency}`;
  })
  .join("\n")}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ 货币兑换LLM处理失败: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * 直接处理单个输入（用于测试）
 * @param {string} userInput - 用户输入
 * @returns {Object} 处理结果
 */
export function processSingleInput(userInput) {
  return processUserInput(userInput);
}
