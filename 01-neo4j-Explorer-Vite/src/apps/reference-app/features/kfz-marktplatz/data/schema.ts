import type { LucideIcon } from 'lucide-react'

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  description: string
  slug: string
}

export interface UseCase {
  id: string
  title: string
  description: string
  productIds: string[]
  icon: LucideIcon
}

export interface Product {
  id: string
  name: string
  shortDescription: string
  category: string
  highlights: string[]
  icon: LucideIcon
}

export interface Insurer {
  id: string
  name: string
  logoUrl: string
}
