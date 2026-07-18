export interface LogSearchResult {
  content: string
  matchCount: number
  active: boolean
  error: string | null
}

export function searchLogLines(
  content: string,
  query: string,
  regexMode: boolean,
  caseSensitive: boolean,
): LogSearchResult {
  if (!query) {
    return { content, matchCount: 0, active: false, error: null }
  }

  let matches: (line: string) => boolean
  if (regexMode) {
    let expression: RegExp
    try {
      expression = new RegExp(query, caseSensitive ? '' : 'i')
    } catch (error) {
      return {
        content,
        matchCount: 0,
        active: true,
        error: error instanceof Error ? error.message : String(error),
      }
    }
    matches = (line) => expression.test(line)
  } else {
    const expected = caseSensitive ? query : query.toLocaleLowerCase()
    matches = caseSensitive
      ? (line) => line.includes(expected)
      : (line) => line.toLocaleLowerCase().includes(expected)
  }

  const lines = content.split(/\r?\n/)
  if (lines.at(-1) === '') lines.pop()
  const matchedLines = lines.filter(matches)

  return {
    content: matchedLines.join('\n'),
    matchCount: matchedLines.length,
    active: true,
    error: null,
  }
}
