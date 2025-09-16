// 简单的内存会话存储

class SessionStore {
  constructor() {
    this.map = new Map();
  }

  set(sessionId, value) {
    this.map.set(sessionId, value);
  }

  get(sessionId) {
    return this.map.get(sessionId);
  }

  delete(sessionId) {
    this.map.delete(sessionId);
  }

  size() {
    return this.map.size;
  }

  entries() {
    return this.map.entries();
  }
}

export const sessionStore = new SessionStore();
