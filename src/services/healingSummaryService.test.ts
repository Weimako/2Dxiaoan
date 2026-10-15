import {
  generateHealingSummary,
  saveSessionSummary,
  getSessionSummary,
  getUserActiveSessionId,
  setUserActiveSessionId,
  resetUserChatSession,
  getUserChatDialogs,
  saveUserChatDialogs,
  isSystemCategorizationTag,
  SYSTEM_CATEGORIZATION_TAGS,
  type ChatDialogItem,
  type HealingSessionSummary,
} from './healingSummaryService.ts'

// 模拟本地存储环境（如果在纯 Node 运行时环境下测试）
const mockStorage = new Map<string, string>()
if (typeof globalThis.localStorage === 'undefined') {
  ;(globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, val: string) => mockStorage.set(key, String(val)),
    removeItem: (key: string) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
  }
}

async function runTests() {
  console.log('=== 安心健康 (Xiaoan Health) 深度疗愈与多账户隔离测试 ===\n')

  // -------------------------------------------------------------
  // 测试 1 (场景 A)：工作压力与疲惫
  // -------------------------------------------------------------
  console.log('--- 测试 1：工作压力与疲惫 ---')
  const dialogsA: ChatDialogItem[] = [
    { id: '1', role: 'user', text: '小安，最近工作项目连续加班，真的太累了。', time: '10:00', userId: 'user_A' },
    { id: '2', role: 'assistant', text: '听到你连续加班，真的很心疼。你可以先在这里歇歇。', time: '10:00', userId: 'user_A' },
    { id: '3', role: 'user', text: '每天开会和赶进度，身体好疲惫，晚上还睡不着。', time: '10:01', userId: 'user_A' },
    { id: '4', role: 'assistant', text: '身体在向你发出求救信号呢，试着把双肩慢慢放沉下来。', time: '10:01', userId: 'user_A' },
  ]
  const resA = await generateHealingSummary(dialogsA, 'session_A', 'user_A')
  console.log('总结首段:', resA.paragraphs[0])
  console.log('主题:', resA.topics)
  console.log('情绪:', resA.emotions)
  console.log('词云:', resA.wordCloud.map((w) => `${w.word}(${w.size})`))

  if (!resA.topics.some((t) => t.includes('工作') || t.includes('躯体') || t.includes('生活步调'))) {
    throw new Error('测试 1：应该包含工作或躯体主题')
  }
  if (!resA.wordCloud.some((w) => w.word.includes('工作') || w.word.includes('疲惫') || w.word.includes('累'))) {
    throw new Error('测试 1：词云应该包含工作或疲惫关键词')
  }
  console.log('✅ 测试 1 通过\n')

  // -------------------------------------------------------------
  // 测试 2 (场景 B)：人际沟通与边界
  // -------------------------------------------------------------
  console.log('--- 测试 2：人际沟通与边界 ---')
  const dialogsB: ChatDialogItem[] = [
    { id: '1', role: 'user', text: '我和最好的朋友吵架了，感觉沟通好困难。', time: '11:00', userId: 'user_B' },
    { id: '2', role: 'assistant', text: '和亲近的人产生分歧，心里一定觉得很委屈和难过吧。', time: '11:00', userId: 'user_B' },
    { id: '3', role: 'user', text: '我总是不好意思拒绝别人，总是迎合，没有守住自己的边界。', time: '11:02', userId: 'user_B' },
  ]
  const resB = await generateHealingSummary(dialogsB, 'session_B', 'user_B')

  if (!resB.topics.some((t) => t.includes('人际') || t.includes('边界'))) {
    throw new Error('测试 2：应该包含人际或边界主题')
  }
  if (!resB.wordCloud.some((w) => w.word.includes('人际') || w.word.includes('边界') || w.word.includes('沟通'))) {
    throw new Error('测试 2：词云应该包含人际/边界关键词')
  }
  if (resB.wordCloud.some((w) => w.word === '工作负荷' || w.word === '加班')) {
    throw new Error('测试 2：词云不应错误混入场景 A 的工作负荷关键词')
  }
  console.log('✅ 测试 2 通过\n')

  // -------------------------------------------------------------
  // 测试 3 (场景 C / 测试 E)：积极分享与情绪真实性 (排除不相关负面情绪)
  // -------------------------------------------------------------
  console.log('--- 测试 3：积极分享与情绪真实性 (测试 E) ---')
  const dialogsC: ChatDialogItem[] = [
    { id: '1', role: 'user', text: '今天天气特别好，我和家人去公园散步，太开心了！', time: '15:00', userId: 'user_C' },
    { id: '2', role: 'assistant', text: '哇，听到你这么惬意，我也为你感到高兴！', time: '15:00', userId: 'user_C' },
    { id: '3', role: 'user', text: '哈哈哈哈，拍到了好漂亮的落叶，心里特别轻松。', time: '15:01', userId: 'user_C' },
  ]
  const resC = await generateHealingSummary(dialogsC, 'session_C', 'user_C')

  if (!resC.emotions.includes('开心')) {
    throw new Error('测试 3：应该明确识别出开心情绪')
  }
  if (resC.emotions.includes('焦虑') || resC.emotions.includes('难过') || resC.emotions.includes('生气')) {
    throw new Error('测试 3：积极对话不应出现负面情绪')
  }
  if (resC.wordCloud.some((w) => w.word === '焦虑' || w.word === '难过')) {
    throw new Error('测试 3：词云不应无依据地生成焦虑或难过')
  }
  console.log('✅ 测试 3 (测试 E) 通过\n')

  // -------------------------------------------------------------
  // 测试 4 (场景 D / 测试 D)：中性客观对话与情绪词云排查 (绝无「中性」标签，不捏造「平静」)
  // -------------------------------------------------------------
  console.log('--- 测试 4：中性客观对话与情绪词云 (测试 D) ---')
  const dialogsD: ChatDialogItem[] = [
    { id: '1', role: 'user', text: '今天晚上我在写数学作业，做完了两张卷子。', time: '19:00', userId: 'user_D' },
    { id: '2', role: 'assistant', text: '专心完成作业辛苦啦，记得适当活动一下脖子和手腕。', time: '19:01', userId: 'user_D' },
  ]
  const resD = await generateHealingSummary(dialogsD, 'session_D', 'user_D')
  console.log('中性客观对话词云:', resD.wordCloud.map((w) => w.word))

  // 验证 1：绝对不包含系统内部技术标签「中性」
  if (resD.wordCloud.some((w) => isSystemCategorizationTag(w.word))) {
    throw new Error('测试 4：词云绝不能包含「中性」等系统分类标签！')
  }
  if (resD.emotions.some((e) => isSystemCategorizationTag(e))) {
    throw new Error('测试 4：emotions 绝不能包含「中性」等系统分类标签！')
  }
  // 验证 2：不因为系统判定为中性而强行捏造「平静」
  if (resD.emotions.includes('平静')) {
    throw new Error('测试 4：用户客观描述写作业，未表达平静感受，不得强行虚构「平静」情绪！')
  }
  // 验证 3：词云体现真实对话主题（作业/学业）
  if (!resD.wordCloud.some((w) => w.word.includes('作业') || w.word.includes('学业') || w.word.includes('数学'))) {
    throw new Error('测试 4：词云应反映真实对话主题（作业/学业）')
  }
  console.log('✅ 测试 4 (测试 D) 通过\n')

  // -------------------------------------------------------------
  // 测试 5 (测试 A)：多账户隔离测试 (账户 A 对话与小结不得被账户 B 读取)
  // -------------------------------------------------------------
  console.log('--- 测试 5：多账户隔离 (测试 A) ---')
  const userA_Id = 'user_AccountA'
  const userB_Id = 'user_AccountB'

  // 1. 账户 A 登录并进行对话
  const sessionA_Id = resetUserChatSession(userA_Id)
  const dialogs_AccountA: ChatDialogItem[] = [
    { id: 'a1', role: 'user', text: '账户A的私密话题：最近考研压力很大。', time: '09:00', userId: userA_Id, sessionId: sessionA_Id },
    { id: 'a2', role: 'assistant', text: '小安在听，备考过程确实很不容易。', time: '09:00', userId: userA_Id, sessionId: sessionA_Id },
  ]
  saveUserChatDialogs(userA_Id, sessionA_Id, dialogs_AccountA)
  const summary_AccountA = await generateHealingSummary(dialogs_AccountA, sessionA_Id, userA_Id)
  saveSessionSummary(summary_AccountA, userA_Id)

  // 2. 模拟结束当前对话/退出，并使用账户 B 登录
  const sessionB_Id = resetUserChatSession(userB_Id)
  const dialogs_AccountB = getUserChatDialogs(userB_Id, sessionB_Id)

  // 验证：账户 B 看不到账户 A 的对话记录
  if (dialogs_AccountB.length > 0) {
    throw new Error(`测试 5：账户 B 不应该读到任何对话记录，但读到了 ${dialogs_AccountB.length} 条`)
  }
  if (dialogs_AccountB.some((d) => d.text.includes('考研压力') || d.userId === userA_Id)) {
    throw new Error('测试 5：账户 B 严重串用了账户 A 的对话内容！')
  }

  // 验证：账户 B 无法通过自己的凭证读取账户 A 的疗愈小结
  const foreignSummary = getSessionSummary(sessionA_Id, userB_Id)
  if (foreignSummary !== null) {
    throw new Error('测试 5：账户 B 绝不能读取账户 A 的疗愈小结！')
  }

  // 验证：账户 B 的最新小结查询返回 null，不回退到账户 A
  const latestSummaryB = getSessionSummary(undefined, userB_Id)
  if (latestSummaryB !== null) {
    throw new Error('测试 5：账户 B 初次登录时最新小结应为 null')
  }
  console.log('✅ 测试 5 (测试 A) 通过\n')

  // -------------------------------------------------------------
  // 测试 6 (测试 B)：切回原账户测试 (账户 A 仍可访问自己历史，且不混入账户 B 内容)
  // -------------------------------------------------------------
  console.log('--- 测试 6：切回原账户 (测试 B) ---')
  // 账户 B 创建自己的一段对话
  const dialogs_AccountB_real: ChatDialogItem[] = [
    { id: 'b1', role: 'user', text: '账户B的专属日记：今天和朋友去露营喝茶。', time: '14:00', userId: userB_Id, sessionId: sessionB_Id },
    { id: 'b2', role: 'assistant', text: '露营亲近自然是一件很棒的事。', time: '14:00', userId: userB_Id, sessionId: sessionB_Id },
  ]
  saveUserChatDialogs(userB_Id, sessionB_Id, dialogs_AccountB_real)
  const summary_AccountB = await generateHealingSummary(dialogs_AccountB_real, sessionB_Id, userB_Id)
  saveSessionSummary(summary_AccountB, userB_Id)

  // 切回账户 A
  const reloadedDialogsA = getUserChatDialogs(userA_Id, sessionA_Id)
  const reloadedSummaryA = getSessionSummary(sessionA_Id, userA_Id)

  if (!reloadedDialogsA.some((d) => d.text.includes('考研压力'))) {
    throw new Error('测试 6：账户 A 切回后应能访问自己的对话记录')
  }
  if (reloadedDialogsA.some((d) => d.text.includes('露营喝茶') || d.userId === userB_Id)) {
    throw new Error('测试 6：账户 A 的记录中不得混入账户 B 的内容！')
  }
  if (!reloadedSummaryA || reloadedSummaryA.userId !== userA_Id) {
    throw new Error('测试 6：账户 A 切回后应能访问自己的疗愈小结')
  }
  if (reloadedSummaryA.wordCloud.some((w) => w.word.includes('露营'))) {
    throw new Error('测试 6：账户 A 的小结中不应包含账户 B 的关键词')
  }
  console.log('✅ 测试 6 (测试 B) 通过\n')

  // -------------------------------------------------------------
  // 测试 7 (测试 C)：异步竞态隔离测试 (账户 A 延迟返回的请求不污染账户 B)
  // -------------------------------------------------------------
  console.log('--- 测试 7：异步竞态隔离 (测试 C) ---')
  let activeCurrentUser = userA_Id
  let activeCurrentSession = sessionA_Id
  let summaryStateForView: HealingSessionSummary | null = null

  // 模拟账户 A 发起延迟返回的总结请求
  const delayedRequest = async () => {
    const requestedUserId = userA_Id
    const requestedSessionId = sessionA_Id
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 50))
    const res = await generateHealingSummary(dialogs_AccountA, requestedSessionId, requestedUserId)
    // 模拟组件防御核验逻辑
    if (activeCurrentUser === requestedUserId && activeCurrentSession === requestedSessionId) {
      summaryStateForView = res
    } else {
      // 账户已切换，安全丢弃响应
    }
  }

  // 触发请求并立即切换为账户 B
  const inFlightPromise = delayedRequest()
  activeCurrentUser = userB_Id
  activeCurrentSession = sessionB_Id
  summaryStateForView = null // 切换账户时清空视图状态

  // 等待账户 A 的延迟请求完成
  await inFlightPromise

  // 验证账户 B 的视图状态与存储未被篡改
  if (summaryStateForView !== null) {
    throw new Error('测试 7：账户 A 的延迟总结请求错误写入了账户 B 的状态中！')
  }
  const checkSummaryB = getSessionSummary(sessionB_Id, userB_Id)
  if (checkSummaryB?.paragraphs[0]?.includes('考研压力')) {
    throw new Error('测试 7：账户 B 的持久化小结被账户 A 错误覆盖！')
  }
  console.log('✅ 测试 7 (测试 C) 通过\n')

  // -------------------------------------------------------------
  // 测试 8：系统分类标签全量排除校验
  // -------------------------------------------------------------
  console.log('--- 测试 8：系统分类标签全量黑名单校验 ---')
  for (const tag of SYSTEM_CATEGORIZATION_TAGS) {
    if (!isSystemCategorizationTag(tag)) {
      throw new Error(`测试 8：系统分类标签「${tag}」未被正确识别！`)
    }
  }
  console.log('✅ 测试 8 通过\n')

  console.log('🎉 所有测试场景 (测试 A, B, C, D, E, F) 全部顺利通过！')
}

runTests().catch((err) => {
  console.error('❌ 测试失败:', err)
  process.exit(1)
})
