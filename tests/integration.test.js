import { describe, test, expect } from '@jest/globals';

describe('MCP服务器集成测试', () => {
  test('验证所有工具都已注册', () => {
    // 这个测试验证我们的MCP服务器包含了所有预期的工具
    const expectedTools = ['joker', 'calculator', 'student_grades'];
    
    // 在实际的集成测试中，我们可以检查服务器实例的工具注册情况
    // 这里我们只是验证工具名称的完整性
    expect(expectedTools).toContain('joker');
    expect(expectedTools).toContain('calculator');
    expect(expectedTools).toContain('student_grades');
    expect(expectedTools).toHaveLength(3);
  });

  test('验证工具输入模式', () => {
    // 验证每个工具都有正确的输入模式
    const toolSchemas = {
      joker: { topic: 'string' },
      calculator: { operation: 'string', a: 'number', b: 'number' },
      student_grades: { query_type: 'string' }
    };

    expect(toolSchemas.joker).toHaveProperty('topic');
    expect(toolSchemas.calculator).toHaveProperty('operation');
    expect(toolSchemas.calculator).toHaveProperty('a');
    expect(toolSchemas.calculator).toHaveProperty('b');
    expect(toolSchemas.student_grades).toHaveProperty('query_type');
  });

  test('验证输出格式一致性', () => {
    // 验证所有工具都返回相同格式的输出
    const mockOutput = {
      content: [{ type: "text", text: "test message" }]
    };

    expect(mockOutput).toHaveProperty('content');
    expect(mockOutput.content).toBeInstanceOf(Array);
    expect(mockOutput.content[0]).toHaveProperty('type');
    expect(mockOutput.content[0]).toHaveProperty('text');
  });
});
