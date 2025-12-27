export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | null;
};

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;

  constructor(opts: ApiClientOptions = {}) {
    this.baseUrl = opts.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';
    this.getToken = opts.getToken;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers || {});
    if (!headers.has('content-type') && init.body) headers.set('content-type', 'application/json');
    const token = this.getToken?.();
    if (token) headers.set('authorization', `Bearer ${token}`);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let errorMessage = `API ${res.status}: ${text || res.statusText}`;
        try {
          const errorJson = JSON.parse(text);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {
          // 忽略 JSON 解析错误，使用原始错误消息
        }
        throw new Error(errorMessage);
      }
      return (await res.json()) as T;
    } catch (error) {
      // 如果是网络错误，提供更友好的提示
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Failed to fetch - 无法连接到服务器');
      }
      throw error;
    }
  }

  signup(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>('/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  login(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  me() {
    return this.request<{ id: string; email: string; created_at: string }>('/v1/me');
  }

  captureMemory(input: { type: string; content_raw: string; tags?: string[]; source?: string }) {
    return this.request('/v1/memory/capture', { method: 'POST', body: JSON.stringify(input) });
  }

  searchMemory(q: string) {
    const qs = new URLSearchParams({ q }).toString();
    return this.request<{ items: any[] }>(`/v1/memory/search?${qs}`);
  }

  clarify(prompt: string) {
    return this.request<{ questions: any[] }>('/v1/planner/clarify', { method: 'POST', body: JSON.stringify({ prompt }) });
  }

  generatePlan(prompt: string, answers: Record<string, any>) {
    return this.request<{ goal: any; tasks: any[] }>('/v1/planner/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, answers }),
    });
  }

  todayTasks() {
    return this.request<{ items: any[] }>('/v1/tasks/today');
  }

  checkin(taskId: string, input: { status: 'done' | 'skipped'; reason_code?: string; note?: string }) {
    return this.request(`/v1/tasks/${taskId}/checkin`, { method: 'POST', body: JSON.stringify(input) });
  }

  treeSnapshot() {
    return this.request<any>('/v1/tree/snapshot');
  }

  // Goals API
  listGoals() {
    return this.request<{ items: any[] }>('/v1/goals');
  }

  createGoal(input: { title: string; description?: string; life_wheel_dimension?: string }) {
    return this.request('/v1/goals', { method: 'POST', body: JSON.stringify(input) });
  }

  updateGoalStatus(goalId: string, status: string) {
    return this.request(`/v1/goals/${goalId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  deleteGoal(goalId: string) {
    return this.request(`/v1/goals/${goalId}`, { method: 'DELETE' });
  }

  // Chat API (数字人对话)
  chat(input: { message: string; context?: Record<string, any> }) {
    return this.request<{ 
      reply: string; 
      mood?: string;
      functionCall?: { name: string; arguments: Record<string, any>; result?: any };
      quickActions?: Array<{ id: string; label: string; type: string }>;
    }>('/v1/chat', { method: 'POST', body: JSON.stringify(input) });
  }

  // Today Tasks (获取今日任务)
  getTodayTasks() {
    return this.request<{ tasks: any[] }>('/v1/tasks/today');
  }
}







