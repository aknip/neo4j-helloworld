import { type SVGProps } from 'react'

export function IconAnimationsEnabled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-name='icon-animations-enabled'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 79.86 51.14'
      {...props}
    >
      <g fill='#d9d9d9'>
        <rect x={0.53} y={0.5} width={78.83} height={50.14} rx={3.5} ry={3.5} />
        <path d='M75.86 1c1.65 0 3 1.35 3 3v43.14c0 1.65-1.35 3-3 3H4.03c-1.65 0-3-1.35-3-3V4c0-1.65 1.35-3 3-3h71.83m0-1H4.03c-2.21 0-4 1.79-4 4v43.14c0 2.21 1.79 4 4 4h71.83c2.21 0 4-1.79 4-4V4c0-2.21-1.79-4-4-4z' />
      </g>
      <rect
        x={5}
        y={5}
        width={70}
        height={41}
        rx={2}
        ry={2}
        fill='#fff'
      />
      {/* Play icon - animations enabled */}
      <path
        d='M32 18l18 12-18 12V18z'
        fill='#22c55e'
        opacity={0.8}
      />
      <text
        x='40'
        y='22'
        fontSize='8'
        fill='#666'
        textAnchor='middle'
        fontFamily='system-ui, sans-serif'
      >
        Animations
      </text>
      <text
        x='40'
        y='48'
        fontSize='6'
        fill='#999'
        textAnchor='middle'
        fontFamily='system-ui, sans-serif'
      >
        Enabled
      </text>
    </svg>
  )
}
