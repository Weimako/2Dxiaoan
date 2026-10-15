export type ScriptCategory = '人际关系' | '沟通表达' | '学习与成长'

export interface ScriptOptionReaction {
  dialogue: string
  atmosphere: string
}

export interface ScriptOption {
  id: string
  badge: string
  text: string
  style?: 'gentle' | 'pleasing' | 'direct' | 'courage'
  reaction: ScriptOptionReaction
  nextStepId?: string
  outcomeId?: string
}

export interface ScriptStep {
  stepId: string
  stepTitle?: string
  speaker: string
  speakerAvatarText: string
  speakerRole: string
  prompt: string
  options: ScriptOption[]
}

export interface ScriptGentleExample {
  scenario: string
  suggestedWords: string
  rationale: string
}

export interface ScriptOutcome {
  id: string
  title: string
  badgeLabel: string
  badgeColor: 'green' | 'amber' | 'blue' | 'purple'
  storyEnding: string
  discoveryTitle: string
  impactAnalysis: string
  gentleExample: ScriptGentleExample
}

export interface ScriptItem {
  id: string
  title: string
  category: ScriptCategory
  sub: string
  duration: string
  character: string
  characterRole: string
  scene: string
  tags: string[]
  illustrationKey:
    | 'tiredFriend'
    | 'wordsHurt'
    | 'groupVoice'
    | 'selfCritic'
    | 'comfortFriend'
    | 'declineParty'
  initialStepId: string
  steps: Record<string, ScriptStep>
  outcomes: Record<string, ScriptOutcome>
}

export const scriptCategories: ('全部' | ScriptCategory)[] = [
  '全部',
  '人际关系',
  '沟通表达',
  '学习与成长',
]

