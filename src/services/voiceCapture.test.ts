import assert from 'node:assert'
import test from 'node:test'
import {
  detectPlatform,
  detectContainer,
  detectBestAudioMimeType,
  getPlatformCapabilities,
} from './voicePlatformAdapter.ts'
import { voiceCaptureService } from './voiceCaptureService.ts'

test('1. detectPlatform 在测试运行环境中具备容错回退能力', () => {
  const p = detectPlatform()
  assert.ok(['windows', 'macos', 'android', 'ios', 'linux', 'unknown'].includes(p))
})

test('2. detectContainer 能正确辨别运行容器', () => {
  const container = detectContainer()
  assert.ok(
    [
      'browser_desktop',
      'browser_mobile',
      'android_webview',
      'ios_webview',
      'standalone_pwa',
    ].includes(container)
  )
})

test('3. detectBestAudioMimeType 能安全返回类型结构而不抛出异常', () => {
  const res = detectBestAudioMimeType()
  assert.ok(typeof res.bestMime === 'string')
  assert.ok(Array.isArray(res.allSupported))
})

test('4. getPlatformCapabilities 返回结构完整且安全画像清晰', () => {
  const cap = getPlatformCapabilities()
  assert.ok(typeof cap.isSecureContext === 'boolean')
  assert.ok(typeof cap.canRecordAudio === 'boolean')
  assert.ok(typeof cap.canTranscribeLocally === 'boolean')
  assert.ok(typeof cap.recommendation === 'string')
})

test('5. voiceCaptureService 默认处于 idle 状态且能安全取消与释放', () => {
  assert.strictEqual(voiceCaptureService.getStatus(), 'idle')
  assert.strictEqual(voiceCaptureService.getLiveVolume(), 0)

  // 空状态下 cancel 和 release 应幂等且安全无报错
  assert.doesNotThrow(() => {
    voiceCaptureService.cancel()
    voiceCaptureService.release()
  })

  assert.strictEqual(voiceCaptureService.getStatus(), 'idle')
})
