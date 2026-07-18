export interface LogTailData {
  content: string
  path: string
  size: number
  modifiedAt: string
  truncated: boolean
}

export function getLogsURL(endpointURL: string, tail: number) {
  const url = new URL(endpointURL)
  const graphqlPath = /\/graphql\/?$/

  url.pathname = graphqlPath.test(url.pathname) ? url.pathname.replace(graphqlPath, '/api/logs') : '/api/logs'
  url.search = ''
  url.hash = ''
  url.searchParams.set('tail', String(tail))

  return url
}

export async function fetchLogTail(endpointURL: string, token: string, tail: number, signal?: AbortSignal) {
  const response = await fetch(getLogsURL(endpointURL, tail), {
    headers: {
      authorization: `Bearer ${token}`,
    },
    signal,
  })

  if (!response.ok) {
    const message = (await response.text()).trim()
    throw new Error(message || `HTTP ${response.status}`)
  }

  return response.json() as Promise<LogTailData>
}
