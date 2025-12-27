/**
 * GEDO.AI Agent 模块
 * 
 * 提供两个核心 Agent：
 * 1. PlannerAgent - 智能规划代理（目标澄清、SMART拆解、动态调整）
 * 2. RecallAgent - 记忆召回代理（场景化唤醒、模式识别、复盘洞察）
 */

export { PlannerAgent } from './PlannerAgent.mjs';
export { RecallAgent } from './RecallAgent.mjs';

/**
 * 简单的 LLM Provider 接口
 * 实际使用时需要替换为真实的 LLM 调用
 */
export class MockLLMProvider {
  async chat(messages) {
    // Mock 响应，实际应该调用 OpenAI/Claude 等 API
    console.log('[MockLLM] Received messages:', messages.length);
    return {
      content: '{}', // 返回空 JSON，让 Agent 走降级逻辑
    };
  }
}

/**
 * OpenAI Provider 示例
 */
export class OpenAIProvider {
  constructor(apiKey, model = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '{}',
    };
  }
}

// 使用示例
async function main() {
  const token = process.env.GEDO_API_TOKEN;
  const llmProvider = new MockLLMProvider();
  
  // 创建 Agent 实例
  const { PlannerAgent, RecallAgent } = await import('./index.mjs');
  
  const planner = new PlannerAgent(token, llmProvider);
  const recall = new RecallAgent(token, llmProvider);
  
  console.log('[Agent] PlannerAgent and RecallAgent initialized');
  
  // 示例：检查生命之花平衡
  // const balance = await planner.checkLifeWheelBalance();
  // console.log('[Agent] Life wheel balance:', balance);
  
  // 示例：检测行为模式
  // const patterns = await recall.detectPatterns();
  // console.log('[Agent] Detected patterns:', patterns);
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}








