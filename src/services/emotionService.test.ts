import assert from 'node:assert'
import test from 'node:test'
import { analyzeEmotion } from './emotionService.ts'

test('1. 哈哈哈 -> 开心', () => {
  const res = analyzeEmotion('哈哈哈')
  assert.ok(res.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'positive')
})

test('2. 哈哈哈哈哈 -> 开心', () => {
  const res = analyzeEmotion('哈哈哈哈哈')
  assert.ok(res.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'positive')
})

test('3. 嘿嘿 -> 偏积极开心', () => {
  const res = analyzeEmotion('嘿嘿')
  assert.ok(res.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res.moods)}`)
})

test('4. 笑死了 / 嘻嘻 -> 开心', () => {
  const res1 = analyzeEmotion('笑死了')
  assert.ok(res1.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res1.moods)}`)

  const res2 = analyzeEmotion('嘻嘻')
  assert.ok(res2.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res2.moods)}`)
})

test('5. 太好了，终于成功了 -> 开心', () => {
  const res = analyzeEmotion('太好了，终于成功了')
  assert.ok(res.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'positive')
})

test('6. 我今天很难过 -> 难过', () => {
  const res = analyzeEmotion('我今天很难过')
  assert.ok(res.moods.includes('难过'), `Expected 难过, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
})

