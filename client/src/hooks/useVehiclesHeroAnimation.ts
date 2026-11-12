import { useEffect } from 'react'
import gsap from 'gsap'

export function useVehiclesHeroAnimation(isReady: boolean, deps: unknown[] = []) {
  useEffect(() => {
    if (!isReady) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const eyebrow = document.querySelector('[data-vehicles-eyebrow]')
      const titleLines = gsap.utils.toArray<HTMLElement>('[data-vehicles-title-line] > span')
      const subtitle = document.querySelector('[data-vehicles-hero-subtitle]')
      const cta = document.querySelector('[data-vehicles-hero-cta]')
      const stats = document.querySelectorAll('[data-vehicles-stat]')

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      
      if (eyebrow) {
        gsap.set(eyebrow, { opacity: 0, y: 10 })
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.65 }, 0.85)
      }

      if (titleLines.length) {
        gsap.set(titleLines, { y: '110%' })
        tl.to(titleLines, { y: 0, duration: 0.95, stagger: 0.11, ease: 'power4.out' }, 1)
      }

      if (subtitle) {
        gsap.set(subtitle, { opacity: 0, y: 18 })
        tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, 1.35)
      }

      if (cta) {
        gsap.set(cta, { opacity: 0, y: 14 })
        tl.to(cta, { opacity: 1, y: 0, duration: 0.7 }, 1.55)
      }

      if (stats.length) {
        gsap.set(stats, { opacity: 0, y: 16 })
        tl.to(stats, { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 }, 1.65)
      }
    })

    return () => ctx.revert()
  }, [isReady, ...deps])
}
