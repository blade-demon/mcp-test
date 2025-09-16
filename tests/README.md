# MCP 计算器测试文档

## 测试结构

```
tests/
├── calculator.test.js      # 计算器功能测试
├── student-grades.test.js  # 学生成绩查询测试
├── joker.test.js          # Joker工具测试
├── integration.test.js     # 集成测试
├── run-tests.js           # 测试运行脚本
└── README.md              # 测试文档
```

## 运行测试

### 安装测试依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
# 只运行计算器测试
npx jest tests/calculator.test.js

# 只运行学生成绩测试
npx jest tests/student-grades.test.js

# 只运行joker测试
npx jest tests/joker.test.js
```

### 监视模式运行测试

```bash
npm run test:watch
```

### 使用自定义测试脚本

```bash
node tests/run-tests.js
```

## 测试覆盖范围

### 计算器功能测试

- ✅ 加法运算（英文名和符号）
- ✅ 减法运算（英文名和符号）
- ✅ 乘法运算（英文名和符号）
- ✅ 除法运算（英文名和符号）
- ✅ 除零错误处理
- ✅ 无效操作处理
- ✅ 大小写不敏感
- ✅ 负数运算
- ✅ 小数运算

### 学生成绩查询测试

- ✅ 总分最高查询
- ✅ 语文最高分查询
- ✅ 数学最高分查询
- ✅ 英语最高分查询
- ✅ 所有最高分统计
- ✅ 无效查询类型处理
- ✅ 数据完整性验证

### Joker 工具测试

- ✅ 基本笑话功能
- ✅ 中文话题支持
- ✅ 特殊字符处理
- ✅ 返回格式验证

### 集成测试

- ✅ 工具注册验证
- ✅ 输入模式验证
- ✅ 输出格式一致性

## 测试数据

测试使用 `students.csv` 文件中的真实学生成绩数据，包含 29 名学生的语文、数学、英语成绩。

## 注意事项

1. 确保 `students.csv` 文件存在于项目根目录
2. 测试使用 ES 模块，需要 Node.js 14+版本
3. 所有测试都是异步的，使用 async/await 语法
4. 测试覆盖了正常情况和异常情况
