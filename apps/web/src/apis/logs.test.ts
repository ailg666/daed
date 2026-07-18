import { getLogsURL } from './logs'

it('derives the logs endpoint from the configured GraphQL endpoint', () => {
  expect(getLogsURL('http://192.168.9.103:2026/graphql', 500).toString()).toBe(
    'http://192.168.9.103:2026/api/logs?tail=500',
  )
})

it('preserves a reverse proxy path prefix', () => {
  expect(getLogsURL('https://router.example/daed/graphql', 1000).toString()).toBe(
    'https://router.example/daed/api/logs?tail=1000',
  )
})
