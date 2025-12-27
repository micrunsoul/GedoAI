'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeTreeData, 
  SkillNode, 
  GoalFlower, 
  TaskLeaf,
  LifeTheme,
  DIMENSION_COLORS,
  CATEGORY_COLORS,
  DIMENSION_LABELS,
  CATEGORY_LABELS,
  LifeWheelDimension,
} from './types';
import { TreeSidePanel } from './TreeSidePanel';

interface LifeTreeViewProps {
  data: LifeTreeData;
  onTaskClick?: (task: TaskLeaf) => void;
  onGoalClick?: (goal: GoalFlower) => void;
  onSkillClick?: (skill: SkillNode) => void;
  onThemeClick?: (theme: LifeTheme) => void;
}

export const LifeTreeView = ({ data, onTaskClick, onGoalClick, onSkillClick }: LifeTreeViewProps) => {
  const [selectedItem, setSelectedItem] = useState<{
    type: 'skill' | 'goal' | 'task' | 'theme';
    data: SkillNode | GoalFlower | TaskLeaf | LifeTheme;
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // SVG 视图尺寸
  const width = 900;
  const height = 700;
  const centerX = width / 2;
  const groundY = height - 100;
  const trunkBottom = groundY - 20;
  const trunkTop = 200;
  const crownCenterY = trunkTop - 60;

  // 计算根系位置（能力节点）
  const rootNodes = useMemo(() => {
    const roots: Array<{ skill: SkillNode; x: number; y: number; endX: number; endY: number; thickness: number }> = [];
    const count = data.skills.length;
    if (count === 0) return roots;
    
    const baseSpread = Math.min(count * 50, 320);
    
    data.skills.forEach((skill, i) => {
      const angleSpread = Math.PI * 0.8;
      const startAngle = Math.PI + (Math.PI - angleSpread) / 2;
      const angle = startAngle + (angleSpread * i) / Math.max(count - 1, 1);
      const length = 50 + skill.proficiencyLevel * 80;
      const thickness = 2 + skill.proficiencyLevel * 5;
      
      // 根系起点（树干底部）
      const startX = centerX + Math.cos(angle) * 15;
      const startY = trunkBottom;
      
      // 根系终点
      const endX = centerX + Math.cos(angle) * (baseSpread * 0.4 + length * 0.3);
      const endY = groundY + 20 + Math.sin(angle - Math.PI) * length * 0.6;
      
      roots.push({
        skill,
        x: startX,
        y: startY,
        endX,
        endY,
        thickness,
      });
    });
    return roots;
  }, [data.skills, centerX, trunkBottom, groundY]);

  // 计算花/果位置（目标）
  const flowerNodes = useMemo(() => {
    const flowers: Array<{ goal: GoalFlower; x: number; y: number; size: number }> = [];
    const activeGoals = data.goals.filter(g => g.status === 'active' || g.status === 'completed');
    const count = activeGoals.length;
    if (count === 0) return flowers;
    
    activeGoals.forEach((goal, i) => {
      const angleSpread = Math.PI * 0.9;
      const startAngle = -Math.PI / 2 - angleSpread / 2;
      const angle = startAngle + (angleSpread * i) / Math.max(count - 1, 1);
      const radius = 100 + (i % 2) * 35;
      const size = goal.status === 'completed' ? 26 : 20;
      
      flowers.push({
        goal,
        x: centerX + Math.cos(angle) * radius,
        y: crownCenterY + Math.sin(angle) * radius * 0.55,
        size,
      });
    });
    return flowers;
  }, [data.goals, centerX, crownCenterY]);

  // 计算叶片位置（今日任务）
  const leafNodes = useMemo(() => {
    const leaves: Array<{ task: TaskLeaf; x: number; y: number; rotation: number; branchY: number }> = [];
    const count = data.todayTasks.length;
    if (count === 0) return leaves;
    
    const availableHeight = trunkBottom - trunkTop - 60;
    const spacing = Math.min(availableHeight / count, 50);
    
    data.todayTasks.forEach((task, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const branchY = trunkTop + 80 + i * spacing;
      const branchLength = 50 + (i % 3) * 20;
      
      leaves.push({
        task,
        x: centerX + side * branchLength,
        y: branchY - 5 + (i % 2) * 10,
        rotation: side * (20 + (i % 3) * 10),
        branchY,
      });
    });
    return leaves;
  }, [data.todayTasks, centerX, trunkBottom, trunkTop]);

  // 人生领域（8维度）位置
  const dimensionNodes = useMemo(() => {
    const dimensions: LifeWheelDimension[] = [
      'health', 'career', 'family', 'finance', 
      'growth', 'social', 'hobby', 'self_realization'
    ];
    
    return dimensions.map((dim, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / 8;
      const radius = 160;
      return {
        dimension: dim,
        x: centerX + Math.cos(angle) * radius,
        y: crownCenterY + Math.sin(angle) * radius * 0.6,
        value: data.lifeWheel[dim],
      };
    });
  }, [data.lifeWheel, centerX, crownCenterY]);

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
    <div className="relative w-full h-full flex bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950">
      {/* 图例 */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">图例</h4>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-slate-500 hover:text-white text-xs"
              >
                收起
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-b from-amber-700 to-amber-900" />
                <span className="text-slate-300">树干 = 人生主题</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-800 to-stone-900" />
                <span className="text-slate-300">根系 = 能力（智忆证据）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 rounded-full bg-lime-500" />
                <span className="text-slate-300">枝叶 = 今日行动</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pink-500" />
                <span className="text-slate-300">花朵 = 进行中目标</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-slate-300">果实 = 已完成目标</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-slate-500 flex items-center justify-center text-[8px]">8</div>
                <span className="text-slate-300">维度 = 人生领域</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute top-4 left-4 z-10 bg-slate-800/80 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          📖 图例
        </button>
      )}

      {/* 主 SVG 视图 */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ maxHeight: '85vh' }}
        >
          <defs>
            {/* 树干渐变 */}
            <linearGradient id="trunkGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            
            {/* 树干纹理渐变 */}
            <linearGradient id="trunkTexture" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#000" stopOpacity="0" />
              <stop offset="70%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.15" />
            </linearGradient>
            
            {/* 根系渐变 */}
            <linearGradient id="rootGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#57534e" />
              <stop offset="100%" stopColor="#292524" />
            </linearGradient>

            {/* 树冠渐变 */}
            <radialGradient id="crownGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#166534" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#14532d" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#052e16" stopOpacity="0.2" />
            </radialGradient>

            {/* 土壤渐变 */}
            <linearGradient id="soilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>

            {/* 发光滤镜 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 柔和阴影 */}
            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3" />
            </filter>

            {/* 内发光 */}
            <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 背景星空效果 */}
          <g className="stars" opacity={0.3}>
            {Array.from({ length: 30 }).map((_, i) => (
              <circle
                key={i}
                cx={50 + Math.random() * (width - 100)}
                cy={20 + Math.random() * 120}
                r={0.5 + Math.random() * 1.5}
                fill="#fff"
                opacity={0.3 + Math.random() * 0.5}
              />
            ))}
          </g>

          {/* 土壤层（价值观基础）*/}
          <g className="soil">
            {/* 土壤主体 */}
            <ellipse
              cx={centerX}
              cy={groundY + 30}
              rx={280}
              ry={50}
              fill="url(#soilGradient)"
            />
            {/* 土壤表面 */}
            <path
              d={`M ${centerX - 280} ${groundY} 
                  Q ${centerX - 150} ${groundY - 10} ${centerX} ${groundY - 5}
                  Q ${centerX + 150} ${groundY - 10} ${centerX + 280} ${groundY}
                  L ${centerX + 280} ${groundY + 30}
                  Q ${centerX} ${groundY + 50} ${centerX - 280} ${groundY + 30}
                  Z`}
              fill="#292524"
              opacity={0.8}
            />
            {/* 土壤纹理 */}
            <g opacity={0.3}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ellipse
                  key={i}
                  cx={centerX - 200 + i * 55 + Math.random() * 20}
                  cy={groundY + 15 + Math.random() * 20}
                  rx={15 + Math.random() * 10}
                  ry={5 + Math.random() * 5}
                  fill="#1c1917"
                />
              ))}
            </g>
          </g>

          {/* 根系（能力） */}
          <g className="roots">
            {rootNodes.map(({ skill, x, y, endX, endY, thickness }, i) => {
              const midX = (x + endX) / 2 + (i % 2 === 0 ? -20 : 20);
              const midY = (y + endY) / 2 + 15;
              const isHovered = hoveredId === skill.id;
              
              return (
                <motion.g
                  key={skill.id}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                >
                  {/* 根茎路径 */}
                  <motion.path
                    d={`M ${x} ${y} Q ${midX} ${midY} ${endX} ${endY}`}
                    stroke="url(#rootGradient)"
                    strokeWidth={thickness}
                    fill="none"
                    strokeLinecap="round"
                    whileHover={{ strokeWidth: thickness + 3 }}
                    className="cursor-pointer transition-all"
                    filter={isHovered ? 'url(#glow)' : undefined}
                    onClick={() => handleSkillClick(skill)}
                    onMouseEnter={() => setHoveredId(skill.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                  
                  {/* 能力节点（根尖） */}
                  <motion.circle
                    cx={endX}
                    cy={endY}
                    r={6 + Math.min(skill.evidenceCount, 8)}
                    fill={CATEGORY_COLORS[skill.category]}
                    stroke="#fff"
                    strokeWidth={isHovered ? 3 : 2}
                    whileHover={{ scale: 1.3 }}
                    className="cursor-pointer"
                    filter={isHovered ? 'url(#glow)' : 'url(#softShadow)'}
                    onClick={() => handleSkillClick(skill)}
                    onMouseEnter={() => setHoveredId(skill.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                  
                  {/* 证据数量标记 */}
                  {skill.evidenceCount > 0 && (
                    <text
                      x={endX}
                      y={endY + 4}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={9}
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {skill.evidenceCount}
                    </text>
                  )}
                  
                  {/* 能力名称（悬停显示） */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <rect
                          x={endX - 40}
                          y={endY + 18}
                          width={80}
                          height={22}
                          rx={4}
                          fill="#1e293b"
                          stroke={CATEGORY_COLORS[skill.category]}
                          strokeWidth={1}
                        />
                        <text
                          x={endX}
                          y={endY + 33}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={11}
                          fontWeight="500"
                        >
                          {skill.name.length > 8 ? skill.name.slice(0, 8) + '…' : skill.name}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}
          </g>

          {/* 树干（人生主题） */}
          <g className="trunk">
            {/* 树干主体 */}
            <motion.path
              d={`
                M ${centerX - 25} ${trunkBottom}
                C ${centerX - 35} ${trunkBottom - 80} ${centerX - 30} ${trunkTop + 120} ${centerX - 18} ${trunkTop + 50}
                L ${centerX - 8} ${trunkTop}
                L ${centerX + 8} ${trunkTop}
                L ${centerX + 18} ${trunkTop + 50}
                C ${centerX + 30} ${trunkTop + 120} ${centerX + 35} ${trunkBottom - 80} ${centerX + 25} ${trunkBottom}
                Z
              `}
              fill="url(#trunkGradient)"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ transformOrigin: `${centerX}px ${trunkBottom}px` }}
              filter="url(#softShadow)"
            />
            
            {/* 树干纹理 */}
            <motion.path
              d={`
                M ${centerX - 25} ${trunkBottom}
                C ${centerX - 35} ${trunkBottom - 80} ${centerX - 30} ${trunkTop + 120} ${centerX - 18} ${trunkTop + 50}
                L ${centerX - 8} ${trunkTop}
                L ${centerX + 8} ${trunkTop}
                L ${centerX + 18} ${trunkTop + 50}
                C ${centerX + 30} ${trunkTop + 120} ${centerX + 35} ${trunkBottom - 80} ${centerX + 25} ${trunkBottom}
                Z
              `}
              fill="url(#trunkTexture)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
            
            {/* 树干纹路线条 */}
            <g opacity={0.3}>
              {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
                const y = trunkBottom - (trunkBottom - trunkTop) * t;
                return (
                  <path
                    key={i}
                    d={`M ${centerX - 15 + t * 5} ${y} Q ${centerX} ${y + 5} ${centerX + 15 - t * 5} ${y}`}
                    stroke="#451a03"
                    strokeWidth={1}
                    fill="none"
                  />
                );
              })}
            </g>

            {/* 人生主题标签 */}
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <rect
                x={centerX - 55}
                y={(trunkBottom + trunkTop) / 2 - 15}
                width={110}
                height={30}
                rx={6}
                fill="#1e293b"
                fillOpacity={0.9}
                stroke="#f59e0b"
                strokeWidth={1.5}
              />
              <text
                x={centerX}
                y={(trunkBottom + trunkTop) / 2 + 5}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize={12}
                fontWeight="600"
              >
                {data.lifeTheme?.title || '🌟 设定人生主题'}
              </text>
            </motion.g>
          </g>

          {/* 分枝与叶片（今日任务） */}
          <g className="branches">
            {leafNodes.map(({ task, x, y, rotation, branchY }, i) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';
              const isHovered = hoveredId === task.id;
              
              const leafColor = isCompleted 
                ? '#22c55e' 
                : isInProgress 
                  ? '#84cc16' 
                  : '#a3e635';
              
              const side = x < centerX ? -1 : 1;
              
              return (
                <motion.g
                  key={task.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
                >
                  {/* 枝条 */}
                  <motion.path
                    d={`M ${centerX + side * 8} ${branchY} 
                        Q ${centerX + side * 30} ${branchY - 3} ${x} ${y}`}
                    stroke="#78350f"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  {/* 叶片 */}
                  <motion.ellipse
                    cx={x}
                    cy={y}
                    rx={20}
                    ry={10}
                    fill={leafColor}
                    transform={`rotate(${rotation} ${x} ${y})`}
                    whileHover={{ scale: 1.25 }}
                    className="cursor-pointer"
                    filter={isHovered ? 'url(#glow)' : 'url(#softShadow)'}
                    onClick={() => handleTaskClick(task)}
                    onMouseEnter={() => setHoveredId(task.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ opacity: isCompleted ? 1 : 0.85 }}
                    stroke={isHovered ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  
                  {/* 叶脉 */}
                  <line
                    x1={x - 12 * Math.cos(rotation * Math.PI / 180)}
                    y1={y - 12 * Math.sin(rotation * Math.PI / 180)}
                    x2={x + 12 * Math.cos(rotation * Math.PI / 180)}
                    y2={y + 12 * Math.sin(rotation * Math.PI / 180)}
                    stroke="#166534"
                    strokeWidth={1}
                    opacity={0.5}
                    className="pointer-events-none"
                  />
                  
                  {/* 完成标记 */}
                  {isCompleted && (
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <circle cx={x} cy={y} r={8} fill="#166534" />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={11}
                        fontWeight="bold"
                      >
                        ✓
                      </text>
                    </motion.g>
                  )}
                  
                  {/* 任务名称（悬停显示） */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <rect
                          x={x - 50}
                          y={y - 35}
                          width={100}
                          height={24}
                          rx={4}
                          fill="#1e293b"
                          stroke={leafColor}
                          strokeWidth={1}
                        />
                        <text
                          x={x}
                          y={y - 18}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={11}
                        >
                          {task.title.length > 12 ? task.title.slice(0, 12) + '…' : task.title}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}
          </g>

          {/* 树冠背景 */}
          <motion.ellipse
            cx={centerX}
            cy={crownCenterY}
            rx={200}
            ry={120}
            fill="url(#crownGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* 人生领域标记（8维度）*/}
          <g className="dimensions" opacity={0.6}>
            {dimensionNodes.map(({ dimension, x, y, value }, i) => (
              <motion.g
                key={dimension}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + i * 0.05 }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill={DIMENSION_COLORS[dimension]}
                  opacity={0.3}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill={DIMENSION_COLORS[dimension]}
                  fontSize={9}
                  fontWeight="bold"
                >
                  {DIMENSION_LABELS[dimension].charAt(0)}
                </text>
              </motion.g>
            ))}
          </g>

          {/* 花/果（目标） */}
          <g className="flowers">
            {flowerNodes.map(({ goal, x, y, size }, i) => {
              const isCompleted = goal.status === 'completed';
              const isHovered = hoveredId === goal.id;
              const color = DIMENSION_COLORS[goal.lifeWheelDimension];
              
              return (
                <motion.g
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.12, duration: 0.5, type: 'spring' }}
                >
                  {/* 花茎 */}
                  <motion.path
                    d={`M ${centerX} ${trunkTop + 20} Q ${(centerX + x) / 2} ${(trunkTop + y) / 2 + 20} ${x} ${y}`}
                    stroke="#166534"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  {isCompleted ? (
                    /* 果实 */
                    <motion.g
                      whileHover={{ scale: 1.15 }}
                      className="cursor-pointer"
                      onClick={() => handleGoalClick(goal)}
                      onMouseEnter={() => setHoveredId(goal.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* 果实光晕 */}
                      <circle
                        cx={x}
                        cy={y}
                        r={size + 6}
                        fill={color}
                        opacity={0.3}
                      />
                      {/* 果实主体 */}
                      <circle
                        cx={x}
                        cy={y}
                        r={size}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={2}
                        filter={isHovered ? 'url(#glow)' : 'url(#softShadow)'}
                      />
                      {/* 果实高光 */}
                      <circle
                        cx={x - size * 0.3}
                        cy={y - size * 0.3}
                        r={size * 0.25}
                        fill="#fff"
                        opacity={0.4}
                      />
                      {/* 完成标记 */}
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                      >
                        ★
                      </text>
                    </motion.g>
                  ) : (
                    /* 花朵 */
                    <motion.g
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      className="cursor-pointer"
                      onClick={() => handleGoalClick(goal)}
                      onMouseEnter={() => setHoveredId(goal.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      filter={isHovered ? 'url(#glow)' : 'url(#softShadow)'}
                    >
                      {/* 花瓣 */}
                      {[0, 72, 144, 216, 288].map((angle) => (
                        <ellipse
                          key={angle}
                          cx={x + Math.cos((angle * Math.PI) / 180) * 14}
                          cy={y + Math.sin((angle * Math.PI) / 180) * 14}
                          rx={12}
                          ry={7}
                          fill={color}
                          opacity={0.85}
                          transform={`rotate(${angle + 90} ${x + Math.cos((angle * Math.PI) / 180) * 14} ${y + Math.sin((angle * Math.PI) / 180) * 14})`}
                        />
                      ))}
                      {/* 花心 */}
                      <circle cx={x} cy={y} r={10} fill="#fbbf24" />
                      <circle cx={x} cy={y} r={6} fill="#f59e0b" />
                    </motion.g>
                  )}
                  
                  {/* 进度环 */}
                  {!isCompleted && goal.progress > 0 && (
                    <circle
                      cx={x}
                      cy={y}
                      r={size + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth={3}
                      strokeDasharray={`${(goal.progress / 100) * 2 * Math.PI * (size + 8)} ${2 * Math.PI * (size + 8)}`}
                      transform={`rotate(-90 ${x} ${y})`}
                      opacity={0.7}
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* 目标名称（悬停显示） */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.g
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <rect
                          x={x - 55}
                          y={y + size + 12}
                          width={110}
                          height={28}
                          rx={4}
                          fill="#1e293b"
                          stroke={color}
                          strokeWidth={1}
                        />
                        <text
                          x={x}
                          y={y + size + 25}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={11}
                        >
                          {goal.title.length > 14 ? goal.title.slice(0, 14) + '…' : goal.title}
                        </text>
                        <text
                          x={x}
                          y={y + size + 37}
                          textAnchor="middle"
                          fill={color}
                          fontSize={9}
                        >
                          {goal.progress}% · {DIMENSION_LABELS[goal.lifeWheelDimension]}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}
          </g>

          {/* 空状态提示 */}
          {data.skills.length === 0 && data.goals.length === 0 && data.todayTasks.length === 0 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <text
                x={centerX}
                y={height / 2 + 50}
                textAnchor="middle"
                fill="#64748b"
                fontSize={14}
              >
                添加智忆和目标，让你的树茁壮成长
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* 侧边详情面板 */}
      <AnimatePresence>
        {selectedItem && (
          <TreeSidePanel
            type={selectedItem.type as 'skill' | 'goal' | 'task'}
            data={selectedItem.data as SkillNode | GoalFlower | TaskLeaf}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
