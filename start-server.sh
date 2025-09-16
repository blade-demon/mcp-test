#!/bin/bash

echo "🚀 启动货币兑换MCP服务器..."

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口3000已被占用，正在停止现有进程..."
    pkill -f "node src/server-sse.js"
    sleep 2
fi

# 启动服务器
echo "📡 启动SSE服务器..."
node src/server-sse.js &

# # 等待服务器启动
# sleep 3

# # 测试服务器是否正常
# echo "🔍 测试服务器状态..."
# if curl -s http://localhost:3000/status > /dev/null; then
#     echo "✅ 服务器启动成功！"
#     echo "🌐 访问地址:"
#     echo "   - 货币兑换客户端: http://localhost:3000/client/html/currency-exchange-client.html"
#     echo ""
#     echo "📊 服务器状态:"
#     curl -s http://localhost:3000/status | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/status
# else
#     echo "❌ 服务器启动失败！"
#     exit 1
# fi
