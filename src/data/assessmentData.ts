import {
  AssessmentTopic,
  AssessmentEvaluation,
  RadarDimension,
  BarDimension,
} from '../types/assessment'

// ==========================================
// 1. 心里天气 (Inner Weather)
// ==========================================
const innerWeatherTopic: AssessmentTopic = {
  id: 'inner-weather',
  category: 'exploration',
  title: '心里天气',
  subtitle: '最近是晴、是雾，还是一阵微风。',
  badge: '情绪觉察',
  color: '#6f9a76',
  accentColor: '#53845b',
  description: '感知当下情绪云层的厚度与流向，给起风的心找一个歇脚处。',
  purpose: '帮助你温和回顾近期的情绪体验，看见心里真正需要的一束光。',
  targetAudience: '感到心绪多变、情绪压抑或想要了解自己当下心情状态的朋友',
  chartType: 'radar',
  dimensions: [
    { key: 'clearness', name: '晴朗度' },
    { key: 'acceptance', name: '接纳度' },
    { key: 'resilience', name: '韧性度' },
    { key: 'rest', name: '歇脚感' },
    { key: 'expression', name: '表达力' },
  ],
  disclaimer:
    '【自编轻量探索】本自评仅用于日常情绪觉察与轻柔反思，不构成任何临床诊断与心理标签。情绪如云，聚散皆自然。',
  questions: [
    {
      id: 'iw-1',
      prompt: '这几天心里的主调，更像哪种天气？',
      subtitle: '跟着第一直觉选择就好，没有好坏之分。',
      options: [
        { label: '亮堂清朗，偶有微风', score: 3 },
        { label: '有一层薄雾，略显朦胧', score: 2 },
        { label: '风有点大，吹得有些晃', score: 1 },
        { label: '阴云滞重，透不过气', score: 0 },
      ],
    },
    {
      id: 'iw-2',
      prompt: '这些情绪或心绪出现的频率与持续时间？',
      options: [
        { label: '偶尔浮现，很快能自然流淌', score: 3 },
        { label: '大半天左右，在忙碌中会淡化', score: 2 },
        { label: '几乎整天都在，容易被牵引', score: 1 },
        { label: '如影随形，久久难以排遣', score: 0 },
      ],
    },
    {
      id: 'iw-3',
      prompt: '情绪对你日常做事与节奏的实际影响？',
      options: [
        { label: '节奏平稳，照常安稳生活', score: 3 },
        { label: '偶尔分心，需要多花些时间', score: 2 },
        { label: '拖慢了步调，感觉有些吃力', score: 1 },
        { label: '感到停滞，需要很大力气才能动起来', score: 0 },
      ],
    },
    {
      id: 'iw-4',
      prompt: '当心里起风或落雨时，你习惯怎么对待自己？',
      options: [
        { label: '允许自己停下歇歇，泡杯热茶', score: 3 },
        { label: '稍有烦躁，但能慢慢平复', score: 2 },
        { label: '习惯强撑着继续，不愿示弱', score: 1 },
        { label: '容易陷入自责：“为什么我又这样”', score: 0 },
      ],
    },
    {
      id: 'iw-5',
      prompt: '此刻你心里最渴望哪一种歇脚方式？',
      options: [
        { label: '安静独处，让思绪自由漫游', score: 3 },
        { label: '有人轻声倾听，不必给任何建议', score: 2 },
        { label: '美美睡上一觉，给身心完全断电', score: 1 },
        { label: '走到绿意林间，深深叹一口气', score: 2 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    // Score sum: 0 - 14
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 14
    const ratio = Math.max(0, Math.min(1, totalScore / maxScore))

    // Dimension calculation (0 - 100)
    const q1 = answers[0] ?? 2
    const q2 = answers[1] ?? 2
    const q3 = answers[2] ?? 2
    const q4 = answers[3] ?? 2
    const q5 = answers[4] ?? 2

    const clearnessVal = Math.round(((q1 * 1.5 + q2) / 7.5) * 80 + 20)
    const acceptanceVal = Math.round((q4 / 3) * 75 + 25)
    const resilienceVal = Math.round((q3 / 3) * 75 + 25)
    const restVal = Math.round(((q4 + q5) / 6) * 75 + 25)
    const expressionVal = Math.round(((q2 + q5) / 6) * 70 + 30)

    const radarDimensions: RadarDimension[] = [
      { name: '亮堂度', value: clearnessVal },
      { name: '接纳度', value: acceptanceVal },
      { name: '从容度', value: resilienceVal },
      { name: '歇脚感', value: restVal },
      { name: '表达力', value: expressionVal },
    ]

    let weatherName = '微风暖阳'
    let summary = '心里还有透亮的光，偶有浮云掠过，整体步调松弛稳定。'
    let levelColor = '#5e9d68'

    if (ratio >= 0.75) {
      weatherName = '天晴日朗 · 步履轻盈'
      summary = '当下的你心境较为通透，情绪即便有波澜也能自然平复，能够给自己留出呼吸的空隙。'
      levelColor = '#5e9d68'
    } else if (ratio >= 0.5) {
      weatherName = '林间薄雾 · 偶有清风'
      summary = '心头有些薄雾或琐事牵挂，虽有些沉甸甸，但并未遮挡前行的路，仍有力量温柔支撑自己。'
      levelColor = '#6d9972'
    } else if (ratio >= 0.25) {
      weatherName = '微风微雨 · 需拢领口'
      summary = '近来风势稍大，或许生活中有些消耗你的事情。心在轻轻提醒你：该找个干燥温暖处歇歇脚了。'
      levelColor = '#c5a85e'
    } else {
      weatherName = '阴云滞留 · 渴望暖意'
      summary = '心里像积了一层厚云，感到有些沉重与疲惫。请记得允许这份低落存在，此时此刻不必急着变晴。'
      levelColor = '#b57e62'
    }

    return {
      topicId: 'inner-weather',
      topicTitle: '心里天气',
      category: 'exploration',
      score: totalScore,
      maxScore,
      levelName: weatherName,
      levelColor,
      weatherSummary: weatherName,
      summary,
      radarDimensions,
      detailedPoints: [
        {
          title: '当下的主调天气',
          text: `从你的回答来看，心境更接近「${weatherName}」。雾气在时，路并没有消失，只是步调需要放缓。`,
        },
        {
          title: '情绪接纳状态',
          text:
            acceptanceVal > 60
              ? '你懂得在不好的时候对自己宽容一些，这是极宝贵的心理韧性。'
              : '面对起风落雨时，你容易暗暗责怪自己。试着把对自己的要求松一扣。',
        },
        {
          title: '给心留的歇脚空间',
          text:
            restVal > 60
              ? '你保有给自己充电的知觉，继续保持这份对内在需求的敬重。'
              : '日常的耗电量有些大，今天不妨给自己划出30分钟绝对不被催促的留白时光。',
        },
      ],
      careAdvice: [
        '给情绪命名但不贴标签：告诉自己“我现在有些疲倦”，而不是“我很糟糕”。',
        '放下即刻解决问题的冲动，试着跟小安一起做组4-7-8呼吸，把双肩沉下来。',
        '如果窗外有阳光或树叶，抬头静静看上两分钟，让目光投向远处。',
      ],
      disclaimer:
        '本探索为项目自编的轻量情绪觉察工具，不代表临床诊断。若情绪持续低落超过两周且严重影响生活，建议寻求专业心理咨询支持。',
      shareSummary: `当前心里天气为「${weatherName}」，状态概括：${summary}`,
    }
  },
}

// ==========================================
// 2. 和人相处 (Social Relations)
// ==========================================
const socialRelationsTopic: AssessmentTopic = {
  id: 'social-relations',
  category: 'exploration',
  title: '和人相处',
  subtitle: '说话、靠近、一个人待着，哪边更费力。',
  badge: '人际探索',
  color: '#90aa83',
  accentColor: '#6f9263',
  description: '梳理人际互动中的能量流动，观察需求表达、边界感与支持感。',
  purpose: '帮助你觉察关系中的紧绷与自洽，找到最舒服的相处距离。',
  targetAudience: '在人际交往中感到容易疲惫、难以说“不”或渴望更松弛关系的朋友',
  chartType: 'radar',
  dimensions: [
    { key: 'expression', name: '需求表达' },
    { key: 'boundary', name: '边界感' },
    { key: 'support', name: '支持感' },
    { key: 'conflict', name: '冲突应对' },
    { key: 'ease', name: '人际松弛' },
  ],
  disclaimer:
    '【自编轻量探索】人际相处没有统一模板，每个人的舒适社交距离各不相同。本自评用于自我认知，不代表社交能力评价。',
  questions: [
    {
      id: 'sr-1',
      prompt: '当你想表达自己的需要或观点时，通常感到？',
      options: [
        { label: '自然从容，能够直率且温和地说出', score: 3 },
        { label: '心里会稍微打草稿，但基本能表达', score: 2 },
        { label: '担心给对方添麻烦，经常选择咽回去', score: 1 },
        { label: '极度焦虑害怕被否定，习惯完全隐身', score: 0 },
      ],
    },
    {
      id: 'sr-2',
      prompt: '面对不同意见或人际小冲突时，你的第一反应？',
      options: [
        { label: '就事论事，尝试换位思考并坦诚沟通', score: 3 },
        { label: '先保持安静，等双方情绪平复后再谈', score: 2 },
        { label: '内心紧绷，习惯性觉得“是不是我做得不好”', score: 1 },
        { label: '感到强烈应激抗拒，只想立刻逃避远离', score: 0 },
      ],
    },
    {
      id: 'sr-3',
      prompt: '你是否容易因为他人的语气、脸色或评价感到压力？',
      options: [
        { label: '基本不受干扰，明白别人的情绪属于别人', score: 3 },
        { label: '偶尔会留意，但很快能放下', score: 2 },
        { label: '经常在脑中反复回放，琢磨背后含义', score: 1 },
        { label: '极度敏感，容易被他人的负面反馈击垮', score: 0 },
      ],
    },
    {
      id: 'sr-4',
      prompt: '当你感到脆弱疲惫时，能感受到来自朋友或家人的支持吗？',
      options: [
        { label: '有能安心交付软弱的港湾，被深切接纳', score: 3 },
        { label: '有少数一两位可以倾诉，虽然不常打扰', score: 2 },
        { label: '不确定对方是否愿意承接，习惯自己扛', score: 1 },
        { label: '感觉四顾茫然，孤立无援', score: 0 },
      ],
    },
    {
      id: 'sr-5',
      prompt: '在需要拒绝别人或设立个人界限时，你的感受？',
      options: [
        { label: '能够温和而坚定地表达“这次我不便参加”', score: 3 },
        { label: '虽然有些许抱歉内疚，但依然能守住界限', score: 2 },
        { label: '总是很难说出“不”，经常勉强答应后后悔', score: 1 },
        { label: '害怕被排斥，几乎从未表达过自己的底线', score: 0 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 15

    const q1 = answers[0] ?? 2 // 需求表达
    const q2 = answers[1] ?? 2 // 冲突应对
    const q3 = answers[2] ?? 2 // 人际松弛 / 敏感度
    const q4 = answers[3] ?? 2 // 支持感
    const q5 = answers[4] ?? 2 // 边界感

    const expVal = Math.round((q1 / 3) * 75 + 25)
    const bndVal = Math.round((q5 / 3) * 75 + 25)
    const supVal = Math.round((q4 / 3) * 75 + 25)
    const confVal = Math.round((q2 / 3) * 75 + 25)
    const easeVal = Math.round((q3 / 3) * 75 + 25)

    const radarDimensions: RadarDimension[] = [
      { name: '需求表达', value: expVal },
      { name: '边界清晰', value: bndVal },
      { name: '关系支持', value: supVal },
      { name: '冲突应对', value: confVal },
      { name: '人际松弛', value: easeVal },
    ]

    let levelName = '温润自洽型'
    let levelColor = '#609a72'
    let summary = '你对自己的界限有清晰觉察，能温和守住自我，在人际互动中保有难得的自在与松弛。'

    if (totalScore >= 12) {
      levelName = '自洽从容 · 距离适宜'
      levelColor = '#5e9d68'
      summary = '你在人际交往中保持着舒适的呼吸感，既能坦诚表达自己，也能给予他人空间，关系安全感充沛。'
    } else if (totalScore >= 8) {
      levelName = '体贴敏锐 · 偶有顾虑'
      levelColor = '#7ca878'
      summary = '你往往能敏锐体察他人情绪，是个体贴的伙伴；但有时会将他人的感受置于自己之上，略有内耗。'
    } else if (totalScore >= 4) {
      levelName = '习惯迁就 · 渴望边界'
      levelColor = '#c5a85e'
      summary = '你在关系中承担了较多迎合与忍耐，说“不”对你而言需要很大勇气。你的善意值得首先被自己珍惜。'
    } else {
      levelName = '紧绷防御 · 急需安歇'
      levelColor = '#b57e62'
      summary = '当前人际互动带给你不小的消耗与压力，容易感到孤立或被过度要求。退回一个人的安静角落是完全被允许的。'
    }

    return {
      topicId: 'social-relations',
      topicTitle: '和人相处',
      category: 'exploration',
      score: totalScore,
      maxScore,
      levelName,
      levelColor,
      summary,
      radarDimensions,
      detailedPoints: [
        {
          title: '边界与自我保留',
          text:
            bndVal >= 60
              ? '你能较好地捍卫心理篱笆，既不筑高墙，也不轻易任由他人踩踏。'
              : '常常因为不好意思拒绝而过度透支自己的时间与心力，记住：温和的拒绝也是对关系的保护。',
        },
        {
          title: '表达与需求沟通',
          text:
            expVal >= 60
              ? '你懂得说出真实想法，这减少了许多猜测与误会的成本。'
              : '你习惯把委屈与真实想法藏在心底。其实爱与理解往往是在坦诚袒露脆弱时发生的。',
        },
        {
          title: '周围的支持力量',
          text:
            supVal >= 60
              ? '你拥有能感知到安全支持的网络，这是抵御外界风雨的温暖底气。'
              : '在需要帮助时容易觉得自己是一个人。不妨试着向一个信任的朋友轻敲一下对话框。',
        },
      ],
      careAdvice: [
        '练习一句简单的拒绝话术：“这次我可能没办法参加，谢谢你想起我。”无需解释过多理由。',
        '分清别人的情绪课题：对方皱眉或冷淡，往往是他们自己的生活压力，与你的价值无关。',
        '感到社交过载时，勇敢宣布“今日电量用尽”，给自己一整晚的纯粹独处时光。',
      ],
      disclaimer:
        '本探索为项目自编的轻量反思工具，旨在帮助你觉察关系互动模式，非临床诊断。',
      shareSummary: `人际相处状态评估为「${levelName}」，观察小结：${summary}`,
    }
  },
}

// ==========================================
// 3. 身体里的信号 (Body Signals)
// ==========================================
const bodySignalsTopic: AssessmentTopic = {
  id: 'body-signals',
  category: 'exploration',
  title: '身体里的信号',
  subtitle: '肩、胃、睡眠，有没有在轻轻提醒你。',
  badge: '身心观察',
  color: '#5f8c6b',
  accentColor: '#457352',
  description: '聆听躯体各处的轻声呢喃，感知睡眠、紧绷、胃部与精力的真实反馈。',
  purpose: '帮助你放下头脑里的忙乱，把注意力重新接回身体，察觉疲乏并及时照料。',
  targetAudience: '久坐伏案、长期忙碌、感觉身体酸沉或睡眠不安的朋友',
  chartType: 'radar',
  dimensions: [
    { key: 'sleep', name: '睡眠感知' },
    { key: 'relaxation', name: '躯体松弛' },
    { key: 'stamina', name: '精力续航' },
    { key: 'restAwareness', name: '休息响应' },
    { key: 'rhythm', name: '肠胃节奏' },
  ],
  disclaimer:
    '【重要健康提示】本测评仅用于日常身心觉察与生活节奏调整，绝非医学或临床诊断。若您有持续、剧烈或令您担忧的身体症状（如胸痛、心慌、顽固失眠或严重腹部疼痛），请务必及时前往正规医疗机构就医。',
  questions: [
    {
      id: 'bs-1',
      prompt: '早晨醒来时，你的身体和精神通常的感觉？',
      options: [
        { label: '身体舒畅轻盈，精力比较充沛', score: 3 },
        { label: '还可以，洗漱喝水后能慢慢进入状态', score: 2 },
        { label: '依然沉重疲劳，像没充进电一样', score: 1 },
        { label: '头昏脑涨四肢酸沉，极度抗拒起床', score: 0 },
      ],
    },
    {
      id: 'bs-2',
      prompt: '你的肩颈、胸口、胃部或背部是否有明显的紧绷感？',
      options: [
        { label: '全身基本松弛，没有明显的酸紧卡顿', score: 3 },
        { label: '伏案久了会酸，但拉伸后能缓解', score: 2 },
        { label: '常不自觉耸肩、咬紧牙关，肩颈僵硬', score: 1 },
        { label: '长期处于紧缩酸胀甚至胸闷感', score: 0 },
      ],
    },
    {
      id: 'bs-3',
      prompt: '最近入睡及睡眠质量的大致状况是？',
      options: [
        { label: '半小时内能自然入睡，醒来踏实', score: 3 },
        { label: '偶尔睡前思绪稍多，但整体无大碍', score: 2 },
        { label: '翻来覆去入睡困难，或容易夜醒多梦', score: 1 },
        { label: '睡眠严重受阻，经常睁眼到凌晨', score: 0 },
      ],
    },
    {
      id: 'bs-4',
      prompt: '身体感到疲惫时，你有及时停下来休息的习惯吗？',
      options: [
        { label: '觉察到累了就会主动起身舒展、喝水歇息', score: 3 },
        { label: '会先把手头的事告一段落再去休息', score: 2 },
        { label: '习惯拖着疲惫硬撑，直到事情做完', score: 1 },
        { label: '习惯性忽略身体警告，直到彻底透支倒下', score: 0 },
      ],
    },
    {
      id: 'bs-5',
      prompt: '你的日常进食习惯与胃部感受如何？',
      options: [
        { label: '三餐相对定时，吃得舒服消化良好', score: 3 },
        { label: '偶有忙碌延迟，但胃口整体平稳', score: 2 },
        { label: '经常没有食欲，或借暴饮暴食来排解压力', score: 1 },
        { label: '肠胃极易受紧张应激影响，频繁胀痛难受', score: 0 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 15

    const q1 = answers[0] ?? 2 // 精力
    const q2 = answers[1] ?? 2 // 躯体松弛
    const q3 = answers[2] ?? 2 // 睡眠
    const q4 = answers[3] ?? 2 // 休息响应
    const q5 = answers[4] ?? 2 // 胃部

    const sleepVal = Math.round((q3 / 3) * 75 + 25)
    const relaxVal = Math.round((q2 / 3) * 75 + 25)
    const staminaVal = Math.round((q1 / 3) * 75 + 25)
    const restVal = Math.round((q4 / 3) * 75 + 25)
    const rhythmVal = Math.round((q5 / 3) * 75 + 25)

    const radarDimensions: RadarDimension[] = [
      { name: '睡眠感知', value: sleepVal },
      { name: '躯体松弛', value: relaxVal },
      { name: '精力续航', value: staminaVal },
      { name: '休息响应', value: restVal },
      { name: '饮食节奏', value: rhythmVal },
    ]

    let levelName = '身心协调良好'
    let levelColor = '#5e9d68'
    let summary = '身体处于相对平稳的呼吸节奏中，紧绷感较低，能够敏锐感知并照顾身体的微小需求。'

    if (totalScore >= 12) {
      levelName = '身心舒展 · 充满活力'
      levelColor = '#5e9d68'
      summary = '你的身体与意识保持着良好的连接，睡眠与日常精力运转顺畅，请继续保持这套自我关照的习惯。'
    } else if (totalScore >= 8) {
      levelName = '轻度紧绷 · 需微调息'
      levelColor = '#7aa87e'
      summary = '身体正在发出轻微的提醒信号（如肩颈酸僵或入睡稍慢），它在提醒你把步子稍稍放慢一点。'
    } else if (totalScore >= 4) {
      levelName = '显著疲劳 · 紧缩负荷'
      levelColor = '#c5a85e'
      summary = '躯体正承担着不可忽视的紧张负荷，睡眠或胃口已出现波澜。身体在渴望你给它一次真正的放空。'
    } else {
      levelName = '高度耗竭 · 亮起红灯'
      levelColor = '#b57e62'
      summary = '各项身体信号均提示长期处于超负荷运转。请停下无休止的催促，必要时请及时寻求医疗协助。'
    }

    return {
      topicId: 'body-signals',
      topicTitle: '身体里的信号',
      category: 'exploration',
      score: totalScore,
      maxScore,
      levelName,
      levelColor,
      summary,
      radarDimensions,
      detailedPoints: [
        {
          title: '躯体与肌肉紧张度',
          text:
            relaxVal >= 60
              ? '身体各主要关节与肌群较为松弛，没有形成长期顽固的代偿紧张。'
              : '身体正在下意识帮你“扛事”，耸肩或咬牙是压力未释放的躯体化表现，需要主动做些深呼吸与温和拉伸。',
        },
        {
          title: '睡眠蓄电感知',
          text:
            sleepVal >= 60
              ? '睡眠能够起到较为充分的修复作用，为白天的运转提供稳固基石。'
              : '睡眠节律受到了情绪或压力的打扰，睡前一小时尽量避免浏览高刺激屏幕与信息流。',
        },
        {
          title: '对疲惫的响应',
          text:
            restVal >= 60
              ? '你懂得把累当回事，不会轻易透支自己的底线。'
              : '你经常在身体报警时依然选择催促自己。身体也是你的好朋友，它需要被温柔照料。',
        },
      ],
      careAdvice: [
        '身体扫描练习：躺下或坐好，从脚趾、小腿、腹部到肩颈，一步步把注意力带过去，轻轻说一句“放松”。',
        '喝一口温水，用热毛巾敷一敷颈后和双眼，给紧绷的神经一次温润的触感抚慰。',
        '若存在持续的剧烈头痛、胸闷心悸或严重肠胃不适，切勿仅凭自评硬撑，请务必尽快就医排查器质性原因。',
      ],
      disclaimer:
        '本自评仅用于自我身心状态觉察，不替代医疗诊断。若身体不适持续或加剧，请及时咨询专业医师。',
      shareSummary: `身体信号评估为「${levelName}」，观察小结：${summary}`,
    }
  },
}

// ==========================================
// 4. 学习与日常 (Daily Pace)
// ==========================================
const dailyPaceTopic: AssessmentTopic = {
  id: 'daily-pace',
  category: 'exploration',
  title: '学习与日常',
  subtitle: '功课、节奏、被催的感觉。',
  badge: '生活节律',
  color: '#c5a85e',
  accentColor: '#9e8544',
  description: '观察生活节奏的张力与弹力，审视任务压力、专注力与个人留白。',
  purpose: '帮助你辨识节奏混乱与内耗的源头，在繁杂事务中找回属于自己的呼吸感。',
  targetAudience: '面临课业繁重、工作任务堆积、感到被时间推着走的朋友',
  chartType: 'radar',
  dimensions: [
    { key: 'manageability', name: '掌控感' },
    { key: 'focus', name: '专注度' },
    { key: 'breathing', name: '留白度' },
    { key: 'recovery', name: '回血力' },
    { key: 'meaning', name: '喜悦感' },
  ],
  disclaimer:
    '【自编轻量探索】任务量是客观的，但心里的节律是可以重塑的。本自评用于觉察日常负荷，帮助寻找松紧平衡。',
  questions: [
    {
      id: 'dp-1',
      prompt: '面对近期的课业任务或日常待办，你心里的首要感觉？',
      options: [
        { label: '心里有数，能一件一件按部就班推进', score: 3 },
        { label: '事情稍多但还可承受，偶有手忙脚乱', score: 2 },
        { label: '总感觉被截止日期催着赶着，喘不过气', score: 1 },
        { label: '极度焦虑拖延，脑子一团乱不知从何开始', score: 0 },
      ],
    },
    {
      id: 'dp-2',
      prompt: '在学习或做事时的专注力与沉浸体验如何？',
      options: [
        { label: '比较容易进入心流，思路清晰连贯', score: 3 },
        { label: '偶有走神或被通知打断，但能重新拉回', score: 2 },
        { label: '频繁分心看手机，很难在同一件事上坚持半小时', score: 1 },
        { label: '思绪极度涣散，坐在桌前数小时却难有进展', score: 0 },
      ],
    },
    {
      id: 'dp-3',
      prompt: '每天的时间安排中，是否拥有属于自己的“喘息留白”？',
      options: [
        { label: '有充足的自主时间，可以完全做自己想做的事', score: 3 },
        { label: '偶尔能挤出一小段闲暇，做点轻松的事', score: 2 },
        { label: '日常安排被各项任务塞得极满，仅有吃饭洗漱空档', score: 1 },
        { label: '连做梦都在被催促，完全没有属于自己的时刻', score: 0 },
      ],
    },
    {
      id: 'dp-4',
      prompt: '一整天奔波结束后，你的精力恢复速度通常如何？',
      options: [
        { label: '睡上一觉就能重新恢复元气，第二天精神饱满', score: 3 },
        { label: '需要安静躺上一阵才能缓过来，大体能应付', score: 2 },
        { label: '常常带着前一天的残余疲惫醒来，慢性消耗', score: 1 },
        { label: '长期处于被掏空的透支状态，周末也无法缓解', score: 0 },
      ],
    },
    {
      id: 'dp-5',
      prompt: '最近是否有心力投入到自己真正喜欢的兴趣中？',
      options: [
        { label: '每周都能保持爱好的时间，并从中获得纯粹滋养', score: 3 },
        { label: '偶尔会抽空做一些，但时间不算太多', score: 2 },
        { label: '心里很想做，但总觉得自己“没资格玩”或太累', score: 1 },
        { label: '已经很久没有体会过纯粹热爱的快乐了', score: 0 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 15

    const q1 = answers[0] ?? 2
    const q2 = answers[1] ?? 2
    const q3 = answers[2] ?? 2
    const q4 = answers[3] ?? 2
    const q5 = answers[4] ?? 2

    const manVal = Math.round((q1 / 3) * 75 + 25)
    const focVal = Math.round((q2 / 3) * 75 + 25)
    const breathVal = Math.round((q3 / 3) * 75 + 25)
    const recVal = Math.round((q4 / 3) * 75 + 25)
    const meanVal = Math.round((q5 / 3) * 75 + 25)

    const radarDimensions: RadarDimension[] = [
      { name: '掌控感', value: manVal },
      { name: '专注度', value: focVal },
      { name: '留白度', value: breathVal },
      { name: '回血力', value: recVal },
      { name: '喜悦感', value: meanVal },
    ]

    let levelName = '节奏匀称自得'
    let levelColor = '#5e9d68'
    let summary = '你对日常节奏有较好的把控力，在任务推进与自我休息之间维持了良好的动态平衡。'

    if (totalScore >= 12) {
      levelName = '从容有度 · 呼吸自如'
      levelColor = '#5e9d68'
      summary = '你懂得把大事情拆细，并在奔跑中为自己留出绿荫。这种有张有弛的步调节奏十分健康。'
    } else if (totalScore >= 8) {
      levelName = '负荷适中 · 偶有追赶'
      levelColor = '#8fae70'
      summary = '任务有些堆积，偶尔会让你感到一点催促；但你依然保有着核心的执行力与自愈能力。'
    } else if (totalScore >= 4) {
      levelName = '节奏紧绷 · 留白不足'
      levelColor = '#c5a85e'
      summary = '你被过多事务追赶着奔跑，留给自己的时间被极度压缩。长此以往容易滑入职业/学业倦怠。'
    } else {
      levelName = '严重过载 · 亟须减负'
      levelColor = '#b57e62'
      summary = '当前生活节奏已呈现超负荷警报，身心都处于高压透支边缘。此时最重要的不是“咬牙硬撑”，而是主动精简。'
    }

    return {
      topicId: 'daily-pace',
      topicTitle: '学习与日常',
      category: 'exploration',
      score: totalScore,
      maxScore,
      levelName,
      levelColor,
      summary,
      radarDimensions,
      detailedPoints: [
        {
          title: '节奏掌控与压力感',
          text:
            manVal >= 60
              ? '面对待办能够理出轻重缓急，避免了无休止的“救火”模式。'
              : '常常被紧急的事牵着走，尝试把今天最重要的事精简为“不可替代的1件事”，先完成它就好。',
        },
        {
          title: '日常自主留白',
          text:
            breathVal >= 60
              ? '日常留白充实，留白不是浪费时间，而是神经系统重新校准的必须阶段。'
              : '你的日程表中缺乏真正的“暂停键”。试着把每天的一顿饭时间设为“无屏幕安心进食时间”。',
        },
        {
          title: '个人喜悦滋养',
          text:
            meanVal >= 60
              ? '你保留着属于自己的心头好，那是生活里跳动的小火苗。'
              : '被功利目标塞得太满，快乐感在悄悄流失。今天不妨允许自己纯粹地看一集动画或听两首老歌。',
        },
      ],
      careAdvice: [
        '运用“微小起步法”：拖延往往来自任务太大，告诉自己“我只先打开文档写两句话，写完就可以停”。',
        '设置日落界限：每天设定一个时间点（如晚8点或9点），在此之后不再处理紧绷事务，进入保护模式。',
        '向外界求助：如果学业或工作要求确实远超个人承载极限，勇敢向导师、主管或家人沟通真实的困境。',
      ],
      disclaimer:
        '本探索为项目自编的轻量反思工具，旨在帮助觉察生活节奏状态，不作能力评定。',
      shareSummary: `生活节奏评估为「${levelName}」，观察小结：${summary}`,
    }
  },
}

// ==========================================
// 5. 对自己柔不柔 (Self-Kindness)
// ==========================================
const selfKindnessTopic: AssessmentTopic = {
  id: 'self-kindness',
  category: 'exploration',
  title: '对自己柔不柔',
  subtitle: '没做好的时候，你会怎么对自己。',
  badge: '自我关怀',
  color: '#819288',
  accentColor: '#596e62',
  description: '觉察内在对话的温度，观察面对过失、休息、局限时的宽容与慈悲。',
  purpose: '帮助你识别内心严苛的审判官，学着用对待最好朋友的方式，温柔拥抱自己。',
  targetAudience: '常常内耗自责、完美主义倾向、很难原谅自己犯错的朋友',
  chartType: 'radar',
  dimensions: [
    { key: 'forgiveness', name: '宽容度' },
    { key: 'restGuilt', name: '坦然休息' },
    { key: 'acceptance', name: '接纳局限' },
    { key: 'empathy', name: '情绪体谅' },
    { key: 'affirmation', name: '自我肯定' },
  ],
  disclaimer:
    '【自编轻量探索】我们经常能对身边的朋友无比宽容，却对自己格外苛刻。本自评用于照见内在声音的温度。',
  questions: [
    {
      id: 'sk-1',
      prompt: '当事情没做好或遭遇过失时，你脑海里的第一道声音常常是？',
      options: [
        { label: '“没关系的，我已经尽力了，吸取教训慢慢来”', score: 3 },
        { label: '“有些遗憾，下次要多加注意”', score: 2 },
        { label: '“为什么总是做不好，我怎么这么没用”', score: 1 },
        { label: '严苛自责，陷入深沉的羞耻感与沮丧中', score: 0 },
      ],
    },
    {
      id: 'sk-2',
      prompt: '当你停下手中的事情纯粹休息放空时，心里会怎么想？',
      options: [
        { label: '安心享受休息，知道休息是身心天然的权利', score: 3 },
        { label: '稍微有一点不习惯，但能说服自己放松', score: 2 },
        { label: '心里常升起强烈的罪恶感，觉得“在偷懒就是落后”', score: 1 },
        { label: '完全无法忍受自己停滞，必须随时逼自己处于产出状态', score: 0 },
      ],
    },
    {
      id: 'sk-3',
      prompt: '面对自己的缺点、身体局限或不完美之处，你的态度？',
      options: [
        { label: '理解每个人都由优点和局限组成，温和接纳真实的自己', score: 3 },
        { label: '努力学着去接纳，偶尔还是会暗暗比较介意', score: 2 },
        { label: '很难原谅自己的短板，总是放大缺点反复苛求', score: 1 },
        { label: '极度厌弃不完美的自己，对自己充满挑剔与不满', score: 0 },
      ],
    },
    {
      id: 'sk-4',
      prompt: '当感到难过、失落或委屈等低落情绪时，你怎样对待它们？',
      options: [
        { label: '允许自己难过，给自己倒杯温水，轻轻抱抱自己', score: 3 },
        { label: '找个安静的地方默默消化，给情绪一点时间', score: 2 },
        { label: '强迫自己“快点振作起来，别矫情了”', score: 1 },
        { label: '极力压抑甚至厌恶自己的脆弱，装作毫不在乎', score: 0 },
      ],
    },
    {
      id: 'sk-5',
      prompt: '当你取得了一点小进步，或者完成了一件日常小事时？',
      options: [
        { label: '会由衷为自己感到高兴，甚至给自己一个小奖励', score: 3 },
        { label: '略微感到一点欣慰，然后平静地继续走', score: 2 },
        { label: '觉得这只是理所应当的小事，根本不值一提', score: 1 },
        { label: '马上把注意力盯向下一个没做好的地方，从不肯定自己', score: 0 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 15

    const q1 = answers[0] ?? 2 // 宽容
    const q2 = answers[1] ?? 2 // 休息内疚
    const q3 = answers[2] ?? 2 // 接纳局限
    const q4 = answers[3] ?? 2 // 情绪体谅
    const q5 = answers[4] ?? 2 // 自我肯定

    const forgVal = Math.round((q1 / 3) * 75 + 25)
    const restVal = Math.round((q2 / 3) * 75 + 25)
    const accVal = Math.round((q3 / 3) * 75 + 25)
    const empVal = Math.round((q4 / 3) * 75 + 25)
    const affVal = Math.round((q5 / 3) * 75 + 25)

    const radarDimensions: RadarDimension[] = [
      { name: '自我宽容', value: forgVal },
      { name: '坦然休息', value: restVal },
      { name: '接纳局限', value: accVal },
      { name: '情绪体谅', value: empVal },
      { name: '肯定自我', value: affVal },
    ]

    let levelName = '自我慈悲 · 温暖包容'
    let levelColor = '#5e9d68'
    let summary = '你懂得用柔软、慈悲的心态拥抱自己的顺境与逆境，内在住着一位温柔的守护者。'

    if (totalScore >= 12) {
      levelName = '温柔守护 · 深度自洽'
      levelColor = '#5e9d68'
      summary = '你对自己的心怀有极宝贵的柔和与敬意，懂得允许失误，懂得在疲倦时拉自己的手。'
    } else if (totalScore >= 8) {
      levelName = '偶有严苛 · 正在学习'
      levelColor = '#7aa87e'
      summary = '你在理智上知道应当爱自己，但在遭遇挫折时，脑海里偶尔还是会冒出严苛自责的声音。'
    } else if (totalScore >= 4) {
      levelName = '严苛审判 · 易陷内耗'
      levelColor = '#c5a85e'
      summary = '你对自己的要求极高，常常以最挑剔的眼光审视自己的每一个瑕疵。你太累了，请先对自己心软一点。'
    } else {
      levelName = '过度苛责 · 急需善待'
      levelColor = '#b57e62'
      summary = '内心那个严厉的教官几乎剥夺了你所有喘息与犯错的权利。请记住：你不需要十全十美才配被爱。'
    }

    return {
      topicId: 'self-kindness',
      topicTitle: '对自己柔不柔',
      category: 'exploration',
      score: totalScore,
      maxScore,
      levelName,
      levelColor,
      summary,
      radarDimensions,
      detailedPoints: [
        {
          title: '面对失误与挫折的宽容度',
          text:
            forgVal >= 60
              ? '你能把过失视作人生学习的一部分，不会轻易将事情上升为对自我人格的否定。'
              : '一遇到没做好的事就容易自我攻击。试着问问自己：“如果这是我最好的朋友犯的错，我会这样骂TA吗？”',
        },
        {
          title: '休息时的心理安全感',
          text:
            restVal >= 60
              ? '你能坦然安歇，明白休息不是偷懒，而是生命必不可少的润滑。'
              : '只要一停下来就觉得内疚，这是将自我价值等同于生产力的表现。你的存在本身就已经足够有价值。',
        },
        {
          title: '脆弱情绪的容纳度',
          text:
            empVal >= 60
              ? '你允许眼泪和低落的存在，这种接纳反而能让情绪流动更快平复。'
              : '你经常压抑哭泣或难过的本能。试着把手掌轻轻覆在心口上，感受自己真实的温度。',
        },
      ],
      careAdvice: [
        '“最好的朋友”替换法：每当脑海里出现苛责声音时，把这句话换成对最在乎的朋友说的话。',
        '写下3件今天做得还不错的小事：哪怕只是“今天按时吃了一顿早餐”、“今天看了蓝天”，也值得记下一笔。',
        '给自己一个深长的双臂环抱，闭上眼睛对自己轻轻说一句：“今天辛苦了，你已经尽力了。”',
      ],
      disclaimer:
        '本探索为项目自编的轻量反思工具，旨在帮助觉察自我关怀程度，不作性格或心理定论。',
      shareSummary: `自我关怀评估为「${levelName}」，观察小结：${summary}`,
    }
  },
}

// ==========================================
// 6. PHQ-9 患者健康问卷 (抑郁症状筛查)
// 标准化量表：公开发布中文版常模及正式计分规则
// ==========================================
const phq9Topic: AssessmentTopic = {
  id: 'phq-9',
  category: 'scale',
  title: 'PHQ-9 抑郁症状筛查量表',
  subtitle: '标准化患者健康问卷 · 评估过去两周身心状态',
  badge: '标准化筛查',
  color: '#4f7a8b',
  accentColor: '#366070',
  description: '国际通用的抑郁症状自我筛查量表，采用9项经典身心困扰自评。',
  purpose: '帮助你科学、客观地观察过去两周内心境低落、兴趣减退及生理疲惫的程度。',
  targetAudience: '12岁及以上、想要系统了解自身近期情绪困扰程度的群体',
  chartType: 'bar',
  dimensions: [
    { key: 'core', name: '核心情绪 (心境/兴趣)' },
    { key: 'somatic', name: '躯体表征 (睡眠/精力/食欲)' },
    { key: 'cognitive', name: '认知状态 (自评/专注/速度)' },
  ],
  disclaimer:
    '【权威量表免责声明】PHQ-9为标准化自评初步筛查工具，其测评得分仅用于个人健康监测与临床就医参考，绝不可替代专业精神科医师或心理咨询师的临床诊断。',
  questions: [
    {
      id: 'phq-1',
      prompt: '做事时提不起劲，或几乎没有任何兴趣？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-2',
      prompt: '感到心情低落、沮丧，甚至觉得生活没有指望？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-3',
      prompt: '入睡困难、睡不安稳，或者睡眠过多？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-4',
      prompt: '感到疲倦、疲劳，或者总是没有力气？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-5',
      prompt: '食欲不振，或者暴饮暴食吃得过多？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-6',
      prompt: '觉得自己很糟糕、很失败，或者觉得自己让家人失望了？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-7',
      prompt: '对事情难以集中注意力，例如阅读报纸或看电视时？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-8',
      prompt: '动作或说话速度缓慢到别人已经察觉，或者正好相反，烦躁不安难以静坐？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'phq-9-q',
      prompt: '冒出伤害自己、或者觉得不如死了算了的念头？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 27
    const q9Score = answers[8] ?? 0

    // PHQ-9 standard clinical scoring bands
    let levelName = '无或极轻微倾向'
    let levelColor = '#5e9d68'
    let summary = '过去两周内未见明显的抑郁症状困扰，身心整体处于健康稳定的正常区间。'

    if (totalScore <= 4) {
      levelName = '无或极轻微 (0-4分)'
      levelColor = '#5e9d68'
      summary = '测评得分在正常基线范围内，身心调节功能良好，未见显著抑郁相关症状。'
    } else if (totalScore <= 9) {
      levelName = '轻度抑郁倾向 (5-9分)'
      levelColor = '#7aa87e'
      summary = '存在一些轻度情绪低落或疲劳体验，建议通过适度运动、生活节奏调节与倾诉自我缓解。'
    } else if (totalScore <= 14) {
      levelName = '中度抑郁倾向 (10-14分)'
      levelColor = '#c5a85e'
      summary = '情绪低落、睡眠或动力受损程度较为显著，建议寻求专业心理咨询师的陪伴与进一步评估。'
    } else if (totalScore <= 19) {
      levelName = '中重度抑郁倾向 (15-19分)'
      levelColor = '#b57e62'
      summary = '情绪与躯体症状已对日常工作生活造成明显干扰，强烈建议前往正规精神卫生专科门诊就诊。'
    } else {
      levelName = '重度抑郁倾向 (20-27分)'
      levelColor = '#b3594b'
      summary = '各项症状严重且持续，请务必尽快在家属或亲友陪同下前往正规医疗机构就诊与干预。'
    }

    const coreScore = (answers[0] ?? 0) + (answers[1] ?? 0) // Max 6
    const somaticScore = (answers[2] ?? 0) + (answers[3] ?? 0) + (answers[4] ?? 0) // Max 9
    const cogScore = (answers[5] ?? 0) + (answers[6] ?? 0) + (answers[7] ?? 0) + (answers[8] ?? 0) // Max 12

    const barDimensions: BarDimension[] = [
      {
        name: '核心心境与兴趣',
        score: coreScore,
        maxScore: 6,
        level: coreScore >= 3 ? '明显困扰' : '轻微/正常',
      },
      {
        name: '躯体症状 (睡眠/精力/食欲)',
        score: somaticScore,
        maxScore: 9,
        level: somaticScore >= 5 ? '较重负荷' : '轻微/平稳',
      },
      {
        name: '认知与自评状态',
        score: cogScore,
        maxScore: 12,
        level: cogScore >= 6 ? '显著负面' : '基本良好',
      },
    ]

    const detailedPoints = [
      {
        title: '总分与分级解读',
        text: `本次 PHQ-9 测评得分为 ${totalScore} 分（总分 27 分），属于「${levelName}」。`,
      },
      {
        title: '核心症状观察',
        text:
          coreScore >= 3
            ? '近期心境低落或动力缺乏感受较为突出，请对自己多一些耐心与照顾，避免勉强。'
            : '核心心境尚可保持基本稳定，若有疲劳多与阶段性工作或生活压力有关。',
      },
    ]

    if (q9Score > 0) {
      detailedPoints.unshift({
        title: '⚠️ 重要安全支持关怀',
        text: '您在第9项中提到了消极或自伤念头。请不要独自承受这份痛苦，立即告诉值得信赖的亲友，或拨打全国免费心理危机干预热线：400-161-9995（24小时在线）寻求专业帮助。',
      })
    }

    const careAdvice = [
      '保持规律的作息微习惯：尽量在固定时间起床并到阳光下站立5分钟，辅助校准生物钟。',
      '将待办任务降级为“维持基本运转即可”，暂时放下过高期望，给自己放个情绪假。',
      '若总分达到 10 分或以上，且症状已持续超过2周，请主动前往正规综合医院心理科或精神专科医院进行系统评估。',
    ]

    return {
      topicId: 'phq-9',
      topicTitle: 'PHQ-9 抑郁症状筛查量表',
      category: 'scale',
      score: totalScore,
      maxScore,
      levelName,
      levelColor,
      summary,
      barDimensions,
      detailedPoints,
      careAdvice,
      disclaimer:
        '本量表结果仅供初步筛查参考，非临床诊断依据。若有持续困扰，请寻求专业精神卫生医疗机构诊治。',
      shareSummary: `PHQ-9筛查得分为 ${totalScore}分（${levelName}），小结：${summary}`,
    }
  },
}

// ==========================================
// 7. GAD-7 广泛性焦虑自评量表
// 标准化量表：公开发布中文版常模及正式计分规则
// ==========================================
const gad7Topic: AssessmentTopic = {
  id: 'gad-7',
  category: 'scale',
  title: 'GAD-7 广泛性焦虑症状量表',
  subtitle: '标准化广泛性焦虑自评 · 评估过去两周紧绷与担忧',
  badge: '标准化筛查',
  color: '#657e8d',
  accentColor: '#476372',
  description: '国际通用的焦虑症状筛查量表，7项简明评估近两周的紧张不安程度。',
  purpose: '帮助你辨识内心的急迫感与不可控担忧，觉察神经系统的紧绷负荷。',
  targetAudience: '感到容易神经紧绷、烦躁、失控担忧或伴有躯体紧张的朋友',
  chartType: 'bar',
  dimensions: [
    { key: 'tension', name: '神经紧张与急迫感' },
    { key: 'worry', name: '不可控担忧' },
    { key: 'restless', name: '躯体烦躁与恐惧' },
  ],
  disclaimer:
    '【权威量表免责声明】GAD-7为标准化初步筛查工具，评分仅供自我观察与就诊咨询参考，不能代替专业医师的诊断。',
  questions: [
    {
      id: 'gad-1',
      prompt: '感觉紧张、焦虑，或者急迫不安？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'gad-2',
      prompt: '不能停止担忧，或者无法控制自己的担忧？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'gad-3',
      prompt: '对各种各样不同的事情担忧过多？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'gad-4',
      prompt: '很难放松下来，身体或神经总像紧绷着？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'gad-5',
      prompt: '极度烦躁不安，甚至难以安静坐着？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'gad-6',
      prompt: '容易变得心烦意乱或易怒？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
    {
      id: 'gad-7-q',
      prompt: '感到似乎将有可怕的事情发生而感到害怕？',
      options: [
        { label: '完全没有', score: 0 },
        { label: '有几天', score: 1 },
        { label: '一半以上天数', score: 2 },
        { label: '几乎每天', score: 3 },
      ],
    },
  ],
  evaluate: (answers: number[]): AssessmentEvaluation => {
    const totalScore = answers.reduce((a, b) => a + b, 0)
    const maxScore = 21

    let levelName = '无明显焦虑 (0-4分)'
    let levelColor = '#5e9d68'
    let summary = '过去两周内未见显著的广泛焦虑困扰，神经系统兴奋与抑制处于平衡态。'

    if (totalScore <= 4) {
      levelName = '无明显焦虑 (0-4分)'
      levelColor = '#5e9d68'
      summary = '情绪处于相对放松平稳状态，偶有紧张属于日常正常生理应激。'
    } else if (totalScore <= 9) {
      levelName = '轻度焦虑倾向 (5-9分)'
      levelColor = '#7aa87e'
      summary = '存在一些轻度焦虑和紧绷体验，可通过呼吸引导、正念与减少咖啡因摄入来进行自我调适。'
    } else if (totalScore <= 14) {
      levelName = '中度焦虑倾向 (10-14分)'
      levelColor = '#c5a85e'
      summary = '过度担忧和身体紧绷程度较为明显，建议寻求心理咨询师进行系统支持。'
    } else {
      levelName = '重度焦虑倾向 (15-21分)'
      levelColor = '#b3594b'
      summary = '焦虑程度较高，可能伴随心慌、坐立不安等明显躯体反应，强烈建议前往专业医疗机构寻求诊治。'
    }

    const worryScore = (answers[1] ?? 0) + (answers[2] ?? 0) // Max 6
    const tensionScore = (answers[0] ?? 0) + (answers[3] ?? 0) // Max 6
    const restlessScore = (answers[4] ?? 0) + (answers[5] ?? 0) + (answers[6] ?? 0) // Max 9

    const barDimensions: BarDimension[] = [
      {
        name: '失控担忧 (控制感/泛化担忧)',
        score: worryScore,
        maxScore: 6,
        level: worryScore >= 3 ? '较多担忧' : '可控/轻微',
      },
      {
        name: '神经紧绷 (放松困难/急迫)',
        score: tensionScore,
        maxScore: 6,
        level: tensionScore >= 3 ? '明显紧张' : '基本松弛',
      },
      {
        name: '烦躁与恐惧预感',
        score: restlessScore,
        maxScore: 9,
        level: restlessScore >= 5 ? '较重烦躁' : '情绪平稳',
      },
    ]

    const detailedPoints = [
      {
        title: '总分与分级说明',
        text: `本次 GAD-7 测评得分为 ${totalScore} 分（总分 21 分），评估结果为「${levelName}」。`,
      },
      {
        title: '焦虑认知机制提醒',
        text:
          worryScore >= 3
            ? '担忧是大脑在尝试用“提前预警”来保护你，但大脑可能把危险信号放得太大了。学着对担忧想法说一声：“我看到你了，现在我很安全”。'
            : '担忧基本处于可自洽掌控的范围内，未见广泛蔓延倾向。',
      },
    ]

    const careAdvice = [
      '尝试“生理性叹气”（Physiological Sigh）：深吸两口气后慢慢长长吐气，重复3-5次，直接激活副交感神经。',
      '担忧写下法：将脑中盘旋的事情写在纸上，标记出“我能控制的”与“我无法控制的”，只对前者做最小行动。',
      '减少浓茶、咖啡及高糖高刺激饮料摄入，给予神经系统温润休息。',
    ]

    return {
      topicId: 'gad-7',
      topicTitle: 'GAD-7 广泛性焦虑症状量表',
      category: 'scale',
      score: totalScore,
      maxScore,
      levelName,
      levelColor,
      summary,
      barDimensions,
      detailedPoints,
      careAdvice,
      disclaimer:
        '本量表结果仅供初步筛查参考，非临床诊断依据。若有持续严重焦虑，建议寻求专业医疗机构就诊。',
      shareSummary: `GAD-7筛查得分为 ${totalScore}分（${levelName}），小结：${summary}`,
    }
  },
}

// 汇总所有主题
export const ASSESSMENT_TOPICS: AssessmentTopic[] = [
  innerWeatherTopic,
  socialRelationsTopic,
  bodySignalsTopic,
  dailyPaceTopic,
  selfKindnessTopic,
  phq9Topic,
  gad7Topic,
]

export const EXPLORATION_TOPICS = ASSESSMENT_TOPICS.filter((t) => t.category === 'exploration')
export const SCALE_TOPICS = ASSESSMENT_TOPICS.filter((t) => t.category === 'scale')

export function getTopicById(id: string): AssessmentTopic | undefined {
  return ASSESSMENT_TOPICS.find((t) => t.id === id)
}
