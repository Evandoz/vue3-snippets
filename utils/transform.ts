// 工具函数·数据转换类 transformX 、toX 、X2Y：名词词性

/**
 * 将枚举对象转换为数组
 * @example
 * enum Status {
 *   Active = 1,
 *   Inactive = 2
 * }
 * const arr = enum2Arr(Status); // [1, 2]
 *
 * enum Direction {
 *   Up = 'UP',
 *   Down = 'DOWN'
 * }
 * const arr = enum2Arr(Direction); // ['UP', 'DOWN']
 * @param obj 枚举对象
 * @returns 包含枚举值的数组
 */
export function enum2Arr(obj: object) {
  // 当枚举值是数字时，Object.values 会将枚举键页列举出来，因此需要排除掉
  const arr = Object.values(obj);

  function isNumber(obj: any): obj is number {
    return (
      Object.prototype.toString.call(obj) === '[object Number]' && obj === obj
    );
  }

  const hasNumber = arr.some((item) => isNumber(item));
  if (hasNumber) {
    return arr.filter((item) => isNumber(item));
  }
  return arr;
}

/**
 * 提取字符串中的数字
 * @example
 * const num = extractNumber('123abc456'); // 123456
 * const num = extractNumber('2012-12-03 04:05:06'); // 20121203040506
 * @param obj 字符串
 * @returns 数字
 */
export function extractNumber(obj: any) {
  if (typeof obj !== 'string') return NaN;
  const matched = obj.match(/\d+/g);
  if (!matched) return NaN;
  return Number(matched.join(''));
}

/**
 * CSV 文件生成
 * @example
 * const csv = toCsv([{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }]);
 * @param data 数据
 * @returns CSV 字符串
 */
export const toCsv = (data: any[]) => {
  if (!data || data.length === 0) return '';

  // 获取表头
  const headers = Object.keys(data[0]);

  // 处理值的函数
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '';

    // 如果是对象或数组，转换为 JSON 字符串
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (error) {
        return String(value);
      }
    }

    // 其他类型直接转换为字符串
    return String(value);
  };

  // 处理包含逗号、引号或换行符的值
  const escapeValue = (value: string): string => {
    if (
      value.includes(',') ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // 生成 CSV 内容
  let csvContent = headers.join(',') + '\n';

  // 添加数据行
  data.forEach((row) => {
    const values = headers.map((header) => {
      const formattedValue = formatValue(row[header]);
      return escapeValue(formattedValue);
    });
    csvContent += values.join(',') + '\n';
  });

  return csvContent;
};
