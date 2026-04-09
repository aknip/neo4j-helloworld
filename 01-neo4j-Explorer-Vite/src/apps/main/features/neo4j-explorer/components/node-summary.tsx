import { useState, useEffect, useRef, type JSX } from 'react'
import { RefreshCw } from 'lucide-react'
import { fetchNodeSummary } from '../lib/api'
import { Button } from '@/apps/main/components/ui/button'
import { Skeleton } from '@/apps/main/components/ui/skeleton'

// Module-level cache — survives component unmount/remount (sub-nav switches)
const summaryCache = new Map<string, string>()

export function clearSummaryCache() {
  summaryCache.clear()
}

/** Parse inline markdown (bold, italic, code) into React nodes */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Match **bold**, *italic*, `code`
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let match: RegExpExecArray | null
  let i = 0

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={i++}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={i++}>{match[3]}</em>)
    } else if (match[4]) {
      parts.push(
        <code key={i++} className='bg-muted rounded px-1 py-0.5 text-xs'>
          {match[4]}
        </code>
      )
    }
    last = match.index + match[0].length
  }
  if (last < text.length) {
    parts.push(text.slice(last))
  }
  return parts.length ? parts : [text]
}

function renderMarkdown(md: string): JSX.Element[] {
  const lines = md.split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={key++} className='list-disc space-y-1 pl-6'>
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trimEnd()

    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={key++} className='text-md mt-4 mb-2 font-medium'>
          {renderInline(trimmed.slice(4))}
        </h4>
      )
    } else if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={key++} className='mt-5 mb-2 text-lg font-semibold'>
          {renderInline(trimmed.slice(3))}
        </h3>
      )
    } else if (/^[-*]\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ''))
    } else if (trimmed === '') {
      flushList()
    } else {
      flushList()
      elements.push(
        <p key={key++} className='mb-1'>
          {renderInline(trimmed)}
        </p>
      )
    }
  }
  flushList()
  return elements
}

export function NodeSummary({ eid }: { eid: string }) {
  const [summary, setSummary] = useState<string | null>(
    summaryCache.get(eid) ?? null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentEidRef = useRef(eid)

  const loadSummary = (targetEid: string, skipCache = false) => {
    currentEidRef.current = targetEid

    if (!skipCache) {
      const cached = summaryCache.get(targetEid)
      if (cached) {
        setSummary(cached)
        setError(null)
        return
      }
    }

    setSummary(null)
    setError(null)
    setLoading(true)

    fetchNodeSummary(targetEid)
      .then((data) => {
        if (currentEidRef.current !== targetEid) return
        summaryCache.set(targetEid, data.summary)
        setSummary(data.summary)
      })
      .catch((err) => {
        if (currentEidRef.current !== targetEid) return
        const msg =
          err?.response?.data?.error ?? err?.message ?? 'Unbekannter Fehler'
        setError(msg)
      })
      .finally(() => {
        if (currentEidRef.current !== targetEid) return
        setLoading(false)
      })
  }

  useEffect(() => {
    loadSummary(eid)
  }, [eid])

  if (loading) {
    return (
      <div className='space-y-3'>
        <p className='text-muted-foreground text-sm'>
          Zusammenfassung wird generiert...
        </p>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
        <Skeleton className='h-4 w-2/3' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-4/5' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='space-y-3'>
        <p className='text-destructive text-sm'>{error}</p>
        <Button variant='outline' size='sm' onClick={() => loadSummary(eid, true)}>
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className='space-y-1'>
      <div className='flex justify-end'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            summaryCache.delete(eid)
            loadSummary(eid, true)
          }}
        >
          <RefreshCw size={14} className='me-1' />
          Neu generieren
        </Button>
      </div>
      <div className='text-sm leading-relaxed'>{renderMarkdown(summary)}</div>
    </div>
  )
}
