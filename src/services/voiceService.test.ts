import assert from 'node:assert'
import test from 'node:test'
import {
  VOICE_PROFILES,
  VOICE_PROFILE_LIST,
  type VoiceProfileId,
  getSavedVoiceProfileId,
  saveVoiceProfileId,
  resolveBestBrowserVoice,
} from './voiceService.ts'

test('1. 四种音色配置完整存在且参数合法', () => {
  const ids: VoiceProfileId[] = ['adultMale', 'adultFemale', 'boy', 'girl']

  assert.strictEqual(VOICE_PROFILE_LIST.length, 4)

  for (const id of ids) {
    const profile = VOICE_PROFILES[id]
    assert.ok(profile, `Profile ${id} should exist`)
    assert.strictEqual(profile.id, id)
    assert.ok(profile.label.length > 0, `Profile ${id} must have a label`)
    assert.ok(profile.pitch > 0 && profile.pitch <= 2.0, `Profile ${id} pitch out of bounds: ${profile.pitch}`)
    assert.ok(profile.rate > 0 && profile.rate <= 2.0, `Profile ${id} rate out of bounds: ${profile.rate}`)
    assert.ok(profile.cloudVoiceId.length > 0, `Profile ${id} must have cloudVoiceId`)
    assert.ok(profile.preferredKeywords.length > 0, `Profile ${id} must have preferredKeywords`)
    assert.ok(profile.samplePhrase.length > 0, `Profile ${id} must have samplePhrase`)
  }
})

test('2. 成年男声音高与语速稳重温和 (pitch < 1.0)', () => {
  const male = VOICE_PROFILES.adultMale
  assert.strictEqual(male.label, '成年男声')
  assert.strictEqual(male.gender, 'male')
  assert.strictEqual(male.ageGroup, 'adult')
  assert.ok(male.pitch <= 0.9, '成年男声音高应偏低深沉')
  assert.ok(male.cloudVoiceId.includes('Yunxi'), '应配置真实云端云希声线 ID')
})

test('3. 成年女声音色温润轻柔 (pitch ~ 1.02)', () => {
  const female = VOICE_PROFILES.adultFemale
  assert.strictEqual(female.label, '成年女声')
  assert.strictEqual(female.gender, 'female')
  assert.strictEqual(female.ageGroup, 'adult')
  assert.ok(female.pitch >= 0.95 && female.pitch <= 1.15, '成年女声音高应在温润自然范围')
  assert.ok(female.cloudVoiceId.includes('Xiaoxiao'), '应配置真实云端晓晓声线 ID')
})

test('4. 男童声具备青年/童声音高与生机语速 (pitch > 1.25)', () => {
  const boy = VOICE_PROFILES.boy
  assert.strictEqual(boy.label, '男孩')
  assert.strictEqual(boy.gender, 'male')
  assert.strictEqual(boy.ageGroup, 'child')
  assert.ok(boy.pitch > 1.25, '男孩音高应明显高于成人')
  assert.ok(boy.cloudVoiceId.includes('Yunjian'), '应配置真实云端云健/童声 ID')
})

test('5. 女童声具备清甜高音调与活泼语速 (pitch > 1.40)', () => {
  const girl = VOICE_PROFILES.girl
  assert.strictEqual(girl.label, '女孩')
  assert.strictEqual(girl.gender, 'female')
  assert.strictEqual(girl.ageGroup, 'child')
  assert.ok(girl.pitch > 1.40, '女孩音高应具有甜美童声特征')
  assert.ok(girl.cloudVoiceId.includes('Xiaoyi'), '应配置真实云端小艺/幼童 ID')
})

test('6. 音色四种配置音高各不相同，具备真实声学可辨识度', () => {
  const pitches = [
    VOICE_PROFILES.adultMale.pitch,
    VOICE_PROFILES.adultFemale.pitch,
    VOICE_PROFILES.boy.pitch,
    VOICE_PROFILES.girl.pitch,
  ]
  const uniquePitches = new Set(pitches)
  assert.strictEqual(uniquePitches.size, 4, '四种音色的声学音高应当互不相同，具备真实的听觉区分度')
})

test('7. 声音存储隔离与默认值容错机制', () => {
  // 无 window 环境下应优雅返回默认 adultFemale
  const defaultVal = getSavedVoiceProfileId('test_user_123')
  assert.strictEqual(defaultVal, 'adultFemale')
})
