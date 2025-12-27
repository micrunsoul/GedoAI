'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Tag, 
  Calendar,
  ChevronRight,
  Star,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Link2,
} from 'lucide-react';
import { Memory, MemoryType, SystemTag, TYPE_LABELS, SYSTEM_TAG_LABELS } from './types';

interface MemoryListProps {
  memories: Memory[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: { types?: MemoryType[]; tags?: string[] }) => void;
  onMemoryClick?: (memory: Memory) => void;
  onMemoryDelete?: (id: string) => void;
  onMemoryEdit?: (memory: Memory) => void;
}

export const MemoryList = ({
  memories,
  onSearch,
  onFilter,
  onMemoryClick,
  onMemoryDelete,
  onMemoryEdit,
}: MemoryListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<MemoryType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const toggleType = (type: MemoryType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    onFilter?.({ types: newTypes, tags: selectedTags });
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilter?.({ types: selectedTypes, tags: newTags });
  };

  // 收集所有标签
  const allUserTags = [...new Set(memories.flatMap(m => m.userTags))];

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索记忆..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl border transition-colors ${
            showFilters || selectedTypes.length > 0 || selectedTags.length > 0
              ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* 筛选器 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4"
          >
            {/* 类型筛选 */}
            <div>
              <div className="text-sm text-slate-400 mb-2">记忆类型</div>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(TYPE_LABELS) as [MemoryType, typeof TYPE_LABELS[MemoryType]][]).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedTypes.includes(key)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{value.icon}</span>
                    <span>{value.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 系统标签筛选 */}
            <div>
              <div className="text-sm text-slate-400 mb-2">系统标签</div>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(SYSTEM_TAG_LABELS) as [SystemTag, typeof SYSTEM_TAG_LABELS[SystemTag]][]).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => toggleTag(key)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors`}
                    style={{
                      backgroundColor: selectedTags.includes(key) ? value.color : '#1e293b',
                      color: selectedTags.includes(key) ? '#fff' : '#cbd5e1',
                    }}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 用户标签筛选 */}
            {allUserTags.length > 0 && (
              <div>
                <div className="text-sm text-slate-400 mb-2">自定义标签</div>
                <div className="flex flex-wrap gap-2">
                  {allUserTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Tag size={12} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 记忆列表 */}
      <div className="space-y-3">
        {memories.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>还没有记忆，开始记录吧！</p>
          </div>
        ) : (
          memories.map((memory) => (
            <motion.div
              key={memory.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* 卡片头部 */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => {
                  setExpandedId(expandedId === memory.id ? null : memory.id);
                  onMemoryClick?.(memory);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* 类型图标 */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: TYPE_LABELS[memory.type].color + '20' }}
                    >
                      {TYPE_LABELS[memory.type].icon}
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-white ${expandedId === memory.id ? '' : 'line-clamp-2'}`}>
                        {memory.contentRaw}
                      </p>
                      
                      {/* 标签 */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {memory.systemTags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: SYSTEM_TAG_LABELS[tag].color + '20',
                              color: SYSTEM_TAG_LABELS[tag].color,
                            }}
                          >
                            {SYSTEM_TAG_LABELS[tag].label}
                          </span>
                        ))}
                        {memory.userTags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 操作菜单 */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === memory.id ? null : memory.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {menuOpenId === memory.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden z-10 min-w-[120px]"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMemoryEdit?.(memory);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-700 text-sm"
                          >
                            <Edit2 size={14} />
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 关联到目标
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-700 text-sm"
                          >
                            <Link2 size={14} />
                            关联目标
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMemoryDelete?.(memory.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-slate-700 text-sm"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 展开指示 */}
                  <ChevronRight
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      expandedId === memory.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {/* 展开详情 */}
              <AnimatePresence>
                {expandedId === memory.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-slate-800">
                      <div className="pt-4 space-y-3">
                        {/* 元信息 */}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{new Date(memory.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                          {memory.reminderDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>提醒：{memory.reminderDate}</span>
                            </div>
                          )}
                          {memory.impactScore > 0 && (
                            <div className="flex items-center gap-1">
                              <Star size={14} />
                              <span>影响度：{memory.impactScore.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* 结构化信息 */}
                        {memory.contentStruct && Object.keys(memory.contentStruct).length > 0 && (
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-2">AI 提取的信息</div>
                            <div className="space-y-1">
                              {memory.contentStruct.people && memory.contentStruct.people.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-slate-400">相关人员：</span>
                                  <span className="text-white">{memory.contentStruct.people.join('、')}</span>
                                </div>
                              )}
                              {memory.contentStruct.skills && memory.contentStruct.skills.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-slate-400">相关技能：</span>
                                  <span className="text-white">{memory.contentStruct.skills.join('、')}</span>
                                </div>
                              )}
                              {memory.contentStruct.conclusions && memory.contentStruct.conclusions.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-slate-400">关键结论：</span>
                                  <span className="text-white">{memory.contentStruct.conclusions.join('；')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};








