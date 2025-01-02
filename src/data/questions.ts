import { Question, Category } from '../types/questions';

export const categories: Category[] = [
  {
    id: 'values',
    title: '价值观',
    description: '关于个人价值观和影响的问题',
    baseNumber: 1
  },
  {
    id: 'ability',
    title: '能力',
    description: '关于能力和经验的问题',
    baseNumber: 2
  },
  {
    id: 'wishes',
    title: '愿望与梦想',
    description: '关于你的愿望和观点的问题',
    baseNumber: 3
  }
];

export const questions: Question[] = [
  // 价值观问题
  {
    id: 'admired-person',
    serialNumber: '101',
    text: '你有崇拜的人么？你为什么喜欢/崇拜他/她？喜欢/崇拜什么地方？',
    category: 'values',
    answer: '',
    elaboration: ''
  },
  {
    id: 'youth-impact',
    serialNumber: '102',
    text: '你在青春期或人生最活跃时期（11～18）是否有对你影响很大的事情？',
    category: 'values',
    answer: '',
    elaboration: ''
  },
  {
    id: 'environment-improvement',
    serialNumber: '103',
    text: '现在你生活的环境有什么不足？需要改善的地方？',
    category: 'values',
    answer: '',
    elaboration: ''
  },
  {
    id: 'others-perception',
    serialNumber: '104',
    text: '问问你周围的人：你是一个看中什么的人？在意什么的人？',
    category: 'values',
    answer: '',
    elaboration: ''
  },
  {
    id: 'unwanted-advice',
    serialNumber: '105',
    text: '你不希望你的朋友给你什么建议？',
    category: 'values',
    answer: '',
    elaboration: ''
  },

  // 能力问题
  {
    id: 'fulfilling-experience',
    serialNumber: '201',
    text: '目前人生最充实的一段经历是什么？',
    category: 'ability',
    answer: '',
    elaboration: ''
  },
  {
    id: 'impatience',
    serialNumber: '202',
    text: '最近一次对别人不耐烦的事情是什么？（因为你有一些天赋，你认为别人也有，其实没有，所以你表现出不耐烦）',
    category: 'ability',
    answer: '',
    elaboration: ''
  },
  {
    id: 'strengths',
    serialNumber: '203',
    text: '问问你周围的人：你擅长什么？',
    category: 'ability',
    answer: '',
    elaboration: ''
  },
  {
    id: 'alternative-career',
    serialNumber: '204',
    text: '如果放弃现在的工作/事业，你想干什么？',
    category: 'ability',
    answer: '',
    elaboration: ''
  },
  {
    id: 'achievements',
    serialNumber: '205',
    text: '到目前为止，你做成了什么事情？',
    category: 'ability',
    answer: '',
    elaboration: ''
  },

  // 愿望与梦想问题
  {
    id: 'willing-to-learn',
    serialNumber: '301',
    text: '哪件事情就算花钱也愿意学？',
    category: 'wishes',
    answer: '',
    elaboration: ''
  },
  {
    id: 'bookshelf',
    serialNumber: '302',
    text: '你的书架上有什么内容的书？',
    category: 'wishes',
    answer: '',
    elaboration: ''
  },
  {
    id: 'helpful-content',
    serialNumber: '303',
    text: '什么内容给你很大的帮助？',
    category: 'wishes',
    answer: '',
    elaboration: ''
  },
  {
    id: 'gratitude',
    serialNumber: '304',
    text: '你有想要感谢的人和事么？',
    category: 'wishes',
    answer: '',
    elaboration: ''
  },
  {
    id: 'world-dissatisfaction',
    serialNumber: '305',
    text: '你对这个世界有什么不满么？',
    category: 'wishes',
    answer: '',
    elaboration: ''
  }
];
