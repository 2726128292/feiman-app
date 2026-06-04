import type {
  UserProfile,
  StudyTopic,
  FeynmanSession,
  ReviewCard,
  QuizQuestion,
  QuizRecord,
  DailyPlan,
  Achievement,
  SquarePost,
  ProjectTask,
} from '../types'

// ==================== 用户信息 ====================

export const defaultUserProfile: UserProfile = {
  userName: 'Alex',
  avatar: '',
  level: 12,
  streakDays: 12,
  themeColor: '#4F7CFF',
  darkMode: false,
  reminderRules: [
    { id: 'r1', type: 'flashcard', enabled: true, time: '08:30' },
    { id: 'r2', type: 'explain', enabled: true, time: '12:20' },
    { id: 'r3', type: 'review', enabled: false, time: '20:00' },
  ],
}

// ==================== 学习主题（学习路径） ====================

export const mockTopics: StudyTopic[] = [
  {
    id: 'topic-1',
    title: '前端工程化',
    tags: ['Vue3', 'Vite', 'PWA'],
    status: 'active',
    progress: 72,
    createdAt: '2025-10-15',
    color: '#4F7CFF',
    chapters: [
      { id: 'ch-1-1', title: 'Vite 构建工具', completed: true, progress: 100 },
      { id: 'ch-1-2', title: 'Vue3 组合式 API', completed: true, progress: 100 },
      { id: 'ch-1-3', title: 'PWA 离线缓存', completed: false, progress: 60 },
      { id: 'ch-1-4', title: '自动化部署', completed: false, progress: 20 },
    ],
  },
  {
    id: 'topic-2',
    title: '计算机网络',
    tags: ['HTTP', '缓存', 'CDN'],
    status: 'active',
    progress: 45,
    createdAt: '2025-11-01',
    color: '#22C55E',
    chapters: [
      { id: 'ch-2-1', title: 'HTTP 协议详解', completed: true, progress: 100 },
      { id: 'ch-2-2', title: '浏览器缓存策略', completed: false, progress: 55 },
      { id: 'ch-2-3', title: 'CDN 内容分发', completed: false, progress: 20 },
      { id: 'ch-2-4', title: 'HTTPS 与安全', completed: false, progress: 0 },
    ],
  },
  {
    id: 'topic-3',
    title: '高等数学',
    tags: ['极限', '导数', '积分'],
    status: 'active',
    progress: 30,
    createdAt: '2025-11-20',
    color: '#A855F7',
    chapters: [
      { id: 'ch-3-1', title: '极限与连续', completed: true, progress: 100 },
      { id: 'ch-3-2', title: '导数与微分', completed: false, progress: 40 },
      { id: 'ch-3-3', title: '积分基础', completed: false, progress: 10 },
      { id: 'ch-3-4', title: '微分方程入门', completed: false, progress: 0 },
    ],
  },
]

// ==================== 费曼讲解会话 ====================

export const mockSessions: FeynmanSession[] = [
  {
    id: 'session-1',
    topicId: 'topic-3',
    content: '递归就像俄罗斯套娃，每个娃里面还有一个更小的娃……',
    score: 82,
    gaps: [
      { text: '缺少终止条件解释', priority: 'high' },
      { text: '类比清楚但边界情况不足', priority: 'medium' },
      { text: '代码例子可以更具体', priority: 'low' },
    ],
    type: 'text',
    duration: 480,
    step: 2,
    totalSteps: 5,
    createdAt: '2025-06-04T10:30:00',
  },
  {
    id: 'session-2',
    topicId: 'topic-2',
    content: 'HTTP 缓存分为强缓存和协商缓存两种。强缓存通过 Expires 和 Cache-Control 控制...',
    score: 78,
    gaps: [
      { text: 'ETag 和 Last-Modified 区别未说明', priority: 'medium' },
    ],
    type: 'text',
    step: 3,
    totalSteps: 5,
    createdAt: '2025-06-03T14:00:00',
  },
]

// ==================== 闪卡复习 ====================

