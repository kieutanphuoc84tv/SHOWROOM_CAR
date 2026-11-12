import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type NexusLogoProps = {
  variant?: 'nav' | 'footer'
  className?: string
  asLink?: boolean
}

export function NexusLogo({ variant = 'nav', className, asLink = true }: NexusLogoProps) {
  const isFooter = variant === 'footer'

  const content = (
    <span
      data-nexus-logo={variant}
      className={cn(
        'inline-flex items-baseline overflow-hidden',
        isFooter
          ? 'font-bold uppercase tracking-[-0.04em] leading-[0.85] text-black select-none'
          : 'font-bold uppercase tracking-tight text-black',
        className
      )}
      aria-label="Nexus Auto"
    >
      <span
        data-logo-nexus
        className={cn(isFooter ? 'text-[clamp(3.5rem,14vw,9rem)]' : 'text-[15px]')}
      >
        Nexus
      </span>
      <span
        data-logo-auto
        className={cn(
          isFooter ? 'text-[clamp(3.5rem,14vw,9rem)] text-neutral-400' : 'text-[15px] text-neutral-500'
        )}
      >
        {' '}Auto
      </span>
    </span>
  )

  if (asLink && !isFooter) {
    return (
      <Link to="/" className="shrink-0 focus-visible:outline-offset-4">
        {content}
      </Link>
    )
  }

  return content
}
