import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGsapScrollAnimations(deps: unknown[] = []) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 56, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-fade-in]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((container) => {
        const items = container.querySelectorAll('[data-stagger-item]')
        if (!items.length) return
        gsap.fromTo(
          items,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.14,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      const heroSection = document.querySelector('[data-hero-section]')
      const heroMedia = document.querySelector('[data-hero-parallax]')
      const heroImage = document.querySelector('[data-hero-image]')

      if (heroSection && heroMedia) {
        gsap.to(heroMedia, {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        })
      }

      if (heroImage) {
        gsap.fromTo(
          heroImage,
          { scale: 1.12 },
          {
            scale: 1,
            duration: 2.8,
            ease: 'power2.out',
          }
        )
      }

      const heroTitleLines = gsap.utils.toArray<HTMLElement>('[data-hero-title-line] > span')
      if (heroTitleLines.length) {
        gsap.to(heroTitleLines, {
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power4.out',
          delay: 0.15,
        })
      }

      const heroEyebrow = document.querySelector('[data-hero-eyebrow]')
      const heroSearch = document.querySelector('[data-hero-search]')
      const heroSubtitle = document.querySelector('[data-hero-subtitle]')
      const heroCta = document.querySelector('[data-hero-cta]')
      const heroStats = document.querySelector('[data-hero-stats]')

      const heroIntro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      if (heroEyebrow) {
        heroIntro.fromTo(heroEyebrow, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8 }, 0)
      }
      if (heroSearch) {
        heroIntro.fromTo(heroSearch, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.8 }, 0.1)
      }
      if (heroSubtitle) {
        heroIntro.fromTo(heroSubtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 0.55)
      }
      if (heroCta) {
        heroIntro.fromTo(heroCta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.75)
      }
      if (heroStats) {
        heroIntro.fromTo(heroStats, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1 }, 0.65)
      }

      gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 24 + i * 8, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.2 + i * 0.15,
            ease: 'power3.out',
          }
        )
      })
    })

    return () => ctx.revert()
  }, deps)
}
