import { useQuery } from '@tanstack/react-query'
import { fetchSettings } from '../lib/api'

export function useSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['explorer-settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  })

  const labelDisplayName = (label: string): string =>
    settings?.labels[label]?.displayName ?? label

  const isLabelVisible = (label: string): boolean =>
    settings?.labels[label]?.visible ?? true

  const propertyDisplayName = (prop: string): string =>
    settings?.properties[prop]?.displayName ?? prop

  const relTypeDisplayName = (type: string): string =>
    settings?.relationshipTypes[type]?.displayName ?? type

  return {
    settings,
    isLoading,
    labelDisplayName,
    isLabelVisible,
    propertyDisplayName,
    relTypeDisplayName,
  }
}
