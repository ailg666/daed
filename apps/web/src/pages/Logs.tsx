import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import { Download, RefreshCw, ScrollText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchLogTail } from '~/apis'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Switch } from '~/components/ui/switch'
import { endpointURLAtom, tokenAtom } from '~/store'

const lineOptions = [200, 500, 1000, 2000, 5000]

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 1) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** unitIndex

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function LogsPage() {
  const { t } = useTranslation()
  const endpointURL = useStore(endpointURLAtom)
  const token = useStore(tokenAtom)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const [tail, setTail] = useState(500)
  const [liveRefresh, setLiveRefresh] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)

  const logsQuery = useQuery({
    queryKey: ['logs', endpointURL, tail],
    queryFn: ({ signal }) => fetchLogTail(endpointURL, token, tail, signal),
    enabled: Boolean(endpointURL && token),
    refetchInterval: liveRefresh ? 2000 : false,
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!autoScroll || !logsQuery.data?.content || !logContainerRef.current) return

    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
  }, [autoScroll, logsQuery.data?.content])

  const downloadLogs = () => {
    if (!logsQuery.data?.content) return

    const blob = new Blob([logsQuery.data.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'daed.log'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const modifiedAt = logsQuery.data?.modifiedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(
        new Date(logsQuery.data.modifiedAt),
      )
    : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ScrollText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('logs.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('logs.description')}</p>
        </div>
      </div>

      <Card padding="none" className="gap-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('logs.tailLines')}</span>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={tail}
              onChange={(event) => setTail(Number(event.target.value))}
            >
              {lineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={liveRefresh} onCheckedChange={setLiveRefresh} />
            <span>{t('logs.liveRefresh')}</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={autoScroll} onCheckedChange={setAutoScroll} />
            <span>{t('logs.autoScroll')}</span>
          </label>

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={logsQuery.isFetching}
              onClick={() => logsQuery.refetch()}
            >
              <RefreshCw />
              {t('actions.refresh')}
            </Button>
            <Button variant="outline" size="sm" disabled={!logsQuery.data?.content} onClick={downloadLogs}>
              <Download />
              {t('logs.download')}
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-b bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="min-w-0">
            <span className="font-medium text-foreground">{t('logs.path')}: </span>
            <span className="break-all">{logsQuery.data?.path ?? '—'}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">{t('logs.fileSize')}: </span>
            {logsQuery.data ? formatBytes(logsQuery.data.size) : '—'}
          </div>
          <div className="flex items-center gap-2">
            <span>
              <span className="font-medium text-foreground">{t('logs.modifiedAt')}: </span>
              {modifiedAt}
            </span>
            {logsQuery.data?.truncated && <Badge variant="secondary">{t('logs.truncated')}</Badge>}
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="h-[calc(100vh-19rem)] min-h-[28rem] overflow-auto bg-zinc-950 p-4 font-mono text-xs leading-5 text-zinc-100"
        >
          {logsQuery.isError ? (
            <div className="whitespace-pre-wrap text-red-400">
              {t('logs.loadError')}: {logsQuery.error.message}
            </div>
          ) : (
            <pre className="min-w-max whitespace-pre">{logsQuery.data?.content || t('logs.empty')}</pre>
          )}
        </div>
      </Card>
    </div>
  )
}