export const mockCards: ReviewCard[] = [
  {
    id: 'card-1',
    topicId: 'topic-1',
    question: '什么是 Service Worker？',
    answer: 'Service Worker 是运行在浏览器后台的脚本，可以拦截网络请求、实现离线缓存和推送通知，是 PWA 的核心技术之一。',
    dueAt: '2025-06-04',
    interval: 1,
    easeFactor: 2.5,
    reviewCount: 2,
    lastReviewAt: '2025-06-01',
  },
  {
    id: 'card-2',
    topicId: 'topic-3',
    question: '递归必须具备哪两个要素？',
    answer: '1) 递归出口（终止条件）：防止无限调用；2) 递归体：问题规模逐步缩小。',
    dueAt: '2025-06-04',
    interval: 3,
    easeFactor: 2.3,
    reviewCount: 3,
    lastReviewAt: '2025-05-30',
  },
  {
    id: 'card-3',
    topicId: 'topic-2',
    question: 'Cache-Control: no-cache 和 no-store 有什么区别？',
    answer: 'no-cache 表示使用前必须向服务器验证；no-store 表示完全不缓存任何内容。',
    dueAt: '2025-06-04',
    interval: 7,
    easeFactor: 2.6,
    reviewCount: 4,
    lastReviewAt: '2025-05-25',
  },
  {
    id: 'card-4',
    topicId: 'topic-1',
    question: 'Vite 为什么开发时启动很快？',
    answer: 'Vite 利用浏览器原生 ESM 支持，按需编译源码，不需要打包整个项目。同时使用 esbuild 进行预构建依赖，速度极快。',
    dueAt: '2025-06-05',
    interval: 14,
    easeFactor: 2.8,
    reviewCount: 5,
    lastReviewAt: '2025-05-18',
  },
  {
    id: 'card-5',
    topicId: 'topic-3',
    question: '洛必达法则的使用前提是什么？',
    answer: '必须是 0/0 或 ∞/∞ 型未定式，且分子分母在去心邻域内可导，导数之比的极限存在或为无穷。',
    dueAt: '2025-06-05',
    interval: 5,
    easeFactor: 2.2,
    reviewCount: 2,
    lastReviewAt: '2025-05-28',
  },
]

// ==================== 测验题目 ====================

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'quiz-1',
    question: '下面哪种情况最可能导致递归无限执行？',
    options: [
      '函数参数是字符串',
      '缺少终止条件',
      '使用箭头函数',
      '使用局部变量',
    ],
    correctIndex: 1,
    explanation: '递归必须有终止条件（base case），否则函数会无限调用自身导致栈溢出。',
    topicId: 'topic-3',
  },
  {
    id: 'quiz-2',
    question: 'Service Worker 的生命周期不包括哪个阶段？',
    options: [
      'Installing',
      'Activated',
      'Idle',
      'Redundant',
    ],
    correctIndex: 2,
    explanation: 'Service Worker 生命周期包括：Installing → Waiting → Activated → Redundant，没有 Idle 阶段。',
    topicId: 'topic-1',
  },
  {
    id: 'quiz-3',
    question: 'HTTP/2 相比 HTTP/1.1 最核心的改进是什么？',
    options: [
      '更短的头部字段名',
      '多路复用（Multiplexing）',
      '强制 HTTPS',
      '更大的请求体限制',
    ],
    correctIndex: 1,
    explanation: 'HTTP/2 引入二进制帧和多路复用，可以在单个 TCP 连接上并行发送多个请求，解决了 HTTP/1.1 的队头阻塞问题。',
    topicId: 'topic-2',
  },
  {
    id: 'quiz-4',
    question: '以下哪个不是 Vite 的特性？',
    options: [
      '即时服务器启动（HMR）',
      '按需编译',
      '基于 webpack 打包',
      '原生 ESM 开发服务器',
    ],
    correctIndex: 2,
    explanation: 'Vite 在开发模式下不使用 webpack，而是利用浏览器原生 ESM 能力实现按需加载，生产环境则使用 Rollup 打包。',
    topicId: 'topic-1',
  },
  {
    id: 'quiz-5',
    question: '定积分的几何意义是什么？',
    options: [
      '曲线的斜率',
      '曲边梯形的面积',
      '函数的变化率',
      '曲线的切线方程',
    ],
    correctIndex: 1,
    explanation: '定积分 ∫[a,b] f(x)dx 在几何上表示由曲线 y=f(x)、x轴以及直线 x=a、x=b 所围成的曲边梯形的有向面积。',
    topicId: 'topic-3',
  },
]

export const mockQuizRecords: QuizRecord[] = [
  {
    id: 'record-1',
    questions: [mockQuizQuestions[0], mockQuizQuestions[1]],
    answers: [1, 2],
    score: 100,
    completedAt: '2025-06-04T09:00:00',
  },
  {
    id: 'record-2',
    questions: mockQuizQuestions.slice(0, 5),
    answers: [1, 2, 1, 2, 1],
    score: 80,
    completedAt: '2025-06-03T16:00:00',
  },
]

// ==================== 今日计划 ====================

export const mockDailyPlans: DailyPlan[] = [
  {
    date: '2025-06-04',
    tasks: [
      {
        id: 'task-1',
        title: '闪卡复习 15 张',
        time: '08:30',
        type: 'flashcard',
        priority: 'medium',
        completed: false,
        topicId: 'topic-1',
      },
      {
        id: 'task-2',
        title: '费曼讲解：递归',
        time: '12:20',
        type: 'explain',
        priority: 'medium',
        completed: false,
        topicId: 'topic-3',
      },
      {
        id: 'task-3',
        title: '薄弱点补救：终止条件',
        time: '20:30',
        type: 'remediation',
        priority: 'high',
        completed: false,
        topicId: 'topic-3',
      },
    ],
  },
  {
    date: '2025-06-03',
    tasks: [
      {
        id: 'task-4',
        title: '闪卡复习 10 张',
        time: '09:00',
        type: 'flashcard',
        priority: 'low',
        completed: true,
      },
      {
        id: 'task-5',
        title: '费曼讲解：HTTP 缓存',
        time: '14:00',
        type: 'explain',
        priority: 'medium',
        completed: true,
        topicId: 'topic-2',
      },
    ],
  },
]

