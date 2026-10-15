import assert from 'node:assert'
import test from 'node:test'
import type { EnergySourceOrigin } from '../components/EnergyCheckTool.tsx'

/**
 * 辅助函数：根据来源及回退值计算能量检测完成或返回时的目标页面
 */
export function resolveEnergyReturnTarget(
  source?: EnergySourceOrigin | string | null,
  fallbackOrigin: EnergySourceOrigin = 'tools'
): 'home' | 'tools' {
  const origin = source || fallbackOrigin
  if (origin === 'home') {
    return 'home'
  }
  return 'tools'
}

/**
 * 辅助函数：解析 hash 路由中的能量来源参数
 */
export function parseEnergyOriginFromHash(hash: string): EnergySourceOrigin {
  const cleanHash = hash.replace(/^#\/?/, '')
  const [, queryString] = cleanHash.split('?')
  const params = new URLSearchParams(queryString || '')
  const fromParam = params.get('from')
  if (fromParam === 'home') {
    return 'home'
  }
  return 'tools'
}

test('1. 从首页进入检测时，返回目标严格解析为 home', () => {
  const targetFromSource = resolveEnergyReturnTarget('home')
  assert.strictEqual(targetFromSource, 'home', '来源为 home 时必须返回 home')

  const parsedFromHash = parseEnergyOriginFromHash('#/tool-energy?from=home')
  assert.strictEqual(parsedFromHash, 'home', 'Hash 包含 from=home 时解析为 home')

  const targetFromHashParsed = resolveEnergyReturnTarget(parsedFromHash)
  assert.strictEqual(targetFromHashParsed, 'home', '基于 Hash 解析后跳转回 home')
})

test('2. 从能量工具箱进入检测时，返回目标解析为 tools', () => {
  const targetFromTools = resolveEnergyReturnTarget('tools')
  assert.strictEqual(targetFromTools, 'tools', '来源为 tools 时必须返回 tools')

  const targetFromToolbox = resolveEnergyReturnTarget('energy-toolbox')
  assert.strictEqual(targetFromToolbox, 'tools', '兼容 energy-toolbox 别名并映射为 tools')

  const parsedFromHashTools = parseEnergyOriginFromHash('#/tool-energy?from=tools')
  assert.strictEqual(parsedFromHashTools, 'tools', 'Hash 包含 from=tools 时解析为 tools')

  const parsedFromHashToolbox = parseEnergyOriginFromHash('#/tool-energy?from=energy-toolbox')
  assert.strictEqual(parsedFromHashToolbox, 'tools', 'Hash 包含 from=energy-toolbox 时解析为 tools')
})

test('3. 缺省或空参数时默认安全回退到 tools', () => {
  assert.strictEqual(resolveEnergyReturnTarget(null), 'tools')
  assert.strictEqual(resolveEnergyReturnTarget(undefined), 'tools')
  assert.strictEqual(parseEnergyOriginFromHash('#/tool-energy'), 'tools')
})
