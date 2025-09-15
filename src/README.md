# MCP 计算器项目结构

## 文件结构

```
src/
├── index.js              # 主入口文件
├── utils/                # 工具函数目录
│   └── csvReader.js      # CSV文件读取工具
├── tools/                # MCP工具目录
│   ├── calculator.js     # 四则运算计算器工具
│   ├── studentGrades.js  # 学生成绩查询工具
│   └── joker.js          # 笑话工具
└── README.md             # 项目结构说明
```

## 模块说明

### 主入口文件 (`index.js`)

- 创建 MCP 服务器实例
- 注册所有工具和资源
- 启动服务器连接

### 工具函数 (`utils/`)

#### `csvReader.js`

- **功能**: 读取学生成绩 CSV 文件
- **导出函数**: `readStudentsData()`
- **返回**: Promise<Array> 学生数据数组

### MCP 工具 (`tools/`)

#### `calculator.js`

- **功能**: 四则运算计算器
- **导出**:
  - `calculatorConfig`: 工具配置对象
  - `calculatorHandler`: 工具处理函数
- **支持运算**: 加法、减法、乘法、除法
- **错误处理**: 除零检查、无效操作检查

#### `studentGrades.js`

- **功能**: 学生成绩查询
- **导出**:
  - `studentGradesConfig`: 工具配置对象
  - `studentGradesHandler`: 工具处理函数
- **查询类型**: 总分最高、各科最高分、所有最高分统计

#### `joker.js`

- **功能**: 笑话生成器
- **导出**:
  - `jokerConfig`: 工具配置对象
  - `jokerHandler`: 工具处理函数
- **输入**: 笑话主题

## 设计原则

1. **单一职责**: 每个文件只负责一个特定功能
2. **模块化**: 功能分离，便于维护和测试
3. **可复用性**: 工具函数可以在多个地方使用
4. **配置分离**: 工具配置和处理逻辑分离
5. **错误处理**: 每个模块都有适当的错误处理

## 扩展指南

### 添加新工具

1. 在 `tools/` 目录下创建新文件
2. 导出 `config` 和 `handler` 对象
3. 在 `index.js` 中导入并注册工具

### 添加新工具函数

1. 在 `utils/` 目录下创建新文件
2. 导出需要的函数
3. 在需要的地方导入使用

## 测试

所有模块都有对应的测试文件，位于 `tests/` 目录下，确保代码质量和功能正确性。