test('7. 我很焦虑，不知道怎么办 -> 焦虑', () => {
  const res = analyzeEmotion('我很焦虑，不知道怎么办')
  assert.ok(res.moods.includes('焦虑'), `Expected 焦虑, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
})

test('8. 我真的很生气 -> 生气', () => {
  const res = analyzeEmotion('我真的很生气')
  assert.ok(res.moods.includes('生气'), `Expected 生气, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
})

test('9. 嗯 -> 中性或不明确', () => {
  const res = analyzeEmotion('嗯')
  assert.ok(
    res.moods.includes('中性') || res.moods.includes('不明确') || res.moods.includes('平静'),
    `Expected 中性/平静, got ${JSON.stringify(res.moods)}`
  )
  assert.strictEqual(res.valence, 'neutral')
})

test('10. 好的 / 收到 / 知道了 -> 中性或不明确', () => {
  for (const phrase of ['好的', '收到', '知道了', '哦']) {
    const res = analyzeEmotion(phrase)
    assert.ok(
      res.moods.includes('中性') || res.moods.includes('不明确') || res.moods.includes('平静'),
      `For "${phrase}" Expected 中性, got ${JSON.stringify(res.moods)}`
    )
    assert.strictEqual(res.valence, 'neutral')
  }
})

test('11. 我难过得都笑了 -> 难过与混合/复杂情绪', () => {
  const res = analyzeEmotion('我难过得都笑了')
  assert.ok(
    res.moods.includes('难过') && res.moods.includes('复杂'),
    `Expected 难过与复杂, got ${JSON.stringify(res.moods)}`
  )
  assert.strictEqual(res.valence, 'mixed')
})

test('12. 哈哈哈，我真的快崩溃了 -> 崩溃/焦虑（不得仅凭笑声判定开心）', () => {
  const res = analyzeEmotion('哈哈哈，我真的快崩溃了')
  assert.ok(
    res.moods.includes('崩溃') || res.moods.includes('焦虑'),
    `Expected 崩溃/焦虑, got ${JSON.stringify(res.moods)}`
  )
  assert.strictEqual(res.valence, 'negative')
  assert.ok(!res.moods.includes('开心'), '不得判定为开心')
})

test('13. 我一点也不开心 -> 否定反转为消极/难过（不能因开心误判为积极）', () => {
  const res = analyzeEmotion('我一点也不开心')
  assert.ok(res.moods.includes('难过'), `Expected 难过, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
  assert.ok(!res.moods.includes('开心'), '不能误判为开心')
})

test('14. 你真厉害，呵呵 -> 结合上下文判断反讽/无奈', () => {
  const res = analyzeEmotion('你真厉害，呵呵')
  assert.ok(
    res.moods.includes('无奈') || res.moods.includes('复杂'),
    `Expected 无奈, got ${JSON.stringify(res.moods)}`
  )
  assert.strictEqual(res.valence, 'negative')
})

test('15. 转折句测试：虽然很难过，但大家都在帮我，我挺开心的 -> 开心', () => {
  const res = analyzeEmotion('虽然很难过，但大家都在帮我，我挺开心的')
  assert.ok(res.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'positive')
})

test('16. 转折句测试：虽然成功了，但我其实很难过 -> 难过', () => {
  const res = analyzeEmotion('虽然成功了，但我其实很难过')
  assert.ok(res.moods.includes('难过'), `Expected 难过, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
})

test('17. 客观日常陈述 -> 中性', () => {
  const res = analyzeEmotion('今天晚上我在写数学作业')
  assert.ok(
    res.moods.includes('中性') || res.moods.includes('平静'),
    `Expected 中性, got ${JSON.stringify(res.moods)}`
  )
  assert.strictEqual(res.valence, 'neutral')
})

test('18. 纯数字/符号噪音 -> 中性', () => {
  const res = analyzeEmotion('12345 ......')
  assert.ok(res.moods.includes('中性'), `Expected 中性, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'neutral')
})

test('19. 独立「呵呵」 -> 歧义处理为无奈或不明确（不武断判定为开心或暴怒）', () => {
  const res = analyzeEmotion('呵呵')
  assert.ok(
    res.moods.includes('无奈') || res.moods.includes('不明确') || res.moods.includes('中性'),
    `Expected 无奈/不明确, got ${JSON.stringify(res.moods)}`
  )
  assert.ok(!res.moods.includes('开心'), '不得误判为积极开心')
  assert.ok(!res.moods.includes('生气'), '不得误判为严重愤怒')
})

test('20. 我好紧张 / 我很担心 -> 焦虑', () => {
  const res1 = analyzeEmotion('我好紧张')
  assert.ok(res1.moods.includes('焦虑'), `Expected 焦虑, got ${JSON.stringify(res1.moods)}`)
  assert.strictEqual(res1.valence, 'negative')

  const res2 = analyzeEmotion('我很担心')
  assert.ok(res2.moods.includes('焦虑'), `Expected 焦虑, got ${JSON.stringify(res2.moods)}`)
  assert.strictEqual(res2.valence, 'negative')
})

test('21. 气死我了 -> 愤怒/生气', () => {
  const res = analyzeEmotion('气死我了')
  assert.ok(res.moods.includes('生气'), `Expected 生气, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
})

test('22. 真棒 / 好开心 -> 开心积极', () => {
  const res1 = analyzeEmotion('真棒')
  assert.ok(res1.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res1.moods)}`)
  assert.strictEqual(res1.valence, 'positive')

  const res2 = analyzeEmotion('好开心')
  assert.ok(res2.moods.includes('开心'), `Expected 开心, got ${JSON.stringify(res2.moods)}`)
  assert.strictEqual(res2.valence, 'positive')
})

test('23. 没有很生气 / 一点也不焦虑 -> 否定消极翻转为平静', () => {
  const res1 = analyzeEmotion('没有很生气')
  assert.ok(
    res1.moods.includes('平静') || res1.moods.includes('中性'),
    `Expected 平静/中性, got ${JSON.stringify(res1.moods)}`
  )

  const res2 = analyzeEmotion('一点也不焦虑')
  assert.ok(
    res2.moods.includes('平静') || res2.moods.includes('中性'),
    `Expected 平静, got ${JSON.stringify(res2.moods)}`
  )
})

test('24. 我很伤心 -> 难过悲伤', () => {
  const res = analyzeEmotion('我很伤心')
  assert.ok(res.moods.includes('难过'), `Expected 难过, got ${JSON.stringify(res.moods)}`)
  assert.strictEqual(res.valence, 'negative')
})
