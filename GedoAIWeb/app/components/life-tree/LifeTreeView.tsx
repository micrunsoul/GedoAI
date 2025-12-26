'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeTreeData, 
  SkillNode, 
  GoalFlower, 
  TaskLeaf,
  DIMENSION_COLORS,
  CATEGORY_COLORS,
  DIMENSION_LABELS,
  CATEGORY_LABELS,
} from './types';
import { TreeSidePanel } from './TreeSidePanel';

interface LifeTreeViewProps {
  data: LifeTreeData;
  onTaskClick?: (task: TaskLeaf) => void;
  onGoalClick?: (goal: GoalFlower) => void;
  onSkillClick?: (skill: SkillNode) => void;
}

export const LifeTreeView = ({ data, onTaskClick, onGoalClick, onSkillClick }: LifeTreeViewProps) => {
  const [selectedItem, setSelectedItem] = useState<{
    type: 'skill' | 'goal' | 'task';
    data: SkillNode | GoalFlower | TaskLeaf;
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // SVG 视图尺寸
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const trunkBottom = height - 80;
  const trunkTop = 180;

  // 计算根系位置（技能节点）
  const rootNodes = useMemo(() => {
    const roots: Array<{ skill: SkillNode; x: number; y: number; length: number }> = [];
    const count = data.skills.length;
    const spread = Math.min(count * 40, 300);
    
    data.skills.forEach((skill, i) => {
      const angle = Math.PI + (Math.PI * (i - (count - 1) / 2)) / Math.max(count, 4);
      const length = 40 + skill.proficiencyLevel * 60;
      roots.push({
        skill,
        x: centerX + Math.cos(angle) * spread * 0.3,
        y: trunkBottom + 30,
        length,
      });
    });
    return roots;
  }, [data.skills, centerX, trunkBottom]);

  // 计算花/果位置（目标）
  const flowerNodes = useMemo(() => {
    const flowers: Array<{ goal: GoalFlower; x: number; y: number; size: number }> = [];
    const activeGoals = data.goals.filter(g => g.status === 'active' || g.status === 'completed');
    const count = activeGoals.length;
    
    activeGoals.forEach((goal, i) => {
      const angle = -Math.PI / 2 + (Math.PI * 0.8 * (i - (count - 1) / 2)) / Math.max(count, 3);
      const radius = 120 + Math.random() * 40;
      const size = goal.status === 'completed' ? 28 : 22;
      flowers.push({
        goal,
        x: centerX + Math.cos(angle) * radius,
        y: trunkTop - 40 + Math.sin(angle) * radius * 0.5,
        size,
      });
    });
    return flowers;
  }, [data.goals, centerX, trunkTop]);

  // 计算叶片位置（今日任务）
  const leafNodes = useMemo(() => {
    const leaves: Array<{ task: TaskLeaf; x: number; y: number; rotation: number }> = [];
    const count = data.todayTasks.length;
    
    data.todayTasks.forEach((task, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const yOffset = 80 + (i * 35);
      leaves.push({
        task,
        x: centerX + side * (60 + Math.random() * 30),
        y: trunkBottom - yOffset,
        rotation: side * (15 + Math.random() * 20),
      });
    });
    return leaves;
  }, [data.todayTasks, centerX, trunkBottom]);

  const handleSkillClick = (skill: SkillNode) => {
    setSelectedItem({ type: 'skill', data: skill });
    onSkillClick?.(skill);
  };

  const handleGoalClick = (goal: GoalFlower) => {
    setSelectedItem({ type: 'goal', data: goal });
    onGoalClick?.(goal);
  };

  const handleTaskClick = (task: TaskLeaf) => {
    setSelectedItem({ type: 'task', data: task });
    onTaskClick?.(task);
  };

  return (
    <div className="relative w-full h-full flex">
      {/* 主 SVG 视图 */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-w-4xl"
          style={{ maxHeight: '80vh' }}
        >
          <defs>
            {/* 树干渐变 */}
            <linearGradient id="trunkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            
            {/* 根系渐变 */}
            <linearGradient id="rootGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* 发光滤镜 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景土地 */}
          <ellipse
            cx={centerX}
            cy={trunkBottom + 50}
            rx={200}
            ry={30}
            fill="#1c1917"
            opacity={0.5}
          />

          {/* 根系（技能） */}
          <g className="roots">
            {rootNodes.map(({ skill, x, y, length }, i) => (
              <motion.g
                key={skill.id}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                {/* 根茎 */}
                <motion.path
                  d={`M ${centerX} ${trunkBottom} Q ${x} ${y} ${x} ${y + length}`}
                  stroke="url(#rootGradient)"
                  strokeWidth={3 + skill.proficiencyLevel * 4}
                  fill="none"
                  strokeLinecap="round"
                  whileHover={{ strokeWidth: 8 }}
                  className="cursor-pointer"
                  onClick={() => handleSkillClick(skill)}
                  onMouseEnter={() => setHoveredId(skill.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                
                {/* 技能节点 */}
                <motion.circle
                  cx={x}
                  cy={y + length}
                  r={8 + skill.evidenceCount}
                  fill={CATEGORY_COLORS[skill.category]}
                  stroke="#fff"
                  strokeWidth={2}
                  whileHover={{ scale: 1.3 }}
                  className="cursor-pointer"
                  filter={hoveredId === skill.id ? 'url(#glow)' : undefined}
                  onClick={() => handleSkillClick(skill)}
                  onMouseEnter={() => setHoveredId(skill.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                
                {/* 技能名称 */}
                <AnimatePresence>
                  {hoveredId === skill.id && (
                    <motion.text
                      x={x}
                      y={y + length + 25}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {skill.name}
                    </motion.text>
                  )}
                </AnimatePresence>
              </motion.g>
            ))}
          </g>

          {/* 树干 */}
          <motion.path
            d={`
              M ${centerX - 20} ${trunkBottom}
              Q ${centerX - 25} ${(trunkBottom + trunkTop) / 2} ${centerX - 15} ${trunkTop + 40}
              L ${centerX} ${trunkTop}
              L ${centerX + 15} ${trunkTop + 40}
              Q ${centerX + 25} ${(trunkBottom + trunkTop) / 2} ${centerX + 20} ${trunkBottom}
              Z
            `}
            fill="url(#trunkGradient)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8 }}
            style={{ transformOrigin: `${centerX}px ${trunkBottom}px` }}
          />

          {/* 分枝与叶片（今日任务） */}
          <g className="branches">
            {leafNodes.map(({ task, x, y, rotation }, i) => {
              const isCompleted = task.status === 'completed';
              const isPending = task.status === 'pending';
              const leafColor = isCompleted ? '#22c55e' : isPending ? '#84cc16' : '#a3e635';
              
              return (
                <motion.g
                  key={task.id}
                  initial={{ opacity: 0, x: centerX, y: trunkBottom }}
                  animate={{ opacity: 1, x, y }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                >
                  {/* 枝条 */}
                  <motion.line
                    x1={centerX}
                    y1={y}
                    x2={x}
                    y2={y}
                    stroke="#78350f"
                    strokeWidth={3}
                  />
                  
                  {/* 叶片 */}
                  <motion.ellipse
                    cx={x}
                    cy={y}
                    rx={18}
                    ry={10}
                    fill={leafColor}
                    transform={`rotate(${rotation} ${x} ${y})`}
                    whileHover={{ scale: 1.2 }}
                    className="cursor-pointer"
                    filter={hoveredId === task.id ? 'url(#glow)' : undefined}
                    onClick={() => handleTaskClick(task)}
                    onMouseEnter={() => setHoveredId(task.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ opacity: isCompleted ? 1 : 0.8 }}
                  />
                  
                  {/* 完成标记 */}
                  {isCompleted && (
                    <motion.text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                      fontWeight="bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.text>
                  )}
                </motion.g>
              );
            })}
          </g>

          {/* 树冠（花/果 = 目标） */}
          <g className="crown">
            {/* 树冠背景 */}
            <motion.ellipse
              cx={centerX}
              cy={trunkTop - 20}
              rx={180}
              ry={100}
              fill="#166534"
              opacity={0.3}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            
            {/* 花/果（目标） */}
            {flowerNodes.map(({ goal, x, y, size }, i) => {
              const isCompleted = goal.status === 'completed';
              const color = DIMENSION_COLORS[goal.lifeWheelDimension];
              
              return (
                <motion.g
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
                >
                  {/* 花茎 */}
                  <motion.line
                    x1={centerX}
                    y1={trunkTop}
                    x2={x}
                    y2={y}
                    stroke="#166534"
                    strokeWidth={2}
                  />
                  
                  {isCompleted ? (
                    /* 果实 */
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={2}
                      whileHover={{ scale: 1.2 }}
                      className="cursor-pointer"
                      filter={hoveredId === goal.id ? 'url(#glow)' : undefined}
                      onClick={() => handleGoalClick(goal)}
                      onMouseEnter={() => setHoveredId(goal.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  ) : (
                    /* 花朵 */
                    <motion.g
                      whileHover={{ scale: 1.2 }}
                      className="cursor-pointer"
                      onClick={() => handleGoalClick(goal)}
                      onMouseEnter={() => setHoveredId(goal.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* 花瓣 */}
                      {[0, 60, 120, 180, 240, 300].map((angle) => (
                        <ellipse
                          key={angle}
                          cx={x + Math.cos((angle * Math.PI) / 180) * 12}
                          cy={y + Math.sin((angle * Math.PI) / 180) * 12}
                          rx={10}
                          ry={6}
                          fill={color}
                          opacity={0.8}
                          transform={`rotate(${angle} ${x + Math.cos((angle * Math.PI) / 180) * 12} ${y + Math.sin((angle * Math.PI) / 180) * 12})`}
                        />
                      ))}
                      {/* 花心 */}
                      <circle cx={x} cy={y} r={8} fill="#fbbf24" />
                    </motion.g>
                  )}
                  
                  {/* 进度环 */}
                  {!isCompleted && goal.progress > 0 && (
                    <circle
                      cx={x}
                      cy={y}
                      r={size + 5}
                      fill="none"
                      stroke={color}
                      strokeWidth={3}
                      strokeDasharray={`${(goal.progress / 100) * 2 * Math.PI * (size + 5)} ${2 * Math.PI * (size + 5)}`}
                      transform={`rotate(-90 ${x} ${y})`}
                      opacity={0.6}
                    />
                  )}
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 侧边详情面板 */}
      <AnimatePresence>
        {selectedItem && (
          <TreeSidePanel
            type={selectedItem.type}
            data={selectedItem.data}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};






