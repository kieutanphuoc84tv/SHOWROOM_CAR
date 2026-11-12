import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGsapBrandEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      const navLogo = document.querySelector('[data-nexus-logo="nav"]')
      const navNexus = navLogo?.querySelector('[data-logo-nexus]')
      const navAuto = navLogo?.querySelector('[data-logo-auto]')

      if (navLogo && navNexus && navAuto) {
        gsap.set(navLogo, { opacity: 1 })
        gsap.set([navNexus, navAuto], { opacity: 0 })

        gsap
          .timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 })
          .fromTo(navNexus, { x: -32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 })
          .fromTo(navAuto, { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9 }, '-=0.7')
          .fromTo(
            navLogo,
            { scale: 0.9, transformOrigin: 'left center' },
            { scale: 1, duration: 0.7 },
            '-=0.9'
          )
      }

      const header = document.querySelector('[data-site-header]')
      if (header && navLogo) {
        ScrollTrigger.create({
          start: 'top -80',
          end: 99999,
          onUpdate: () => {
            const scrolled = window.scrollY > 80
            gsap.to(header, {
              backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(244,244,244,0.9)',
              boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.07)' : '0 0 0 rgba(0,0,0,0)',
              duration: 0.4,
              ease: 'power2.out',
            })
            gsap.to(navLogo, {
              scale: scrolled ? 0.94 : 1,
              transformOrigin: 'left center',
              duration: 0.4,
              ease: 'power2.out',
            })
          },
        })
      }

      const footer = document.querySelector('[data-site-footer]')
      const wordmarkWrap = document.querySelector('[data-footer-wordmark-wrap]')
      const wordmark = document.querySelector('[data-nexus-logo="footer"]')
      const footerNexus = wordmark?.querySelector('[data-logo-nexus]')
      const footerAuto = wordmark?.querySelector('[data-logo-auto]')
      const wordmarkLine = document.querySelector('[data-footer-wordmark-line]')

      if (footer && wordmarkWrap && wordmark && footerNexus && footerAuto) {
        gsap.set(wordmarkWrap, { clipPath: 'inset(100% 0% 0% 0%)' })
        gsap.set(wordmark, { y: 100, opacity: 0, scale: 0.88 })
        gsap.set([footerNexus, footerAuto], { opacity: 0 })
        if (wordmarkLine) gsap.set(wordmarkLine, { scaleX: 0, transformOrigin: 'left center' })

        const footerTl = gsap.timeline({
          scrollTrigger: {
            trigger: wordmarkWrap,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })

        footerTl
          .to(wordmarkWrap, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.15,
            ease: 'power4.inOut',
          })
          .to(
            wordmark,
            { y: 0, opacity: 1, scale: 1, duration: 1.25, ease: 'power4.out' },
            '-=0.9'
          )
          .fromTo(
            footerNexus,
            { x: -48, opacity: 0, letterSpacing: '0.08em' },
            { x: 0, opacity: 1, letterSpacing: '-0.04em', duration: 1, ease: 'power3.out' },
            '-=0.95'
          )
          .fromTo(
            footerAuto,
            { x: 48, opacity: 0, letterSpacing: '0.06em' },
            { x: 0, opacity: 1, letterSpacing: '-0.04em', duration: 1, ease: 'power3.out' },
            '-=0.75'
          )

        if (wordmarkLine) {
          footerTl.to(
            wordmarkLine,
            { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
            '-=1.1'
          )
        }

      }

      gsap.utils.toArray<HTMLElement>('[data-footer-reveal]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            delay: i * 0.07,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-footer-pills]').forEach((container) => {
        const pills = container.querySelectorAll('a')
        gsap.fromTo(
          pills,
          { y: 24, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // Brand wheel — dual orbit rotation
      document.querySelectorAll<HTMLElement>('[data-brand-wheel]').forEach((wheel) => {
        gsap.fromTo(
          wheel,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: wheel,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        wheel.querySelectorAll<HTMLElement>('[data-brand-orbit]').forEach((orbit) => {
          const direction = orbit.dataset.brandDirection === '1' ? 1 : -1
          const duration = 34
          const badges = orbit.querySelectorAll<HTMLElement>('[data-brand-badge]')

          const spin = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'none' } })
          spin.to(orbit, { rotation: 360 * direction, duration }, 0)
          badges.forEach((badge) => {
            spin.to(badge, { rotation: -360 * direction, duration }, 0)
          })

          ScrollTrigger.create({
            trigger: wheel,
            start: 'top 90%',
            end: 'bottom 10%',
            onEnter: () => spin.play(),
            onLeave: () => spin.pause(),
            onEnterBack: () => spin.play(),
            onLeaveBack: () => spin.pause(),
          })
        })
      })

      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count || '0')
        const suffix = el.dataset.countSuffix || ''
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 2.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.val)}${suffix}`
          },
        })
      })
    })

    return () => ctx.revert()
  }, [])
}
