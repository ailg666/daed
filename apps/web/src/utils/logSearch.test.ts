import { searchLogLines } from './logSearch'

const logs = ['level=info dialer=hk-01', 'level=warning dialer=jp-02', 'level=error dialer=HK-03'].join('\n')

it('searches literal text without case sensitivity by default', () => {
  const result = searchLogLines(logs, 'hk', false, false)

  expect(result.matchCount).toBe(2)
  expect(result.content).toContain('hk-01')
  expect(result.content).toContain('HK-03')
})

it('supports case-sensitive literal searches', () => {
  const result = searchLogLines(logs, 'HK', false, true)

  expect(result.matchCount).toBe(1)
  expect(result.content).toContain('HK-03')
})

it('supports regular expressions', () => {
  const result = searchLogLines(logs, 'level=(warning|error)', true, false)

  expect(result.matchCount).toBe(2)
})

it('reports invalid regular expressions without hiding logs', () => {
  const result = searchLogLines(logs, '[', true, false)

  expect(result.error).not.toBeNull()
  expect(result.content).toBe(logs)
})