export const scriptCatalog: ScriptItem[] = [
  // 1. 朋友临时提出请求，但你今天很疲惫
  {
    id: 'script-tired-friend',
    title: '朋友临时提出请求，但你今天很疲惫',
    category: '人际关系',
    sub: '面对突如其来的聚会邀约，练习在关照他人与守护自我电量间找到平衡。',
    duration: '3 分钟体验',
    character: '好友 佳佳',
    characterRole: '高中至今的好朋友',
    scene:
      '周五傍晚，你刚结束了一周高强度的学习与工作，身心处于极度电量不足的状态，正准备换上舒服的睡衣早点休息。此时手机突然弹出佳佳的消息：“今晚我们常去的那家烤肉店周年庆，小雨他们都在！快收拾一下过来，就差你一个人啦！”',
    tags: ['身体电量', '守护边界', '真诚拒绝'],
    illustrationKey: 'tiredFriend',
    initialStepId: 'step-1',
    steps: {
      'step-1': {
        stepId: 'step-1',
        speaker: '佳佳',
        speakerAvatarText: '佳',
        speakerRole: '好友',
        prompt:
          '“快来嘛！今天超难得大家都在，位置我都占好啦，少你一个怎么行呀！”',
        options: [
          {
            id: 'opt-1-assertive',
            badge: '🌱 温和表达边界',
            text: '“佳佳，听起来好棒！不过我这一周实在太累了，今天特别需要早点睡充电。你们好好吃好好玩，下次我单独请你喝奶茶补上~”',
            reaction: {
              dialogue:
                '“哎呀这样呀，听你语音确实蛮疲惫的！那身体最要紧，赶紧泡个脚早点睡，下周我们再约奶茶！”',
              atmosphere:
                '佳佳语气虽有些小遗憾，但充满体贴与理解，没有任何责怪。你感到紧绷的神经放松了下来。',
            },
            nextStepId: 'step-2-care',
          },
          {
            id: 'opt-1-pleasing',
            badge: '🍂 勉强顺从妥协',
            text: '“啊……其实我今天头有点晕挺想睡的，但既然大家都去了，那我还是硬撑着过来坐一会儿吧……”',
            reaction: {
              dialogue: '“哇太讲义气了！那我等你哦，快点来，少喝点酒就行！”',
              atmosphere:
                '佳佳以为你只是随口客套，欣然催促。你心里沉甸甸的，不得不拖着沉重的身体翻找出门衣服。',
            },
            nextStepId: 'step-2-exhaust',
          },
        ],
      },
      'step-2-care': {
        stepId: 'step-2-care',
        speaker: '佳佳',
        speakerAvatarText: '佳',
        speakerRole: '好友',
        prompt:
          '“对了，那你今晚有晚饭吃吗？要不要我给你点一份清淡的热粥外卖送过去呀，你在家也要吃点东西再睡。”',
        options: [
          {
            id: 'opt-2-accept',
            badge: '🤍 欣然接纳好意',
            text: '“哇太暖心了，谢谢佳佳！正好冰箱空空的，那我就安心享用你的投喂啦，爱你~”',
            reaction: {
              dialogue: '“小事一桩！热粥在路上了，你安心休息哈，明早见！”',
              atmosphere:
                '屏幕两端流淌着真诚而轻松的暖意，彼此都没有人情压力与愧疚感。',
            },
            outcomeId: 'outcome-boundary-healthy',
          },
          {
            id: 'opt-2-independent',
            badge: '🌿 感谢并温和自理',
            text: '“不用麻烦啦，我煮个热汤面很快的。你专心跟他们吃烤肉，别总挂念我啦，玩得开心！”',
            reaction: {
              dialogue: '“好嘞，那我们拍照发群里给你看好吃的，你早点睡！”',
              atmosphere:
                '双方边界清晰而自在，你卸下了一整天的防御，安心准备自己的晚餐。',
            },
            outcomeId: 'outcome-boundary-healthy',
          },
        ],
      },
      'step-2-exhaust': {
        stepId: 'step-2-exhaust',
        speaker: '佳佳',
        speakerAvatarText: '佳',
        speakerRole: '好友',
        prompt:
          '（聚餐现场喧闹嘈杂，朋友们都在大笑碰杯，佳佳突然注意到你的脸色很苍白）“你怎么看起来这么憔悴，话也不说，是不是生谁的气呀？”',
        options: [
          {
            id: 'opt-2-hide',
            badge: '🍂 掩饰委屈继续硬撑',
            text: '“没有没有……就是今天有点累，大家继续聊，不用管我……”',
            reaction: {
              dialogue: '“好吧……那你多吃点菜……”，佳佳有些不知所措地转头继续聊天。',
              atmosphere:
                '周围的气氛变得有些微妙尴尬，大家不知道该怎么照顾你的情绪，而你如坐针毡。',
            },
            outcomeId: 'outcome-over-pleasing',
          },
          {
            id: 'opt-2-stop-loss',
            badge: '🌱 及时止损坦白离开',
            text: '“佳佳抱歉，我今天身体实在吃不消，强撑过来发现头疼得厉害，我得先提前打车回家休息了，真不好意思扫了大家的兴。”',
            reaction: {
              dialogue:
                '“天哪你早说呀！快别撑着了，我送你到路口打车，到家了一定给我报平安！”',
              atmosphere:
                '佳佳立刻流露出关心。虽然中途离开有些波折，但你终于诚实照顾了自己。',
            },
            outcomeId: 'outcome-stop-loss',
          },
        ],
      },
    },
    outcomes: {
      'outcome-boundary-healthy': {
        id: 'outcome-boundary-healthy',
        title: '温和设立边界：赢得尊重与真挚休息',
        badgeLabel: '🌟 舒适关系 · 零内耗',
        badgeColor: 'green',
        storyEnding:
          '你换上舒服的睡衣，喝了一杯温水，在安静的夜晚睡了一个好觉。佳佳不仅没有生气，反而更懂得了你的生活节奏。',
        discoveryTitle: '边界不是关系的终点，而是安全感的起点',
        impactAnalysis:
          '很多时候我们害怕拒绝，是担心“拒绝一次请求等于拒绝整段关系”。但心理学研究表明：清晰、温和且带有替代提议的拒绝，不仅不会破坏友谊，反而会向对方传递出“我在真实地与你交往”的安全信号。',
        gentleExample: {
          scenario: '朋友突然邀约而自己身心耗竭时',
          suggestedWords:
            '“听起来很棒，谢谢你想到我！不过我今天电量见底了，特别需要早点休息。你们玩得开心，下次我请你喝茶补上~”',
          rationale:
            '肯定对方好意 + 陈述身体客观事实 + 给出未来替代方案，既有温度又有底线。',
        },
      },
      'outcome-over-pleasing': {
        id: 'outcome-over-pleasing',
        title: '勉强妥协：身心透支与隐性内耗',
        badgeLabel: '🍂 能量耗竭 · 委屈积压',
        badgeColor: 'amber',
        storyEnding:
          '那天晚上你回到家已经是午夜，头痛欲裂，躺在床上甚至对佳佳产生了一丝委屈的怨气：“我明明很累，她为什么还要叫我……”',
        discoveryTitle: '委曲求全往往换来双向尴尬',
        impactAnalysis:
          '当我们出于恐惧而硬撑着去迎合他人时，我们的身体语言和微表情会不自觉流露出抗拒。对方能潜意识感受到这种不舒服，从而产生困惑或负罪感。最耗竭的是，我们可能会把自己的“不敢拒绝”迁怒于他人的“不知体谅”。',
        gentleExample: {
          scenario: '感到不想去但害怕对方失望时',
          suggestedWords:
            '在按下回复键前暂停3秒深呼吸，问问自己：“如果我现在去了，明天我能快乐吗？”如果不可以，勇敢告诉对方真实的身体电量。',
          rationale:
            '把注意力从“对方会不会失望”拉回“我当下的真实承载力”。',
        },
      },
      'outcome-stop-loss': {
        id: 'outcome-stop-loss',
        title: '及时止损：虽有波折，但勇敢找回了自己',
        badgeLabel: '💫 勇敢觉察 · 止损边界',
        badgeColor: 'blue',
        storyEnding:
          '虽然中途离席有些波折，但坐上出租车的那一刻，你长长地舒了一口气。你发现：坦诚说出自己的局限，世界并没有塌下来。',
        discoveryTitle: '任何时刻按下暂停键，都不算太晚',
        impactAnalysis:
          '很多人即使中途已经极为不适，也往往因为沉没成本选择硬撑到底。学会在感到极限时坦率承认“我尝试了，但身体确实到了极限”，展现了对自己生命的真实敬意。',
        gentleExample: {
          scenario: '已经答应赴约但中途极其不适时',
          suggestedWords:
            '“朋友们真的很抱歉，我原本以为自己能挺住，但身体实在在拉警报了。我先撤回去休息，今天真的辛苦大家，下次再聚！”',
          rationale:
            '不找虚假借口，坦荡表达对身体警报的尊重，成熟大方。',
        },
      },
    },
  },

  // 2. 同学无意间说了一句让你不舒服的话
  {
    id: 'script-words-hurt',
    title: '同学无意间说了一句让你不舒服的话',
    category: '沟通表达',
    sub: '面对带刺的调侃或无心之失，如何温和而清晰地捍卫自尊。',
    duration: '3 分钟体验',
    character: '同学 林浩',
    characterRole: '平时爱开玩笑的同桌',
    scene:
      '午休自习课上，大家都在解一道数学大题。你花了一些时间认真推导细节，同桌林浩突然转着笔大声笑：“你怎么做题每次都这么慢啊，跟个树懒似的！等你想明白黄花菜都凉啦！”周围有几个同学跟着笑了两声。',
    tags: ['非暴力沟通', '设立底线', '自我尊重'],
    illustrationKey: 'wordsHurt',
    initialStepId: 'step-1',
    steps: {
      'step-1': {
        stepId: 'step-1',
        speaker: '林浩',
        speakerAvatarText: '浩',
        speakerRole: '同桌',
        prompt:
          '“哈哈看我干嘛，树懒同学，赶紧写呀，不然真交不上啦！”',
        options: [
          {
            id: 'opt-1-assertive',
            badge: '🌱 温和清晰划定底线',
            text: '“林浩，我知道你可能只是开玩笑，但当着大家这么说，我心里挺不舒服的。我习惯一步步想扎实，希望你以后别再用树懒开玩笑了。”',
            reaction: {
              dialogue:
                '“呃……我真没别的意思，不好意思啊，我刚才嘴碎了，你别往心里去！”',
              atmosphere:
                '林浩收起了嬉皮笑脸，神情有些尴尬，周围的笑声也停了。大家都意识到这种玩笑确实越界了。',
            },
            nextStepId: 'step-2-after-class',
          },
          {
            id: 'opt-1-swallow',
            badge: '🍂 强颜欢笑默默忍耐',
            text: '“哈哈……是吧，我确实比较慢……”（低下头，紧紧握着笔，脸颊发烫，一整节课心神不宁）',
            reaction: {
              dialogue: '“哈哈没事，多练练就好了！树懒也挺萌的！”',
              atmosphere:
                '林浩觉得这个玩笑很成功，继续自得其乐。你的胸口堵得慌，解题思路全乱了。',
            },
            nextStepId: 'step-2-repeat-joke',
          },
          {
            id: 'opt-1-aggressive',
            badge: '⚡ 激烈反唇相讥',
            text: '“你算什么东西啊？你自己卷子漏洞百出还好意思嘲笑别人，真讨人嫌！”',
            reaction: {
              dialogue:
                '“吃枪药啦？开个玩笑至于这么上纲上线吗！真开不起玩笑！”，林浩也恼羞成怒。',
              atmosphere:
                '自习室气氛瞬间降到冰点，班长过来维持纪律，两人当场陷入僵持。',
            },
            outcomeId: 'outcome-aggressive-clash',
          },
        ],
      },
      'step-2-after-class': {
        stepId: 'step-2-after-class',
        speaker: '林浩',
        speakerAvatarText: '浩',
        speakerRole: '同桌',
        prompt:
          '（下课后，林浩递过来一块零食）“刚才真对不起啊，我平时说话不过脑子，你没真生我气吧？”',
        options: [
          {
            id: 'opt-2-firm-kind',
            badge: '🌱 接受道歉并重申尊重',
            text: '“零食我收下了，说开了就没事。大家解题节奏不同，以后互相尊重就好。”',
            reaction: {
              dialogue: '“好嘞！以后我保证注意分寸，绝不瞎起外号！”',
              atmosphere:
                '误会彻底消除，两人之间建立起了健康的相互尊重，林浩再也没有乱开玩笑。',
            },
            outcomeId: 'outcome-words-hurt-healthy',
          },
          {
            id: 'opt-2-focus-topic',
            badge: '💬 就事论事交流解题',
            text: '“没事，这道题我刚才想通第二种解法了，你要不要看看另一种思路？”',
            reaction: {
              dialogue: '“哇真的吗？快教教我，刚才那步我确实卡壳了！”',
              atmosphere:
                '话题自然回到学业交流，尴尬完全化解为良性探讨。',
            },
            outcomeId: 'outcome-words-hurt-healthy',
          },
        ],
      },
      'step-2-repeat-joke': {
        stepId: 'step-2-repeat-joke',
        speaker: '林浩',
        speakerAvatarText: '浩',
        speakerRole: '同桌',
        prompt:
          '（放学整理书包时，林浩又拍你的肩）“嘿树懒同学，今天走这么早啊？”',
        options: [
          {
            id: 'opt-2-speak-now',
            badge: '🌱 及时澄清：不再忍耐',
            text: '“林浩，其实中午你这么叫我时我难受了一下午。请不要再叫我树懒了，这真的不尊重人。”',
            reaction: {
              dialogue: '“啊……我以为你不在意呢……对不起对不起，我以后绝对不叫了！”',
              atmosphere:
                '虽然延迟了半天，但你终于把真实的感受说了出来，心里的大石头落地了。',
            },
            outcomeId: 'outcome-words-hurt-delayed',
          },
          {
            id: 'opt-2-keep-silent',
            badge: '🍂 再次沉默回避',
            text: '“……嗯，我先走了。”（默默加快脚步离开，心里满是委屈）',
            reaction: {
              dialogue: '“拜拜~明天见！”，林浩挥挥手走掉。',
              atmosphere:
                '林浩毫无觉察，而你的委屈在回家的路上不断发酵成内耗。',
            },
            outcomeId: 'outcome-words-hurt-silence',
          },
        ],
      },
    },
    outcomes: {
      'outcome-words-hurt-healthy': {
        id: 'outcome-words-hurt-healthy',
        title: '清晰界定感受：自尊是自己给的底线',
        badgeLabel: '🌿 清晰表达 · 赢得尊重',
        badgeColor: 'green',
        storyEnding:
          '你不仅成功终止了不当的玩笑，而且让林浩意识到了你的底线。在接下来的相处中，他明显变得更加尊重你的节奏。',
        discoveryTitle: '不带敌意的坚决，最具力量',
        impactAnalysis:
          '很多“无心玩笑”之所以演变成习惯性言语冒犯，是因为被调侃者第一时间用微笑表达了“默许”。心理学中的“非暴力沟通”告诉我们：用“陈述事实（当你说...时）+ 表达感受（我感到不舒服）+ 提出请求（请不要再这样说）”，能在不激化矛盾的前提下最快立规矩。',
        gentleExample: {
          scenario: '面对让你不舒服的言语调侃时',
          suggestedWords:
            '“可能你只是想开个玩笑，但这么说我真的会感到不被尊重。我不喜欢这个称呼，请不要再这么叫我了。”',
          rationale:
            '区分“对方的动机（或许无心）”与“客观的影响（我的不适）”，有理有节。',
        },
      },
      'outcome-words-hurt-silence': {
        id: 'outcome-words-hurt-silence',
        title: '隐忍妥协：压抑的心灵容易长出暗疮',
        badgeLabel: '🍂 委屈积郁 · 自我怀疑',
        badgeColor: 'amber',
        storyEnding:
          '那天晚上做作业时，林浩嘲笑的嘴脸和周围人的笑声一直在你脑子里盘旋。你甚至开始怀疑自己：“我是不是真的太笨太慢了……”',
        discoveryTitle: '沉默常被误读为允许',
        impactAnalysis:
          '当我们选择用微笑掩饰委屈时，对方的大脑会接收到“这个行为被允许”的正反馈。日积月累，小调侃会升级为长期的言语轻慢。更可怕的是，这种内耗会逐渐侵蚀我们对自己的客观评价。',
        gentleExample: {
          scenario: '感到委屈却不敢当场反驳时',
          suggestedWords:
            '在心里对自己默念：“我的感受是真实的，我完全有权利保护自己。”哪怕声音有点发抖，也要把那句“我不喜欢这样”说出来。',
          rationale:
            '保护自己的勇气不需要等到完全不害怕时才去行动。',
        },
      },
      'outcome-aggressive-clash': {
        id: 'outcome-aggressive-clash',
        title: '情绪反弹：攻击性表达往往转移了焦点',
        badgeLabel: '⚡ 冲突激化 · 失去焦点',
        badgeColor: 'purple',
        storyEnding:
          '两个人在教室里大吵一架，林浩咬定“你开不起玩笑小题大做”，老师也批评了两个人破坏纪律。你感到极度委屈，明明自己是受害者，却成了惹事者。',
        discoveryTitle: '愤怒是脆弱的盔甲，但容易伤人伤己',
        impactAnalysis:
          '当言语攻击发生时，人们本能会进入防御和反击状态，从而完全忽略了原本的问题所在。用“人身攻击”回应“不当玩笑”，往往会让对方倒打一耙，让自己陷入被动。',
        gentleExample: {
          scenario: '火气冲上来想要破口大骂时',
          suggestedWords:
            '深吸一口气停顿两秒，将火力从“攻击对方人格”收回到“界定自己的底线”：“开玩笑的前提是双方都觉得好笑。你现在这么说不是幽默，是没礼貌。”',
          rationale:
            '站稳理性和道义的制高点，对方无处借力反咬。',
        },
      },
      'outcome-words-hurt-delayed': {
        id: 'outcome-words-hurt-delayed',
        title: '迟到的边界：只要开口，就是成长的胜利',
        badgeLabel: '🌱 觉察觉醒 · 亡羊补牢',
        badgeColor: 'blue',
        storyEnding:
          '虽然中午没有立刻说出口，但放学前你勇敢地补上了这堂边界课。林浩的道歉让你明白：只要勇敢说出真相，世界其实很讲道理。',
        discoveryTitle: '给自己一点反应的时间，也很棒',
        impactAnalysis:
          '我们不是每时每刻都能做出完美的即时反应。被冒犯时大脑发懵是正常的生理保护。允许自己事后复盘并重新找机会澄清，同样是一种极其成熟的情绪修复能力。',
        gentleExample: {
          scenario: '当场没反应过来，事后想找对方说清楚时',
          suggestedWords:
            '“林浩，关于今天中午那件事，我想了想还是想跟你坦诚说一下：被你那么叫我心里真的很不好受，希望下次我们不要开这种玩笑了。”',
          rationale:
            '事后沟通情绪更平静，逻辑更清晰，对方也更容易理性听取。',
        },
      },
    },
  },

  // 3. 小组合作时，你的意见一直没有被听见
  {
    id: 'script-group-voice',
    title: '小组合作时，你的意见一直没有被听见',
    category: '沟通表达',
    sub: '在语速飞快、主导力强的团队中，练习自信而建设性地发声。',
    duration: '4 分钟体验',
    character: '组长 张敏',
    characterRole: '执行力强但节奏飞快的组长',
    scene:
      '期末项目研讨会上，4人小组正在讨论课题展示方案。组长张敏语速飞快地在白板上搭建框架，另外两个组员连连附和。你事先熬夜查了很多前沿案例，敏锐察觉到现有方案完全缺少了用户调研支持，若被老师提问很容易被全盘推翻。你想插话，但几次都被飞快的讨论节奏掠过。',
    tags: ['职场沟通', '团队发声', '建设性提议'],
    illustrationKey: 'groupVoice',
    initialStepId: 'step-1',
    steps: {
      'step-1': {
        stepId: 'step-1',
        speaker: '张敏',
        speakerAvatarText: '敏',
        speakerRole: '组长',
        prompt:
          '“那整体结构就这么敲定了！前言我负责，小周做PPT，小李做问卷，你负责附录整理，大家没意见的话我们今天就收工！”',
        options: [
          {
            id: 'opt-1-constructive',
            badge: '🌱 结构化温和介入',
            text: '“敏姐，大家刚才搭的框架推进很迅速！不过我昨晚查案例时注意到，评审老师特别看重真实调研支撑。如果在第二章前加一个用户痛点访谈，整个方案会更立得住。给我两分钟，我快速把这个想法同步一下，看看大家的看法？”',
            reaction: {
              dialogue:
                '“诶？确实有这个可能！大家先停一下，听听看你的调研设计思路！”',
              atmosphere:
                '白板前的讨论声安静了下来，张敏和组员们都把目光转向你，认真等待你的分享。',
            },
            nextStepId: 'step-2-pitch',
          },
          {
            id: 'opt-1-give-up',
            badge: '🍂 弱弱试探后彻底放弃',
            text: '“那个……其实我觉得……是不是缺点什么……不过你们定就好，我听大家的安排吧。”',
            reaction: {
              dialogue: '“好嘞，那咱们就抓紧分头行动吧！”',
              atmosphere:
                '张敏没太听清你的上半句，顺着后半句直接结束了会议。你看着手里的调研笔记，心里充满失落。',
            },
            nextStepId: 'step-2-teacher-review',
          },
        ],
      },
      'step-2-pitch': {
        stepId: 'step-2-pitch',
        speaker: '张敏',
        speakerAvatarText: '敏',
        speakerRole: '组长',
        prompt:
          '（听完你清晰列出的3个核心痛点和设计方案后）“这个调研切入点太绝了！刚好补上了我们最薄弱的一环。那调研设计和访谈分析这块，你愿意全权牵头负责吗？”',
        options: [
          {
            id: 'opt-2-take-lead',
            badge: '💫 自信领衔核心模块',
            text: '“没问题，我今晚就能把问卷和提纲拟定好，明天中午我们花10分钟对一下细节就上线。”',
            reaction: {
              dialogue: '“太棒了！有你把关这一块我就踏实多了！”',
              atmosphere:
                '团队成员纷纷投来赞赏的目光，你在团队中的专业影响力显著提升。',
            },
            outcomeId: 'outcome-group-voice-lead',
          },
          {
            id: 'opt-2-collaborate',
            badge: '🌿 协同分工提效',
            text: '“我很乐意主导设计，小李对数据整理很熟，我们俩搭档效率会更高，大家觉得呢？”',
            reaction: {
              dialogue: '“赞同！小李赶紧跟上，咱们这次期末稳了！”',
              atmosphere:
                '分工高效合理，团队凝聚力达到高潮，大家各展所长。',
            },
            outcomeId: 'outcome-group-voice-lead',
          },
        ],
      },
      'step-2-teacher-review': {
        stepId: 'step-2-teacher-review',
        speaker: '张敏',
        speakerAvatarText: '敏',
        speakerRole: '组长',
        prompt:
          '（中期方案汇报时，导师皱起眉头指责缺乏一手调研数据支撑。会议室里，张敏叹气，组员面面相觑）',
        options: [
          {
            id: 'opt-2-complain',
            badge: '🍂 事后埋怨推卸',
            text: '“我当时开会就想说了，是你们语速太快根本没人理我……”',
            reaction: {
              dialogue: '“你当时支支吾吾的也没说清楚啊，现在马后炮有什么用？”，组员反唇相讥。',
              atmosphere:
                '团队内部产生嫌隙，大家互相指责，士气低落。',
            },
            outcomeId: 'outcome-group-voice-blame',
          },
          {
            id: 'opt-2-rescue',
            badge: '🌱 建设性主动补位',
            text: '“大家别慌，我之前已经整理过一部分样本案例，我们把问卷精简成5题快速跑一下，今晚就能把调研这块补上。”',
            reaction: {
              dialogue: '“天哪太救命了！你简直是我们的底牌，辛苦你了！”',
              atmosphere:
                '危机化险为夷，张敏也深刻意识到下次讨论必须留出充分发言时间。',
            },
            outcomeId: 'outcome-group-voice-rescue',
          },
        ],
      },
    },
    outcomes: {
      'outcome-group-voice-lead': {
        id: 'outcome-group-voice-lead',
        title: '主动发声：从隐形人到团队中流砥柱',
        badgeLabel: '🌟 自信表达 · 专业担当',
        badgeColor: 'green',
        storyEnding:
          '最终汇报中，你们小组因为扎实详实的一手调研获得了全班最高分。张敏在致谢环节特意感谢了你的敏锐发现，你赢得了极高的团队认可。',
        discoveryTitle: '建设性的发声，谁都不会拒绝',
        impactAnalysis:
          '很多内向者害怕在会议中打断别人，是因为觉得“打断是不礼貌的”。但实际上：先肯定团队进展 + 提出潜在风险 + 请求简短时间窗口（“给我2分钟”），是最高级的职场沟通策略。团队最看重的是能解决问题的人。',
        gentleExample: {
          scenario: '讨论节奏太快、自己插不上话时',
          suggestedWords:
            '“大家前面的方向很棒！针对刚才的第二点我整理了一些数据风险，给我2分钟跟大家过一下关键发现，大家看看对不对？”',
          rationale:
            '用“为了团队成果更好”的共同目标作为发声契机，自然又大方。',
        },
      },
      'outcome-group-voice-blame': {
        id: 'outcome-group-voice-blame',
        title: '消极退缩：未表达的意见往往沦为怨气',
        badgeLabel: '🍂 习得性无助 · 团队内耗',
        badgeColor: 'amber',
        storyEnding:
          '小组项目重做了一周，疲惫不堪。你在小组里越来越像个局外人，感到委屈却又无从说起。',
        discoveryTitle: '世界上没有会读心术的队友',
        impactAnalysis:
          '“我给了暗示，对方就应该懂”是人际交往中最常见的认知陷阱。退缩往往伴随着事后的委屈，而委屈最终会演化成攻击性的埋怨。主动清晰地把话说出来，是成人的基本责任。',
        gentleExample: {
          scenario: '察觉到自己有好的想法却不敢说时',
          suggestedWords:
            '在笔记本上把想法提炼成核心的 1、2、3 点，然后在对方语毕换气的间隙，举起手温和示意：“关于这点我有两个补充细节想跟大家聊聊。”',
          rationale:
            '结构化的准备能大幅降低当众表达的紧张感。',
        },
      },
      'outcome-group-voice-rescue': {
        id: 'outcome-group-voice-rescue',
        title: '危机补位：用行动赢得信任的逆转',
        badgeLabel: '💫 沉着担当 · 峰回路转',
        badgeColor: 'blue',
        storyEnding:
          '虽然经历了老师的批评，但你拿出的解决方案力挽狂澜。张敏专门向你道歉：“上次会议我节奏太赶了没顾上你，多亏了你！”',
        discoveryTitle: '行动比抱怨更有说服力',
        impactAnalysis:
          '当团队遭遇挫折时，最能体现一个人成熟度的是“不忙于分锅，而是聚焦解决”。你的专业性最终得到了证明，也为自己赢得了未来话语权。',
        gentleExample: {
          scenario: '方案遇到阻碍需要拯救时',
          suggestedWords:
            '“先不慌，问题很清晰，我有现成的备用方案，我们现在按照这个步骤分工，两小时内能解决。”',
          rationale:
            '成为团队的定海神针，用专业度赢得长久威信。',
        },
      },
    },
  },

  // 4. 你已经努力了，却担心结果不够好
  {
    id: 'script-self-critic',
    title: '你已经努力了，却担心结果不够好',
    category: '学习与成长',
    sub: '当深夜的焦虑与冒名顶替感来袭，学会用自我慈悲代替严苛审判。',
    duration: '3 分钟体验',
    character: '内在声音',
    characterRole: '深夜的自我审判者',
    scene:
      '明天是至关重要的答辩考核。过去两周你每天早起复习、写了满满三大本笔记、模拟演讲了数十遍。然而现在已经是午夜12点了，躺在床上的你心跳加速，脑海里翻江倒海：“万一老师问到一个我没看过的偏门问题怎么办？万一我一紧张忘词怎么办？我肯定还是准备得不够充分……”',
    tags: ['自我慈悲', '放下完美主义', '内在安宁'],
    illustrationKey: 'selfCritic',
    initialStepId: 'step-1',
    steps: {
      'step-1': {
        stepId: 'step-1',
        speaker: '内在声音',
        speakerAvatarText: '我',
        speakerRole: '内心声音',
        prompt:
          '“别睡了！快爬起来把所有课件再从头看一遍！你现在睡觉就是对自己不负责任，明天万一考砸了你后悔都来不及！”',
        options: [
          {
            id: 'opt-1-self-compassion',
            badge: '🤍 自我慈悲与事实确认',
            text: '轻轻把手放在心口深呼吸：“我知道你是在担心我，想保护我。但过去两周我已经拼尽全力了，现在的我最需要的是睡眠和清醒的大脑，而不是疲惫崩溃的身体。今晚我允许自己好好睡觉。”',
            reaction: {
              dialogue:
                '（随着三次深长的吐气，紧绷的横膈膜和咬紧的牙关慢慢松弛下来，脑海里严厉的声音渐渐变得柔和）',
              atmosphere:
                '身心重新回到安全区，心率从紧绷的90次放缓至平静的65次，被窝里泛起安宁的暖意。',
            },
            nextStepId: 'step-2-night-peace',
          },
          {
            id: 'opt-1-anxious-push',
            badge: '🍂 屈服于恐惧通宵熬夜',
            text: '“不行，我太心慌了，我必须开灯把重点再背一遍，不然我根本合不上眼！”',
            reaction: {
              dialogue:
                '（台灯刺眼地亮起，你坐在书桌前疯狂翻书，但注意力已经无法集中，每看一行都觉得陌生的恐惧）',
              atmosphere:
                '肾上腺素强行飙升，身体进入应激性透支状态，焦虑感呈指数级放大。',
            },
            nextStepId: 'step-2-exhaustion',
          },
        ],
      },
      'step-2-night-peace': {
        stepId: 'step-2-night-peace',
        speaker: '内在声音',
        speakerAvatarText: '我',
        speakerRole: '内心声音',
        prompt:
          '（被窝里逐渐暖和起来，睡意渐渐袭来，但脑中偶尔还闪过一丝微小的担忧：“如果明天真的表现失常怎么办？”）',
        options: [
          {
            id: 'opt-2-anchor-value',
            badge: '🌱 锚定内核与个人价值',
            text: '“一次答辩只是人生路上的一道小测试，它不能定义我全部的价值。无论明天的成绩如何，我都拥有复盘和继续前行的力量。此刻我很好。”',
            reaction: {
              dialogue:
                '（脑海里的杂音完全退潮，像是沉入了一片温暖宁静的温水池塘，安然进入梦乡）',
              atmosphere:
                '副交感神经系统完全接管，身体得到深层滋养修复，第二天早晨神清气爽。',
            },
            outcomeId: 'outcome-self-critic-peace',
          },
          {
            id: 'opt-2-sensory-grounding',
            badge: '🌿 运用五感着陆法',
            text: '不再去纠缠思维的故事，把所有注意力放在被子的重量、枕头的柔软与气息的吸入呼出上。',
            reaction: {
              dialogue: '（身体完全臣服于重力，呼吸悠长平缓，悄然入睡）',
              atmosphere:
                '大脑思维回路逐步静音，心流回归安稳沉静。',
            },
            outcomeId: 'outcome-self-critic-peace',
          },
        ],
      },
      'step-2-exhaustion': {
        stepId: 'step-2-exhaustion',
        speaker: '内在声音',
        speakerAvatarText: '我',
        speakerRole: '内心声音',
        prompt:
          '（凌晨3点半，眼睛酸痛流泪，胃里一阵阵痉挛恶心，整个人处于崩溃边缘）',
        options: [
          {
            id: 'opt-2-self-blame',
            badge: '🍂 陷入更深的自我厌弃',
            text: '“我怎么这么废物，连睡个觉都管不住自己，明天肯定全完了……”',
            reaction: {
              dialogue:
                '（陷入深深的绝望与无助，在自责中硬挺到天亮，头痛欲裂）',
              atmosphere: '第二天考场上头脑一片空白，身体虚脱。',
            },
            outcomeId: 'outcome-self-critic-crash',
          },
          {
            id: 'opt-2-emergency-soothe',
            badge: '💫 紧急关怀中止恶性循环',
            text: '“立刻关灯！不再责怪自己了。哪怕只睡3小时，身体也比不睡强。喝口温水，现在就躺下。”',
            reaction: {
              dialogue:
                '（深吸一口气放下书本，钻进被窝，终止了恶性内耗）',
              atmosphere:
                '虽然睡眠不足，但至少止住了情绪崩塌，保住了底线精力。',
            },
            outcomeId: 'outcome-self-critic-rescue',
          },
        ],
      },
    },
    outcomes: {
      'outcome-self-critic-peace': {
        id: 'outcome-self-critic-peace',
        title: '内在安宁：学会像好朋友一样对待自己',
        badgeLabel: '🌟 自我慈悲 · 稳定内核',
        badgeColor: 'green',
        storyEnding:
          '第二天你精神饱满地步入考场，虽然遇到了一道意料之外的问题，但因为大脑清醒冷静，你条理清晰地给出了自己的见解，顺利通过了考核。',
        discoveryTitle: '苛责不会带来优秀，关怀才会',
        impactAnalysis:
          '神经科学研究表明：当我们进行残酷的自我批判时，大脑杏仁核会激发“战或逃”反应，导致前额叶皮层（负责理性与记忆）供血不足，出现“大脑宕机”。而“自我慈悲”能激活催产素释放，让大脑重获从容与高水平认知功能。',
        gentleExample: {
          scenario: '因担心结果而极度苛求自己时',
          suggestedWords:
            '“我已经尽我所能做好了当下的准备。不确定的未来不归我掌控，但我此刻的休息与平和归我掌控。我配得上这一晚的好眠。”',
          rationale:
            '区分“掌控圈”与“关注圈”，将注意力收回到当下的关怀中。',
        },
      },
      'outcome-self-critic-crash': {
        id: 'outcome-self-critic-crash',
        title: '焦虑反刍：完美主义陷阱引发的耗竭',
        badgeLabel: '🍂 压力超载 · 恶性循环',
        badgeColor: 'amber',
        storyEnding:
          '第二天在考场上你因为极度疲劳而出现低级失误。事后你更加坚信“自己不够好”，陷入了完美主义与自我怀疑的无休止轮回。',
        discoveryTitle: '完美主义是披着自律外衣的恐惧',
        impactAnalysis:
          '很多人的过度准备并不是追求卓越，而是出于对“不被认可”的恐惧。这种把自我价值绑定在单一结果上的思维模式，会让人长期处于慢性应激障碍之中。',
        gentleExample: {
          scenario: '察觉到自己正在强迫性熬夜内耗时',
          suggestedWords:
            '站起身离开书桌，洗一把脸对镜子里的自己说：“你已经很棒了，不要再折磨这个爱你的身体了，现在去睡觉。”',
          rationale:
            '物理切断应激源，强行打断强迫性思维链条。',
        },
      },
      'outcome-self-critic-rescue': {
        id: 'outcome-self-critic-rescue',
        title: '紧急刹车：任何时候关怀自己都不算晚',
        badgeLabel: '🌱 及时止损 · 自我接纳',
        badgeColor: 'blue',
        storyEnding:
          '虽然只睡了几个小时，但因为你及时叫停了自责，答辩时发挥出了基本水平。这次经历让你深刻认识到：照顾身体比多背两页书重要一百倍。',
        discoveryTitle: '允许自己在过程中犯错与调整',
        impactAnalysis:
          '人生没有绝对标准的教科书。当我们发现自己误入了焦虑陷阱时，最关键的一步是“不追加第二支箭”（不再因为自己焦虑而批判自己），温和地把方向盘打回来。',
        gentleExample: {
          scenario: '发现自己又忍不住陷入焦虑时',
          suggestedWords:
            '“是的，我刚才又掉进恐惧里了，这很正常，不用慌。现在我选择对自己温柔一点。”',
          rationale:
            '不加评判地接纳当下的脆弱，是打破恶性循环的唯一解药。',
        },
      },
    },
  },

  // 5. 朋友心情不好，你想关心对方却不知道怎么开口
  {
    id: 'script-comfort-friend',
    title: '朋友心情不好，你想关心对方却不知道怎么开口',
    category: '人际关系',
    sub: '面对身边人的低落脆弱，练习不施加压力的温暖在场。',
    duration: '3 分钟体验',
    character: '好友 子涵',
    characterRole: '同班好友',
    scene:
      '一整天下来，平时活泼爱笑的子涵格外反常。午饭只吃了一口，自习课一直趴在桌上，下课时有人叫她她也只是勉强摆摆手。放学时同学们都走得差不多了，你看到她眼眶红红的，一个人低着头默默擦眼泪。你想走上前关心她，但内心充满顾虑：“我该怎么说才不会显得冒犯？万一她不想理我怎么办？”',
    tags: ['深层倾听', '情感在场', '真挚关怀'],
    illustrationKey: 'comfortFriend',
    initialStepId: 'step-1',
    steps: {
      'step-1': {
        stepId: 'step-1',
        speaker: '子涵',
        speakerAvatarText: '涵',
        speakerRole: '好友',
        prompt:
          '（子涵低着头把课本胡乱塞进书包，吸了吸鼻子，眼泪又滴在课桌上）',
        options: [
          {
            id: 'opt-1-gentle-presence',
            badge: '🌿 低压力的温柔在场',
            text: '轻轻走到她身边递上一包纸巾和一瓶温热的红豆奶茶，轻声说：“子涵，看你今天好像挺难受的。如果你想找人说说，我随时都在；如果现在只想一个人静静，我也在旁边陪你一会儿，别硬撑着。”',
            reaction: {
              dialogue:
                '“（子涵接过纸巾，紧绷了一整天的肩膀终于塌了下来，眼泪止不住地涌出）‘谢谢你……今天家里发生了一些事，我憋了一整天了，周围全是人我不敢哭……’”',
              atmosphere:
                '原本冷清防御的气氛瞬间瓦解为安全的情感流动，子涵感到被接纳和包容。',
            },
            nextStepId: 'step-2-listen',
          },
          {
            id: 'opt-1-pushy-cheer',
            badge: '🍂 急切追问并强行打气',
            text: '“哎呀子涵你怎么了呀！谁欺负你了快告诉我！多大点事嘛，哭解决不了问题，开心一点，走我带你吃好吃的去！”',
            reaction: {
              dialogue:
                '“（子涵下意识把头扭向另一边，用力擦了擦眼泪，声音变得生硬冷淡）‘我没事……你先走吧，我想一个人待着。’”',
              atmosphere:
                '子涵重新竖起了情感高墙，你的急切让她感到自己的脆弱被强行曝光与评判。',
            },
            nextStepId: 'step-2-wall',
          },
        ],
      },
      'step-2-listen': {
        stepId: 'step-2-listen',
        speaker: '子涵',
        speakerAvatarText: '涵',
        speakerRole: '好友',
        prompt:
          '（子涵抽泣着断断续续向你倾诉）“我爸妈今天吵得特别凶，甚至把我的奖状都撕了……我觉得自己无论怎么努力，在这个家里都是多余的……”',
        options: [
          {
            id: 'opt-2-pure-empathy',
            badge: '🤍 深度共情与情感确认',
            text: '轻轻拍拍她的背，温柔地说：“天哪，经历了这些真的太让人窒息和委屈了……你已经拼尽全力在做一个好孩子了，这不是你的错，想哭就痛痛快快哭出来，我一直在这里陪着你。”',
            reaction: {
              dialogue:
                '“（子涵紧紧抱住你放声大哭，情绪得到了最彻底的宣泄与释放）‘谢谢你……有你在真的太好了……’”',
              atmosphere:
                '深层的情感共鸣建立了坚不可摧的信任基石，两人的心贴得极近。',
            },
            outcomeId: 'outcome-comfort-deep-safe',
          },
          {
            id: 'opt-2-preach-solution',
            badge: '🍂 急于给出人生大道理',
            text: '“其实你应该成熟一点，大人吵架是大人的事，你只要搞好学习就行了，哭也没用对吧？”',
            reaction: {
              dialogue:
                '“（子涵愣了一下，慢慢松开了握着纸巾的手，眼神暗淡下来）‘……嗯，你说得对。’”',
              atmosphere:
                '子涵关闭了心扉，因为她需要的不是理性的裁判，而是一间避雨的屋檐。',
            },
            outcomeId: 'outcome-comfort-preach',
          },
        ],
      },
      'step-2-wall': {
        stepId: 'step-2-wall',
        speaker: '子涵',
        speakerAvatarText: '涵',
        speakerRole: '好友',
        prompt:
          '（子涵背起书包准备快步离开教室）',
        options: [
          {
            id: 'opt-2-repair-space',
            badge: '🌱 敏锐觉察并给足空间',
            text: '快步递上纸巾：“子涵，抱歉刚才我有点着急了，我只是心疼你。你路上注意安全，如果回到家想找人吐槽，随时弹我窗，我一直都在。”',
            reaction: {
              dialogue:
                '“（子涵停下脚步，回头看了看你，神色缓和了许多）‘谢谢你……我刚才态度不好，到家我跟你说。’”',
              atmosphere:
                '修补了刚才的压迫感，留下了安全的沟通入口。',
            },
            outcomeId: 'outcome-comfort-repaired',
          },
          {
            id: 'opt-2-offended-retreat',
            badge: '🍂 感到好心被辜负而赌气',
            text: '“切，真是好心当成驴肝肺，不识好歹，以后不管你了。”',
            reaction: {
              dialogue: '（子涵头也不回地跑出了教室，眼里满是委屈）',
              atmosphere:
                '双方都感到受伤，原本真挚的关心演变成了关系的裂痕。',
            },
            outcomeId: 'outcome-comfort-alienated',
          },
        ],
      },
    },
    outcomes: {
      'outcome-comfort-deep-safe': {
        id: 'outcome-comfort-deep-safe',
        title: '安全容器：不加评判的倾听是最高级的爱',
        badgeLabel: '🌟 深度共情 · 灵魂陪伴',
        badgeColor: 'green',
        storyEnding:
          '哭过之后，子涵的情绪明显平复了下来。她洗了把脸，眼里的阴霾散去许多。你们一起在晚霞中走回宿舍，这段陪伴成为了她灰暗日子里最温暖的光。',
        discoveryTitle: '共情不是提供方案，而是与黑暗同坐',
        impactAnalysis:
          '心理治疗中最核心的发现是：当一个人极度悲伤时，任何“开心点”、“不要哭”的劝解，实质上都是在否认对方的情绪合法性，会让人感到加倍孤独。真正的治愈来自于“我允许你此刻难过，且我愿意陪你一起呆在这里”。',
        gentleExample: {
          scenario: '面对朋友沉重的难过时',
          suggestedWords:
            '“如果想哭就哭吧，我在这里陪着你，不会催你，也不会给任何人说。你不是一个人。”',
          rationale:
            '提供安全的物理空间与心理保密承诺，让情绪得以自然流淌。',
        },
      },
      'outcome-comfort-preach': {
        id: 'outcome-comfort-preach',
        title: '说教之伤：理性的大道理往往是情感的绝缘体',
        badgeLabel: '🍂 情感错位 · 无形隔阂',
        badgeColor: 'amber',
        storyEnding:
          '子涵后来很少再跟你提起家里的事。你们依然是普通朋友，但你知道，彼此之间多了一层看不见的距离。',
        discoveryTitle: '情绪需要被看见，而不是被纠正',
        impactAnalysis:
          '我们之所以习惯在别人难过时急于给建议，是因为我们自身难以忍受“看着别人痛苦却无能为力”的焦虑。我们急于解决问题，是为了平息自己的不适，而不是为了对方。',
        gentleExample: {
          scenario: '忍不住想给朋友提建议时',
          suggestedWords:
            '管住想说教的嘴巴，在心里默念三遍：“先处理心情，再处理事情。此刻她不需要导师，她只需要一个拥抱。”',
          rationale:
            '克制解决问题的冲动，把重心放回情感连接。',
        },
      },
      'outcome-comfort-repaired': {
        id: 'outcome-comfort-repaired',
        title: '敏锐修补：尊重对方的节奏也是关怀',
        badgeLabel: '🌱 觉察共情 · 留白温柔',
        badgeColor: 'blue',
        storyEnding:
          '晚上九点多，子涵给你发来了一长串微信，倾诉了心里的委屈。因为你给予了她足够的安全空间，她终于愿意卸下防备。',
        discoveryTitle: '尊重对方的防御机制',
        impactAnalysis:
          '当脆弱的人竖起刺时，往往是因为他们太害怕再次受伤。不强攻对方的城堡，在护城河外温柔地点一盏灯，是更深层次的懂得与慈悲。',
        gentleExample: {
          scenario: '对方表示想一个人呆着时',
          suggestedWords:
            '“完全理解，你需要独处的空间。我就在手机另一头，随时待命，你什么时候需要我都在。”',
          rationale:
            '尊重边界的同时，留下一张不设有效期的求助兑换券。',
        },
      },
      'outcome-comfort-alienated': {
        id: 'outcome-comfort-alienated',
        title: '自恋受挫：把关怀变成了彼此的负担',
        badgeLabel: '🍂 冲突裂痕 · 防御反弹',
        badgeColor: 'purple',
        storyEnding:
          '之后的几天你们互相避开彼此的目光。一段原本可以加深的友谊，因为一次错误的沟通姿态而留下了遗憾的阴影。',
        discoveryTitle: '关怀不能带有“必须被感激”的预期',
        impactAnalysis:
          '如果我们的关心必须建立在“对方立刻报以感谢与配合”的前提下，那这往往不是真正的爱，而是一种索取情绪价值的交换。',
        gentleExample: {
          scenario: '对方没有立刻接受好意时',
          suggestedWords:
            '提醒自己：“对方拒绝的是压力，不是我的善意。她的状态很差，不能要求一个溺水者优雅地道谢。”',
          rationale:
            '放下自我中心的执念，理解创伤者的防御反应。',
        },
      },
    },
  },

  // 6. 你想拒绝一次聚会，又担心对方失望
  {
    id: 'script-decline-party',
    title: '你想拒绝一次聚会，又担心对方失望',
    category: '人际关系',
    sub: '面对热络的大型群聚社交，练习体面拒绝而不伤彼此情谊。',
    duration: '3 分钟体验',
    character: '发小 欣欣',
    characterRole: '从小玩到大的好朋友',
    scene:
      '发小欣欣在群里热火朝天地张罗着周六的聚会，打算召集二十多号人去玩沉浸式密室大逃脱，晚上还要去嘈杂的KTV连轴转。你知道欣欣为了组局费了很大心血，但你天生对强刺激和人多嘈杂的环境容易神经敏感过载，加上近来身心消耗极大，周六特别需要一个人在家安安静静看书休整。你看着私聊窗口，十分纠结。',
    tags: ['社交过载', '高敏人群', '优雅拒绝'],
    illustrationKey: 'declineParty',
    initialStepId: 'step-1',
    steps: {
      'step-1': {
        stepId: 'step-1',
        speaker: '欣欣',
        speakerAvatarText: '欣',
        speakerRole: '发小',
        prompt:
          '“宝！周六你肯定来吧？我特意把你名字报上去了，你可不许放我鸽子呀，有你在我才安心！”',
        options: [
          {
            id: 'opt-1-kind-refuse',
            badge: '🌱 肯定心意 + 真诚拒绝 + 替代方案',
            text: '“欣欣，先夸夸你组局辛苦啦！不过我最近对高嘈杂环境容易过载头痛，周六特别需要一个人在家充电静养，这次大聚会我就不去凑热闹啦。不过我想单独跟你好好聚聚，下周找个安静阳光好的下午，我请你喝咖啡吃蛋糕，好不好？”',
            reaction: {
              dialogue:
                '“（欣欣发来一个大大的抱抱表情）‘懂啦懂啦！我知道你平时就不太耐受人多的地方。那周六你好好在被窝里躺平回血，下周的下午茶我已经记在备忘录里啦！’”',
              atmosphere:
                '欣欣不仅完全理解，而且为拥有一个能单独深入聊天的专属时间感到开心。',
            },
            nextStepId: 'step-2-cafe-chat',
          },
          {
            id: 'opt-1-fear-refuse',
            badge: '🍂 害怕让对方失望而违心答应',
            text: '“呃……好吧，既然你名字都报上去了，那我就来吧……”',
            reaction: {
              dialogue: '“‘太棒啦！周六不见不散，记得准时到哦！’”',
              atmosphere:
                '欣欣欢呼雀跃，而你的心里像压了一块巨石，整个周五都在为周六的聚会发愁。',
            },
            nextStepId: 'step-2-party-chaos',
          },
        ],
      },
      'step-2-cafe-chat': {
        stepId: 'step-2-cafe-chat',
        speaker: '欣欣',
        speakerAvatarText: '欣',
        speakerRole: '发小',
        prompt:
          '（欣欣在微信上分享了两个安静可爱的庭院咖啡馆）“下周去哪一家？第一家有大草坪和猫猫，第二家有超级棒的肉桂卷！”',
        options: [
          {
            id: 'opt-2-pick-cat',
            badge: '🌿 愉快敲定二人专属时光',
            text: '“第一家！有猫猫和阳光，刚好适合我们两个舒舒服服聊天~”',
            reaction: {
              dialogue: '“成交！下周六下午两点，不见不散！”',
              atmosphere:
                '高质量的深度社交即将到来，你对未来的相聚充满期待。',
            },
            outcomeId: 'outcome-decline-healthy',
          },
          {
            id: 'opt-2-deep-connection',
            badge: '🤍 表达对彼此关系的珍视',
            text: '“两家都可以，最主要是想好好听你讲讲最近的心情，好久没跟你深度聊天啦。”',
            reaction: {
              dialogue: '“呜呜呜你真好，我也憋了好多话想跟你讲！”',
              atmosphere:
                '情感浓度显著提升，真正的友谊在真诚中深化。',
            },
            outcomeId: 'outcome-decline-healthy',
          },
        ],
      },
      'step-2-party-chaos': {
        stepId: 'step-2-party-chaos',
        speaker: '欣欣',
        speakerAvatarText: '欣',
        speakerRole: '发小',
        prompt:
          '（周六聚会现场，巨大的音响和鬼屋尖叫让你头痛欲裂，大家都在喝酒推杯换盏，欣欣过来拉你玩骰子）“你怎么一个人坐角落发呆呀，快起来嗨！”',
        options: [
          {
            id: 'opt-2-freeze-end',
            badge: '🍂 忍无可忍强撑到结束',
            text: '“……没事，你们玩吧，我有点晕。”（一直僵硬地坐到午夜散场）',
            reaction: {
              dialogue: '“（欣欣察觉到了你的格格不入，有些扫兴）‘好吧……感觉你今天玩得不是很开心。’”',
              atmosphere:
                '双输结局：你耗尽了所有能量，欣欣也因为你没玩好而产生心理负担。',
            },
            outcomeId: 'outcome-decline-exhaust',
          },
          {
            id: 'opt-2-honest-leave',
            badge: '💫 勇敢承认极限提前退场',
            text: '“欣欣对不起，我环境过载引发偏头痛了，再呆下去可能会吐。我必须得先打车回家了，你专心招呼大家，真不好意思。”',
            reaction: {
              dialogue: '“天哪这么严重！那你赶紧回去吃药睡觉，到家给我报平安！”',
              atmosphere:
                '虽然过程有些狼狈，但你终于保护了自己的生理极限。',
            },
            outcomeId: 'outcome-decline-rescue',
          },
        ],
      },
    },
    outcomes: {
      'outcome-decline-healthy': {
        id: 'outcome-decline-healthy',
        title: '高情商拒绝：用“高质量小聚”替代“低质量硬融”',
        badgeLabel: '🌟 优雅拒绝 · 双向奔赴',
        badgeColor: 'green',
        storyEnding:
          '下周的庭院咖啡馆里，你们坐在阳光下聊了整整三个小时，彼此都觉得得到了极大的滋养。欣欣感叹：“还是这样两个人坐着聊天舒服，上次二十多个人吵得我头疼！”',
        discoveryTitle: '拒绝不等于冷漠，它是对彼此时间的精细尊重',
        impactAnalysis:
          '人际关系中的“替代性邀约”（Counter-offer）是拒绝的最高智慧。它向对方传递了两个明确信息：1. 我拒绝的是这个“活动形式”，而不是“你这个人”；2. 我愿意投入更珍贵的专属时间与你建立深度连接。',
        gentleExample: {
          scenario: '面对不适合自己的大型聚会时',
          suggestedWords:
            '“谢谢你的热情邀请！不过我最近社交电池比较低，人多的大聚会我就不去凑热闹了。我很珍惜我们的关系，找个时间我们俩单独喝茶慢慢聊！”',
          rationale:
            '先表达感谢，再清晰定性，最后给出专注的一对一替代方案。',
        },
      },
      'outcome-decline-exhaust': {
        id: 'outcome-decline-exhaust',
        title: '无效迎合：为了讨好别人，牺牲了两个人的快乐',
        badgeLabel: '🍂 能量透支 · 双向扫兴',
        badgeColor: 'amber',
        storyEnding:
          '周末结束后，你整整三天没缓过劲来，对欣欣的微信也下意识不想回复。原本要好的关系，因为一次勉强的赴约蒙上了疲惫的阴影。',
        discoveryTitle: '强融的圈子，折磨的是所有人',
        impactAnalysis:
          '当我们勉强自己去迎合不适合的社交场合时，我们的疲惫和疏离是藏不住的。这不仅不能给聚会增色，反而会把负面气场传递给东道主，让对方背上“招待不周”的隐形愧疚。',
        gentleExample: {
          scenario: '内心极度抗拒但觉得“不得不去”时',
          suggestedWords:
            '问问自己：“我去现场能带来快乐吗？如果不能，我为什么要把一个痛苦的自己送去现场？”',
          rationale:
            '认识到“勉强自己”实质上也是一种对现场氛围的不负责任。',
        },
      },
      'outcome-decline-rescue': {
        id: 'outcome-decline-rescue',
        title: '身体拉警报时的及时自我拯救',
        badgeLabel: '🌱 倾听身体 · 勇敢止损',
        badgeColor: 'blue',
        storyEnding:
          '回到安静的房间，洗了个热水澡，你终于缓过劲来。你下定决心：以后从一开始就要诚实对待自己的能量限制，不再轻易妥协。',
        discoveryTitle: '身体的感受永远不会说谎',
        impactAnalysis:
          '高敏感或内向者在强刺激环境下会产生真实的神经生理过载（皮质醇激增、偏头痛、恶心）。这不是“矫情”，而是真实的生理防御。学会尊重并优先照顾身体警报，是成年人自爱的起点。',
        gentleExample: {
          scenario: '在嘈杂社交场合感到身体不适时',
          suggestedWords:
            '“我的身体已经在拉警报了。照顾好自己不是自私，而是底线。我现在就要离开。”',
          rationale:
            '无须自责，身体是陪伴你一生的唯一容器。',
        },
      },
    },
  },
]

