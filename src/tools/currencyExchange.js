/**
 * 货币兑换工具
 * 支持多种货币之间的兑换计算
 */

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

/**
 * 货币兑换处理器
 * @param {Object} args - 参数对象
 * @param {number} args.amount - 兑换金额
 * @param {string} args.fromCurrency - 源货币代码
 * @param {string} args.toCurrency - 目标货币代码
 * @returns {Object} 兑换结果
 */
export async function currencyExchangeHandler(args) {
  try {
    const { amount, fromCurrency, toCurrency } = args;

    // 参数验证
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new Error("金额必须是一个大于0的数字");
    }

    if (!fromCurrency || !toCurrency) {
      throw new Error("源货币和目标货币不能为空");
    }

    const fromUpper = fromCurrency.toUpperCase();
    const toUpper = toCurrency.toUpperCase();

    if (!EXCHANGE_RATES[fromUpper]) {
      throw new Error(`不支持的源货币: ${fromCurrency}`);
    }

    if (!EXCHANGE_RATES[toUpper]) {
      throw new Error(`不支持的目标货币: ${toCurrency}`);
    }

    if (fromUpper === toUpper) {
      return {
        content: [
          {
            type: "text",
            text: `兑换结果: ${amount.toFixed(
              2
            )} ${fromUpper} = ${amount.toFixed(
              2
            )} ${toUpper} (相同货币无需兑换)`,
          },
        ],
      };
    }

    // 计算兑换金额
    // 1. 先将源货币转换为美元
    const usdAmount = amount / EXCHANGE_RATES[fromUpper];

    // 2. 再将美元转换为目标货币
    const convertedAmount = usdAmount * EXCHANGE_RATES[toUpper];

    // 3. 保留两位小数，第三位小数四舍五入
    const finalAmount = Math.round(convertedAmount * 100) / 100;

    const result = {
      content: [
        {
          type: "text",
          text: `兑换结果: ${amount.toFixed(
            2
          )} ${fromUpper} = ${finalAmount.toFixed(2)} ${toUpper}`,
        },
      ],
    };

    return result;
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `兑换失败: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * 获取支持的货币列表
 * @returns {Object} 货币列表
 */
export function getSupportedCurrencies() {
  const currencies = Object.keys(EXCHANGE_RATES).map((code) => ({
    code,
    name: getCurrencyName(code),
    rate: EXCHANGE_RATES[code],
  }));

  return {
    content: [
      {
        type: "text",
        text: `支持的货币列表:\n${currencies
          .map((c) => `${c.code} - ${c.name} (汇率: ${c.rate})`)
          .join("\n")}`,
      },
    ],
  };
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
 * 批量货币兑换
 * @param {Array} exchanges - 兑换请求数组
 * @returns {Object} 批量兑换结果
 */
export function batchCurrencyExchange(exchanges) {
  const results = [];

  for (const exchange of exchanges) {
    const result = currencyExchangeHandler(exchange);
    results.push({
      input: exchange,
      output: result,
    });
  }

  return {
    content: [
      {
        type: "text",
        text: `批量兑换完成，共处理 ${results.length} 个请求`,
      },
    ],
    results,
  };
}
