import { Shield, Zap, Lock, Truck, FileText } from 'lucide-react'
import type { Product } from './schema'

export const products: Product[] = [
  {
    id: 'produkt-1',
    name: 'Produkt 1',
    shortDescription: 'Umfassende Lösung mit erweiterten Funktionen',
    category: 'kategorie-1',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: FileText,
  },
  {
    id: 'produkt-2',
    name: 'Produkt 2',
    shortDescription: 'Basis-Paket mit Standardfunktionen',
    category: 'kategorie-2',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: Shield,
  },
  {
    id: 'produkt-3',
    name: 'Produkt 3',
    shortDescription: 'Spezialisierte Lösung für spezifische Anforderungen',
    category: 'kategorie-3',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: Zap,
  },
  {
    id: 'produkt-4',
    name: 'Produkt 4',
    shortDescription: 'Premium-Variante mit vollem Funktionsumfang',
    category: 'kategorie-2',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: Lock,
  },
  {
    id: 'produkt-5',
    name: 'Produkt 5',
    shortDescription: 'Flexible Lösung für unterschiedliche Einsatzbereiche',
    category: 'kategorie-1',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: Shield,
  },
  {
    id: 'produkt-6',
    name: 'Produkt 6',
    shortDescription: 'Standard-Paket mit bewährten Grundfunktionen',
    category: 'kategorie-1',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: FileText,
  },
  {
    id: 'produkt-7',
    name: 'Produkt 7',
    shortDescription: 'Umfangreiche Lösung für professionelle Anwendungen',
    category: 'kategorie-3',
    highlights: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    icon: Truck,
  },
]
