// 服务器通用配置与常量

export const SERVER_INFO = {
  name: "demo-server",
  version: "1.0.0",
};

export const DEFAULT_PORT = 3000;

export const STATIC_ROUTES = [
  { mountPath: "/client", dir: "client" },
  // 根目录静态资源
  { mountPath: "/", dir: "." },
];