// ==================== 成就系统 ====================

export const mockAchievements: Achievement[] = [
  {
    type: 'streak',
    level: 12,
    unlockedAt: '2025-06-04',
    icon: '🔥',
    name: '连续打卡 12 天',
    description: '保持每日学习不间断，已连续打卡 12 天！',
  },
  {
    type: 'explainer',
    level: 3,
    unlockedAt: '2025-06-02',
    icon: '🎯',
    name: '讲解达人',
    description: '累计完成 20 次费曼讲解，平均清晰度超过 85 分。',
  },
  {
    type: 'graph_explorer',
    level: 1,
    unlockedAt: '2025-05-28',
    icon: '🕸️',
    name: '图谱探索者',
    description: '知识图谱中已解锁 128 个知识点节点。',
  },
  {
    type: 'quiz_perfect',
    level: 5,
    unlockedAt: '2025-06-01',
    icon: '🏆',
    name: '测验满分',
    description: '在模拟测验中获得 5 次满分成绩。',
  },
]

// ==================== 讲解广场 ====================

export const mockSquarePosts: SquarePost[] = [
  {
    id: 'post-1',
    authorName: '小林',
    avatarLetter: '小',
    avatarBg: '#DBEAFE',
    title: '用咖啡机解释事件循环',
    clarityScore: 91,
    likes: 120,
    topicId: 'topic-1',
    createdAt: '2025-06-03T20:15:00',
  },
  {
    id: 'post-2',
    authorName: 'Mia',
    avatarLetter: 'M',
    avatarBg: '#D1FAE5',
    title: '三分钟讲懂 HTTP 缓存',
    clarityScore: 88,
    likes: 96,
    topicId: 'topic-2',
    createdAt: '2025-06-03T18:30:00',
  },
  {
    id: 'post-3',
    authorName: '张同学',
    avatarLetter: '张',
    avatarBg: '#F3E8FF',
    title: '递归与动态规划区别',
    clarityScore: 84,
    likes: 73,
    topicId: 'topic-3',
    createdAt: '2025-06-02T21:00:00',
  },
]

// ==================== 项目实践 ====================

export const mockProjects: ProjectTask[] = [
  {
    id: 'proj-1',
    title: '做一个离线可用的学习卡片 PWA',
    subTasks: [
      { id: 'sub-1-1', text: '创建 manifest.json', completed: true },
      { id: 'sub-1-2', text: '配置 Service Worker 缓存', completed: true },
      { id: 'sub-1-3', text: '离线模式降级提示', completed: false },
      { id: 'sub-1-4', text: 'GitHub Pages 发布', completed: false },
    ],
    status: 'active',
  },
]

// ==================== 学习分析 / 热力图数据 ====================

export interface AnalyticsData {
  masteryRate: number
  masteryChange: number
  forgetRisk: '低' | '中' | '高'
  forgetRiskChange: number
  clarityScore: number
  clarityChange: number
  gapCount: number
  gapChange: number
  weeklyScores: number[]
  heatmapValues: number[][]
}

export const mockAnalytics: AnalyticsData = {
  masteryRate: 68,
  masteryChange: 12,
  forgetRisk: '中',
  forgetRiskChange: -8,
  clarityScore: 84,
  clarityChange: 9,
  gapCount: 17,
  gapChange: -5,
  // 本周成长曲线数据点（对应截图中的折线图）
  weeklyScores: [72, 78, 75, 82, 79, 86, 90],
  // 热力日历数据（5行 x 7列），值 0-4 对应颜色深浅
  heatmapValues: [
    [0, 1, 2, 3, 0, 1, 2],
    [1, 3, 0, 2, 1, 3, 2],
    [3, 2, 1, 2, 3, 1, 2],
    [2, 1, 3, 0, 2, 1, 3],
    [3, 2, 1, 2, 3, 2, 4],
  ],
}

// ==================== 首页仪表盘汇总数据 ====================

export interface DashboardSummary {
  activeTopicsCount: number
  dueCardsCount: number
  pendingQuizzesCount: number
  knowledgeNodesCount: number
  aiSuggestion: string
  suggestionTopic: string
}

export const mockDashboardSummary: DashboardSummary = {
  activeTopicsCount: 6,
  dueCardsCount: 42,
  pendingQuizzesCount: 3,
  knowledgeNodesCount: 128,
  aiSuggestion: '你在「递归」概念上重复卡顿，建议先完成 8 分钟类比讲解。',
  suggestionTopic: '递归',
}
