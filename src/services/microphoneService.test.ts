import assert from 'node:assert'
import test from 'node:test'
import {
  parseMicrophoneError,
  checkMicrophonePrerequisites,
  stopMediaStream,
} from './microphoneService.ts'

test('1. 非浏览器环境能够安全进行前置条件检查', () => {
  const result = checkMicrophonePrerequisites()
  assert.strictEqual(result.supported, false)
  assert.ok(result.error)
  assert.strictEqual(result.error?.code, 'UNSUPPORTED')
})

test('2. NotAllowedError 正确识别为权限未开启并提供指引', () => {
  const err = new Error('Permission denied')
  err.name = 'NotAllowedError'

  const info = parseMicrophoneError(err)
  assert.strictEqual(info.code, 'NOT_ALLOWED')
  assert.strictEqual(info.title, '麦克风访问权限未开启')
  assert.strictEqual(info.canRetry, true)
  assert.ok(info.instructions.length >= 2)
  assert.ok(info.instructions[0].includes('地址栏') || info.instructions[0].includes('权限'))
})

test('3. NotFoundError 正确识别为未检测到录音设备', () => {
  const err = new Error('Requested device not found')
  err.name = 'NotFoundError'

  const info = parseMicrophoneError(err)
  assert.strictEqual(info.code, 'NOT_FOUND')
  assert.strictEqual(info.title, '未检测到麦克风录音设备')
  assert.ok(info.instructions.some((s) => s.includes('外接') || s.includes('声音设置')))
})

test('4. NotReadableError 正确识别为麦克风被其他软件独占', () => {
  const err = new Error('Device in use')
  err.name = 'NotReadableError'

  const info = parseMicrophoneError(err)
  assert.strictEqual(info.code, 'NOT_READABLE')
  assert.strictEqual(info.title, '麦克风已被其他应用占用')
  assert.ok(info.instructions.some((s) => s.includes('会议') || s.includes('占用')))
})

test('5. SecurityError 正确识别为安全策略限制', () => {
  const err = new Error('Permissions-Policy denied')
  err.name = 'SecurityError'

  const info = parseMicrophoneError(err)
  assert.strictEqual(info.code, 'SECURITY_ERROR')
  assert.strictEqual(info.title, '安全策略限制麦克风访问')
  assert.ok(info.instructions.some((s) => s.includes('HTTPS') || s.includes('iframe')))
})

test('6. stopMediaStream 能安全释放所有轨道并不对空值报错', () => {
  // 测试空值防崩
  assert.doesNotThrow(() => {
    stopMediaStream(null)
    stopMediaStream(undefined)
  })

  // 测试轨道真实被调用 stop()
  let stopped = false
  const mockTrack = {
    stop: () => {
      stopped = true
    },
  } as any
  const mockStream = {
    getTracks: () => [mockTrack],
  } as any

  stopMediaStream(mockStream)
  assert.strictEqual(stopped, true, '应主动调用轨道的 stop() 方法释放硬件')
})
