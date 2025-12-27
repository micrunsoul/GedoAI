'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MemoryInput, MemoryList, MemoryConfirmModal, Memory, MemoryInput as MemoryInputType } from '@/app/components/memory';
import { useAuth } from '@/app/contexts/AuthContext';

export default function MemoryPage() {
  const { api } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMemory, setPendingMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载记忆列表
  const loadMemories = useCallback(async (query = '') => {
    try {
      const result = await api.searchMemory(query);
      // 转换 API 响应格式为组件格式
      const formattedMemories: Memory[] = (result.items || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        type: (item.type as Memory['type']) || 'important_info',
        contentRaw: (item.content_raw as string) || '',
        contentStruct: item.content_struct as Memory['contentStruct'],
        source: (item.source as Memory['source']) || 'text',
        systemTags: (item.system_tags as string[]) || [],
        userTags: (item.tags as string[]) || [],
        confidence: (item.confidence as number) || 1,
        impactScore: (item.impact_score as number) || 0,
        usageCount: (item.usage_count as number) || 0,
        confirmed: true,
        reminderDate: item.reminder_date as string | undefined,
        createdAt: (item.created_at as string) || new Date().toISOString(),
        updatedAt: (item.updated_at as string) || new Date().toISOString(),
      }));
      setMemories(formattedMemories);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // 使用防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMemories(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadMemories]);

  const handleSubmit = async (input: MemoryInputType) => {
    try {
      await api.captureMemory({
        type: input.type,
        content_raw: input.contentRaw,
        tags: input.userTags,
        source: input.source,
      });
      // 重新加载列表
      await loadMemories(searchQuery);
    } catch (error) {
      console.error('Failed to save memory:', error);
      throw error;
    }
  };

  const handleAnalyze = async (text: string) => {
    // MVP：简单的关键词匹配模拟 AI 分析
    // 后续接入真实 LLM
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let suggestedType: Memory['type'] = 'important_info';
    const suggestedTags: string[] = [];
    
    if (text.includes('生日') || text.includes('纪念日') || text.includes('日期')) {
      suggestedType = 'date_reminder';
      suggestedTags.push('日期');
    } else if (text.includes('擅长') || text.includes('喜欢') || text.includes('不喜欢') || text.includes('习惯')) {
      suggestedType = 'personal_trait';
      suggestedTags.push('特质');
    } else if (text.includes('完成') || text.includes('学会') || text.includes('参加') || text.includes('成功')) {
      suggestedType = 'key_event';
      suggestedTags.push('事件');
    }
    
    return {
      suggestedType,
      suggestedTags,
      extractedInfo: {},
    };
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filters: { types?: Memory['type'][]; tags?: string[] }) => {
    // 前端筛选（已加载的数据）
    // 后续可以改为服务端筛选
    let filtered = memories;
    
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(m => filters.types!.includes(m.type));
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(m =>
        m.systemTags.some(t => filters.tags!.includes(t)) ||
        m.userTags.some(t => filters.tags!.includes(t))
      );
    }
    
    setMemories(filtered);
  };

  const handleConfirmPending = async (updates: Partial<Memory>) => {
    if (pendingMemory) {
      try {
        await api.captureMemory({
          type: updates.type || pendingMemory.type,
          content_raw: pendingMemory.contentRaw,
          tags: updates.userTags || [],
          source: pendingMemory.source,
        });
        await loadMemories(searchQuery);
        setPendingMemory(null);
      } catch (error) {
        console.error('Failed to confirm memory:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    // TODO: 接入删除 API
    // 暂时只从本地状态移除
    setMemories(memories.filter(m => m.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">智忆</h1>
          <p className="text-slate-400">
            记录你的经验、想法、重要信息，沉淀为能力证据，让智引更懂你
          </p>
        </div>

        {/* 输入区 */}
        <div className="mb-8">
          <MemoryInput onSubmit={handleSubmit} onAnalyze={handleAnalyze} />
        </div>

        {/* 记忆列表 */}
        <div>
          <h2 className="text-lg font-medium text-white mb-4">
            我的记忆 <span className="text-slate-500">({memories.length})</span>
          </h2>
          <MemoryList
            memories={memories}
            onSearch={handleSearch}
            onFilter={handleFilter}
            onMemoryDelete={handleDelete}
          />
        </div>

        {/* 确认弹窗 */}
        <AnimatePresence>
          {pendingMemory && (
            <MemoryConfirmModal
              memory={pendingMemory}
              suggestedType="personal_trait"
              suggestedTags={['self_awareness']}
              onConfirm={handleConfirmPending}
              onReject={() => setPendingMemory(null)}
              onClose={() => setPendingMemory(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
