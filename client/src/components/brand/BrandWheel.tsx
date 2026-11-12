import { useEffect, useRef } from 'react'

/** SVG logos for each brand — monochrome white paths */
const BRANDS = [
  {
    name: 'Toyota',
    svg: (
      <svg viewBox="0 0 100 60" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <ellipse cx="50" cy="30" rx="28" ry="18" fill="none" stroke="white" strokeWidth="5"/>
        <ellipse cx="50" cy="30" rx="12" ry="18" fill="none" stroke="white" strokeWidth="5"/>
        <ellipse cx="50" cy="13" rx="22" ry="5.5" fill="none" stroke="white" strokeWidth="5"/>
      </svg>
    ),
  },
  {
    name: 'BMW',
    svg: (
      <svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="5"/>
        <circle cx="50" cy="50" r="32" fill="none" stroke="white" strokeWidth="2"/>
        <line x1="50" y1="18" x2="50" y2="82" stroke="white" strokeWidth="4"/>
        <line x1="18" y1="50" x2="82" y2="50" stroke="white" strokeWidth="4"/>
        <path d="M50 18 A32 32 0 0 1 82 50 L50 50 Z" fill="white" opacity="0.9"/>
        <path d="M50 82 A32 32 0 0 1 18 50 L50 50 Z" fill="white" opacity="0.9"/>
      </svg>
    ),
  },
  {
    name: 'Mercedes',
    svg: (
      <svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="5"/>
        <path d="M50 8 L50 50 M50 50 L82 70 M50 50 L18 70" stroke="white" strokeWidth="5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Porsche',
    svg: (
      <svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <rect x="8" y="8" width="84" height="84" rx="4" fill="none" stroke="white" strokeWidth="4"/>
        <line x1="50" y1="8" x2="50" y2="92" stroke="white" strokeWidth="4"/>
        <line x1="8" y1="50" x2="92" y2="50" stroke="white" strokeWidth="4"/>
        <rect x="18" y="18" width="28" height="28" rx="2" fill="white" opacity="0.8"/>
        <rect x="54" y="54" width="28" height="28" rx="2" fill="white" opacity="0.8"/>
        <text x="50" y="57" textAnchor="middle" fontSize="10" fill="black" fontWeight="bold" fontFamily="sans-serif">P</text>
      </svg>
    ),
  },
  {
    name: 'Audi',
    svg: (
      <svg viewBox="0 0 140 55" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="25" cy="27" r="20" fill="none" stroke="white" strokeWidth="4.5"/>
        <circle cx="51" cy="27" r="20" fill="none" stroke="white" strokeWidth="4.5"/>
        <circle cx="77" cy="27" r="20" fill="none" stroke="white" strokeWidth="4.5"/>
        <circle cx="103" cy="27" r="20" fill="none" stroke="white" strokeWidth="4.5"/>
      </svg>
    ),
  },
  {
    name: 'Honda',
    svg: (
      <svg viewBox="0 0 100 80" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <text x="50" y="62" textAnchor="middle" fontSize="72" fontWeight="900" fontFamily="Arial Black, sans-serif" fill="white">H</text>
      </svg>
    ),
  },
]

type BrandWheelProps = {
  className?: string
}

export function BrandWheel({ className }: BrandWheelProps) {
  const orbitRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const angleRef = useRef(0)

  useEffect(() => {
    let lastTime = performance.now()

    function tick(now: number) {
      const dt = now - lastTime
      lastTime = now
      angleRef.current = (angleRef.current + dt * 0.025) % 360

      if (orbitRef.current) {
        orbitRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const count = BRANDS.length
  const radius = 72

  return (
    <div
      data-brand-wheel
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
      aria-hidden
    >
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_38%,rgba(255,255,255,0.10),transparent_55%)]" />

      {/* Orbit pivot — positioned at 60% 38% of the card */}
      <div className="absolute" style={{ left: '60%', top: '38%' }}>
        {/* Rotating ring */}
        <div
          ref={orbitRef}
          className="absolute"
          style={{ width: 0, height: 0, willChange: 'transform' }}
        >
          {/* Faint orbit circle */}
          <div
            className="absolute rounded-full border border-white/10"
            style={{
              width: radius * 2,
              height: radius * 2,
              left: -radius,
              top: -radius,
            }}
          />

          {BRANDS.map((brand, i) => {
            const angleDeg = (360 / count) * i - 90
            const angleRad = (angleDeg * Math.PI) / 180
            const x = Math.cos(angleRad) * radius
            const y = Math.sin(angleRad) * radius
            const counterRotate = -((360 / count) * i - 90)

            return (
              <div
                key={brand.name}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${counterRotate}deg)`,
                  willChange: 'transform',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full border border-white/25 bg-white/[0.08] backdrop-blur-sm"
                  style={{ width: 40, height: 40 }}
                  title={brand.name}
                >
                  <div className="w-[26px] h-[26px]">{brand.svg}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Centre badge — NEXUS, static */}
        <div
          className="absolute flex items-center justify-center rounded-full border border-white/30 bg-white/[0.12] backdrop-blur-sm"
          style={{
            width: 54,
            height: 54,
            left: -27,
            top: -27,
          }}
        >
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-white">NEXUS</span>
        </div>
      </div>
    </div>
  )
}

export const brandWheelLabels = BRANDS.map((b) => b.name)