// Articles definitions for PsychoArticlesView
export interface ArticleItem {
  id: string
  title: string
  category: string
  sub: string
  readTime: string
  tags: string[]
  summary: string
  keyTakeaways: string[]
  paragraphs: string[]
}

export const articleCategories = [
  '全部',
  '情绪通识',
  '身心减压',
  '睡眠调理',
  '自我关怀',
  '人际边界',
]

export const articleCatalog: ArticleItem[] = [
  {
    id: 'article-1',
    title: '为什么我们总是忍不住压抑负面情绪？',
    category: '情绪通识',
    sub: '情绪不是需要被消除的故障，而是身心的一封信。',
    readTime: '4 分钟',
    tags: ['情绪接纳', '心理机制', '温和释放'],
    summary:
      '很多人从小学会了“懂事”和“坚强”，习惯把难过和委屈硬生生咽下去。但未被表达的情绪从未消亡，它们只是潜伏在肌肉紧绷、失眠或突然的疲倦里。',
    keyTakeaways: [
      '情绪的生理半衰期通常只有 90 秒，顺应它便会自然消退',
      '压抑并不能消灭情绪，反而需要消耗双倍的心理能量',
      '试着对心情说：“我看到你了，你在这里是安全的”',
    ],
    paragraphs: [
      '在成长过程中，我们常常被灌输“要坚强”、“不要动不动就哭”、“别把负面情绪带给别人”。久而久之，大脑建立了一种条件反射：一旦感到悲伤、焦虑或委屈，第一反应是把它硬生生压下去，甚至为自己的脆弱感到自责。',
      '神经科学研究表明，人体每一次情绪激发的生理化学反应（如肾上腺素激增、心跳加速）其实只有大约 90 秒的自然半衰期。如果你不去评判它、不去压抑它，只是单纯觉察并深呼吸，它会像潮水一样自然退去。',
      '而当我们试图压抑情绪时，前额叶皮层必须持续消耗大量葡萄糖和心理能量去“按住”杏仁核的警报。这种持续的内耗不仅会引发头痛、肩颈酸痛等躯体化症状，还会让我们在某一刻突然情绪失控。',
      '下一次，当难过或委屈涌上来时，试着找一个安静的角落，坐下来对它说：“我知道你现在很难过，没关系，我就在这里陪着你。”允许情绪流过，身心才会真正轻松下来。',
    ],
  },
  {
    id: 'article-2',
    title: '高敏感族群的自处之道：敏感不是脆弱，而是超能力',
    category: '自我关怀',
    sub: '感知细腻的世界，需要一把专属的心灵遮阳伞。',
    readTime: '5 分钟',
    tags: ['高敏感力量', '自我认同', '能量守护'],
    summary:
      '如果你常常能察觉到空气中微小的情绪波动、对强光噪音格外容易疲倦，你很可能是占人群约 20% 的高敏感者（HSP）。敏感不是病理性的脆弱，而是一座高分辨率的感知雷达。',
    keyTakeaways: [
      '高敏感者拥有更强的大脑镜像神经元与深度加工能力',
      '疲惫不是因为你能力不足，而是因为输入信息超载',
      '学会建立定期的“低刺激留白”，保护自己的心灵花园',
    ],
    paragraphs: [
      '根据心理学家伊莱恩·阿伦（Elaine Aron）博士的研究，世界上大约有 15%~20% 的人天生拥有更高的感觉加工敏感性（SPS）。他们的大脑岛叶和镜像神经元更加活跃，对光线、气味、他人的语气表情具有惊人的敏锐度。',
      '然而，在崇尚快节奏和高抗压的现代社会里，这种敏锐往往容易被误读为“玻璃心”、“太作”或“想太多”。高敏感者常常在嘈杂的办公室或密集社交后感到被抽空。',
      '请记住：高敏感是一种极其珍贵的天赋。它赋予了你深邃的共情能力、对艺术与自然的细腻体悟，以及洞察细节的敏锐直觉。你不是机器出了故障，你只是一台高精度的传感器。',
      '保护好这份超能力的关键在于“适度减载”：允许自己戴上降噪耳机、定期在自然或安静房间中独处、温和地向他人表达自己的休息需求。给你的高敏雷达罩上一层柔软的保护网。',
    ],
  },
  {
    id: 'article-3',
    title: '交感神经与副交感神经：学会主动给神经系统降噪',
    category: '身心减压',
    sub: '从生理层面理解身体是如何在紧绷与放松间切换的。',
    readTime: '4 分钟',
    tags: ['迷走神经', '生理放松', '科学减压'],
    summary:
      '焦虑和压力并不是纯粹的思想问题，它是一套深刻烙印在神经系统里的生理反应。通过调节呼吸与迷走神经，我们可以直接向大脑发送“我很安全”的生物信号。',
    keyTakeaways: [
      '交感神经负责“战或逃”，副交感神经负责“休息与消化”',
      '延长的呼气（如 4-4-6 呼吸）能直接刺激迷走神经释放乙酰胆碱',
      '温水洗脸、轻柔哼唱与大自然声景都能有效唤醒放松机制',
    ],
    paragraphs: [
      '我们的自主神经系统由交感神经系统和副交感神经系统共同组成。交感神经就像油门，负责在面对危险或任务时调动身体资源；而副交感神经就像刹车，负责心率下降、消化修复与睡眠恢复。',
      '现代人的困境在于：虽然没有猛兽追赶，但持续的消息提示、紧迫的 deadline 和人际关系压力，让交感神经长期处于轻微踩油门的状态，导致慢性疲劳和失眠。',
      '好消息是，呼吸是我们唯一能够自主控制的植物神经调节入口。吸气时交感神经轻度兴奋，而深长、平缓的呼气则会直接拉动副交感神经的刹车。这就是为什么 4 秒吸气、4 秒屏息、6 秒深呼气的节奏能快速让人平静下来。',
      '下次感到心慌意乱时，不必努力强迫自己“别想了”，只需把手放在腹部，做三次悠长而舒缓的深呼气，身体自然会带着心灵着陆。',
    ],
  },
  {
    id: 'article-4',
    title: '摆脱睡前思维反刍：给夜晚留一盏柔软的暖灯',
    category: '睡眠调理',
    sub: '为什么一躺在床上脑子就停不下来？写下担忧清单，让大脑安心入睡。',
    readTime: '3 分钟',
    tags: ['助眠仪式', '思维清空', '睡眠卫生'],
    summary:
      '夜深人静时，外界输入切断，大脑默认模式网络（DMN）开始活跃，白天未完成的遗憾与明天的担忧开始轮番上演。学会温柔打断这个死循环。',
    keyTakeaways: [
      '睡前半小时把脑中的待办和焦虑写在纸上，完成“大脑缓存卸载”',
      '避免在床上强行翻滚努力入睡，这会建立床与焦虑的负面条件反射',
      '调暗暖色光源，伴随温水与身体扫描，让睡意自然降临',
    ],
    paragraphs: [
      '你是否有过这样的体验：明明白天累得不行，但一沾枕头，脑海里就突然开始复盘五年前说错的一句话，或者开始为下周的某件事焦虑不安？',
      '心理学上称之为“睡前思维反刍”。当外界的声音静止，大脑的默认模式网络（DMN）便会接管意识，寻找尚未闭环的任务。大脑其实不是在折磨你，它只是笨拙地想提醒你“别忘了这些事”。',
      '破解反刍的最有效方法是“物理外化”：在床头放一本便签纸。睡前如果脑中有念头盘旋，开一盏昏暗小灯，把那些念头逐一写下来：“明天上午处理发票”、“明天下午回复邮件”。写下来相当于向大脑出具了一张签收单：“我已经收到了，明天再办”。',
      '同时，如果上床超过 20 分钟依然清醒，不要硬躺，起身坐在暗光椅子上听一段雨声或做几次慢呼吸，等困意再次来袭时再回床。',
    ],
  },
  {
    id: 'article-5',
    title: '讨好型人格的温柔解法：温和而坚定地做自己',
    category: '人际边界',
    sub: '把“对不起”换成“谢谢你”，把关注点收回自己身上。',
    readTime: '5 分钟',
    tags: ['摆脱讨好', '人际轻松', '自我自尊'],
    summary:
      '讨好并非单纯的友善，而是一种根深蒂固的安全感防御机制——害怕被讨厌、害怕冲突。学会用温和的方式确立边界，你会发现世界并不会因此崩塌。',
    keyTakeaways: [
      '你的价值不需要靠无止境的迎合与自我牺牲来证明',
      '用“谢谢你的理解”代替习惯性的“不好意思打扰了”',
      '他人有提出要求的权利，而你拥有温和说不的自由',
    ],
    paragraphs: [
      '“好的，我都行”、“真不好意思又麻烦你”、“没关系我多做一点没事的”……这些话是不是常常脱口而出？讨好型人格者往往把所有人的感受排在自己前面，宁愿自己委屈，也不愿看到别人脸上一丝不悦。',
      '但长期的讨好往往会导致隐秘的怨恨与耗竭：你以为付出了全部善意，换来的却是被理所当然地忽视；内心深处那个真实的自己，越来越感到孤单与被压抑。',
      '练习改变可以从最微小的语言习惯开始：把日常口头禅“对不起给你添麻烦了”换成“谢谢你的耐心帮助”；当有人提出邀约或请求时，不要立刻脱口而出“好”，而是给自己争取 5 秒钟：“我看一下我的日程，待会回复你可以吗？”',
      '请相信：一个健康、值得维系的关系，绝不会因为你温和的一次拒绝而破碎。反而，清晰的边界才会让真实的爱与尊重得以扎根。',
    ],
  },
  {
    id: 'article-6',
    title: '允许自己不完美：走出冒名顶替感的心理束缚',
    category: '自我关怀',
    sub: '你远比自己想象的更值得被爱与被认可。',
    readTime: '4 分钟',
    tags: ['冒名顶替综合征', '接纳真实', '自我肯定'],
    summary:
      '总觉得自己取得的成绩全靠运气，生怕哪一天被别人“拆穿”真实水平？这种普遍的冒名顶替现象往往困扰着最优秀、最认真的人。',
    keyTakeaways: [
      '超过 70% 的人在人生某些阶段都曾经历过冒名顶替感',
      '运气也是实力与准备碰撞出的火花，不必刻意抹杀自己的努力',
      '允许自己做一个真实的、偶有局限但依然发光的人',
    ],
    paragraphs: [
      '“我只是运气好碰巧赶上了”、“如果大家知道我其实懂的没那么多，一定会很失望吧”……在心理学中，这种无法将自己的成功内化、长期担心自己是“骗子”的感受被称为冒名顶替综合征（Impostor Syndrome）。',
      '讽刺的是，冒名顶替感极少出现在真正不称职的人身上，它最常光顾的是那些对自己要求极高、富有责任心和反思能力的优秀者。因为他们知道知识的汪洋有多大，所以总觉得自己掌握的只是水滴。',
      '学会拥抱不完美：把“我必须知道所有答案”转变成“我是一个终身学习者，不知道没关系，我可以慢慢去了解”。',
      '世界爱你的真实，胜过爱你的无瑕。允许自己停下来歇一歇，给那个一路认真前行、已走过许多风雨的自己一个大大的拥抱。',
    ],
  },
]
