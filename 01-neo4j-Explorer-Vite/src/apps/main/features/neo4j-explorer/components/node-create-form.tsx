import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNodeProperties, createNode } from '../lib/api'
import { Button } from '@/apps/main/components/ui/button'
import { Input } from '@/apps/main/components/ui/input'
import { Label } from '@/apps/main/components/ui/label'
import { Skeleton } from '@/apps/main/components/ui/skeleton'
import { toast } from 'sonner'

interface Props {
  label: string
  onCreated: () => void
  onCancel: () => void
}

export function NodeCreateForm({ label, onCreated, onCancel }: Props) {
  const { data: knownProps, isLoading } = useQuery({
    queryKey: ['node-properties', label],
    queryFn: () => fetchNodeProperties(label),
  })

  const properties = knownProps ?? []
  // id immer anbieten
  const fields = properties.includes('id')
    ? properties
    : ['id', ...properties]
  const filtered = fields.filter(
    (f) => !['createdAt', 'updatedAt'].includes(f)
  )

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const f of filtered) {
      init[f] =
        f === 'id'
          ? `${label.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`
          : ''
    }
    return init
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createNode(label, values)
      toast.success(`Node :${label} erstellt`)
      onCreated()
    } catch (err) {
      toast.error(`Fehler: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <Skeleton className='h-40 w-full' />

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Neuen :{label} erstellen</h2>
      <form onSubmit={handleSubmit} className='space-y-3'>
        {filtered.map((prop) => (
          <div
            key={prop}
            className='grid grid-cols-[200px_1fr] items-center gap-3'
          >
            <Label>{prop}</Label>
            <Input
              value={values[prop] ?? ''}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [prop]: e.target.value }))
              }
            />
          </div>
        ))}
        <div className='flex gap-2'>
          <Button type='submit' disabled={saving}>
            {saving ? 'Erstelle...' : 'Erstellen'}
          </Button>
          <Button type='button' variant='outline' onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  )
}
